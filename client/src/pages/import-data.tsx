import { useState } from "react";
import { ExcelUpload } from "@/components/import-data/excel-upload";
import { ImportHistory } from "@/components/import-data/import-history";
import { useUser } from "@/context/user-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, History, FileText, Database } from "lucide-react";

export default function ImportData() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("upload");
  
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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
                <div className="text-lg font-semibold text-primary-500 md:ml-6">Import Data</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Import Data</h1>
          <p className="mt-1 text-sm text-gray-500">
            Import your financial data from Excel spreadsheets using Google Gemini AI
          </p>
        </div>
        
        {/* Main content */}
        <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-8 w-full max-w-md mx-auto">
            <TabsTrigger value="upload" className="flex items-center">
              <Upload className="h-4 w-4 mr-2" />
              Upload Excel
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center">
              <History className="h-4 w-4 mr-2" />
              Import History
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="mt-0">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Upload area */}
              <div className="lg:col-span-2">
                <ExcelUpload />
              </div>
              
              {/* Helpful information */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-primary-500" />
                      Supported Formats
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-primary-500 rounded-full mr-2"></div>
                        Excel files (.xlsx, .xls)
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-primary-500 rounded-full mr-2"></div>
                        Maximum file size: 10MB
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-primary-500 rounded-full mr-2"></div>
                        All common Excel formats supported
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Database className="h-5 w-5 mr-2 text-primary-500" />
                      How It Works
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Our system uses Google Gemini AI to analyze your Excel files and automatically:
                    </p>
                    <ol className="space-y-2 text-sm list-decimal pl-5">
                      <li>Extract transaction data from your spreadsheets</li>
                      <li>Identify and categorize income and expenses</li>
                      <li>Convert multi-currency transactions</li>
                      <li>Import the data into your account</li>
                    </ol>
                    <p className="text-sm text-gray-600 mt-4">
                      The AI will analyze column headers and content to determine what data represents transactions, categories, dates, and amounts.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="mt-0">
            <ImportHistory />
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
