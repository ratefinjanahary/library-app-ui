import { api } from '../api';
import { Category } from '../types';

export const categoriesService = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/categories')
    return response.data
  },

  getById: async (id: string): Promise<Category> => {
    const response = await api.get<Category>(`/categories/${id}`)
    return response.data
  },

  create: async (data: Partial<Category>): Promise<Category> => {
    const response = await api.post<Category>('/categories', data)
    return response.data
  },

  update: async (id: string, data: Partial<Category>): Promise<Category> => {
    const response = await api.patch<Category>(`/categories/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`)
  }
}
