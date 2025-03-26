import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Sidebar } from "@/components/ui/sidebar";
import Dashboard from "@/pages/dashboard";
import Transactions from "@/pages/transactions";
import Invoices from "@/pages/invoices";
import Expenses from "@/pages/expenses";
import TaxReports from "@/pages/tax-reports";
import ImportData from "@/pages/import-data";
import BusinessSetup from "@/pages/business-setup";
import Landing from "@/pages/landing";
import NotFound from "@/pages/not-found";
import { useUser, UserProvider } from "./context/user-context";

function Router() {
  const [location] = useLocation();
  
  // Don't show sidebar for landing page
  if (location === "/landing") {
    return (
      <div className="min-h-screen">
        <Switch>
          <Route path="/landing" component={Landing} />
        </Switch>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/transactions" component={Transactions} />
          <Route path="/invoices" component={Invoices} />
          <Route path="/expenses" component={Expenses} />
          <Route path="/tax-reports" component={TaxReports} />
          <Route path="/import-data" component={ImportData} />
          <Route path="/business-setup" component={BusinessSetup} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function AppContent() {
  const { isInitialized } = useUser();
  const [location] = useLocation();
  
  // Skip user check for landing page
  if (location === "/landing") {
    return (
      <div>
        <Router />
        <Toaster />
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <Router />
      <Toaster />
    </div>
  );
}

// Redirect to landing page if user is visiting the site for the first time
function App() {
  const [location, setLocation] = useLocation();
  
  // If the user is at the root path and hasn't seen the landing page,
  // redirect them to the landing page
  useEffect(() => {
    const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
    if (location === '/' && !hasVisitedBefore) {
      localStorage.setItem('hasVisitedBefore', 'true');
      setLocation('/landing');
    }
  }, [location, setLocation]);

  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
