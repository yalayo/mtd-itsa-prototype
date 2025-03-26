import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CloudUpload, FileSpreadsheet, Cpu, Check, AlertCircle } from "lucide-react";
import { useUser } from "@/context/user-context";
import { importExcelFile } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export function ExcelUpload() {
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [processingMessage, setProcessingMessage] = useState("Preparing to analyze your data...");
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFile(file);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };
  
  const handleFile = (file: File) => {
    if (file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || 
        file.type === "application/vnd.ms-excel") {
      setSelectedFile(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload an Excel file (.xlsx or .xls)",
        variant: "destructive",
      });
    }
  };
  
  const handleUpload = async () => {
    if (!selectedFile || !user) return;
    
    setIsProcessing(true);
    setProgress(0);
    setStatus('processing');
    
    // Simulate progress updates with realistic AI processing messages
    const progressMessages = [
      "Preparing to analyze your data...",
      "Analyzing spreadsheet structure...",
      "Identifying column headers and content types...",
      "Extracting transaction data with Gemini AI...",
      "Categorizing income and expenses...",
      "Converting currency values...",
      "Validating transaction data...",
      "Preparing to import transactions..."
    ];
    
    let messageIndex = 0;
    
    const progressInterval = setInterval(() => {
      setProgress((prevProgress) => {
        const increment = Math.random() * 15;
        const newProgress = prevProgress + increment;
        
        if (newProgress > messageIndex * 12 && messageIndex < progressMessages.length) {
          setProcessingMessage(progressMessages[messageIndex]);
          messageIndex++;
        }
        
        return newProgress > 90 ? 90 : newProgress;
      });
    }, 800);
    
    try {
      await importExcelFile(user.id, selectedFile);
      
      // Clear the progress interval and set to 100%
      clearInterval(progressInterval);
      setProgress(100);
      setProcessingMessage("Import completed successfully!");
      setStatus('success');
      
      // Wait a bit to show 100% completion
      setTimeout(() => {
        // Invalidate relevant queries to refresh the data
        queryClient.invalidateQueries({ queryKey: [`/api/users/${user.id}/transactions`] });
        
        toast({
          title: "Import successful",
          description: "Your Excel data has been processed and transactions have been imported.",
        });
      }, 1500);
    } catch (error) {
      clearInterval(progressInterval);
      setStatus('error');
      setProcessingMessage("Import failed. Please check your file and try again.");
      
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Failed to import Excel data. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const resetUpload = () => {
    setSelectedFile(null);
    setIsProcessing(false);
    setProgress(0);
    setStatus('idle');
    setProcessingMessage("Preparing to analyze your data...");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Cpu className="h-5 w-5 mr-2 text-primary-500" />
          Import with Gemini AI
        </CardTitle>
        <CardDescription>
          Upload your Excel spreadsheet and our AI will automatically extract and categorize your transactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isProcessing ? (
          <div 
            className={`border-2 ${selectedFile ? 'border-primary-300 bg-primary-50' : 'border-dashed border-gray-300 hover:bg-gray-50'} rounded-lg p-6 transition-all duration-200`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center py-4">
              {selectedFile ? (
                <div className="text-center">
                  <div className="mb-4 h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center mx-auto">
                    <FileSpreadsheet className="h-6 w-6 text-primary-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">{selectedFile.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB · Excel Spreadsheet
                  </p>
                  <div className="mt-4 flex justify-center space-x-3">
                    <Button variant="outline" onClick={resetUpload}>
                      Change File
                    </Button>
                    <Button onClick={handleUpload}>
                      Start Import
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <CloudUpload className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">Upload your Excel file</h3>
                  <p className="mt-1 text-sm text-gray-500 text-center mb-6">
                    Drag and drop your file here, or click to browse
                  </p>
                  <Button onClick={() => fileInputRef.current?.click()}>
                    Browse Files
                  </Button>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    className="hidden" 
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                  />
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6 border rounded-lg bg-gray-50">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  {status === 'success' ? 'Import completed' : status === 'error' ? 'Import failed' : 'Processing...'}
                </span>
                <span className="text-sm text-gray-500">{progress.toFixed(0)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            <div className="flex items-start">
              {status === 'success' ? (
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <Check className="h-4 w-4 text-green-500" />
                </div>
              ) : status === 'error' ? (
                <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                </div>
              ) : (
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                  <Cpu className="h-4 w-4 text-primary-500" />
                </div>
              )}
              <div>
                <p className="text-sm text-gray-900 font-medium">
                  {processingMessage}
                </p>
                {selectedFile && (
                  <p className="text-xs text-gray-500 mt-1">
                    File: {selectedFile.name}
                  </p>
                )}
              </div>
            </div>
            
            {(status === 'success' || status === 'error') && (
              <div className="mt-6 flex justify-end">
                <Button variant="outline" onClick={resetUpload}>
                  {status === 'success' ? 'Import Another File' : 'Try Again'}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t bg-gray-50 text-sm text-gray-500 px-6 py-4">
        <div className="flex items-center">
          <FileSpreadsheet className="h-4 w-4 mr-2 text-gray-400" />
          Supported formats: .xlsx, .xls (up to 10MB)
        </div>
      </CardFooter>
    </Card>
  );
}
