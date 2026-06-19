export interface User {
  id: string;
  email: string;
  role: 'tester' | 'recruiter' | 'admin';
  fullName: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  role: string;
  fullName: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  fullName: string;
  role: 'tester' | 'recruiter';
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface OtpVerifyRequest {
  email: string;
  otp: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  fullName: string | null;
  planType: string;
  studyLimit: number;
}

export interface Test {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'completed';
  createdAt: string;
  recruiterId: string;
}

export interface Submission {
  id: string;
  testId: string;
  testerId: string;
  status: string;
  createdAt: string;
}

export interface AIResponse {
  response: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  status: number;
}
