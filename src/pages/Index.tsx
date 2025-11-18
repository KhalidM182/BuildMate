import { useState } from "react";
import { Button } from "@/components/ui/button";
import BuildConfigurator, { BuildConfig } from "@/components/BuildConfigurator";
import BuildResults from "@/components/BuildResults";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Cpu, Sparkles, Zap, Shield } from "lucide-react";

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
  const { toast } = useToast();

  const handleGenerateBuilds = async (config: BuildConfig) => {
    setIsLoading(true);
    setBuilds(null);

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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-border mb-4">
            <Sparkles className="w-4 h-4 text-accent animate-glow" />
            <span className="text-sm font-medium">Powered by AI</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
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
        <section className="py-20 px-4">
          <BuildResults builds={builds} />
        </section>
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
