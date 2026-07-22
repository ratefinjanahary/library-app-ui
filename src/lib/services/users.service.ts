// lib/services/users.service.ts
import { api } from "../api";

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedUsersResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const usersService = {
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }): Promise<PaginatedUsersResponse> => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  updateUserRole: async (id: number, role: string): Promise<User> => {
    const response = await api.patch(`/users/${id}/role`, { role });
    return response.data;
  },
};