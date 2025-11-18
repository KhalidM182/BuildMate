import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Monitor, Keyboard, Mouse, Headphones, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ComponentCard from "./ComponentCard";

interface Build {
  tier: string;
  totalCost: number;
  components: any;
}

interface PeripheralsSectionProps {
  budget: number;
  useCase: string;
  selectedBuild: Build;
}

interface Peripheral {
  category: string;
  model: string;
  price: number;
  reason: string;
  specs: Record<string, string>;
}

const categoryIcons = {
  monitor: Monitor,
  keyboard: Keyboard,
  mouse: Mouse,
  headset: Headphones,
};

export default function PeripheralsSection({ budget, useCase, selectedBuild }: PeripheralsSectionProps) {
  const [peripherals, setPeripherals] = useState<Peripheral[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const remainingBudget = budget - selectedBuild.totalCost;

  const handleGeneratePeripherals = async () => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("recommend-peripherals", {
        body: {
          budget: remainingBudget,
          build: selectedBuild,
          useCase,
        },
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

      setPeripherals(data.peripherals);
      toast({
        title: "Success!",
        description: "Peripheral recommendations generated.",
      });
    } catch (error) {
      console.error("Error generating peripherals:", error);
      toast({
        title: "Error",
        description: "Failed to generate peripherals. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="glass p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">Recommended Peripherals</h3>
          <p className="text-muted-foreground">
            Complete your setup with matching peripherals (${remainingBudget} remaining)
          </p>
        </div>
        {!peripherals && (
          <Button
            onClick={handleGeneratePeripherals}
            disabled={isLoading || remainingBudget < 100}
            className="bg-gradient-primary hover:opacity-90"
          >
            {isLoading ? (
              <span className="animate-pulse">Generating...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Recommendations
              </>
            )}
          </Button>
        )}
      </div>

      {remainingBudget < 100 && !peripherals && (
        <p className="text-sm text-muted-foreground">
          Increase your budget to get peripheral recommendations
        </p>
      )}

      {peripherals && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {peripherals.map((peripheral, index) => {
            const Icon = categoryIcons[peripheral.category as keyof typeof categoryIcons] || Monitor;
            return (
              <div key={index} className="space-y-2">
                <ComponentCard
                  icon={Icon}
                  name={peripheral.category.charAt(0).toUpperCase() + peripheral.category.slice(1)}
                  model={peripheral.model}
                  price={peripheral.price}
                  reason={peripheral.reason}
                />
                {peripheral.specs && Object.keys(peripheral.specs).length > 0 && (
                  <Card className="glass p-3">
                    <h5 className="text-xs font-semibold mb-2">Specs</h5>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(peripheral.specs).map(([key, value]) => (
                        <div key={key}>
                          <span className="text-muted-foreground">{key}:</span>{" "}
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
