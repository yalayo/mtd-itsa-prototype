import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Save, User, CreditCard, Settings, Globe, Landmark } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CurrencySelect } from "@/components/ui/currency-select";
import { useUser } from "@/context/user-context";
import { useState } from "react";

export default function BusinessSetup() {
  const { user } = useUser();
  const [baseCurrency, setBaseCurrency] = useState(user?.baseCurrency || "GBP");
  
  return (
    <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Business Setup</h1>
          <Button className="flex items-center">
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
        
        <Tabs defaultValue="personal">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="personal">Personal Details</TabsTrigger>
            <TabsTrigger value="business">Business Details</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>
          
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center mb-6">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-4">
                    <User className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="font-medium">{user?.fullName}</p>
                    <p className="text-sm text-gray-500">
                      {user?.businessType === 'sole_trader' ? 'Sole Trader' : 'Landlord'}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" defaultValue={user?.fullName} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" defaultValue={user?.username} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue="john.smith@example.com" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" defaultValue="+44 7700 900077" />
                  </div>
                </div>
                
                <div className="mt-6">
                  <p className="text-sm text-gray-500">
                    This information is used for correspondence and tax reporting purposes.
                    Ensure all details are accurate and up to date.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="business">
            <Card>
              <CardHeader>
                <CardTitle>Business Details</CardTitle>
                <CardDescription>
                  Manage your business information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center mb-6">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-4">
                    <Building2 className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="font-medium">Business Information</p>
                    <p className="text-sm text-gray-500">Configure your business details for invoices and tax reports</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input id="businessName" defaultValue="John Smith Consulting" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="businessType">Business Type</Label>
                    <Input id="businessType" defaultValue={user?.businessType === 'sole_trader' ? 'Sole Trader' : 'Landlord'} readOnly />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="utr">Unique Taxpayer Reference (UTR)</Label>
                    <Input id="utr" defaultValue="1234567890" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="vatNumber">VAT Number (if applicable)</Label>
                    <Input id="vatNumber" defaultValue="" placeholder="Not registered for VAT" />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="businessAddress">Business Address</Label>
                    <Input id="businessAddress" defaultValue="123 Business Street" />
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <Input defaultValue="London" placeholder="City" />
                      <Input defaultValue="EC1A 1BB" placeholder="Postal Code" />
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <p className="text-sm text-gray-500">
                    Your business details will appear on invoices and tax documents.
                    Make sure they match the information registered with HMRC.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>System Preferences</CardTitle>
                <CardDescription>
                  Customize your account settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Globe className="h-5 w-5 mr-3 text-gray-700" />
                      <div>
                        <p className="font-medium">Base Currency</p>
                        <p className="text-sm text-gray-500">Set your primary operating currency</p>
                      </div>
                    </div>
                    <div className="w-36">
                      <CurrencySelect 
                        value={baseCurrency} 
                        onChange={setBaseCurrency} 
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CreditCard className="h-5 w-5 mr-3 text-gray-700" />
                      <div>
                        <p className="font-medium">Payment Details</p>
                        <p className="text-sm text-gray-500">Configure your payment information</p>
                      </div>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Landmark className="h-5 w-5 mr-3 text-gray-700" />
                      <div>
                        <p className="font-medium">HMRC Integration</p>
                        <p className="text-sm text-gray-500">Connect to HMRC for digital tax submissions</p>
                      </div>
                    </div>
                    <Button variant="outline">Connect</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Settings className="h-5 w-5 mr-3 text-gray-700" />
                      <div>
                        <p className="font-medium">Notification Preferences</p>
                        <p className="text-sm text-gray-500">Manage email and system notifications</p>
                      </div>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>
                </div>
                
                <div className="mt-6">
                  <p className="text-sm text-gray-500">
                    These settings affect how the system operates and how your data is processed.
                    Changes will be applied immediately once saved.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}