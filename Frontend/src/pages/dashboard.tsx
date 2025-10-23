import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/atis/header";
import { CurrentAtisCard } from "@/components/atis/current-atis-card";
import { WeatherCard } from "@/components/atis/weather-card";
import { RunwayStatusGrid } from "@/components/atis/runway-status-grid";
import { NotamList } from "@/components/atis/notam-list";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { CurrentAtisData } from "@shared/schema";

export default function Dashboard() {
  const { data, isLoading, error, refetch, isRefetching } = useQuery<CurrentAtisData>({
    queryKey: ["/api/atis/current"],
    refetchInterval: 60000, // Auto-refresh every 60 seconds
  });

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          airfieldStatus="Unknown"
          lastUpdated={new Date()}
          onRefresh={() => refetch()}
        />
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load ATIS data. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          airfieldStatus="Loading..."
          lastUpdated={new Date()}
        />
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <Skeleton className="h-[200px] w-full" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Skeleton className="h-[300px]" />
              <Skeleton className="h-[300px]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        airfieldStatus={data!.atis.airfieldStatus}
        lastUpdated={data!.lastUpdated}
        onRefresh={() => refetch()}
        isRefreshing={isRefetching}
      />
      
      <main className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="md:hidden mb-4">
            <div className="text-sm text-muted-foreground">
              Last updated: <span className="font-mono font-medium">{new Date(data!.lastUpdated).toLocaleTimeString('en-GB')}z</span>
            </div>
          </div>

          <CurrentAtisCard data={data!.atis} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WeatherCard data={data!.weather} />
            <RunwayStatusGrid runways={data!.runways} />
          </div>

          <NotamList notams={data!.notams} />
        </div>
      </main>
    </div>
  );
}
