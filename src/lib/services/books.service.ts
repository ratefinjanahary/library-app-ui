import { api } from '../api'
import { Book } from '../types'

// Interface pour les paramètres de requête
export interface BookQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number; // Changé de string à number pour correspondre au type Book
}

// Interface pour la réponse paginée
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Interface pour la réponse du backend
interface BackendPaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const booksService = {
  getAll: async (params?: BookQueryParams): Promise<PaginatedResponse<Book>> => {
    const response = await api.get<BackendPaginatedResponse<Book>>('/books', { params });
    
    // Transformer la réponse du backend en format attendu par le frontend
    return {
      data: response.data.data,
      total: response.data.meta.total,
      page: response.data.meta.page,
      limit: response.data.meta.limit,
      totalPages: response.data.meta.totalPages,
    };
  },

  getById: async (id: string): Promise<Book> => {
    const response = await api.get<Book>(`/books/${id}`)
    return response.data
  },

  create: async (data: Partial<Book>): Promise<Book> => {
    const response = await api.post<Book>('/books', data)
    return response.data
  },

  update: async (id: string, data: Partial<Book>): Promise<Book> => {
    const response = await api.patch<Book>(`/books/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/books/${id}`)
  }
}