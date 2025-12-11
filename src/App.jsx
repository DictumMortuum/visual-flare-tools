import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout.jsx";
import Index from "./pages/Index.jsx";
import About from "./pages/About";
import ToolPage from "./pages/ToolPage.jsx";
import NotFound from "./pages/NotFound.jsx";
import Login from "./components/auth/Login.jsx";
import { WishlistRouter } from "@/components/tools/general/Wishlist";
import { TableRouter } from "@/components/tools/boardgame/BoardGameTables";
import EurovisionLeaderboard from "./pages/EurovisionLeaderboard.jsx";
import { UserProvider } from './context';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <UserProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <HashRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/tools/:id" element={<ToolPage />} />
                <Route path="/wishlist/:email" element={<WishlistRouter />} />
                <Route path="/table/:id" element={<TableRouter />} />
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<NotFound />} />
              </Route>
              <Route path="/eurovision-leaderboard" element={<EurovisionLeaderboard />} />
            </Routes>
          </HashRouter>
        </TooltipProvider>
      </UserProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
