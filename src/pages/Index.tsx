import { useState } from "react";
import { Button } from "@/components/ui/button";
import BuildConfigurator, { BuildConfig } from "@/components/BuildConfigurator";
import BuildResults from "@/components/BuildResults";
import BuildActions from "@/components/BuildActions";
import PeripheralsSection from "@/components/PeripheralsSection";
import BuildComparison from "@/components/BuildComparison";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Cpu, Sparkles, Zap, Shield, GitCompare } from "lucide-react";
import logo from "@/assets/logo.png";

interface Build {
  tier: string;
  totalCost: number;
  performanceScore: number;
  bottleneckPercentage: number;
  powerConsumption: number;
  components: any;
  performanceExpectations: any;
  compatibilityNotes: string;
}

export default function Index() {
  const [showConfigurator, setShowConfigurator] = useState(false);
  const [builds, setBuilds] = useState<Build[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [buildConfig, setBuildConfig] = useState<BuildConfig | null>(null);
  const [selectedTier, setSelectedTier] = useState<string>("Better");
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonBuilds, setComparisonBuilds] = useState<[Build, Build] | null>(null);
  const { toast } = useToast();

  const handleGenerateBuilds = async (config: BuildConfig) => {
    setIsLoading(true);
    setBuilds(null);
    setBuildConfig(config);

    try {
      const { data, error } = await supabase.functions.invoke("generate-pc-build", {
        body: config,
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      setBuilds(data.builds);
      setSelectedTier("Better");
      setShowComparison(false);
      toast({
        title: "Success!",
        description: "Your custom PC builds have been generated.",
      });
    } catch (error) {
      console.error("Error generating builds:", error);
      toast({
        title: "Error",
        description: "Failed to generate builds. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompareBuilds = (tier1: string, tier2: string) => {
    if (!builds) return;
    const build1 = builds.find((b) => b.tier === tier1);
    const build2 = builds.find((b) => b.tier === tier2);
    if (build1 && build2) {
      setComparisonBuilds([build1, build2]);
      setShowComparison(true);
      setTimeout(() => {
        document.getElementById("comparison")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const scrollToConfigurator = () => {
    setShowConfigurator(true);
    setTimeout(() => {
      document.getElementById("configurator")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8 animate-slide-up">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img 
              src={logo} 
              alt="BuildMate Logo" 
              className="w-24 h-24 md:w-32 md:h-32 animate-float drop-shadow-[0_0_30px_rgba(139,92,246,0.5)]"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-border mb-4">
            <Sparkles className="w-4 h-4 text-accent animate-glow" />
            <span className="text-sm font-medium">Powered by AI</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            <span className="gradient-text">BuildMate</span>
            Build Your Dream PC with{" "}
            <span className="gradient-text">AI Intelligence</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Get personalized, optimized PC builds tailored to your budget and needs. 
            From gaming rigs to ML workstations, we've got you covered.
          </p>

          <div className="flex flex-wrap gap-4 justify-center pt-8">
            <Button
              size="lg"
              onClick={scrollToConfigurator}
              className="h-14 px-8 text-lg font-semibold bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow-primary"
            >
              <Cpu className="w-5 h-5 mr-2" />
              Start Building
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 text-lg font-semibold glass hover:bg-primary/10"
            >
              Learn More
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">
            <div className="glass rounded-xl p-6 hover:border-primary/50 transition-all duration-300">
              <Zap className="w-10 h-10 text-primary mb-4 mx-auto" />
              <h3 className="font-semibold text-lg mb-2">Instant Recommendations</h3>
              <p className="text-sm text-muted-foreground">
                Get three optimized build tiers in seconds, powered by advanced AI
              </p>
            </div>
            <div className="glass rounded-xl p-6 hover:border-primary/50 transition-all duration-300">
              <Shield className="w-10 h-10 text-accent mb-4 mx-auto" />
              <h3 className="font-semibold text-lg mb-2">Compatibility Guaranteed</h3>
              <p className="text-sm text-muted-foreground">
                Every component is verified for perfect compatibility and performance
              </p>
            </div>
            <div className="glass rounded-xl p-6 hover:border-primary/50 transition-all duration-300">
              <Sparkles className="w-10 h-10 text-primary mb-4 mx-auto animate-glow" />
              <h3 className="font-semibold text-lg mb-2">Smart Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Detailed bottleneck analysis and performance expectations for your use case
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Configurator Section */}
      {showConfigurator && (
        <section id="configurator" className="py-20 px-4">
          <BuildConfigurator onGenerateBuilds={handleGenerateBuilds} isLoading={isLoading} />
        </section>
      )}

      {/* Results Section */}
      {builds && (
        <>
          <section className="py-20 px-4">
            <BuildResults builds={builds} onTierChange={setSelectedTier} />
          </section>

          {/* Action Buttons */}
          <section className="py-8 px-4">
            <div className="w-full max-w-6xl mx-auto space-y-8">
              <BuildActions
                buildData={builds}
                budget={buildConfig!.budget}
                useCase={buildConfig!.useCase}
                customRequirements={buildConfig?.customRequirements}
                selectedTier={selectedTier}
              />

              {/* Compare Button */}
              <div className="flex justify-center gap-4">
                <Button
                  variant="outline"
                  className="glass"
                  onClick={() => handleCompareBuilds("Good", "Better")}
                >
                  <GitCompare className="w-4 h-4 mr-2" />
                  Compare Good vs Better
                </Button>
                <Button
                  variant="outline"
                  className="glass"
                  onClick={() => handleCompareBuilds("Better", "Best")}
                >
                  <GitCompare className="w-4 h-4 mr-2" />
                  Compare Better vs Best
                </Button>
              </div>
            </div>
          </section>

          {/* Comparison Section */}
          {showComparison && comparisonBuilds && (
            <section id="comparison" className="py-20 px-4">
              <div className="w-full max-w-6xl mx-auto">
                <BuildComparison build1={comparisonBuilds[0]} build2={comparisonBuilds[1]} />
              </div>
            </section>
          )}

          {/* Peripherals Section */}
          <section className="py-20 px-4">
            <div className="w-full max-w-6xl mx-auto">
              <PeripheralsSection
                budget={buildConfig!.budget}
                useCase={buildConfig!.useCase}
                selectedBuild={builds.find((b) => b.tier === selectedTier)!}
              />
            </div>
          </section>
        </>
      )}

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>Powered by Lovable AI • All recommendations are AI-generated and should be verified</p>
        </div>
      </footer>
    </div>
  );
}
