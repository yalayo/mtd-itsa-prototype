import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Receipt, Search, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Expenses() {
  return (
    <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <Button className="flex items-center">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </div>
        
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input 
              placeholder="Search expenses..." 
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-4">
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="travel">Travel</SelectItem>
                <SelectItem value="office">Office Supplies</SelectItem>
                <SelectItem value="utilities">Utilities</SelectItem>
              </SelectContent>
            </Select>
            
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Expense Management</CardTitle>
            <CardDescription>
              Track, categorize, and manage your business expenses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border mb-4">
              <div className="p-4 flex justify-between items-center">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Receipt className="h-5 w-5" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium">This page is under development</p>
                    <p className="text-sm text-gray-500">Expense management functionality will be available soon</p>
                  </div>
                </div>
                <Button variant="outline">View Details</Button>
              </div>
            </div>
            
            <p className="text-sm text-gray-500">
              The expense tracking system will allow you to record expenses, categorize them, 
              attach receipts, and generate reports for tax and accounting purposes. 
              Check back soon for the full functionality.
            </p>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Expenses</CardTitle>
              <CardDescription>Current financial year</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">£0.00</p>
              <p className="text-sm text-gray-500 mt-2">No expenses recorded yet</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Expenses</CardTitle>
              <CardDescription>Last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">£0.00</p>
              <p className="text-sm text-gray-500 mt-2">No recent expenses</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pending Receipts</CardTitle>
              <CardDescription>Expenses without receipts</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
              <p className="text-sm text-gray-500 mt-2">No pending receipts</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}