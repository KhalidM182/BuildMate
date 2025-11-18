import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Cpu, Gamepad2, Layers, Briefcase, Sparkles } from "lucide-react";

interface BuildConfiguratorProps {
  onGenerateBuilds: (config: BuildConfig) => void;
  isLoading: boolean;
}

export interface BuildConfig {
  budget: number;
  useCase: string;
  customRequirements?: string;
}

const useCases = [
  { id: "gaming", label: "Gaming", icon: Gamepad2, description: "High FPS, smooth gameplay" },
  { id: "3d-modeling", label: "3D Modeling", icon: Layers, description: "Rendering, CAD work" },
  { id: "machine-learning", label: "Machine Learning", icon: Cpu, description: "AI training, data science" },
  { id: "productivity", label: "Productivity", icon: Briefcase, description: "Office, multitasking" },
  { id: "mixed", label: "Mixed Use", icon: Sparkles, description: "Balanced performance" },
];

export default function BuildConfigurator({ onGenerateBuilds, isLoading }: BuildConfiguratorProps) {
  const [budget, setBudget] = useState<number>(1500);
  const [selectedUseCase, setSelectedUseCase] = useState<string>("gaming");
  const [customRequirements, setCustomRequirements] = useState<string>("");

  const handleSubmit = () => {
    onGenerateBuilds({
      budget,
      useCase: selectedUseCase,
      customRequirements: customRequirements.trim() || undefined,
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-slide-up">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold gradient-text">Configure Your Build</h2>
        <p className="text-muted-foreground">Tell us your budget and needs, we'll do the rest</p>
      </div>

      <Card className="glass p-6 space-y-6">
        {/* Budget Input */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label htmlFor="budget" className="text-lg font-semibold">Budget</Label>
            <span className="text-2xl font-bold text-primary">${budget}</span>
          </div>
          <Input
            id="budget"
            type="range"
            min="500"
            max="5000"
            step="100"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>$500</span>
            <span>$5,000</span>
          </div>
        </div>

        {/* Use Case Selection */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold">Primary Use Case</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {useCases.map((useCase) => {
              const Icon = useCase.icon;
              return (
                <button
                  key={useCase.id}
                  onClick={() => setSelectedUseCase(useCase.id)}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 text-left hover:scale-105 ${
                    selectedUseCase === useCase.id
                      ? "border-primary bg-primary/10 shadow-glow-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Icon className={`w-6 h-6 mb-2 ${selectedUseCase === useCase.id ? "text-primary" : "text-muted-foreground"}`} />
                  <div className="font-semibold">{useCase.label}</div>
                  <div className="text-xs text-muted-foreground">{useCase.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Requirements */}
        <div className="space-y-2">
          <Label htmlFor="requirements" className="text-lg font-semibold">
            Custom Requirements <span className="text-muted-foreground text-sm font-normal">(Optional)</span>
          </Label>
          <Textarea
            id="requirements"
            placeholder="e.g., 'I want 120 fps on Fortnite at 1080p' or 'Need fast GPU compute for training models'"
            value={customRequirements}
            onChange={(e) => setCustomRequirements(e.target.value)}
            className="min-h-[120px] resize-none glass border-border/50 focus:border-primary/50 focus:shadow-glow-primary transition-all duration-300 placeholder:text-muted-foreground/50"
          />
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full h-12 text-lg font-semibold bg-gradient-primary hover:opacity-90 transition-opacity"
        >
          {isLoading ? (
            <>
              <span className="animate-pulse">Generating Builds...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Generate AI-Powered Builds
            </>
          )}
        </Button>
      </Card>
    </div>
  );
}
