export const API_CONFIG = {
  MAX_FREE_REQUESTS: 2,
  RESET_INTERVAL_MS: 24 * 60 * 60 * 1000, // 24 hours
  STORAGE_KEYS: {
    USAGE: 'repolens_usage',
    USER_API_KEY: 'repolens_user_key',
    USER_API_PROVIDER: 'repolens_user_provider',
    KEY_VALIDATED: 'repolens_key_validated',
  },
  GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
  OPENROUTER_API_URL: 'https://openrouter.ai/api/v1/chat/completions',
  OPENROUTER_MODEL: 'openrouter/auto',
};
