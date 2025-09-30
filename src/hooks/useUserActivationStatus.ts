
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface UserAuthStatus {
  id: string;
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
  is_active: boolean;
}

export function useUserActivationStatus() {
  const [authStatusMap, setAuthStatusMap] = useState<Map<string, UserAuthStatus>>(new Map());
  const [loading, setLoading] = useState(true);

  const fetchUserAuthStatus = async (userIds: string[]) => {
    console.log('🔍 Fetching auth status for users:', userIds);
    
    if (userIds.length === 0) {
      console.log('⚠️ No user IDs provided, clearing map');
      setAuthStatusMap(new Map());
      setLoading(false);
      return;
    }

    try {
      console.log('📡 Making request to auth status endpoint with userIds:', userIds);

      const response = await apiClient.getUserAuthStatus(userIds);
      const result = response.data;

      console.log('✅ Auth status response data:', result);
      
      if (!result || !result.users) {
        console.warn('⚠️ No users data in response');
        setLoading(false);
        return;
      }

      const statusMap = new Map<string, UserAuthStatus>();
      
      result.users.forEach((authStatus: UserAuthStatus) => {
        // IMPORTANT: Corriger la logique d'activation ici aussi
        const correctedStatus = {
          ...authStatus,
          is_active: !!(authStatus.email_confirmed_at && authStatus.last_sign_in_at)
        };
        
        console.log(`📝 Setting CORRECTED status for user ${authStatus.id}:`, {
          email_confirmed_at: authStatus.email_confirmed_at,
          last_sign_in_at: authStatus.last_sign_in_at,
          original_is_active: authStatus.is_active,
          corrected_is_active: correctedStatus.is_active
        });
        statusMap.set(authStatus.id, correctedStatus);
      });

      console.log('📊 Final status map size:', statusMap.size);
      console.log('📊 Status map entries:', Array.from(statusMap.entries()));
      
      setAuthStatusMap(statusMap);
    } catch (error) {
      console.error('💥 Erreur lors de la récupération du statut d\'authentification:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserActivationStatus = (userId: string): boolean => {
    const authStatus = authStatusMap.get(userId);
    // Un utilisateur est actif si son email est confirmé ET qu'il s'est connecté au moins une fois
    const isActive = !!(authStatus?.email_confirmed_at && authStatus?.last_sign_in_at);
    console.log(`✨ User ${userId} CORRECTED activation status:`, {
      email_confirmed_at: authStatus?.email_confirmed_at,
      last_sign_in_at: authStatus?.last_sign_in_at,
      isActive
    });
    return isActive;
  };

  const getUserAuthData = (userId: string): UserAuthStatus | undefined => {
    return authStatusMap.get(userId);
  };

  return {
    fetchUserAuthStatus,
    getUserActivationStatus,
    getUserAuthData,
    loading,
    authStatusMap
  };
}
