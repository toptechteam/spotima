import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

// Use Vite's import.meta.env for environment variables in the browser
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : `${window.location.origin}/api`);

class ApiClient {
  private client: AxiosInstance;

  // Generic request method
  async request<T = any>(config: AxiosRequestConfig): Promise<{ data: T }> {
    try {
      const response = await this.client.request<T>(config);
      return { data: response.data };
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // HTTP Methods
  async get<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    // Add request interceptor for auth token if needed
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  // Auth methods
  async signIn(email: string, password: string) {
    return this.client.post('/auth/signin', { email, password });
  }

  async signUp(email: string, password: string) {
    return this.client.post('/auth/signup', {
      email,
      password,
      redirectUrl: `${window.location.origin}/`
    });
  }

  async signOut() {
    return this.client.post('/auth/signout');
  }

  async resetPassword(email: string) {
    return this.client.post('/auth/reset-password', {
      email,
      redirectTo: `${window.location.origin}/auth`
    });
  }

  async getSession() {
    return this.client.get('/auth/session');
  }


  async getUser(accessToken?: string) {
    const config = accessToken ? {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    } : undefined;
    return this.client.get('/rest/v1/user_roles', config);
  }

  // Profile methods
  async getUserProfile() {
    return this.client.get(`/me/`);
  }

  async updateUser(userId: string, formData: FormData, config?: any) {
    return this.client.patch(`/users/${userId}/`, formData, config);
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    return this.client.patch(`/profiles/${userId}`, updates);
  }


  // Tool methods
  async getTools() {
    return this.client.get('/tools');
  }

  async getToolById(id: string) {
    return this.client.get(`/tools/${id}`);
  }

  async assignToolToUser(userId: string, toolId: string) {
    return this.client.post('/tools/assign', { userId, toolId });
  }

  async unassignToolFromUser(userId: string, toolId: string) {
    return this.client.post('/tools/unassign', { userId, toolId });
  }

  async getToolAssignments(userId: string) {
    return this.client.get(`/tools/assignments?userId=${userId}`);
  }

  async getToolAssigCompany() {
    return this.client.get(`/tools/my-company/`);
  }

  // Entreprise methods
  async getEntreprises() {
    return this.client.get('/companies/');
  }



  async createEntreprise(data: any) {
    return this.client.post('/companies', data);
  }

  async updateEntreprise(id: string, data: any) {
    return this.client.patch(`/companies/${id}/`, data);
  }

  async deleteEntreprise(id: string) {
    return this.client.delete(`/companies/${id}`);
  }

  async getEntrepriseUsers(entrepriseId: string) {
    return this.client.get(`/users/?company_id=${entrepriseId}`);
  }

  // File upload
  async uploadFile(bucket: string, filePath: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.client.post(`/storage/${bucket}/${filePath}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Admin methods
  async getAdminStats() {
    return this.client.get('/admin/stats');
  }

  async createUserWithRole(userData: {
    id: string;
    email: string;
    full_name: string;
    entreprise_id: string;
  }, role: string = 'user') {
    return this.client.post('/admin/users', { ...userData, role });
  }

  // User management
  async getUsersWithProfiles() {
    return this.client.get('/users/with-profiles');
  }

  async getAdminUsers() {
    return this.client.get('/admin/users');
  }

  async updateUserRole(userId: string, role: string) {
    return this.client.patch(`/users/${userId}/role`, { role });
  }

  async createUser(modal: any) {
    return this.client.post(`/users/`, modal);
  }

  async deleteUser(userId: string) {
    return this.client.delete(`/users/${userId}`);
  }

  // User activation
  async getUserAuthStatus(userIds: string[]) {
    return this.client.post('/auth/status', { userIds });
  }

  async resendActivationEmail(email: string) {
    return this.client.post('/auth/resend-activation', { email });
  }

  // Tool management
  async getToolsWithAssignments() {
    return this.client.get('/tools/with-assignments');
  }

  async createTool(toolData: {
    name: string;
    description?: string;
    photo_url?: string | null;
    company: any
    is_active?: boolean;
  }) {
    return this.client.post('/tools/', toolData);
  }

  async getTool() {
    return this.client.get('/tools/');
  }

  async updateTool(id: string, updates: {
    name: string;
    description?: string;
    photo_url?: string | null;
    company: any
    is_active?: boolean;
  }) {
    return this.client.put(`/tools/${id}/`, updates);
  }


  async updateToolStatus(id: string, updates: {
    is_active?: boolean;
  }) {
    return this.client.patch(`/tools/${id}/`, updates);
  }

  async deleteTool(id: string) {
    return this.client.delete(`/tools/${id}/`);
  }

  async assignToolToEntreprise(toolId: string, entrepriseId: string) {
    return this.client.post(`/tools/${toolId}/assign-entreprise`, { entrepriseId });
  }

  async unassignToolFromEntreprise(toolId: string, entrepriseId: string) {
    return this.client.post(`/tools/${toolId}/unassign-entreprise`, { entrepriseId });
  }
}

export const apiClient = new ApiClient();
