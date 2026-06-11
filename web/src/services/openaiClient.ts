export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

const OPENAI_DIRECT = 'https://api.openai.com/v1/chat/completions';

function chatCompletionEndpoint(): string {
  const custom = import.meta.env.VITE_OPENAI_PROXY_URL?.trim();
  if (custom) {
    const base = custom.replace(/\/$/, '');
    return base.endsWith('/chat/completions') ? base : `${base}/v1/chat/completions`;
  }
  if (import.meta.env.DEV) {
    return '/__openai/v1/chat/completions';
  }
  return OPENAI_DIRECT;
}

function isViteOpenAiProxyUrl(url: string): boolean {
  return url.startsWith('/__openai/');
}

export function isOpenAiConfigured(): boolean {
  return (
    import.meta.env.DEV ||
    Boolean(import.meta.env.VITE_OPENAI_API_KEY?.trim()) ||
    Boolean(import.meta.env.VITE_OPENAI_PROXY_URL?.trim())
  );
}

export async function openaiChatCompletion(
  messages: ChatMessage[],
  options?: { temperature?: number }
): Promise<string> {
  const url = chatCompletionEndpoint();
  const key = import.meta.env.VITE_OPENAI_API_KEY?.trim() ?? '';

  if (url === OPENAI_DIRECT && !key) {
    throw new Error(
      'OpenAI is not configured. Add VITE_OPENAI_API_KEY, use `npm run dev` with the Vite proxy and OPENAI_API_KEY, or set VITE_OPENAI_PROXY_URL. See web/.env.example.'
    );
  }

  const model = import.meta.env.VITE_OPENAI_MODEL?.trim() || 'gpt-4o';

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (key && !isViteOpenAiProxyUrl(url)) {
    headers.Authorization = `Bearer ${key}`;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      messages,
      temperature: options?.temperature ?? 0.35,
    }),
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const j = (await res.json()) as { error?: { message?: string } };
      if (j?.error?.message) detail = j.error.message;
    } catch {
      try {
        detail = await res.text();
      } catch {
        /* ignore */
      }
    }
    throw new Error(detail || `Request failed (${res.status})`);
  }

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>;
  };
  const content = json.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('Unexpected response from OpenAI.');
  }
  return content.trim();
}
