import { api } from '../api'
import { AnalyticsKPIs, TopBook } from '../types'

export const analyticsService = {
  getKPIs: async (): Promise<AnalyticsKPIs> => {
    const response = await api.get<AnalyticsKPIs>('/analytics/kpis')
    return response.data
  },

  getTopBooks: async (): Promise<TopBook[]> => {
    const response = await api.get<TopBook[]>('/analytics/top-books')
    return response.data
  },

  getBorrowingStats: async (): Promise<any[]> => {
    const response = await api.get<any[]>('/analytics/borrowing-stats')
    return response.data
  }
}
