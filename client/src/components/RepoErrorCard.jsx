import React from "react";

const ERROR_CONFIG = {
  INVALID_FORMAT: {
    icon: "❌",
    title: "Formato inválido",
    description: "Use o formato owner/repo, por exemplo: facebook/react.",
  },
  NOT_FOUND: {
    icon: "❌",
    title: "Repositório não encontrado",
    description: "O repositório não existe, está privado ou o nome está incorreto.",
  },
  PRIVATE: {
    icon: "🔒",
    title: "Repositório privado",
    description: "Este repositório é privado. Análise indisponível para repositórios privados.",
  },
  EMPTY: {
    icon: "📭",
    title: "Repositório vazio",
    description: "Não há código para analisar neste repositório.",
  },
  FORBIDDEN: {
    icon: "⏳",
    title: "Rate limit do GitHub",
    description: "O limite da API do GitHub foi atingido. Tente novamente em 1 minuto.",
  },
  NETWORK_ERROR: {
    icon: "🌐",
    title: "Erro de rede",
    description: "Não foi possível verificar o repositório agora.",
  },
  API_ERROR: {
    icon: "❌",
    title: "Erro ao validar repositório",
    description: "Tente novamente em instantes.",
  },
};

const EXAMPLES = ["facebook/react", "vercel/next.js", "vuejs/core"];

export default function RepoErrorCard({ type = "API_ERROR", onRetry, onUseExample }) {
  const config = ERROR_CONFIG[type] || ERROR_CONFIG.API_ERROR;

  return (
    <div className="animate-fade-in max-w-3xl mx-auto mb-8 p-5 rounded-[1.6rem] bg-danger/[0.08] border border-danger/20 backdrop-blur-sm">
      <div className="flex items-start gap-4">
        <div className="text-3xl leading-none">{config.icon}</div>
        <div className="flex-1">
          <h3 className="text-base font-bold text-text">{config.title}</h3>
          <p className="text-sm text-text-muted mt-1">{config.description}</p>

          <div className="mt-4 text-xs text-text-muted space-y-1">
            <p>Checklist rápido:</p>
            <p>• Verifique se o nome está correto (owner/repo)</p>
            <p>• Certifique-se que o repositório é público</p>
            <p>• Tente outro repositório</p>
          </div>

          <div className="mt-4">
            <p className="text-xs text-text-muted mb-2">Exemplos públicos para testar:</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((repo) => (
                <button
                  key={repo}
                  onClick={() => onUseExample?.(repo)}
                  className="px-3 py-1.5 rounded-lg text-xs bg-white/[0.05] border border-white/[0.08] text-text-muted hover:text-text hover:border-primary/30 transition-all cursor-pointer"
                >
                  {repo}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={onRetry}
            className="mt-5 px-4 py-2 rounded-lg text-xs font-semibold bg-primary/15 border border-primary/25 text-primary-light hover:bg-primary/25 transition-all cursor-pointer"
          >
            Tentar outro
          </button>
        </div>
      </div>
    </div>
  );
}
