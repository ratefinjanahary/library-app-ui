import { api } from '../api'
import { Book, PaginatedResponse } from '../types'

export interface BookQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
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
    
    return {
      data: response.data.data,
      total: response.data.meta.total,
      page: response.data.meta.page,
      limit: response.data.meta.limit,
      totalPages: response.data.meta.totalPages,
    };
  },

  getById: async (id: number): Promise<Book> => { // Changé string à number
    const response = await api.get<Book>(`/books/${id}`)
    return response.data
  },

  create: async (data: Partial<Book>): Promise<Book> => {
    const response = await api.post<Book>('/books', data)
    return response.data
  },

  update: async (id: number, data: Partial<Book>): Promise<Book> => { // Changé string à number
    const response = await api.patch<Book>(`/books/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => { // Changé string à number
    await api.delete(`/books/${id}`)
  },

  // Nouvelle méthode pour obtenir les livres disponibles
  getAvailable: async (params?: BookQueryParams): Promise<PaginatedResponse<Book>> => {
    const response = await api.get<BackendPaginatedResponse<Book>>('/books/available', { params });
    
    return {
      data: response.data.data,
      total: response.data.meta.total,
      page: response.data.meta.page,
      limit: response.data.meta.limit,
      totalPages: response.data.meta.totalPages,
    };
  }
}

export type { PaginatedResponse };
