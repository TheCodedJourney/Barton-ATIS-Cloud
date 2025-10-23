import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricDisplay } from "./metric-display";
import { Plane, Navigation } from "lucide-react";
import type { AtisInfo } from "@shared/schema";

interface CurrentAtisCardProps {
  data: AtisInfo;
}

export function CurrentAtisCard({ data }: CurrentAtisCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plane className="h-5 w-5" />
          Current ATIS Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <MetricDisplay
            label="Info Code"
            value={data.informationCode}
            testId="text-info-code"
          />
          <MetricDisplay
            label="Runway / Circuit"
            value={`${data.runwayInUse} / ${data.circuitDirection}`}
            testId="text-runway-circuit"
          />
          <MetricDisplay
            label="QNH"
            value={data.qnh}
            unit="hPa"
            testId="text-qnh"
          />
          <MetricDisplay
            label="QFE"
            value={data.qfe}
            unit="hPa"
            testId="text-qfe"
          />
        </div>
        
        <div className="pt-4 border-t space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Touch and Go:</span>
            <span className="font-medium" data-testid="text-touch-and-go">{data.touchAndGo}</span>
          </div>
          {data.closingTime && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Airfield Closes:</span>
              <span className="font-medium" data-testid="text-closing-time">{data.closingTime}</span>
            </div>
          )}
          {data.nextStatusUpdate && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Next Status Update:</span>
              <span className="font-medium">{data.nextStatusUpdate}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
