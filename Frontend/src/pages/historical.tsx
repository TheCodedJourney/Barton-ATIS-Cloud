import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/atis/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PressureChart } from "@/components/charts/pressure-chart";
import { WindChart } from "@/components/charts/wind-chart";
import { TemperatureChart } from "@/components/charts/temperature-chart";
import { CalendarIcon, TrendingUp, AlertCircle } from "lucide-react";
import { format, subDays } from "date-fns";
import type { HistoricalDataPoint, CurrentAtisData } from "@shared/schema";

export default function Historical() {
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 7),
    to: new Date(),
  });

  const { data: currentAtis } = useQuery<CurrentAtisData>({
    queryKey: ["/api/atis/current"],
  });

  const { data: historicalData, isLoading, error } = useQuery<HistoricalDataPoint[]>({
    queryKey: ["/api/atis/historical", dateRange.from.toISOString(), dateRange.to.toISOString()],
    queryFn: async () => {
      const params = new URLSearchParams({
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString(),
      });
      const response = await fetch(`/api/atis/historical?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch historical data");
      }
      return response.json();
    },
  });

  const handleQuickSelect = (days: number) => {
    setDateRange({
      from: subDays(new Date(), days),
      to: new Date(),
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        airfieldStatus={currentAtis?.atis?.airfieldStatus || "Unknown"}
        lastUpdated={currentAtis?.lastUpdated || new Date()}
      />

      <main className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <TrendingUp className="h-8 w-8" />
                Historical Statistics
              </h2>
              <p className="text-muted-foreground mt-1">
                View historical ATIS data and weather trends
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickSelect(1)}
                data-testid="button-quick-1day"
              >
                Last 24hrs
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickSelect(7)}
                data-testid="button-quick-7days"
              >
                Last 7 days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickSelect(30)}
                data-testid="button-quick-30days"
              >
                Last 30 days
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Date Range</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Showing data from:</span>
                <span className="font-medium">
                  {format(dateRange.from, "dd MMM yyyy")} - {format(dateRange.to, "dd MMM yyyy")}
                </span>
              </div>
            </CardContent>
          </Card>

          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load historical data. Please try adjusting the date range or refresh the page.
              </AlertDescription>
            </Alert>
          ) : isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading historical data...
            </div>
          ) : !historicalData || historicalData.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No historical data available for the selected period
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <PressureChart data={historicalData} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <WindChart data={historicalData} />
                <TemperatureChart data={historicalData} />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
