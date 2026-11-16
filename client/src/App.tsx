import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { ThemeProvider } from "@/components/theme-provider";
import Dashboard from "@/pages/dashboard";

const systemTheme = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme={systemTheme}>
        <Dashboard />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
