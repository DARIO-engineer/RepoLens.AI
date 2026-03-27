import { API_CONFIG } from '../constants/config';

const STORAGE_EVENT = 'repolens:storage-updated';
const USAGE_COOKIE_KEY = 'repolens_usage_cookie';

function emitStorageUpdate() {
  window.dispatchEvent(new CustomEvent(STORAGE_EVENT));
}

function writeCookie(name, value, maxAgeSeconds) {
  try {
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
  } catch {
    // Ignore cookie write failures
  }
}

function readCookie(name) {
  try {
    const match = document.cookie
      .split(';')
      .map((chunk) => chunk.trim())
      .find((chunk) => chunk.startsWith(`${name}=`));

    if (!match) return null;
    return decodeURIComponent(match.slice(name.length + 1));
  } catch {
    return null;
  }
}

/**
 * Gerencia o armazenamento e recuperação de dados de uso
 */
export const UsageStorage = {
  get() {
    try {
      const data = localStorage.getItem(API_CONFIG.STORAGE_KEYS.USAGE);
      if (data) {
        const parsed = JSON.parse(data);
        return {
          count: Number(parsed?.count || 0),
          firstRequestAt: parsed?.firstRequestAt || null,
          lastResetAt: parsed?.lastResetAt || parsed?.firstRequestAt || Date.now(),
        };
      }

      const cookieData = readCookie(USAGE_COOKIE_KEY);
      if (cookieData) {
        const parsed = JSON.parse(cookieData);
        return {
          count: Number(parsed?.count || 0),
          firstRequestAt: parsed?.firstRequestAt || null,
          lastResetAt: parsed?.lastResetAt || parsed?.firstRequestAt || Date.now(),
        };
      }

      return this.getDefault();
    } catch {
      return this.getDefault();
    }
  },

  getDefault() {
    return {
      count: 0,
      lastResetAt: Date.now(),
      firstRequestAt: null,
    };
  },

  set(usage) {
    try {
      localStorage.setItem(
        API_CONFIG.STORAGE_KEYS.USAGE,
        JSON.stringify(usage)
      );
    } catch {
      // Ignore localStorage write failures
    }
    writeCookie(USAGE_COOKIE_KEY, JSON.stringify(usage), 60 * 60 * 24 * 7);
    emitStorageUpdate();
  },

  increment() {
    const usage = this.get();
    if (!usage.lastResetAt) {
      usage.lastResetAt = Date.now();
    }
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
    const referenceTs = usage.lastResetAt || usage.firstRequestAt;
    if (!referenceTs) {
      return false;
    }

    const elapsed = Date.now() - referenceTs;
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
    try {
      return localStorage.getItem(API_CONFIG.STORAGE_KEYS.USER_API_KEY);
    } catch {
      return null;
    }
  },

  set(key) {
    try {
      localStorage.setItem(API_CONFIG.STORAGE_KEYS.USER_API_KEY, key);
    } catch {
      // Ignore localStorage write failures
    }
    emitStorageUpdate();
  },

  getProvider() {
    try {
      return localStorage.getItem(API_CONFIG.STORAGE_KEYS.USER_API_PROVIDER) || 'gemini';
    } catch {
      return 'gemini';
    }
  },

  setProvider(provider) {
    try {
      localStorage.setItem(API_CONFIG.STORAGE_KEYS.USER_API_PROVIDER, provider);
    } catch {
      // Ignore localStorage write failures
    }
    emitStorageUpdate();
  },

  remove() {
    try {
      localStorage.removeItem(API_CONFIG.STORAGE_KEYS.USER_API_KEY);
      localStorage.removeItem(API_CONFIG.STORAGE_KEYS.USER_API_PROVIDER);
      localStorage.removeItem(API_CONFIG.STORAGE_KEYS.KEY_VALIDATED);
    } catch {
      // Ignore localStorage remove failures
    }
    emitStorageUpdate();
  },

  exists() {
    return !!this.get();
  },

  setValidated(isValid) {
    try {
      localStorage.setItem(
        API_CONFIG.STORAGE_KEYS.KEY_VALIDATED,
        isValid.toString()
      );
    } catch {
      // Ignore localStorage write failures
    }
    emitStorageUpdate();
  },

  isValidated() {
    try {
      return localStorage.getItem(API_CONFIG.STORAGE_KEYS.KEY_VALIDATED) === 'true';
    } catch {
      return false;
    }
  },
};

export const StorageSync = {
  EVENT_NAME: STORAGE_EVENT,
};
