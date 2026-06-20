import { type ApiClient } from './client';
import { httpClient } from './httpClient';

// Live backend client. For local UI work without a server, swap back to:
//   import { mockClient } from './client'; export const api = mockClient;
export const api: ApiClient = httpClient;

export * from './types';
