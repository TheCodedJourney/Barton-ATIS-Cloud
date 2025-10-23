import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Info, AlertTriangle } from "lucide-react";
import type { Notam } from "@shared/schema";
import { format } from "date-fns";

interface NotamListProps {
  notams: Notam[];
}

export function NotamList({ notams }: NotamListProps) {
  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case "high":
        return {
          icon: AlertCircle,
          className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
        };
      case "medium":
        return {
          icon: AlertTriangle,
          className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
        };
      default:
        return {
          icon: Info,
          className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
        };
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Operational Briefing
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notams.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No active NOTAMs at this time
            </div>
          ) : (
            notams.map((notam) => {
              const { icon: Icon, className } = getSeverityConfig(notam.severity);
              return (
                <div
                  key={notam.id}
                  className="p-4 rounded-md border bg-card space-y-2"
                  data-testid={`notam-${notam.id}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={className}>
                        <Icon className="h-3 w-3 mr-1" />
                        {notam.category}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Valid: {format(new Date(notam.validFrom), "dd MMM HH:mm")}z
                      {notam.validTo && ` - ${format(new Date(notam.validTo), "dd MMM HH:mm")}z`}
                    </div>
                  </div>
                  <div className="text-sm leading-relaxed">{notam.content}</div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
