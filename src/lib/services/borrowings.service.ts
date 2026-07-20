import { api } from '../api'
import { Borrowing } from '../types'

export const borrowingsService = {
  getAll: async (params?: any): Promise<Borrowing[]> => {
    const response = await api.get<Borrowing[]>('/borrowings', { params })
    return response.data
  },

  getHistory: async (): Promise<Borrowing[]> => {
    const response = await api.get<Borrowing[]>('/borrowings/my')
    return response.data
  },

  borrow: async (bookId: number): Promise<Borrowing> => {
    const response = await api.post<Borrowing>('/borrowings/borrow', { bookId })
    return response.data
  },

  returnBook: async (id: number): Promise<Borrowing> => {
    const response = await api.post<Borrowing>(`/borrowings/return/${id}`)
    return response.data
  },

  // Nouvelle méthode pour récupérer un emprunt spécifique
  getById: async (id: number): Promise<Borrowing> => {
    const response = await api.get<Borrowing>(`/borrowings/${id}`)
    return response.data
  }
}