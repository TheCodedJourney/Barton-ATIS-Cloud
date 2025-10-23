import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/atis/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Download, FileText, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { CurrentAtisData } from "@shared/schema";

export default function Documents() {
  const { toast } = useToast();
  const [selectedNotamCategories, setSelectedNotamCategories] = useState<string[]>([
    "aerodrome",
    "operational",
    "navigation",
  ]);
  const [selectedAerodromeInfo, setSelectedAerodromeInfo] = useState<string[]>([
    "general",
    "runways",
    "frequencies",
    "procedures",
  ]);

  const { data: currentAtis } = useQuery<CurrentAtisData>({
    queryKey: ["/api/atis/current"],
  });

  const handleDownloadNotams = async () => {
    try {
      const response = await fetch("/api/documents/notams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: selectedNotamCategories }),
      });

      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `EGCB_NOTAMs_${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Complete",
        description: "NOTAM document has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download NOTAM document. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadAerodrome = async () => {
    try {
      const response = await fetch("/api/documents/aerodrome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections: selectedAerodromeInfo }),
      });

      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `EGCB_Aerodrome_Info_${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Complete",
        description: "Aerodrome information document has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download aerodrome information. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleNotamCategory = (category: string) => {
    setSelectedNotamCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const toggleAerodromeSection = (section: string) => {
    setSelectedAerodromeInfo((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        airfieldStatus={currentAtis?.atis?.airfieldStatus || "Unknown"}
        lastUpdated={currentAtis?.lastUpdated || new Date()}
      />

      <main className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="space-y-6 max-w-4xl">
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <FileText className="h-8 w-8" />
              Document Downloads
            </h2>
            <p className="text-muted-foreground mt-1">
              Download NOTAMs and aerodrome information documents
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  NOTAM Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="notam-aerodrome"
                      checked={selectedNotamCategories.includes("aerodrome")}
                      onCheckedChange={() => toggleNotamCategory("aerodrome")}
                      data-testid="checkbox-notam-aerodrome"
                    />
                    <Label htmlFor="notam-aerodrome" className="cursor-pointer">
                      Aerodrome NOTAMs
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="notam-operational"
                      checked={selectedNotamCategories.includes("operational")}
                      onCheckedChange={() => toggleNotamCategory("operational")}
                      data-testid="checkbox-notam-operational"
                    />
                    <Label htmlFor="notam-operational" className="cursor-pointer">
                      Operational NOTAMs
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="notam-navigation"
                      checked={selectedNotamCategories.includes("navigation")}
                      onCheckedChange={() => toggleNotamCategory("navigation")}
                      data-testid="checkbox-notam-navigation"
                    />
                    <Label htmlFor="notam-navigation" className="cursor-pointer">
                      Navigation Aid NOTAMs
                    </Label>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={handleDownloadNotams}
                  disabled={selectedNotamCategories.length === 0}
                  data-testid="button-download-notams"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download NOTAM PDF
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Aerodrome Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="aero-general"
                      checked={selectedAerodromeInfo.includes("general")}
                      onCheckedChange={() => toggleAerodromeSection("general")}
                      data-testid="checkbox-aero-general"
                    />
                    <Label htmlFor="aero-general" className="cursor-pointer">
                      General Information
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="aero-runways"
                      checked={selectedAerodromeInfo.includes("runways")}
                      onCheckedChange={() => toggleAerodromeSection("runways")}
                      data-testid="checkbox-aero-runways"
                    />
                    <Label htmlFor="aero-runways" className="cursor-pointer">
                      Runway Details
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="aero-frequencies"
                      checked={selectedAerodromeInfo.includes("frequencies")}
                      onCheckedChange={() => toggleAerodromeSection("frequencies")}
                      data-testid="checkbox-aero-frequencies"
                    />
                    <Label htmlFor="aero-frequencies" className="cursor-pointer">
                      Radio Frequencies
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="aero-procedures"
                      checked={selectedAerodromeInfo.includes("procedures")}
                      onCheckedChange={() => toggleAerodromeSection("procedures")}
                      data-testid="checkbox-aero-procedures"
                    />
                    <Label htmlFor="aero-procedures" className="cursor-pointer">
                      Procedures
                    </Label>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={handleDownloadAerodrome}
                  disabled={selectedAerodromeInfo.length === 0}
                  data-testid="button-download-aerodrome"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Aerodrome PDF
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
