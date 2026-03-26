import React from 'react';
import { useApiKeyManager } from '../hooks/useApiKeyManager';

export function ApiKeySettings() {
  const { hasApiKey, removeApiKey } = useApiKeyManager();

  if (!hasApiKey) return null;

  const handleRemove = () => {
    if (confirm('Are you sure you want to remove your API key? You will revert to the 2 free daily analyses limit.')) {
      removeApiKey();
    }
  };

  return (
    <div className="max-w-4xl lg:max-w-5xl mx-auto mb-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-primary/[0.04] border border-primary/10 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 shadow-inner">
            <span className="text-2xl">🔑</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text">API Key Configured</h3>
            <p className="text-xs text-text-muted mt-0.5">You are using your own Gemini key for unlimited analyses.</p>
          </div>
        </div>
        <button 
          onClick={handleRemove} 
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs font-bold hover:bg-danger/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
        >
          Remove Key
        </button>
      </div>
    </div>
  );
}
