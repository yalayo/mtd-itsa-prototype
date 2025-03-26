import { Switch, Route } from "wouter";
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
import NotFound from "@/pages/not-found";
import { useUser, UserProvider } from "./context/user-context";

function Router() {
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
