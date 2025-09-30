import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';

export interface UserToolAssignment {
  id: string;
  user_id: string;
  tool_id: string;
  assigned_at: string;
}

export function useUserTools() {
  const [userTools, setUserTools] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchUserTools = useCallback(async () => {
    if (!user) {
      setUserTools([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching tools for user:', user.id);
      // Fetch user's tool assignments
      const response = await apiClient.getToolAssigCompany();
      debugger
      const assignments = response.data.results as UserToolAssignment[];
      const toolIds = assignments.map(assignment => assignment.id);

      console.log('User tools fetched:', toolIds);
      setUserTools([...new Set(toolIds)]); // Remove duplicates
    } catch (err) {
      console.error('Error fetching user tools:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch user tools'));
      setUserTools([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Set up polling instead of real-time subscriptions
  useEffect(() => {
    fetchUserTools();

    // Poll every 30 seconds for updates
    const intervalId = setInterval(fetchUserTools, 30000);

    return () => clearInterval(intervalId);
  }, [fetchUserTools]);

  return { userTools, loading, refetch: fetchUserTools };
}
