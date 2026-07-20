import { api } from '../api'
import { Book } from '../types'

export const booksService = {
  getAll: async (params?: any): Promise<Book[]> => {
    const response = await api.get<Book[]>('/books', { params })
    return response.data
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
