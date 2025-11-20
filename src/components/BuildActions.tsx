import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Save, Share2, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BuildActionsProps {
  buildData: any;
  budget: number;
  useCase: string;
  customRequirements?: string;
  selectedTier: string;
}

export default function BuildActions({
  buildData,
  budget,
  useCase,
  customRequirements,
  selectedTier,
}: BuildActionsProps) {
  const [buildName, setBuildName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleSaveBuild = async () => {
    if (!buildName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for your build.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const { data, error } = await supabase
        .from("builds")
        .insert({
          name: buildName,
          budget,
          use_case: useCase,
          custom_requirements: customRequirements,
          build_data: buildData,
          selected_tier: selectedTier,
          share_token: null,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Build Saved!",
        description: "Your PC build has been saved successfully.",
      });

      setBuildName("");
    } catch (error: any) {
      toast({
        title: "Error Saving Build",
        description: error?.message || "Failed to save build. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleShareBuild = async () => {
    if (!buildName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for your build before sharing.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      // Generate a share token
      const { data: tokenData, error: tokenError } = await supabase
        .rpc('generate_share_token');

      if (tokenError) {
        throw tokenError;
      }

      // Insert with share token
      const { data, error } = await supabase
        .from("builds")
        .insert({
          name: buildName,
          budget,
          use_case: useCase,
          custom_requirements: customRequirements,
          build_data: buildData,
          selected_tier: selectedTier,
          share_token: tokenData as string,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setShareToken(data.share_token);

      toast({
        title: "Build Shared!",
        description: "Your build is now shareable. Copy the link below.",
      });
    } catch (error: any) {
      toast({
        title: "Error Sharing Build",
        description: error?.message || "Failed to share build. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyLink = () => {
    if (shareToken) {
      const shareUrl = `${window.location.origin}/shared/${shareToken}`;
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link Copied!",
        description: "Share link copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex gap-4 justify-center">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="glass">
            <Save className="w-4 h-4 mr-2" />
            Save Build
          </Button>
        </DialogTrigger>
        <DialogContent className="glass">
          <DialogHeader>
            <DialogTitle>Save Your Build</DialogTitle>
            <DialogDescription>
              Give your build a memorable name to save it for later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="buildName">Build Name</Label>
              <Input
                id="buildName"
                placeholder="e.g., Gaming Beast 2024"
                value={buildName}
                onChange={(e) => setBuildName(e.target.value)}
              />
            </div>
            <Button
              onClick={handleSaveBuild}
              disabled={isSaving}
              className="w-full bg-gradient-primary"
            >
              {isSaving ? "Saving..." : "Save Build"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="glass">
            <Share2 className="w-4 h-4 mr-2" />
            Share Build
          </Button>
        </DialogTrigger>
        <DialogContent className="glass">
          <DialogHeader>
            <DialogTitle>Share Your Build</DialogTitle>
            <DialogDescription>
              Create a shareable link for your PC build.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {!shareToken ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="shareBuildName">Build Name</Label>
                  <Input
                    id="shareBuildName"
                    placeholder="e.g., Gaming Beast 2024"
                    value={buildName}
                    onChange={(e) => setBuildName(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleShareBuild}
                  disabled={isSaving}
                  className="w-full bg-gradient-primary"
                >
                  {isSaving ? "Creating Link..." : "Create Share Link"}
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-mono break-all">
                    {window.location.origin}/shared/{shareToken}
                  </p>
                </div>
                <Button onClick={handleCopyLink} className="w-full" variant="outline">
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Link
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
