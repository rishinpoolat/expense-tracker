import { describe, it, expect } from 'vitest'
import type { LoginDto, RegisterDto, AuthResponse, User } from '../../src/types/auth'

describe('Auth Types', () => {
  describe('LoginDto', () => {
    it('should have correct structure', () => {
      const loginData: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      }

      expect(loginData.email).toBe('test@example.com')
      expect(loginData.password).toBe('password123')
      expect(Object.keys(loginData)).toEqual(['email', 'password'])
    })
  })

  describe('RegisterDto', () => {
    it('should have correct structure', () => {
      const registerData: RegisterDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      }

      expect(registerData.name).toBe('Test User')
      expect(registerData.email).toBe('test@example.com')
      expect(registerData.password).toBe('password123')
      expect(Object.keys(registerData)).toEqual(['name', 'email', 'password'])
    })
  })

  describe('User', () => {
    it('should have correct structure', () => {
      const user: User = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
      }

      expect(user.id).toBe(1)
      expect(user.name).toBe('Test User')
      expect(user.email).toBe('test@example.com')
      expect(Object.keys(user)).toEqual(['id', 'name', 'email'])
    })
  })

  describe('AuthResponse', () => {
    it('should have correct structure', () => {
      const authResponse: AuthResponse = {
        success: true,
        message: 'Login successful',
        token: 'jwt-token',
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
        },
      }

      expect(authResponse.success).toBe(true)
      expect(authResponse.message).toBe('Login successful')
      expect(authResponse.token).toBe('jwt-token')
      expect(authResponse.user.id).toBe(1)
      expect(Object.keys(authResponse)).toEqual(['success', 'message', 'token', 'user'])
    })

    it('should handle optional fields', () => {
      const authResponse: AuthResponse = {
        success: false,
      }

      expect(authResponse.success).toBe(false)
      expect(authResponse.message).toBeUndefined()
      expect(authResponse.token).toBeUndefined()
      expect(authResponse.user).toBeUndefined()
    })
  })
})