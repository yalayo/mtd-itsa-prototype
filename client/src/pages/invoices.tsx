import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Invoices() {
  return (
    <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <Button className="flex items-center">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        </div>
        
        <div className="mb-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input 
              placeholder="Search invoices..." 
              className="pl-10"
            />
          </div>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Invoice Management</CardTitle>
            <CardDescription>
              Create, view, and manage your professional invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border mb-4">
              <div className="p-4 flex justify-between items-center">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium">This page is under development</p>
                    <p className="text-sm text-gray-500">Invoice functionality will be available soon</p>
                  </div>
                </div>
                <Button variant="outline">View Details</Button>
              </div>
            </div>
            
            <p className="text-sm text-gray-500">
              The invoice management system will allow you to create professional invoices, 
              track payments, and manage your clients. Check back soon for updates on this feature.
            </p>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Draft Invoices</CardTitle>
              <CardDescription>Manage your draft invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
              <p className="text-sm text-gray-500 mt-2">No draft invoices yet</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Outstanding Invoices</CardTitle>
              <CardDescription>Track unpaid invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
              <p className="text-sm text-gray-500 mt-2">No outstanding invoices</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Paid Invoices</CardTitle>
              <CardDescription>View all paid invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
              <p className="text-sm text-gray-500 mt-2">No paid invoices yet</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}