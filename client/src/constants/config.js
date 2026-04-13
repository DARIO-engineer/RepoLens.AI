export const API_CONFIG = {
  MAX_FREE_REQUESTS: 2,
  RESET_INTERVAL_MS: 24 * 60 * 60 * 1000, // 24 hours
  STORAGE_KEYS: {
    USAGE: 'repolens_usage',
    USER_API_KEY: 'repolens_user_key',
    USER_API_PROVIDER: 'repolens_user_provider',
    KEY_VALIDATED: 'repolens_key_validated',
  },
  GEMINI_API_VERSIONS: ['v1beta', 'v1'],
  GEMINI_MODEL_CANDIDATES: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-flash', 'gemini-1.5-pro'],
  OPENROUTER_API_URL: 'https://openrouter.ai/api/v1/chat/completions',
  OPENROUTER_MODEL: 'openrouter/auto',
};
