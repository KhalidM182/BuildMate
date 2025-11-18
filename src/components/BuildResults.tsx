import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ComponentCard from "./ComponentCard";
import { 
  Cpu, 
  MonitorPlay, 
  MemoryStick, 
  HardDrive, 
  Zap, 
  Box,
  Fan,
  CircuitBoard,
  TrendingUp,
  Activity,
  AlertTriangle
} from "lucide-react";

interface Build {
  tier: string;
  totalCost: number;
  performanceScore: number;
  bottleneckPercentage: number;
  powerConsumption: number;
  components: {
    cpu: { model: string; price: number; reason: string };
    gpu: { model: string; price: number; reason: string };
    ram: { model: string; price: number; reason: string };
    motherboard: { model: string; price: number; reason: string };
    storage: { model: string; price: number; reason: string };
    psu: { model: string; price: number; reason: string };
    case: { model: string; price: number; reason: string };
    cooling: { model: string; price: number; reason: string };
  };
  performanceExpectations: {
    gaming?: string;
    productivity?: string;
    ml?: string;
  };
  compatibilityNotes: string;
}

interface BuildResultsProps {
  builds: Build[];
}

const componentIcons = {
  cpu: Cpu,
  gpu: MonitorPlay,
  ram: MemoryStick,
  motherboard: CircuitBoard,
  storage: HardDrive,
  psu: Zap,
  case: Box,
  cooling: Fan,
};

const tierColors = {
  Good: "bg-secondary text-secondary-foreground",
  Better: "bg-primary/20 text-primary",
  Best: "bg-accent/20 text-accent",
};

export default function BuildResults({ builds }: BuildResultsProps) {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-slide-up">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold gradient-text">Your Recommended Builds</h2>
        <p className="text-muted-foreground">Three optimized configurations tailored to your needs</p>
      </div>

      <Tabs defaultValue="Better" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          {builds.map((build) => (
            <TabsTrigger key={build.tier} value={build.tier} className="text-lg">
              {build.tier}
            </TabsTrigger>
          ))}
        </TabsList>

        {builds.map((build) => (
          <TabsContent key={build.tier} value={build.tier} className="space-y-6">
            {/* Overview Card */}
            <Card className="glass p-6">
              <div className="flex flex-wrap gap-4 justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold">{build.tier} Tier</h3>
                    <Badge className={tierColors[build.tier as keyof typeof tierColors]}>
                      Recommended
                    </Badge>
                  </div>
                  <p className="text-3xl font-bold text-primary">${build.totalCost}</p>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <TrendingUp className="w-3 h-3" />
                      Performance
                    </div>
                    <div className="text-xl font-bold text-accent">{build.performanceScore}/10</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <AlertTriangle className="w-3 h-3" />
                      Bottleneck
                    </div>
                    <div className="text-xl font-bold">{build.bottleneckPercentage}%</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <Zap className="w-3 h-3" />
                      Power
                    </div>
                    <div className="text-xl font-bold">{build.powerConsumption}W</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <Activity className="w-3 h-3" />
                      Value
                    </div>
                    <div className="text-xl font-bold text-primary">
                      {Math.round((build.performanceScore / build.totalCost) * 10000)}
                    </div>
                  </div>
                </div>
              </div>

              {build.compatibilityNotes && (
                <div className="bg-muted/50 border border-border rounded-lg p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CircuitBoard className="w-4 h-4" />
                    Compatibility Notes
                  </h4>
                  <p className="text-sm text-muted-foreground">{build.compatibilityNotes}</p>
                </div>
              )}
            </Card>

            {/* Components Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(build.components).map(([key, component]) => {
                const Icon = componentIcons[key as keyof typeof componentIcons];
                return (
                  <ComponentCard
                    key={key}
                    icon={Icon}
                    name={key.charAt(0).toUpperCase() + key.slice(1)}
                    model={component.model}
                    price={component.price}
                    reason={component.reason}
                  />
                );
              })}
            </div>

            {/* Performance Expectations */}
            {Object.keys(build.performanceExpectations).length > 0 && (
              <Card className="glass p-6">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Performance Expectations
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {build.performanceExpectations.gaming && (
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground">Gaming</div>
                      <p className="text-sm">{build.performanceExpectations.gaming}</p>
                    </div>
                  )}
                  {build.performanceExpectations.productivity && (
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground">Productivity</div>
                      <p className="text-sm">{build.performanceExpectations.productivity}</p>
                    </div>
                  )}
                  {build.performanceExpectations.ml && (
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground">Machine Learning</div>
                      <p className="text-sm">{build.performanceExpectations.ml}</p>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
