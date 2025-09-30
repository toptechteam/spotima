import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient, UserProfile } from '@/lib/api';

export type { UserProfile };

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      debugger
      try {
        const response = await apiClient.getUserProfile();
        setProfile(response.data.results);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const getFirstName = () => {
    if (!profile?.full_name) return null;
    return profile.full_name.split(' ')[0];
  };

  return { profile, loading, getFirstName };
}
