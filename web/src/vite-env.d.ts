/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY?: string;
  readonly VITE_OPENAI_MODEL?: string;
  /** Same-origin or CORS-enabled backend that forwards to OpenAI (for production static hosting). */
  readonly VITE_OPENAI_PROXY_URL?: string;
}
