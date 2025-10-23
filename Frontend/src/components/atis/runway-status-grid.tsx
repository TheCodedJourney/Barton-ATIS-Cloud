import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane } from "lucide-react";
import type { RunwayStatus } from "@shared/schema";

interface RunwayStatusGridProps {
  runways: RunwayStatus[];
}

export function RunwayStatusGrid({ runways }: RunwayStatusGridProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plane className="h-5 w-5" />
          Runway Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {runways.map((runway) => (
            <div
              key={runway.id}
              className="p-4 rounded-md border bg-card hover-elevate active-elevate-2"
              data-testid={`card-runway-${runway.runwayId}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-lg">{runway.runwayId}</div>
                <Badge variant="secondary" className="uppercase text-xs">
                  {runway.condition}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Surface: <span className="font-medium text-foreground">{runway.surfaceState}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
