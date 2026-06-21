import { describe, it, expect, beforeEach, vi } from 'vitest'
import { authService } from '../../src/services/authService'
import type { LoginDto, RegisterDto } from '../../src/types/auth'

// Mock the api module
vi.mock('../../src/services/api', () => ({
  api: {
    post: vi.fn(),
  },
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

import { api } from '../../src/services/api'

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('should login successfully and store token/user', async () => {
      const credentials: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      }

      const mockResponse = {
        data: {
          success: true,
          token: 'mock-token',
          user: { id: 1, name: 'Test User', email: 'test@example.com' },
        },
      }

      vi.mocked(api.post).mockResolvedValueOnce(mockResponse)

      const result = await authService.login(credentials)

      expect(api.post).toHaveBeenCalledWith('/auth/login', credentials)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'mock-token')
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'user',
        JSON.stringify(mockResponse.data.user)
      )
      expect(result).toBe(mockResponse.data)
    })

    it('should throw error when login fails', async () => {
      const credentials: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      }

      const mockResponse = {
        data: {
          success: false,
          message: 'Invalid credentials',
        },
      }

      vi.mocked(api.post).mockResolvedValueOnce(mockResponse)

      await expect(authService.login(credentials)).rejects.toThrow('Invalid credentials')
    })
  })

  describe('register', () => {
    it('should register successfully and store token/user', async () => {
      const userData: RegisterDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      }

      const mockResponse = {
        data: {
          success: true,
          token: 'mock-token',
          user: { id: 1, name: 'Test User', email: 'test@example.com' },
        },
      }

      vi.mocked(api.post).mockResolvedValueOnce(mockResponse)

      const result = await authService.register(userData)

      expect(api.post).toHaveBeenCalledWith('/auth/register', userData)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'mock-token')
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'user',
        JSON.stringify(mockResponse.data.user)
      )
      expect(result).toBe(mockResponse.data)
    })

    it('should throw error when registration fails', async () => {
      const userData: RegisterDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      }

      const mockResponse = {
        data: {
          success: false,
          message: 'Email already exists',
        },
      }

      vi.mocked(api.post).mockResolvedValueOnce(mockResponse)

      await expect(authService.register(userData)).rejects.toThrow('Email already exists')
    })
  })

  describe('logout', () => {
    it('should remove token and user from localStorage', () => {
      authService.logout()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user')
    })
  })

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      localStorageMock.getItem.mockReturnValue('mock-token')

      expect(authService.isAuthenticated()).toBe(true)
    })

    it('should return false when token does not exist', () => {
      localStorageMock.getItem.mockReturnValue(null)

      expect(authService.isAuthenticated()).toBe(false)
    })
  })

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('mock-token')

      expect(authService.getToken()).toBe('mock-token')
    })

    it('should return null when no token exists', () => {
      localStorageMock.getItem.mockReturnValue(null)

      expect(authService.getToken()).toBeNull()
    })
  })

  describe('getCurrentUser', () => {
    it('should return parsed user from localStorage', () => {
      const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser))

      expect(authService.getCurrentUser()).toEqual(mockUser)
    })

    it('should return null when no user exists', () => {
      localStorageMock.getItem.mockReturnValue(null)

      expect(authService.getCurrentUser()).toBeNull()
    })
  })
})