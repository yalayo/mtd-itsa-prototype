import { useState } from "react";
import { useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getTaxReports } from "@/lib/api";
import { useUser } from "@/context/user-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileText, AlertTriangle } from "lucide-react";
import { TaxReportCard } from "@/components/tax-reports/tax-report-card";
import { CreateReportModal } from "@/components/tax-reports/create-report-modal";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function TaxReports() {
  const params = new URLSearchParams(useSearch());
  const showPrepareReport = params.get("prepare") === "true";
  
  const { user } = useUser();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(showPrepareReport);
  
  // Get tax reports
  const { data: taxReports, isLoading } = useQuery({
    queryKey: [user?.id ? `/api/users/${user.id}/tax-reports` : null],
    enabled: !!user?.id,
  });

  // Get current date info for determining next submission
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Determine which quarter we're in and the next submission date
  const currentQuarter = Math.floor(currentMonth / 3) + 1;
  
  // Calculate next submission details
  let nextSubmissionQuarter = currentQuarter;
  let nextSubmissionYear = currentYear;
  let submissionDeadline: Date;
  
  // Calculate the next submission deadline
  if (currentMonth < 3) {
    // Q4 submission due on January 31
    submissionDeadline = new Date(currentYear, 0, 31);
    nextSubmissionQuarter = 4;
    nextSubmissionYear = currentYear - 1;
  } else if (currentMonth < 6) {
    // Q1 submission due on April 30
    submissionDeadline = new Date(currentYear, 3, 30);
    nextSubmissionQuarter = 1;
  } else if (currentMonth < 9) {
    // Q2 submission due on July 31
    submissionDeadline = new Date(currentYear, 6, 31);
    nextSubmissionQuarter = 2;
  } else {
    // Q3 submission due on October 31
    submissionDeadline = new Date(currentYear, 9, 31);
    nextSubmissionQuarter = 3;
  }
  
  // Check if the next submission is already prepared
  const isNextSubmissionPrepared = taxReports?.some((report: any) => 
    report.year === nextSubmissionYear && 
    report.quarter === nextSubmissionQuarter &&
    (report.status === "draft" || report.status === "submitted")
  );

  // Calculate days until deadline
  const daysUntilDeadline = Math.ceil(
    (submissionDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // Format submission deadline for display
  const formattedDeadline = submissionDeadline.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  if (isLoading || !user) {
    return (
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Tax Reports</h1>
          <p className="mt-1 text-sm text-gray-500">View and manage your MTD ITSA tax submissions</p>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <div className="text-lg font-semibold text-primary-500 md:ml-6">Tax Reports</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
        {/* Header and actions */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">MTD ITSA Submissions</h1>
              <p className="mt-1 text-sm text-gray-500">
                Prepare and submit your quarterly and annual tax reports
              </p>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Prepare Report
            </Button>
          </div>
          
          {/* Upcoming deadline alert */}
          {!isNextSubmissionPrepared && daysUntilDeadline <= 45 && (
            <Alert className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6">
              <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
              <AlertDescription className="text-sm text-amber-700">
                Your Q{nextSubmissionQuarter} {nextSubmissionYear} tax submission is due on <span className="font-medium">{formattedDeadline}</span> ({daysUntilDeadline} days remaining). 
                <Button variant="link" className="pl-1 text-amber-800 hover:text-amber-600 underline" onClick={() => setIsCreateModalOpen(true)}>
                  Prepare your submission now
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        {/* Tax reports */}
        <div className="space-y-6">
          {taxReports && taxReports.length > 0 ? (
            <>
              {/* Active reports */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Current Tax Year Reports</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {taxReports
                    .filter((report: any) => report.year === currentYear || (report.year === currentYear - 1 && currentMonth < 3))
                    .map((report: any) => (
                      <TaxReportCard key={report.id} report={report} />
                    ))}
                </CardContent>
              </Card>
              
              {/* Previous reports */}
              {taxReports.some((report: any) => report.year < currentYear && !(report.year === currentYear - 1 && currentMonth < 3)) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Previous Tax Years</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {taxReports
                      .filter((report: any) => report.year < currentYear && !(report.year === currentYear - 1 && currentMonth < 3))
                      .map((report: any) => (
                        <TaxReportCard key={report.id} report={report} />
                      ))}
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 mb-4">
                <FileText className="h-6 w-6 text-primary-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No tax reports found</h3>
              <p className="mt-2 text-sm text-gray-500">
                Get started by preparing your first quarterly submission for MTD ITSA.
              </p>
              <div className="mt-6">
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Prepare First Report
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Create Report Modal */}
      <CreateReportModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        defaultQuarter={nextSubmissionQuarter}
        defaultYear={nextSubmissionYear}
      />
    </>
  );
}
