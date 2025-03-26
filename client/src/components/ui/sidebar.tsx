import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/user-context";
import { 
  LayoutDashboard, 
  Receipt, 
  Building2, 
  FileText, 
  Upload, 
  Settings,
  Banknote,
  Menu,
  X
} from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();
  const { user } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };
  
  const links = [
    { href: "/", label: "Dashboard", icon: <LayoutDashboard className="mr-3 h-5 w-5" /> },
    { href: "/transactions", label: "Transactions", icon: <Banknote className="mr-3 h-5 w-5" /> },
    { href: "/invoices", label: "Invoices", icon: <FileText className="mr-3 h-5 w-5" /> },
    { href: "/expenses", label: "Expenses", icon: <Receipt className="mr-3 h-5 w-5" /> },
    { href: "/tax-reports", label: "Tax Reports", icon: <FileText className="mr-3 h-5 w-5" /> },
    { href: "/import-data", label: "Import Data", icon: <Upload className="mr-3 h-5 w-5" /> },
    { href: "/business-setup", label: "Business Setup", icon: <Building2 className="mr-3 h-5 w-5" /> },
  ];
  
  const renderLinks = () => (
    <nav className="mt-5 px-2 flex-1 space-y-1">
      {links.map((link) => {
        const isActive = location === link.href;
        return (
          <div key={link.href} className="w-full">
            <button
              className={`${
                isActive
                  ? "bg-primary/80 text-primary-foreground"
                  : "text-white hover:bg-primary/50"
              } group flex items-center px-3 py-3 text-sm font-medium rounded-md w-full text-left`}
              onClick={() => {
                window.location.href = link.href;
                closeMobileMenu();
              }}
            >
              {link.icon}
              {link.label}
            </button>
          </div>
        );
      })}
    </nav>
  );
  
  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden absolute top-0 left-0 p-4 z-20">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMobileMenu}
          className="text-gray-500 hover:text-gray-700"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>
      
      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={closeMobileMenu} />
          
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-primary text-primary-foreground">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={closeMobileMenu}
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <X className="h-6 w-6 text-white" />
              </Button>
            </div>
            
            <div className="flex-1 h-0 overflow-y-auto">
              <div className="px-4 py-5 flex items-center">
                <div className="flex items-center">
                  <LayoutDashboard className="h-6 w-6 mr-2" />
                  <span className="text-xl font-semibold">CloudAccount</span>
                </div>
              </div>
              
              {renderLinks()}
            </div>
            
            {user && (
              <div className="px-4 py-4 border-t border-primary/20">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary-foreground">
                      {user.fullName.split(' ').map(n => n[0]).join('')}
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-primary-foreground">{user.fullName}</p>
                    <p className="text-xs text-primary-foreground/70">
                      {user.businessType === 'sole_trader' ? 'Sole Trader' : 'Landlord'}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <button className="text-primary-foreground/70 hover:text-primary-foreground">
                      <Settings className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 bg-primary text-primary-foreground">
          <div className="px-4 py-5 flex items-center">
            <div className="flex items-center">
              <LayoutDashboard className="h-6 w-6 mr-2" />
              <span className="text-xl font-semibold">CloudAccount</span>
            </div>
          </div>
          
          {renderLinks()}
          
          {user && (
            <div className="px-4 py-4 border-t border-primary/20">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary-foreground">
                    {user.fullName.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-primary-foreground">{user.fullName}</p>
                  <p className="text-xs text-primary-foreground/70">
                    {user.businessType === 'sole_trader' ? 'Sole Trader' : 'Landlord'}
                  </p>
                </div>
                <div className="ml-auto">
                  <button className="text-primary-foreground/70 hover:text-primary-foreground">
                    <Settings className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
