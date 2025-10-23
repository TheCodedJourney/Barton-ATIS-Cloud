import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Home, TrendingUp, FileText } from "lucide-react";
import Dashboard from "@/pages/dashboard";
import Historical from "@/pages/historical";
import Documents from "@/pages/documents";
import NotFound from "@/pages/not-found";

function Navigation() {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-around p-2">
        <Link href="/">
          <Button
            variant={isActive("/") ? "default" : "ghost"}
            size="sm"
            className="flex-col h-auto py-2 px-4"
            data-testid="link-nav-dashboard"
          >
            <Home className="h-5 w-5 mb-1" />
            <span className="text-xs">Dashboard</span>
          </Button>
        </Link>
        <Link href="/historical">
          <Button
            variant={isActive("/historical") ? "default" : "ghost"}
            size="sm"
            className="flex-col h-auto py-2 px-4"
            data-testid="link-nav-historical"
          >
            <TrendingUp className="h-5 w-5 mb-1" />
            <span className="text-xs">Historical</span>
          </Button>
        </Link>
        <Link href="/documents">
          <Button
            variant={isActive("/documents") ? "default" : "ghost"}
            size="sm"
            className="flex-col h-auto py-2 px-4"
            data-testid="link-nav-documents"
          >
            <FileText className="h-5 w-5 mb-1" />
            <span className="text-xs">Documents</span>
          </Button>
        </Link>
      </div>
    </nav>
  );
}

function DesktopNavigation() {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <div className="hidden md:block fixed left-0 top-16 bottom-0 w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40">
      <nav className="p-4 space-y-2">
        <Link href="/">
          <Button
            variant={isActive("/") ? "default" : "ghost"}
            className="w-full justify-start"
            data-testid="link-desktop-dashboard"
          >
            <Home className="h-5 w-5 mr-2" />
            Dashboard
          </Button>
        </Link>
        <Link href="/historical">
          <Button
            variant={isActive("/historical") ? "default" : "ghost"}
            className="w-full justify-start"
            data-testid="link-desktop-historical"
          >
            <TrendingUp className="h-5 w-5 mr-2" />
            Historical Statistics
          </Button>
        </Link>
        <Link href="/documents">
          <Button
            variant={isActive("/documents") ? "default" : "ghost"}
            className="w-full justify-start"
            data-testid="link-desktop-documents"
          >
            <FileText className="h-5 w-5 mr-2" />
            Documents
          </Button>
        </Link>
      </nav>
    </div>
  );
}

function Router() {
  return (
    <div className="md:ml-64">
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/historical" component={Historical} />
        <Route path="/documents" component={Documents} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <div className="pb-16 md:pb-0">
            <DesktopNavigation />
            <Router />
            <Navigation />
          </div>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
