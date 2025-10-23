import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import type { HistoricalDataPoint } from "@shared/schema";

interface TemperatureChartProps {
  data: HistoricalDataPoint[];
}

export function TemperatureChart({ data }: TemperatureChartProps) {
  const chartData = data.map((point) => ({
    time: format(point.timestamp, "HH:mm"),
    temperature: point.temperature,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Temperature Trends</CardTitle>
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
              label={{ value: 'Temp (°C)', angle: -90, position: 'insideLeft' }}
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
              dataKey="temperature" 
              stroke="hsl(var(--chart-4))" 
              strokeWidth={2}
              dot={{ fill: "hsl(var(--chart-4))" }}
              name="Temperature (°C)"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
