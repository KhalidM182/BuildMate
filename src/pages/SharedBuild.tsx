import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BuildResults from "@/components/BuildResults";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function SharedBuild() {
  const { token } = useParams();
  const [build, setBuild] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBuild = async () => {
      if (!token) {
        setError("Invalid share link");
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("builds")
          .select("*")
          .eq("share_token", token)
          .single();

        if (error) throw error;

        if (!data) {
          setError("Build not found");
          return;
        }

        setBuild(data);
      } catch (err) {
        console.error("Error fetching shared build:", err);
        setError("Failed to load build");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBuild();
  }, [token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading shared build...</p>
        </div>
      </div>
    );
  }

  if (error || !build) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Build Not Found</h1>
          <p className="text-muted-foreground">{error || "This build doesn't exist or is no longer available."}</p>
          <Link to="/">
            <Button className="bg-gradient-primary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Header */}
      <section className="py-12 px-4 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Builder
            </Button>
          </Link>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold gradient-text">{build.name}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span>Budget: ${build.budget}</span>
              <span>•</span>
              <span>Use Case: {build.use_case}</span>
              <span>•</span>
              <span>Tier: {build.selected_tier}</span>
            </div>
            {build.custom_requirements && (
              <p className="text-sm text-muted-foreground mt-2">
                Requirements: {build.custom_requirements}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Build Details */}
      <section className="py-20 px-4">
        <BuildResults builds={build.build_data.builds || build.build_data} />
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>Want to create your own build? <Link to="/" className="text-primary hover:underline">Get started here</Link></p>
        </div>
      </footer>
    </div>
  );
}
