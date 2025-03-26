import { useState, useEffect } from "react";
import { useUser } from "@/context/user-context";
import { QuickStats } from "@/components/dashboard/quick-stats";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { TaxTimeline } from "@/components/dashboard/tax-timeline";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { ExchangeRates } from "@/components/dashboard/exchange-rates";
import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ImportModal } from "@/components/modals/import-modal";

export default function Dashboard() {
  const { user } = useUser();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [daysUntilSubmission, setDaysUntilSubmission] = useState(35);
  
  useEffect(() => {
    // Calculate days until next submission
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    let nextSubmissionDate: Date;
    
    // Q1: Apr 30, Q2: Jul 31, Q3: Oct 31, Q4: Jan 31
    if (currentMonth < 3) {
      // Next is April 30
      nextSubmissionDate = new Date(currentYear, 3, 30);
    } else if (currentMonth < 6) {
      // Next is July 31
      nextSubmissionDate = new Date(currentYear, 6, 31);
    } else if (currentMonth < 9) {
      // Next is October 31
      nextSubmissionDate = new Date(currentYear, 9, 31);
    } else {
      // Next is January 31 of next year
      nextSubmissionDate = new Date(currentYear + 1, 0, 31);
    }
    
    const diffTime = nextSubmissionDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    setDaysUntilSubmission(diffDays);
  }, []);
  
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Determine which quarter is next for submission
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  let nextQuarter: number;
  let submissionDate: string;
  
  if (currentMonth < 3) {
    nextQuarter = 1;
    submissionDate = `April 30, ${currentYear}`;
  } else if (currentMonth < 6) {
    nextQuarter = 2;
    submissionDate = `July 31, ${currentYear}`;
  } else if (currentMonth < 9) {
    nextQuarter = 3;
    submissionDate = `October 31, ${currentYear}`;
  } else {
    nextQuarter = 4;
    submissionDate = `January 31, ${currentYear + 1}`;
  }
  
  return (
    <>
      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <div className="text-lg font-semibold text-primary-500 md:ml-6">Dashboard</div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="mr-4 text-gray-500 hover:text-gray-700"
                  aria-label="Notifications"
                >
                  <Bell className="h-6 w-6" />
                  <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-amber-500 text-xs text-white flex items-center justify-center">3</span>
                </Button>
              </div>
              <div className="border-l border-gray-200 h-6 mx-4 hidden md:block"></div>
              <div className="ml-3 relative md:hidden">
                <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user.fullName.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
        {/* Dashboard Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Financial Overview</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back, your tax reporting period ends in {daysUntilSubmission} days.
          </p>
        </div>

        {/* Alert */}
        <Alert className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6">
          <AlertDescription className="text-sm text-amber-700">
            Your Q{nextQuarter} tax submission is due on <span className="font-medium">{submissionDate}</span>. 
            <Button variant="link" className="pl-1 text-amber-800 hover:text-amber-600 underline" onClick={() => window.location.href="/tax-reports?prepare=true"}>
              Prepare your submission now
            </Button>
          </AlertDescription>
        </Alert>

        {/* Quick Stats */}
        <QuickStats />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent Transactions */}
          <div className="lg:col-span-2">
            <RecentTransactions />
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <TaxTimeline />
            <QuickActions />
            <ExchangeRates />
          </div>
        </div>
      </main>

      {/* Import Modal */}
      <ImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
      />
    </>
  );
}
