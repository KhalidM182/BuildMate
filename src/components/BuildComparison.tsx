import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, TrendingUp, Zap, DollarSign } from "lucide-react";

interface Build {
  tier: string;
  totalCost: number;
  performanceScore: number;
  bottleneckPercentage: number;
  powerConsumption: number;
  components: any;
}

interface BuildComparisonProps {
  build1: Build;
  build2: Build;
}

export default function BuildComparison({ build1, build2 }: BuildComparisonProps) {
  const priceDiff = build2.totalCost - build1.totalCost;
  const perfDiff = build2.performanceScore - build1.performanceScore;

  return (
    <Card className="glass p-6 space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">Build Comparison</h3>
        <p className="text-muted-foreground">See how these tiers stack up</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Build 1 */}
        <div className="space-y-4">
          <div className="text-center">
            <Badge className="mb-2">{build1.tier}</Badge>
            <h4 className="text-3xl font-bold text-primary">${build1.totalCost}</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Performance:</span>
              <span className="font-semibold">{build1.performanceScore}/10</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Bottleneck:</span>
              <span className="font-semibold">{build1.bottleneckPercentage}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Power:</span>
              <span className="font-semibold">{build1.powerConsumption}W</span>
            </div>
          </div>
        </div>

        {/* Comparison Arrow */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <ArrowRight className="w-8 h-8 text-accent" />
          <div className="space-y-2 text-center">
            <div className="flex items-center gap-2 justify-center">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span className={`font-bold ${priceDiff > 0 ? "text-destructive" : "text-accent"}`}>
                {priceDiff > 0 ? "+" : ""}${priceDiff}
              </span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <span className={`font-bold ${perfDiff > 0 ? "text-accent" : "text-destructive"}`}>
                {perfDiff > 0 ? "+" : ""}{perfDiff} pts
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {priceDiff > 0 && perfDiff > 0 && (
                <span>
                  +{((perfDiff / priceDiff) * 1000).toFixed(1)} value per $
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Build 2 */}
        <div className="space-y-4">
          <div className="text-center">
            <Badge className="mb-2">{build2.tier}</Badge>
            <h4 className="text-3xl font-bold text-primary">${build2.totalCost}</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Performance:</span>
              <span className="font-semibold">{build2.performanceScore}/10</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Bottleneck:</span>
              <span className="font-semibold">{build2.bottleneckPercentage}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Power:</span>
              <span className="font-semibold">{build2.powerConsumption}W</span>
            </div>
          </div>
        </div>
      </div>

      {/* Component Differences */}
      <div className="border-t border-border pt-6 space-y-3">
        <h4 className="font-semibold mb-3">Key Component Upgrades</h4>
        {['cpu', 'gpu', 'ram'].map((component) => {
          const comp1 = build1.components[component];
          const comp2 = build2.components[component];
          if (comp1.model !== comp2.model) {
            return (
              <div key={component} className="flex items-center gap-3 text-sm">
                <span className="text-muted-foreground capitalize w-16">{component}:</span>
                <span className="truncate flex-1">{comp1.model}</span>
                <ArrowRight className="w-4 h-4 text-accent flex-shrink-0" />
                <span className="truncate flex-1 font-semibold">{comp2.model}</span>
              </div>
            );
          }
          return null;
        })}
      </div>
    </Card>
  );
}
