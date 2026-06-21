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
  description?: string;
  requirements?: string;
  status: 'draft' | 'active' | 'completed' | 'paused';
  createdAt?: string;
  created_at?: string;
  recruiterId?: string;
  recruiter_id?: string;
  reward_amount?: number;
  rewardAmount?: number;
  estimated_duration?: number;
  estimatedDuration?: number;
  category?: string;
  test_type?: string;
  testType?: string;
  max_testers?: number;
  maxTesters?: number;
  prototype_url?: string;
  prototypeUrl?: string;
  screener_questions?: any[];
  screenerQuestions?: any[];
}

export interface Submission {
  id: string;
  testId?: string;
  test_id?: string;
  testerId?: string;
  tester_id?: string;
  status: string;
  createdAt?: string;
  created_at?: string;
  video_url?: string;
  videoUrl?: string;
  transcript?: string;
  transcript_summary?: string;
  transcriptSummary?: string;
  rating?: number | null;
  feedback?: string | null;
  submitted_at?: string;
  submittedAt?: string;
}

export interface AIResponse {
  response: string;
  success: boolean;
  content?: string;
}

export interface ApiError {
  message: string;
  status: number;
}
