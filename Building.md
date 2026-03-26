# 🚀 MEGA PROMPT - Sistema de Limitação de API com Gestão de Chaves

## 📋 CONTEXTO
Implementar um sistema completo de limitação de uso da API Gemini no RepoLens AI, onde:
- Usuários têm **2 consultas gratuitas** usando a API key do sistema
- Após atingir o limite, devem adicionar sua própria API key do Gemini para continuar
- Sistema deve ser robusto, seguro e ter excelente UX

---

## 🎯 OBJETIVOS PRINCIPAIS

1. **Sistema de Tracking de Uso** (localStorage)
2. **Modal de Solicitação de API Key**
3. **Indicador Visual de Uso Restante**
4. **Lógica de Request com Fallback**
5. **Validação de API Key**
6. **Gestão de Chaves (adicionar/remover)**
7. **Segurança (keys só no frontend)**

---

## 📂 ESTRUTURA DE ARQUIVOS A CRIAR/MODIFICAR

```
/src
  /hooks
    - useApiKeyManager.js       # Hook para gestão de API keys
    - useUsageTracker.js        # Hook para tracking de uso
  /components
    - ApiKeyModal.jsx           # Modal para adicionar key
    - UsageIndicator.jsx        # Badge de uso restante
    - ApiKeySettings.jsx        # Painel de configurações
  /lib
    - apiKeyStorage.js          # Funções de localStorage
    - geminiClient.js           # Cliente Gemini com fallback
  /constants
    - config.js                 # Constantes (MAX_FREE_REQUESTS, etc)
```

---

## 🔧 IMPLEMENTAÇÃO DETALHADA

### **1. ARQUIVO: `/src/constants/config.js`**

```javascript
export const API_CONFIG = {
  MAX_FREE_REQUESTS: 2,
  RESET_INTERVAL_MS: 24 * 60 * 60 * 1000, // 24 horas
  STORAGE_KEYS: {
    USAGE: 'repolens_usage',
    USER_API_KEY: 'repolens_user_key',
    KEY_VALIDATED: 'repolens_key_validated',
  },
  GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
};
```

---

### **2. ARQUIVO: `/src/lib/apiKeyStorage.js`**

```javascript
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
```

---

### **3. ARQUIVO: `/src/hooks/useUsageTracker.js`**

```javascript
import { useState, useEffect } from 'react';
import { UsageStorage, ApiKeyStorage } from '../lib/apiKeyStorage';
import { API_CONFIG } from '../constants/config';

export function useUsageTracker() {
  const [usage, setUsage] = useState(UsageStorage.get());
  const [hasUserKey, setHasUserKey] = useState(ApiKeyStorage.exists());

  useEffect(() => {
    // Verifica se precisa resetar ao carregar
    UsageStorage.checkAndReset();
    setUsage(UsageStorage.get());
  }, []);

  const incrementUsage = () => {
    const newCount = UsageStorage.increment();
    setUsage(UsageStorage.get());
    return newCount;
  };

  const resetUsage = () => {
    UsageStorage.reset();
    setUsage(UsageStorage.get());
  };

  const hasReachedLimit = () => {
    return usage.count >= API_CONFIG.MAX_FREE_REQUESTS;
  };

  const getRemainingRequests = () => {
    return Math.max(0, API_CONFIG.MAX_FREE_REQUESTS - usage.count);
  };

  const canMakeRequest = () => {
    return hasUserKey || !hasReachedLimit();
  };

  return {
    usage,
    hasReachedLimit: hasReachedLimit(),
    remainingRequests: getRemainingRequests(),
    canMakeRequest: canMakeRequest(),
    incrementUsage,
    resetUsage,
    hasUserKey,
    setHasUserKey,
  };
}
```

---

### **4. ARQUIVO: `/src/hooks/useApiKeyManager.js`**

```javascript
import { useState } from 'react';
import { ApiKeyStorage } from '../lib/apiKeyStorage';
import { validateGeminiKey } from '../lib/geminiClient';

export function useApiKeyManager() {
  const [apiKey, setApiKey] = useState(ApiKeyStorage.get() || '');
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState(null);

  const saveApiKey = async (key) => {
    setIsValidating(true);
    setValidationError(null);

    try {
      // Valida a key com uma request de teste
      const isValid = await validateGeminiKey(key);
      
      if (isValid) {
        ApiKeyStorage.set(key);
        ApiKeyStorage.setValidated(true);
        setApiKey(key);
        return { success: true };
      } else {
        setValidationError('API Key inválida. Verifique e tente novamente.');
        return { success: false, error: 'Invalid key' };
      }
    } catch (error) {
      setValidationError('Erro ao validar a key. Tente novamente.');
      return { success: false, error: error.message };
    } finally {
      setIsValidating(false);
    }
  };

  const removeApiKey = () => {
    ApiKeyStorage.remove();
    setApiKey('');
    setValidationError(null);
  };

  const hasApiKey = () => {
    return ApiKeyStorage.exists();
  };

  return {
    apiKey,
    saveApiKey,
    removeApiKey,
    hasApiKey: hasApiKey(),
    isValidating,
    validationError,
  };
}
```

