import { mockClient, type ApiClient } from './client';

// Swap this to the real HTTP client when the backend is wired in.
export const api: ApiClient = mockClient;

export * from './types';
