import { api } from './client';
import { endpoints } from './endpoints';

export const subscribeNewsletter = (email: string) =>
  api<void>(endpoints.newsletter, { method: 'POST', body: { email } });

export const sendContactMessage = (body: { name: string; email: string; subject?: string; message: string }) =>
  api<void>(endpoints.contact, { method: 'POST', body });
