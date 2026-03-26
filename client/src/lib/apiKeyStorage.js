import { API_CONFIG } from '../constants/config';

/**
 * Gerencia o armazenamento e recuperação de dados de uso
 */
export const UsageStorage = {
  get() {
    try {
      const data = localStorage.getItem(API_CONFIG.STORAGE_KEYS.USAGE);
      return data ? JSON.parse(data) : this.getDefault();
    } catch {
      return this.getDefault();
    }
  },

  getDefault() {
    return {
      count: 0,
      lastReset: Date.now(),
    };
  },

  set(usage) {
    localStorage.setItem(
      API_CONFIG.STORAGE_KEYS.USAGE,
      JSON.stringify(usage)
    );
  },

  increment() {
    const usage = this.get();
    usage.count += 1;
    this.set(usage);
    return usage.count;
  },

  reset() {
    this.set(this.getDefault());
  },

  shouldReset() {
    const usage = this.get();
    const elapsed = Date.now() - usage.lastReset;
    return elapsed > API_CONFIG.RESET_INTERVAL_MS;
  },

  checkAndReset() {
    if (this.shouldReset()) {
      this.reset();
    }
  },
};

/**
 * Gerencia a API key do usuário
 */
export const ApiKeyStorage = {
  get() {
    return localStorage.getItem(API_CONFIG.STORAGE_KEYS.USER_API_KEY);
  },

  set(key) {
    localStorage.setItem(API_CONFIG.STORAGE_KEYS.USER_API_KEY, key);
  },

  remove() {
    localStorage.removeItem(API_CONFIG.STORAGE_KEYS.USER_API_KEY);
    localStorage.removeItem(API_CONFIG.STORAGE_KEYS.KEY_VALIDATED);
  },

  exists() {
    return !!this.get();
  },

  setValidated(isValid) {
    localStorage.setItem(
      API_CONFIG.STORAGE_KEYS.KEY_VALIDATED,
      isValid.toString()
    );
  },

  isValidated() {
    return localStorage.getItem(API_CONFIG.STORAGE_KEYS.KEY_VALIDATED) === 'true';
  },
};
