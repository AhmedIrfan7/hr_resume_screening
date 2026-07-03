export type Recommendation = "Strong Fit" | "Fit" | "Weak Fit" | "Not Fit" | string;

export interface Candidate {
  fileName: string;
  candidateName: string;
  email: string;
  phone: string;
  yearsExperience: number | string;
  skills: string;
  education: string;
  certifications: string;
  summary: string;
  score: number;
  classification: Recommendation;
  skillMatchScore: number;
  experienceScore: number;
  achievementScore: number;
  educationScore: number;
  clarityScore: number;
  strengths: string;
  gaps: string;
  recommendation: string;
  processedAt: string;
  rank: number;
}

export interface JobDetails {
  jobTitle: string;
  jobDescription: string;
  mustHaveSkills: string;
  niceToHaveSkills: string;
}

export interface SubmitResponse {
  batchId: string;
  totalFiles: number;
  status: "queued" | string;
}

export interface SubmitErrorResponse {
  error: string;
}

export interface ResultsResponse {
  batchId: string;
  expected: number;
  processedCount: number;
  isComplete: boolean;
  candidates: Candidate[];
}

export interface InboxResume {
  id: string;
  fileName: string;
  senderEmail: string;
  senderName: string;
  subject: string;
  receivedAt: string;
}

export interface InboxListResponse {
  resumes: InboxResume[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

export interface DraftEmailRequest {
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  jobDescription: string;
  score: number;
  classification: string;
  summary: string;
  strengths: string;
  gaps: string;
  recommendation: string;
  currentSubject: string;
  currentBody: string;
  userMessage: string;
  chatHistory: ChatMessage[];
}

export interface DraftEmailResponse {
  subject: string;
  body: string;
  assistantReply: string;
}

export interface SendEmailRequest {
  to: string;
  subject: string;
  body: string;
  candidateName: string;
  batchId: string;
  fileName: string;
}

export interface SendEmailResponse {
  success: boolean;
  sentAt: string;
}
