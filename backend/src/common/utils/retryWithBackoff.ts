import { logger } from './logger';

interface RetryOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  factor?: number;
  jitter?: boolean;
  retryOn?: (error: unknown) => boolean;
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelayMs = 500,
    maxDelayMs = 30_000,
    factor = 2,
    jitter = true,
    retryOn = isRetryableError,
  } = options;

  let lastError: unknown;
  let delay = initialDelayMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts || !retryOn(error)) {
        throw error;
      }
      const actualDelay = jitter
        ? delay * (0.5 + Math.random() * 0.5)
        : delay;
      logger.warn(`Attempt ${attempt} failed, retrying in ${Math.round(actualDelay)}ms`, {
        error: error instanceof Error ? error.message : String(error),
      });
      await sleep(Math.min(actualDelay, maxDelayMs));
      delay = Math.min(delay * factor, maxDelayMs);
    }
  }

  throw lastError;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    // Stripe rate limit
    if ((error as any).statusCode === 429) return true;
    // Transient network errors
    if ((error as any).code === 'ECONNRESET') return true;
    if ((error as any).code === 'ECONNREFUSED') return true;
    if ((error as any).statusCode === 503) return true;
    if ((error as any).statusCode === 502) return true;
  }
  return false;
}
