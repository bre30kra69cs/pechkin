import axios, { AxiosInstance } from 'axios';

const DEFAULT_TIMEOUT = 30000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchHtml(
  url: string,
  options: { timeout?: number; retries?: number } = {}
): Promise<string> {
  const { timeout = DEFAULT_TIMEOUT, retries = MAX_RETRIES } = options;

  const client: AxiosInstance = axios.create({
    timeout,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    },
  });

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await client.get(url);
      return response.data as string;
    } catch (error) {
      lastError = error as Error;

      if (attempt < retries) {
        await sleep(RETRY_DELAY * (attempt + 1));
      }
    }
  }

  throw new Error(`Failed to fetch ${url} after ${retries + 1} attempts: ${lastError?.message}`);
}
