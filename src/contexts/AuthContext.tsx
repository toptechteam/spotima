
import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';

interface User {
  id: string;
  email: string;
  // Add other user properties as needed
}

interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: User;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Verify token and get user data
        const response = await apiClient.getUserProfile()
        if (response.data) {
          const userData = response.data;
          setUser(userData);
          setSession({
            access_token: token,
            refresh_token: '',
            expires_in: 3600, // Default expiry, adjust as needed
            token_type: 'bearer',
            user: userData
          });
        }
      } catch (error) {
        console.error('Session validation failed:', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await apiClient.signIn(email, password);
      if (response.data?.access_token) {
        const token = response.data.access_token;
        localStorage.setItem('token', token);
        
        // Get user data with the token
        const userResponse = await apiClient.getUser(token);
        const userData = userResponse.data;
        
        const session = {
          access_token: token,
          refresh_token: response.data.refresh_token || '',
          expires_in: response.data.expires_in || 3600,
          token_type: 'bearer',
          user: {
            id: userData.id,
            email: userData.email,
            // Add any other user fields you need
            ...userData
          }
        };
        
        setUser(session.user);
        setSession(session);
        return { error: null };
      }
      return { error: 'No access token received' };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { 
        error: error.response?.data?.message || 'An error occurred during sign in' 
      };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const response = await apiClient.signUp(email, password);
      return { error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { 
        error: error.response?.data?.message || 'An error occurred during sign up' 
      };
    }
  };

  const signOut = async () => {
    try {
      await apiClient.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setSession(null);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await apiClient.resetPassword(email);
      return { error: null };
    } catch (error: any) {
      console.error('Password reset error:', error);
      return { 
        error: error.response?.data?.message || 'Failed to send password reset email' 
      };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      signIn,
      signUp,
      signOut,
      resetPassword,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
