import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Business, UserRole } from '../types';
import { api, getStoredToken, setStoredToken, clearStoredToken, setStoredBusinessId, getStoredBusinessId } from '../services/api';

interface AuthContextType {
  user: User | null;
  business: Business | null;
  businesses: Business[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => void;
  switchBusiness: (businessId: string) => Promise<void>;
  demoLogin: (email: string) => Promise<void>;
  temporaryChangeRole: (role: UserRole) => void;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const data = await api.getMe();
      setUser(data.user);
      setBusiness(data.business);
      setBusinesses(data.businesses || [data.business]);
      if (data.business) {
        setStoredBusinessId(data.business.id);
      }
    } catch (err) {
      console.warn('Auto-login error or no session:', err);
      // Attempt fallback demo login automatically if first visit
      try {
        const demoRes = await api.login({ email: 'rajesh@sharmakirana.com', password: 'sharma123' });
        setStoredToken(demoRes.token);
        setUser(demoRes.user);
        setBusiness(demoRes.business);
        setStoredBusinessId(demoRes.business.id);
        const meRes = await api.getMe();
        setBusinesses(meRes.businesses || [demoRes.business]);
      } catch (e) {
        clearStoredToken();
        setUser(null);
        setBusiness(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await api.login(credentials);
      setStoredToken(res.token);
      setUser(res.user);
      setBusiness(res.business);
      setStoredBusinessId(res.business.id);
      const meRes = await api.getMe();
      setBusinesses(meRes.businesses || [res.business]);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: any) => {
    setIsLoading(true);
    try {
      const res = await api.register(payload);
      setStoredToken(res.token);
      setUser(res.user);
      setBusiness(res.business);
      setStoredBusinessId(res.business.id);
      setBusinesses([res.business]);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearStoredToken();
    setUser(null);
    setBusiness(null);
    setBusinesses([]);
  };

  const switchBusiness = async (businessId: string) => {
    try {
      const res = await api.switchBusiness(businessId);
      setBusiness(res.currentBusiness);
      setStoredBusinessId(res.currentBusiness.id);
      if (user) {
        setUser({ ...user, currentBusinessId: businessId });
      }
    } catch (err) {
      console.error('Failed to switch business:', err);
    }
  };

  const demoLogin = async (email: string) => {
    const password = email === 'admin@vyaparai.com' ? 'admin123' : 'sharma123';
    await login({ email, password });
  };

  const temporaryChangeRole = (role: UserRole) => {
    if (user) {
      setUser({ ...user, role });
    }
  };

  const refreshUserData = async () => {
    await fetchProfile();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        business,
        businesses,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        switchBusiness,
        demoLogin,
        temporaryChangeRole,
        refreshUserData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
