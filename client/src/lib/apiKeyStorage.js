import { API_CONFIG } from '../constants/config';

const STORAGE_EVENT = 'repolens:storage-updated';
const USAGE_COOKIE_KEY = 'repolens_usage_cookie';

function emitStorageUpdate() {
  window.dispatchEvent(new CustomEvent(STORAGE_EVENT));
}

function writeCookie(name, value, maxAgeSeconds) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
}

function readCookie(name) {
  const match = document.cookie
    .split(';')
    .map((chunk) => chunk.trim())
    .find((chunk) => chunk.startsWith(`${name}=`));

  if (!match) return null;
  return decodeURIComponent(match.slice(name.length + 1));
}

/**
 * Gerencia o armazenamento e recuperação de dados de uso
 */
export const UsageStorage = {
  get() {
    try {
      const data = localStorage.getItem(API_CONFIG.STORAGE_KEYS.USAGE);
      if (data) return JSON.parse(data);

      const cookieData = readCookie(USAGE_COOKIE_KEY);
      return cookieData ? JSON.parse(cookieData) : this.getDefault();
    } catch {
      return this.getDefault();
    }
  },

  getDefault() {
    return {
      count: 0,
      firstRequestAt: null,
    };
  },

  set(usage) {
    localStorage.setItem(
      API_CONFIG.STORAGE_KEYS.USAGE,
      JSON.stringify(usage)
    );
    writeCookie(USAGE_COOKIE_KEY, JSON.stringify(usage), 60 * 60 * 24 * 7);
    emitStorageUpdate();
  },

  increment() {
    const usage = this.get();
    if (!usage.firstRequestAt) {
      usage.firstRequestAt = Date.now();
    }
    usage.count += 1;
    this.set(usage);
    return usage.count;
  },

  reset() {
    this.set(this.getDefault());
  },

  shouldReset() {
    const usage = this.get();
    if (!usage.firstRequestAt) {
      return false;
    }

    const elapsed = Date.now() - usage.firstRequestAt;
    return elapsed >= API_CONFIG.RESET_INTERVAL_MS;
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
    emitStorageUpdate();
  },

  remove() {
    localStorage.removeItem(API_CONFIG.STORAGE_KEYS.USER_API_KEY);
    localStorage.removeItem(API_CONFIG.STORAGE_KEYS.KEY_VALIDATED);
    emitStorageUpdate();
  },

  exists() {
    return !!this.get();
  },

  setValidated(isValid) {
    localStorage.setItem(
      API_CONFIG.STORAGE_KEYS.KEY_VALIDATED,
      isValid.toString()
    );
    emitStorageUpdate();
  },

  isValidated() {
    return localStorage.getItem(API_CONFIG.STORAGE_KEYS.KEY_VALIDATED) === 'true';
  },
};

export const StorageSync = {
  EVENT_NAME: STORAGE_EVENT,
};
