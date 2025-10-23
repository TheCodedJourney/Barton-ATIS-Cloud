import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cloud, Wind, Thermometer, Eye, AlertTriangle } from "lucide-react";
import type { WeatherObs } from "@shared/schema";

interface WeatherCardProps {
  data: WeatherObs;
}

export function WeatherCard({ data }: WeatherCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          Weather Observation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 rounded-md bg-muted/50 border font-mono text-sm" data-testid="text-metar">
          {data.metar}
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="flex items-start gap-2">
            <Wind className="h-4 w-4 mt-1 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground">Wind</div>
              <div className="font-semibold" data-testid="text-wind">
                {data.windDirection}° @ {data.windSpeed}kt
                {data.windGust && ` (G${data.windGust})`}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Thermometer className="h-4 w-4 mt-1 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground">Temp / Dewpoint</div>
              <div className="font-semibold" data-testid="text-temperature">
                {data.temperature}°C / {data.dewpoint}°C
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Eye className="h-4 w-4 mt-1 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground">Visibility</div>
              <div className="font-semibold">{data.visibility}</div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Cloud className="h-4 w-4 mt-1 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground">Cloud</div>
              <div className="font-semibold">{data.cloudCoverage}</div>
            </div>
          </div>
        </div>

        {data.warnings && (
          <div className="pt-4 border-t">
            <div className="flex items-start gap-2 p-3 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <AlertTriangle className="h-4 w-4 mt-0.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <div>
                <div className="text-xs font-medium text-amber-900 dark:text-amber-200 mb-1">
                  Met Warnings
                </div>
                <div className="text-sm text-amber-800 dark:text-amber-300" data-testid="text-warnings">
                  {data.warnings}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
