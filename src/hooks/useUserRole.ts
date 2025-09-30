
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<'admin' | 'user' | 'is_company_admin' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        debugger
        const response = await apiClient.getUser();
        const userRoles = response.data;
        const userRole = userRoles[0]?.role || null;
        setRole(userRole === 'admin' ? 'admin' : (userRole === 'is_company_admin' ? 'is_company_admin' : 'user'));
        // setRole('is_company_admin');
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole('user');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  const isAdmin = role === 'admin';
  const isUser = role === 'user';
  const is_company_admin = role === 'is_company_admin';

  return {
    role,
    isAdmin,
    isUser,
    is_company_admin,
    loading
  };
}
