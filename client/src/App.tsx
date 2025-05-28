import { Switch, Route, RouteComponentProps } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Projects from "@/pages/projects";
import ProjectDetails from "@/pages/projects/[id]";
import Transformations from "@/pages/transformations";
import Descriptions from "@/pages/descriptions";
import WebhookCallback from "@/pages/webhook-callback";
import Landing from "@/pages/landing";
import Pricing from "@/pages/pricing";
import Debug from "@/pages/debug";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/use-auth";
import { AuthProvider } from "@/contexts/AuthContext";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }
  
  if (!user) {
    // Use React Router's useLocation and Redirect
    return <Route path="*" component={() => {
      window.location.href = "/login";
      return null;
    }} />;
  }
  
  return <Component />;
}

function PublicRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }
  
  if (user) {
    // Use React Router's useLocation and Redirect
    return <Route path="*" component={() => {
      window.location.href = "/";
      return null;
    }} />;
  }
  
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/landing" component={Landing} />
      <Route path="/login" component={() => <PublicRoute component={Login} />} />
      <Route path="/register" component={() => <PublicRoute component={Register} />} />
      
      <Route path="/" component={() => 
        <MainLayout>
          <ProtectedRoute component={Dashboard} />
        </MainLayout>
      } />
      
      <Route path="/projects" component={() => 
        <MainLayout>
          <ProtectedRoute component={Projects} />
        </MainLayout>
      } />
      
      <Route path="/projects/:id" component={(params: RouteComponentProps<{ id: string }>) => 
        <MainLayout>
          <ProtectedRoute component={() => <ProjectDetails id={params.params.id} />} />
        </MainLayout>
      } />
      
      <Route path="/transformations" component={() => 
        <MainLayout>
          <ProtectedRoute component={Transformations} />
        </MainLayout>
      } />
      
      <Route path="/descriptions" component={() => 
        <MainLayout>
          <ProtectedRoute component={Descriptions} />
        </MainLayout>
      } />
      
      <Route path="/pricing" component={() => 
        <MainLayout>
          <ProtectedRoute component={Pricing} />
        </MainLayout>
      } />
      
      <Route path="/webhook-callback" component={WebhookCallback} />
      
      <Route path="/debug" component={() => 
        <MainLayout>
          <ProtectedRoute component={Debug} />
        </MainLayout>
      } />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
