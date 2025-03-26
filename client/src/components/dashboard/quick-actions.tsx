import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Upload, FileText } from "lucide-react";
import { ImportModal } from "@/components/modals/import-modal";
import { Link } from "wouter";

export function QuickActions() {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  return (
    <>
      <Card className="bg-white shadow rounded-lg overflow-hidden">
        <CardHeader className="px-4 py-5 sm:px-6">
          <CardTitle className="text-lg font-medium leading-6 text-gray-900">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="space-y-3">
            <Link href="/transactions?new=true">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4 text-primary-500" />
                Add New Transaction
              </Button>
            </Link>
            <Button variant="outline" className="w-full justify-start" onClick={() => setIsImportModalOpen(true)}>
              <Upload className="mr-2 h-4 w-4 text-primary-500" />
              Import Excel Data
            </Button>
            <Link href="/tax-reports?prepare=true">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4 text-primary-500" />
                Prepare Tax Report
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      
      <ImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
      />
    </>
  );
}
