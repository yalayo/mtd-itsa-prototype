import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Check, Clock, AlertTriangle, FileText, ArrowUpRight, Download } from "lucide-react";
import { submitTaxReport } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/user-context";

interface TaxReportCardProps {
  report: any;
}

export function TaxReportCard({ report }: TaxReportCardProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  
  const submitMutation = useMutation({
    mutationFn: () => submitTaxReport(report.id),
    onSuccess: (updatedReport) => {
      queryClient.invalidateQueries({ queryKey: [user?.id ? `/api/users/${user.id}/tax-reports` : null] });
      toast({
        title: "Report submitted successfully",
        description: `Your Q${report.quarter} ${report.year} report has been submitted to HMRC.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(value);
  };
  
  // Format dates
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not submitted';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Get appropriate status badge
  const getStatusBadge = () => {
    switch(report.status) {
      case 'draft':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Draft</Badge>;
      case 'submitted':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Submitted</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Confirmed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  // Get status icon
  const getStatusIcon = () => {
    switch(report.status) {
      case 'draft':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'submitted':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'confirmed':
        return <Check className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const handleSubmit = () => {
    setIsConfirmDialogOpen(true);
  };
  
  const confirmSubmit = () => {
    submitMutation.mutate();
    setIsConfirmDialogOpen(false);
  };
  
  return (
    <>
      <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-0">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
              <div className="flex items-start mb-4 sm:mb-0">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                  <FileText className="h-5 w-5 text-primary-500" />
                </div>
                <div>
                  <div className="flex items-center">
                    <h3 className="text-lg font-medium text-gray-900">
                      Q{report.quarter} {report.year} Tax Report
                    </h3>
                    <div className="ml-2">
                      {getStatusBadge()}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Period: {new Date(report.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} - {new Date(report.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {report.status === 'draft' ? (
                  <Button 
                    variant="default" 
                    onClick={handleSubmit}
                    disabled={submitMutation.isPending}
                  >
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    Submit to HMRC
                  </Button>
                ) : (
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                )}
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Income</p>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(report.totalIncome)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Expenses</p>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(report.totalExpenses)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Tax Due</p>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(report.taxDue)}</p>
              </div>
            </div>
            
            {report.status !== 'draft' && (
              <div className="mt-4 bg-gray-50 p-3 rounded-md">
                <div className="flex items-start">
                  {getStatusIcon()}
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {report.status === 'submitted' ? 'Submitted to HMRC' : 'Confirmed by HMRC'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {report.submissionDate ? (
                        <>
                          Date: {formatDate(report.submissionDate)}
                          {report.hmrcReference && (
                            <> | Reference: {report.hmrcReference}</>
                          )}
                        </>
                      ) : 'Not yet submitted'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Confirmation Dialog */}
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Tax Report to HMRC</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to submit your Q{report.quarter} {report.year} tax report to HMRC through the Making Tax Digital system. 
              This action cannot be undone.
              
              <div className="mt-4 p-3 bg-amber-50 rounded-md">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                  <p className="text-sm text-amber-800">
                    By submitting this report, you confirm that the information provided is correct and complete to the best of your knowledge.
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSubmit}>Submit Report</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
