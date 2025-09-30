import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface Tool {
  id: string;
  name: string;
  description: string | null;
  photo_url: string | null;
  is_active: boolean | null;
}

export function useTools() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      console.log('Fetching all tools...');
      const response = await apiClient.getTools();
      console.log('All tools fetched:', response.data.results);
      setTools(response.data.results || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching tools:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch tools'));
      setTools([]);
    } finally {
      setLoading(false);
    }
  };

  return { tools, loading, error };
}
