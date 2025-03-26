import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTransactions, createTaxReport } from "@/lib/api";
import { useUser } from "@/context/user-context";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, Calculator } from "lucide-react";

interface CreateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultQuarter?: number;
  defaultYear?: number;
}

export function CreateReportModal({ isOpen, onClose, defaultQuarter, defaultYear }: CreateReportModalProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];
  
  const [year, setYear] = useState<number>(defaultYear || currentYear);
  const [quarter, setQuarter] = useState<number>(defaultQuarter || 1);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isCalculating, setIsCalculating] = useState(false);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [taxDue, setTaxDue] = useState(0);
  
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: [user?.id ? `/api/users/${user.id}/transactions` : null],
    enabled: !!user?.id,
  });
  
  const createReportMutation = useMutation({
    mutationFn: createTaxReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [user?.id ? `/api/users/${user.id}/tax-reports` : null] });
      
      toast({
        title: "Tax report created",
        description: `Your Q${quarter} ${year} tax report has been prepared. You can now review and submit it.`,
      });
      
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Failed to create tax report",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  // Set start and end dates based on selected quarter and year
  useEffect(() => {
    if (quarter && year) {
      let start: Date, end: Date;
      
      switch (quarter) {
        case 1: // April to June
          start = new Date(year, 3, 1); // April 1
          end = new Date(year, 5, 30); // June 30
          break;
        case 2: // July to September
          start = new Date(year, 6, 1); // July 1
          end = new Date(year, 8, 30); // September 30
          break;
        case 3: // October to December
          start = new Date(year, 9, 1); // October 1
          end = new Date(year, 11, 31); // December 31
          break;
        case 4: // January to March
          start = new Date(year, 0, 1); // January 1
          end = new Date(year, 2, 31); // March 31
          break;
        default:
          start = new Date(year, 0, 1);
          end = new Date(year, 2, 31);
      }
      
      setStartDate(start);
      setEndDate(end);
    }
  }, [quarter, year]);
  
  // Calculate report figures based on transactions in the selected period
  const calculateReport = () => {
    if (!transactions || !startDate || !endDate || !user) return;
    
    setIsCalculating(true);
    
    setTimeout(() => {
      let income = 0;
      let expenses = 0;
      
      // Filter transactions for the selected period
      const periodTransactions = transactions.filter((transaction: any) => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= startDate && transactionDate <= endDate;
      });
      
      // Calculate totals
      periodTransactions.forEach((transaction: any) => {
        if (transaction.type === 'income') {
          income += Number(transaction.convertedAmount);
        } else {
          expenses += Number(transaction.convertedAmount);
        }
      });
      
      // Simple tax calculation (20% of profit)
      const profit = income - expenses;
      const tax = Math.max(0, profit * 0.2);
      
      setTotalIncome(income);
      setTotalExpenses(expenses);
      setTaxDue(tax);
      setIsCalculating(false);
    }, 1000);
  };
  
  useEffect(() => {
    if (isOpen && transactions && startDate && endDate) {
      calculateReport();
    }
  }, [isOpen, transactions, startDate, endDate]);
  
  const handleCreateReport = () => {
    if (!user || !startDate || !endDate) return;
    
    const reportData = {
      userId: user.id,
      year,
      quarter,
      startDate,
      endDate,
      totalIncome,
      totalExpenses,
      taxDue,
      status: "draft"
    };
    
    createReportMutation.mutate(reportData);
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(value);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Calculator className="mr-2 h-5 w-5 text-primary-500" />
            Prepare Tax Report
          </DialogTitle>
          <DialogDescription>
            Select the quarter and year for your MTD ITSA submission
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quarter">Quarter</Label>
              <Select value={quarter.toString()} onValueChange={(value) => setQuarter(parseInt(value))}>
                <SelectTrigger id="quarter">
                  <SelectValue placeholder="Select quarter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Q1 (Apr-Jun)</SelectItem>
                  <SelectItem value="2">Q2 (Jul-Sep)</SelectItem>
                  <SelectItem value="3">Q3 (Oct-Dec)</SelectItem>
                  <SelectItem value="4">Q4 (Jan-Mar)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Select value={year.toString()} onValueChange={(value) => setYear(parseInt(value))}>
                <SelectTrigger id="year">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    disabled
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    disabled
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
              </Popover>
            </div>
          </div>
          
          {startDate && endDate && (
            <div className="mt-4 space-y-4">
              <div className="p-4 border rounded-md bg-gray-50">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Report Summary</h4>
                
                {isCalculating ? (
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                      <div className="text-gray-600">Total Income:</div>
                      <div className="text-right font-medium">{formatCurrency(totalIncome)}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                      <div className="text-gray-600">Total Expenses:</div>
                      <div className="text-right font-medium">{formatCurrency(totalExpenses)}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t">
                      <div className="text-gray-800 font-medium">Estimated Tax Due:</div>
                      <div className="text-right font-semibold">{formatCurrency(taxDue)}</div>
                    </div>
                  </>
                )}
              </div>
              
              <div className="text-xs text-gray-500">
                This report will be saved as a draft. You can review and submit it to HMRC later.
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleCreateReport}
            disabled={isCalculating || createReportMutation.isPending || !startDate || !endDate}
          >
            {createReportMutation.isPending ? "Creating..." : "Create Draft Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
