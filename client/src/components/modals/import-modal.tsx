import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Cpu, CloudUpload } from "lucide-react";
import { useUser } from "@/context/user-context";
import { importExcelFile } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportModal({ isOpen, onClose }: ImportModalProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
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
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  const handleImport = async () => {
    if (!selectedFile || !user) return;
    
    setIsProcessing(true);
    setProgress(0);
    
    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress + Math.random() * 10;
        return newProgress > 90 ? 90 : newProgress;
      });
    }, 500);
    
    try {
      await importExcelFile(user.id, selectedFile);
      
      // Clear the progress interval and set to 100%
      clearInterval(progressInterval);
      setProgress(100);
      
      // Wait a bit to show 100% completion
      setTimeout(() => {
        // Invalidate relevant queries to refresh the data
        queryClient.invalidateQueries({ queryKey: [`/api/users/${user.id}/transactions`] });
        
        toast({
          title: "Import successful",
          description: "Your Excel data has been processed and transactions have been imported.",
        });
        
        setIsProcessing(false);
        setSelectedFile(null);
        onClose();
      }, 1000);
    } catch (error) {
      clearInterval(progressInterval);
      setIsProcessing(false);
      
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Failed to import Excel data. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleCancel = () => {
    setSelectedFile(null);
    setIsProcessing(false);
    setProgress(0);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center">
            <div className="bg-primary-100 p-2 rounded-full mr-3">
              <Cpu className="h-6 w-6 text-primary-500" />
            </div>
            <DialogTitle className="text-lg leading-6 font-medium">Import with Gemini AI</DialogTitle>
          </div>
          <DialogDescription className="mt-2">
            Upload your Excel spreadsheet and our AI will automatically extract and categorize your transactions.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          {!isProcessing ? (
            <div className="flex items-center justify-center w-full">
              <label
                className="flex flex-col w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center justify-center pt-7">
                  <CloudUpload className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    {selectedFile 
                      ? `Selected: ${selectedFile.name}`
                      : "Drag and drop your file here or click to select"
                    }
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Excel files (.xlsx, .xls) up to 10MB</p>
                </div>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  className="hidden" 
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          ) : (
            <div className="mt-4">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-gray-500 mt-2">Analyzing your data with Gemini AI...</p>
            </div>
          )}
        </div>
        
        <DialogFooter className="sm:flex sm:flex-row-reverse mt-5">
          <Button
            type="button"
            variant="default"
            onClick={handleImport}
            disabled={!selectedFile || isProcessing}
            className="w-full sm:w-auto"
          >
            {isProcessing ? "Processing..." : "Start Import"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="mt-3 sm:mt-0 sm:mr-3 w-full sm:w-auto"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
