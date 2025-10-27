import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Courses from "./pages/Courses";
import Journeys from "./pages/Journeys";
import Exams from "./pages/Exams";
import Competencies from "./pages/Competencies";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const MainLayout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center justify-between border-b bg-card px-4">
            <SidebarTrigger />
            <Button onClick={handleLogout} variant="ghost" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </header>
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/jornadas" element={<Journeys />} />
              <Route path="/cursos" element={<Courses />} />
              <Route path="/provas" element={<Exams />} />
              <Route path="/competencias" element={<Competencies />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/*" element={<MainLayout />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
