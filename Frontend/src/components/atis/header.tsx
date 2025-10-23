import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Plane, RefreshCw } from "lucide-react";
import { format } from "date-fns";

interface HeaderProps {
  airfieldStatus: string;
  lastUpdated: Date;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function Header({ airfieldStatus, lastUpdated, onRefresh, isRefreshing }: HeaderProps) {
  const isOpen = airfieldStatus.toLowerCase().includes("open");

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Plane className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold tracking-tight">Barton ATIS Cloud</h1>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <div className="h-4 w-px bg-border" />
              <Badge
                variant={isOpen ? "default" : "secondary"}
                className={isOpen ? "bg-green-600 hover:bg-green-700" : ""}
                data-testid="badge-airfield-status"
              >
                {airfieldStatus}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <span>Updated:</span>
              <time className="font-mono font-medium" data-testid="text-last-updated">
                {format(lastUpdated, "HH:mm:ss")}
              </time>
            </div>
            {onRefresh && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onRefresh}
                disabled={isRefreshing}
                data-testid="button-refresh"
                aria-label="Refresh ATIS data"
              >
                <RefreshCw className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`} />
              </Button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
