import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface ComponentCardProps {
  icon: LucideIcon;
  name: string;
  model: string;
  price: number;
  reason: string;
}

export default function ComponentCard({ icon: Icon, name, model, price, reason }: ComponentCardProps) {
  return (
    <Card className="glass p-4 hover:border-primary/50 transition-all duration-300 group">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2 mb-1">
            <h4 className="font-semibold text-sm">{name}</h4>
            <span className="text-primary font-bold text-sm whitespace-nowrap">${price}</span>
          </div>
          <p className="text-xs text-foreground mb-2 truncate" title={model}>{model}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{reason}</p>
        </div>
      </div>
    </Card>
  );
}
