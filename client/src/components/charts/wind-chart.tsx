import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import type { HistoricalDataPoint } from "@shared/schema";

interface WindChartProps {
  data: HistoricalDataPoint[];
}

export function WindChart({ data }: WindChartProps) {
  const chartData = data.map((point) => ({
    time: format(point.timestamp, "HH:mm"),
    speed: point.windSpeed,
    direction: point.windDirection,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wind Speed Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis 
              dataKey="time" 
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              label={{ value: 'Speed (kt)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="speed" 
              stroke="hsl(var(--chart-3))" 
              strokeWidth={2}
              dot={{ fill: "hsl(var(--chart-3))" }}
              name="Wind Speed (kt)"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
