import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Check, Clock, Download, Search, FileSpreadsheet } from "lucide-react";
import { Input } from "@/components/ui/input";

// This is a mock component since the import history API is not fully implemented yet
export function ImportHistory() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // In a real implementation, this data would come from an API
  const mockImportHistory = [
    {
      id: 1,
      fileName: "Q1_2024_Transactions.xlsx",
      importDate: new Date(2024, 3, 10),
      status: "completed",
      transactionsFound: 42,
      transactionsImported: 42,
    },
    {
      id: 2,
      fileName: "Rental_Income_2023.xlsx",
      importDate: new Date(2024, 2, 15),
      status: "completed",
      transactionsFound: 24,
      transactionsImported: 24,
    },
    {
      id: 3,
      fileName: "Business_Expenses_Q4.xlsx",
      importDate: new Date(2024, 1, 28),
      status: "error",
      errorMessage: "Invalid data format in column C",
      transactionsFound: 18,
      transactionsImported: 0,
    }
  ];
  
  const filteredHistory = mockImportHistory.filter(item => 
    item.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Processing</Badge>;
      case 'error':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'completed':
        return <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center"><Check className="h-4 w-4 text-green-500" /></div>;
      case 'processing':
        return <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center"><Clock className="h-4 w-4 text-blue-500" /></div>;
      case 'error':
        return <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center"><AlertCircle className="h-4 w-4 text-red-500" /></div>;
      default:
        return <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center"><AlertCircle className="h-4 w-4 text-gray-500" /></div>;
    }
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Import History</CardTitle>
              <CardDescription>Recent Excel file imports and their status</CardDescription>
            </div>
            <div className="mt-4 sm:mt-0 w-full sm:w-72">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by filename..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Imports</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="failed">Failed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              {filteredHistory.length > 0 ? (
                filteredHistory.map(import_item => (
                  <div key={import_item.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start">
                      <div className="mr-4 hidden sm:block">
                        {getStatusIcon(import_item.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                          <div className="flex items-center mb-2 sm:mb-0">
                            <FileSpreadsheet className="h-5 w-5 text-primary-500 mr-2 sm:hidden" />
                            <h3 className="text-base font-medium text-gray-900">{import_item.fileName}</h3>
                            <div className="ml-2">
                              {getStatusBadge(import_item.status)}
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">{formatDate(import_item.importDate)}</span>
                        </div>
                        
                        {import_item.status === 'completed' ? (
                          <div className="text-sm text-gray-600">
                            Successfully imported {import_item.transactionsImported} transactions from {import_item.transactionsFound} found in the file.
                          </div>
                        ) : import_item.status === 'error' ? (
                          <div className="text-sm text-red-600">
                            Error: {import_item.errorMessage}
                          </div>
                        ) : (
                          <div className="text-sm text-blue-600">
                            Processing {import_item.fileName}...
                          </div>
                        )}
                      </div>
                      
                      {import_item.status === 'completed' && (
                        <div className="ml-4">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Report
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <FileSpreadsheet className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No import history found</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {searchQuery 
                      ? `No results matching "${searchQuery}"`
                      : "You haven't imported any Excel files yet"
                    }
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="completed" className="space-y-4">
              {filteredHistory.filter(item => item.status === 'completed').length > 0 ? (
                filteredHistory
                  .filter(item => item.status === 'completed')
                  .map(import_item => (
                    <div key={import_item.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start">
                        <div className="mr-4 hidden sm:block">
                          {getStatusIcon(import_item.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                            <div className="flex items-center mb-2 sm:mb-0">
                              <FileSpreadsheet className="h-5 w-5 text-primary-500 mr-2 sm:hidden" />
                              <h3 className="text-base font-medium text-gray-900">{import_item.fileName}</h3>
                              <div className="ml-2">
                                {getStatusBadge(import_item.status)}
                              </div>
                            </div>
                            <span className="text-sm text-gray-500">{formatDate(import_item.importDate)}</span>
                          </div>
                          
                          <div className="text-sm text-gray-600">
                            Successfully imported {import_item.transactionsImported} transactions from {import_item.transactionsFound} found in the file.
                          </div>
                        </div>
                        
                        <div className="ml-4">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Report
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium text-gray-900">No completed imports</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {searchQuery 
                      ? `No completed imports matching "${searchQuery}"`
                      : "You don't have any completed imports yet"
                    }
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="failed" className="space-y-4">
              {filteredHistory.filter(item => item.status === 'error').length > 0 ? (
                filteredHistory
                  .filter(item => item.status === 'error')
                  .map(import_item => (
                    <div key={import_item.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start">
                        <div className="mr-4 hidden sm:block">
                          {getStatusIcon(import_item.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                            <div className="flex items-center mb-2 sm:mb-0">
                              <FileSpreadsheet className="h-5 w-5 text-primary-500 mr-2 sm:hidden" />
                              <h3 className="text-base font-medium text-gray-900">{import_item.fileName}</h3>
                              <div className="ml-2">
                                {getStatusBadge(import_item.status)}
                              </div>
                            </div>
                            <span className="text-sm text-gray-500">{formatDate(import_item.importDate)}</span>
                          </div>
                          
                          <div className="text-sm text-red-600">
                            Error: {import_item.errorMessage}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium text-gray-900">No failed imports</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {searchQuery 
                      ? `No failed imports matching "${searchQuery}"`
                      : "You don't have any failed imports"
                    }
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Import Tips</CardTitle>
          <CardDescription>Guidelines for preparing your Excel files</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-l-4 border-primary-500 pl-4 py-2">
            <h4 className="text-sm font-medium text-gray-900">Format Your Data</h4>
            <p className="text-sm text-gray-600">
              Structure your spreadsheet with clear headers for Date, Description, Amount, Category, etc.
            </p>
          </div>
          
          <div className="border-l-4 border-primary-500 pl-4 py-2">
            <h4 className="text-sm font-medium text-gray-900">Currency Columns</h4>
            <p className="text-sm text-gray-600">
              Include a Currency column if you have transactions in multiple currencies.
            </p>
          </div>
          
          <div className="border-l-4 border-primary-500 pl-4 py-2">
            <h4 className="text-sm font-medium text-gray-900">Date Formats</h4>
            <p className="text-sm text-gray-600">
              Use consistent date formats (DD/MM/YYYY or MM/DD/YYYY) throughout your spreadsheet.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
