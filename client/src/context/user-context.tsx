import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: number;
  username: string;
  fullName: string;
  businessType: string;
  baseCurrency: string;
}

interface UserContextType {
  user: User | null;
  isInitialized: boolean;
  setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // In a real app, this would check if the user is logged in
    // For demo purposes, we'll use the sample user
    const initializeUser = async () => {
      try {
        const response = await apiRequest("GET", "/api/users/1", undefined);
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error("Failed to initialize user:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, isInitialized, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
