import { api } from '../api'
import { User } from '../types'

export interface AuthResponse {
  user: User
  token: string
}

export const authService = {
  login: async (data: any): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data)
    return response.data
  },

  register: async (data: any): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data)
    return response.data
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get<User>('/users/profile')
    return response.data
  },
};
