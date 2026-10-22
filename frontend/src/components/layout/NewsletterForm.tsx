'use client';
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { subscribeNewsletter } from '@/lib/api/forms';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState('loading');
    try {
      await subscribeNewsletter(email);
      setState('done');
      setEmail('');
    } catch {
      setState('error');
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full" noValidate>
      <div className="flex h-[52px] w-full items-center justify-between border-b border-line">
        <label htmlFor="newsletter-email" className="sr-only">Your email address</label>
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          autoComplete="email"
          className="h-full min-w-0 flex-1 bg-transparent font-body text-[13px] text-fg outline-none placeholder:text-dim"
        />
        <button type="submit" disabled={state === 'loading'} aria-label="Subscribe" className="text-fg transition-colors hover:text-lime disabled:opacity-50">
          <ArrowRight className="size-5" strokeWidth={1.5} />
        </button>
      </div>
      <p role="status" className="mt-5 font-body text-[12px] leading-[1.7] text-muted">
        {state === 'done' ? 'Thank you. You’re on the list.' : state === 'error' ? 'Something went wrong. Please try again.' : 'New motorcycles, considered stories. No noise.'}
      </p>
    </form>
  );
}