---

### **5. ARQUIVO: `/src/lib/geminiClient.js`**

```javascript
import { ApiKeyStorage } from './apiKeyStorage';
import { API_CONFIG } from '../constants/config';

/**
 * Valida se uma API key do Gemini funciona
 */
export async function validateGeminiKey(apiKey) {
  try {
    const response = await fetch(
      `${API_CONFIG.GEMINI_API_URL}?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: 'test' }]
          }]
        }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Key validation error:', error);
    return false;
  }
}

/**
 * Faz request ao Gemini usando a key apropriada
 */
export async function callGeminiAPI(prompt, useUserKey = true) {
  let apiKey;

  if (useUserKey) {
    apiKey = ApiKeyStorage.get();
  }

  if (!apiKey) {
    // Fallback para a key do sistema (variável de ambiente)
    apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 
             process.env.VITE_GEMINI_API_KEY ||
             process.env.REACT_APP_GEMINI_API_KEY;
  }

  if (!apiKey) {
    throw new Error('No API key available');
  }

  try {
    const response = await fetch(
      `${API_CONFIG.GEMINI_API_URL}?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'API request failed');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}
```

---

### **6. ARQUIVO: `/src/components/UsageIndicator.jsx`**

```jsx
import React from 'react';
import { useUsageTracker } from '../hooks/useUsageTracker';
import './UsageIndicator.css';

export function UsageIndicator() {
  const { hasUserKey, remainingRequests, hasReachedLimit } = useUsageTracker();

  if (hasUserKey) {
    return (
      <div className="usage-indicator user-key">
        <span className="icon">🔑</span>
        <span className="text">Usando sua API key</span>
      </div>
    );
  }

  return (
    <div className={`usage-indicator ${hasReachedLimit ? 'limit-reached' : ''}`}>
      <span className="icon">⚡</span>
      <span className="text">
        {hasReachedLimit 
          ? 'Limite atingido - Adicione sua key' 
          : `${remainingRequests} consultas gratuitas restantes`
        }
      </span>
    </div>
  );
}
```

**CSS:** `/src/components/UsageIndicator.css`

```css
.usage-indicator {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.usage-indicator.limit-reached {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  animation: pulse 2s infinite;
}

.usage-indicator.user-key {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.usage-indicator .icon {
  font-size: 16px;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}
```

---

### **7. ARQUIVO: `/src/components/ApiKeyModal.jsx`**

```jsx
import React, { useState } from 'react';
import { useApiKeyManager } from '../hooks/useApiKeyManager';
import './ApiKeyModal.css';

export function ApiKeyModal({ isOpen, onClose, onSuccess }) {
  const [keyInput, setKeyInput] = useState('');
  const { saveApiKey, isValidating, validationError } = useApiKeyManager();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!keyInput.trim()) return;

    const result = await saveApiKey(keyInput.trim());
    
    if (result.success) {
      onSuccess?.();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        
        <div className="modal-header">
          <h2>🔑 Adicione sua API Key</h2>
          <p className="modal-subtitle">
            Você atingiu o limite de consultas gratuitas
          </p>
        </div>

        <div className="modal-body">
          <div className="info-box">
            <p>
              Para continuar usando o RepoLens AI, adicione sua própria chave 
              da API do Google Gemini. É <strong>100% grátis</strong>!
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="api-key">Sua API Key do Gemini:</label>
              <input
                id="api-key"
                type="password"
                placeholder="Cole sua API key aqui..."
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                disabled={isValidating}
                className={validationError ? 'error' : ''}
              />
              {validationError && (
                <span className="error-message">{validationError}</span>
              )}
            </div>

            <div className="how-to-get">
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="help-link"
              >
                📚 Como obter minha API key gratuita?
              </a>
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                onClick={onClose} 
                className="btn-secondary"
                disabled={isValidating}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={isValidating || !keyInput.trim()}
              >
                {isValidating ? 'Validando...' : 'Salvar e Continuar'}
              </button>
            </div>
          </form>

          <div className="security-note">
            <small>
              🔒 Sua chave é armazenada apenas no seu navegador e nunca 
              é enviada para nossos servidores.
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**CSS:** `/src/components/ApiKeyModal.css`

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  transition: color 0.2s;
}

.modal-close:hover {
  color: #000;
}

.modal-header {
  padding: 32px 32px 0;
  text-align: center;
}

.modal-header h2 {
  margin: 0 0 8px;
  font-size: 24px;
  color: #1a1a1a;
}

.modal-subtitle {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.modal-body {
  padding: 24px 32px 32px;
}

.info-box {
  background: #f0f7ff;
  border-left: 4px solid #4facfe;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.info-box p {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
  font-family: monospace;
}

.form-group input:focus {
  outline: none;
  border-color: #4facfe;
}

.form-group input.error {
  border-color: #f5576c;
}

.error-message {
  display: block;
  color: #f5576c;
  font-size: 12px;
  margin-top: 4px;
}

.how-to-get {
  margin-bottom: 24px;
}

.help-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #4facfe;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s;
}

.help-link:hover {
  color: #2d8fd6;
  text-decoration: underline;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f5f5f5;
  color: #666;
}

.btn-secondary:hover:not(:disabled) {
  background: #e0e0e0;
}

.security-note {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
  text-align: center;
}

.security-note small {
  color: #666;
  line-height: 1.5;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

### **8. ARQUIVO: `/src/components/ApiKeySettings.jsx`**

```jsx
import React from 'react';
import { useApiKeyManager } from '../hooks/useApiKeyManager';
import './ApiKeySettings.css';

export function ApiKeySettings() {
  const { hasApiKey, removeApiKey } = useApiKeyManager();

  if (!hasApiKey) return null;

  const handleRemove = () => {
    if (confirm('Tem certeza que deseja remover sua API key? Você voltará ao limite de 2 consultas gratuitas.')) {
      removeApiKey();
    }
  };

  return (
    <div className="api-key-settings">
      <div className="settings-content">
        <div className="settings-info">
          <span className="icon">🔑</span>
          <div>
            <strong>API Key Configurada</strong>
            <small>Você está usando sua própria chave do Gemini</small>
          </div>
        </div>
        <button onClick={handleRemove} className="btn-remove">
          Remover Key
        </button>
      </div>
    </div>
  );
}
```

**CSS:** `/src/components/ApiKeySettings.css`

```css
.api-key-settings {
  background: linear-gradient(135deg, #e0f7fa 0%, #e1f5fe 100%);
  border: 1px solid #b2ebf2;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}

.settings-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.settings-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.settings-info .icon {
  font-size: 24px;
}

.settings-info strong {
  display: block;
  color: #006064;
  font-size: 14px;
  margin-bottom: 2px;
}

.settings-info small {
  display: block;
  color: #00838f;
  font-size: 12px;
}

.btn-remove {
  padding: 8px 16px;
  background: white;
  border: 1px solid #ef5350;
  color: #ef5350;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-remove:hover {
  background: #ef5350;
  color: white;
}
```

---

### **9. EXEMPLO DE INTEGRAÇÃO NA PÁGINA PRINCIPAL**

```jsx
// App.jsx ou MainPage.jsx
import React, { useState } from 'react';
import { useUsageTracker } from './hooks/useUsageTracker';
import { useApiKeyManager } from './hooks/useApiKeyManager';
import { UsageIndicator } from './components/UsageIndicator';
import { ApiKeyModal } from './components/ApiKeyModal';
import { ApiKeySettings } from './components/ApiKeySettings';
import { callGeminiAPI } from './lib/geminiClient';

function App() {
  const [showModal, setShowModal] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  
  const { 
    canMakeRequest, 
    incrementUsage, 
    hasUserKey,
    setHasUserKey 
  } = useUsageTracker();

  const handleAnalyze = async (repoUrl) => {
    // Verifica se pode fazer request
    if (!canMakeRequest) {
      setShowModal(true);
      return;
    }

    setAnalyzing(true);
    
    try {
      const prompt = `Analyze this GitHub repository: ${repoUrl}`;
      const response = await callGeminiAPI(prompt, hasUserKey);
      
      setResult(response);
      
      // Só incrementa se não tiver usando key própria
      if (!hasUserKey) {
        incrementUsage();
      }
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Erro ao analisar repositório. Tente novamente.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="app">
      <header>
        <h1>RepoLens AI</h1>
        <UsageIndicator />
      </header>

      <main>
        <ApiKeySettings />
        
        {/* Seu formulário/interface aqui */}
        <button 
          onClick={() => handleAnalyze('user/repo')}
          disabled={analyzing}
        >
          {analyzing ? 'Analisando...' : 'Analisar Repositório'}
        </button>

        {result && (
          <div className="result">
            {result}
          </div>
        )}
      </main>

      <ApiKeyModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => setHasUserKey(true)}
      />
    </div>
  );
}

export default App;
```

---

## 🎯 CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1: Setup Básico
- [ ] Criar estrutura de pastas
- [ ] Criar arquivo `config.js` com constantes
- [ ] Implementar `apiKeyStorage.js`
- [ ] Criar hooks `useUsageTracker` e `useApiKeyManager`

### Fase 2: Funcionalidade Core
- [ ] Implementar `geminiClient.js` com validação
- [ ] Criar sistema de tracking de uso
- [ ] Implementar lógica de fallback de API keys

### Fase 3: Interface
- [ ] Criar `UsageIndicator` component
- [ ] Criar `ApiKeyModal` component
- [ ] Criar `ApiKeySettings` component
- [ ] Estilizar todos os componentes

### Fase 4: Integração
- [ ] Integrar na página principal
- [ ] Testar fluxo completo
- [ ] Adicionar tratamento de erros
- [ ] Testar edge cases

### Fase 5: UX/Polish
- [ ] Adicionar animações
- [ ] Mensagens de feedback
- [ ] Loading states
- [ ] Responsividade mobile

### Fase 6: Testes
- [ ] Testar com limite atingido
- [ ] Testar validação de key inválida
- [ ] Testar reset diário
- [ ] Testar remoção de key
- [ ] Testar localStorage limpo

---

## 🚨 PONTOS DE ATENÇÃO

### Segurança
- ✅ API keys do usuário **NUNCA** devem ir pro backend
- ✅ Fazer requests diretamente do frontend para o Gemini
- ✅ Validar keys antes de salvar
- ✅ Mostrar mensagem de segurança no modal

### UX
- ✅ Indicador sempre visível
- ✅ Modal não intrusivo (só aparece quando necessário)
- ✅ Feedback claro de validação
- ✅ Opção de remover key facilmente

### Performance
- ✅ Validação assíncrona sem bloquear UI
- ✅ localStorage como única fonte de verdade
- ✅ Reset automático diário

### Edge Cases
- ✅ localStorage desabilitado/limpo
- ✅ Key inválida ou expirada
- ✅ Limite de rate do Gemini
- ✅ Network errors

---

## 📊 MÉTRICAS PARA TRACKING (OPCIONAL)

Se quiser adicionar analytics:

```javascript
// Exemplo com Google Analytics
const trackEvent = (action, category, label) => {
  if (window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
    });
  }
};

// Usar assim:
trackEvent('limit_reached', 'usage', 'free_tier');
trackEvent('api_key_added', 'conversion', 'user_key');
trackEvent('analysis_completed', 'usage', hasUserKey ? 'user_key' : 'free_tier');
```

---

## 🎨 MELHORIAS FUTURAS

1. **Sistema de reset personalizado** (por hora, por dia, por semana)
2. **Dashboard de uso** (gráfico de consumo)
3. **Múltiplas keys** (rotação automática)
4. **Tier premium** (pagamento para uso ilimitado)
5. **Export de resultados** (PDF, MD)
6. **Histórico de análises**
7. **Suporte a outras LLMs** (Claude, GPT)

---

## ✅ RESULTADO ESPERADO

Depois dessa implementação:

✅ Usuários têm 2 requests grátis por dia  
✅ Sistema pede key própria quando atingir limite  
✅ Validação automática de keys  
✅ UX fluída e não intrusiva  
✅ Segurança (keys só no frontend)  
✅ Reset automático diário  
✅ Gestão completa de keys  
✅ Feedback visual claro em todos os estados  

---

## 🚀 COMANDOS FINAIS

```bash
# Instalar dependências (se necessário)
npm install

# Testar localmente
npm run dev

# Build para produção
npm run build

# Deploy (Vercel)
vercel --prod
```

---

**IMPORTANTE:** Testa cada componente isoladamente antes de integrar tudo! 🔥

Se precisar de ajustes ou tiver dúvidas durante a implementação, me chama! 💪