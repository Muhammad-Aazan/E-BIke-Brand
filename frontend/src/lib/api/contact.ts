import { api } from './client';

export interface SubmitContactInput {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  requestType: 'contact' | 'booking' | 'test_ride' | 'service';
}

export async function submitContact(data: SubmitContactInput) {
  return api<{ contact: any }>('contact', {
    method: 'POST',
    body: data,
  });
}

export async function getMyBookings() {
  return api<{ requests: any[] }>('contact/my-requests');
}
