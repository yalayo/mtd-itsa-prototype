import { useQuery } from "@tanstack/react-query";
import { getTaxReports } from "@/lib/api";
import { useUser } from "@/context/user-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check, Clock, Hourglass } from "lucide-react";

export function TaxTimeline() {
  const { user } = useUser();
  
  const { data: taxReports, isLoading } = useQuery({
    queryKey: [user?.id ? `/api/users/${user.id}/tax-reports` : null],
    enabled: !!user?.id,
  });
  
  if (isLoading || !user) {
    return (
      <Card className="bg-white shadow rounded-lg overflow-hidden">
        <CardHeader className="px-4 py-5 sm:px-6">
          <CardTitle className="text-lg font-medium leading-6 text-gray-900">
            <div className="h-5 w-32 bg-gray-200 animate-pulse rounded"></div>
          </CardTitle>
          <CardDescription className="mt-1 max-w-2xl text-sm text-gray-500">
            <div className="h-4 w-48 bg-gray-200 animate-pulse rounded"></div>
          </CardDescription>
        </CardHeader>
        <CardContent className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-gray-200 animate-pulse rounded-full"></div>
                </div>
                <div className="ml-3">
                  <div className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div>
                  <div className="mt-1 h-3 w-32 bg-gray-200 animate-pulse rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Generate timeline entries
  const currentYear = new Date().getFullYear();
  const currentQuarter = Math.floor((new Date().getMonth() / 3) + 1);
  
  const timelineEntries = [
    { 
      quarter: 4, 
      year: currentYear - 1, 
      status: "completed", 
      date: `Jan 31, ${currentYear}` 
    },
    { 
      quarter: 1, 
      year: currentYear, 
      status: "pending", 
      date: `Apr 30, ${currentYear}` 
    },
    { 
      quarter: 2, 
      year: currentYear, 
      status: "upcoming", 
      date: `Jul 31, ${currentYear}` 
    },
    { 
      quarter: 3, 
      year: currentYear, 
      status: "upcoming", 
      date: `Oct 31, ${currentYear}` 
    }
  ];
  
  // Update with actual data if available
  if (taxReports) {
    taxReports.forEach((report: any) => {
      const entry = timelineEntries.find(e => e.quarter === report.quarter && e.year === report.year);
      if (entry) {
        entry.status = report.status === "submitted" ? "completed" : "pending";
        if (report.submissionDate) {
          const submissionDate = new Date(report.submissionDate);
          entry.date = `Submitted on ${submissionDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`;
        }
      }
    });
  }
  
  return (
    <Card className="bg-white shadow rounded-lg overflow-hidden">
      <CardHeader className="px-4 py-5 sm:px-6">
        <CardTitle className="text-lg font-medium leading-6 text-gray-900">Tax Timeline</CardTitle>
        <CardDescription className="mt-1 max-w-2xl text-sm text-gray-500">Your MTD ITSA reporting deadlines</CardDescription>
      </CardHeader>
      <CardContent className="border-t border-gray-200 px-4 py-5 sm:px-6">
        <div className="space-y-4">
          {timelineEntries.map((entry, index) => (
            <div key={index} className="flex items-start">
              <div className="flex-shrink-0">
                {entry.status === "completed" ? (
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-500">
                    <Check className="h-4 w-4" />
                  </div>
                ) : entry.status === "pending" ? (
                  <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-500">
                    <Clock className="h-4 w-4" />
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                    <Hourglass className="h-4 w-4" />
                  </div>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  Q{entry.quarter} {entry.year}-{entry.year + 1}
                </p>
                <p className="text-sm text-gray-500">
                  {entry.status === "completed" ? `${entry.date}` : entry.status === "pending" ? `Due on ${entry.date}` : `Due on ${entry.date}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
