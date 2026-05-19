export type Provider = 'anthropic' | 'google';

export interface GeneratedComponent {
  id: string;
  prompt: string;
  code: string;
  createdAt: Date;
}

export interface StoredComponent {
  id: string;
  prompt: string;
  code: string;
  createdAt: string; // ISO 8601
}
