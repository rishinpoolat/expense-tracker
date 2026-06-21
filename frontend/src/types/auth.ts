export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: User;
  success: boolean;
  message: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  fullName: string;
}