import { createContext, useContext, useState, useCallback } from "react";

const LANG_KEY = "repolens-lang";

const translations = {
  en: {
    // Header
    "header.subtitle": "Understand any GitHub repository in seconds",
    "header.badge": "Powered by AI Analysis",

    // Hero
    "hero.title1": "Intelligent analysis of",
    "hero.title2": "GitHub repositories",
    "hero.desc": "Paste the URL of any public repository and get in seconds: architectural summary, stack analysis, technical evaluation, and improvement suggestions.",

    // Form
    "form.placeholder": "https://github.com/user/repo",
    "form.button": "Analyze",
    "form.loading": "Analyzing...",
    "form.validation": "Enter a valid GitHub URL (e.g., https://github.com/user/repo)",

    // History
    "history.title": "Recently analyzed",
    "history.clear": "Clear",

    // Error
    "error.title": "Analysis error",

    // RepoStats
    "stats.lastPush": "Last push",
    "stats.license": "License",
    "stats.open": "Open",
    "stats.showMore": "Show more...",
    "stats.showLess": "Show less",
    "stats.today": "Today",
    "stats.yesterday": "Yesterday",
    "stats.daysAgo": "d ago",
    "stats.langDNA": "Language DNA",
    "stats.healthRadar": "Health Radar",

    // ArchitectureGraph
    "arch.title": "Architecture Map",
    "arch.subtitle": "Interactive graph of the project structure",
    "arch.loading": "Mapping architecture...",
    "arch.modules": "modules",
    "arch.files": "files",
    "arch.clickToReorg": "click to reorganize",
    "arch.legendFrontend": "Frontend/Core",
    "arch.legendBackend": "Backend/API",
    "arch.legendTests": "Tests",
    "arch.legendConfig": "Config/Utils",
    "arch.legendAssets": "Assets/Styles",
    "arch.legendFiles": "Files",

    // RepoPersonality
    "personality.title": "Repo Personality",
    "personality.subtitle": "Personality analysis based on repository metadata",
    "personality.age": "Age",
    "personality.size": "Size",
    "personality.lastPush": "Last push",
    "personality.traitsTitle": "Detected traits",
    "personality.dimensionsTitle": "Personality dimensions",
    "personality.comparisonTitle": "Archetype comparison",
    "personality.today": "today",
    "personality.dAgo": "d ago",
    "personality.wAgo": "w ago",
    "personality.mAgo": "mo ago",

    // Copilot CLI_STEPS
    "copilot.step1.result": "Copilot suggested creating services/github.js, services/ai.js and routes/analyze.js with separation of concerns",
    "copilot.step1.impact": "Modular, testable and scalable code",
    "copilot.step2.result": "Identified that ES imports are hoisted before dotenv.config() — suggested import 'dotenv/config' as first import",
    "copilot.step2.impact": "Critical bug resolved in seconds",
    "copilot.step3.result": "Generated fuzzy-matching with accent stripping, universal header regex and variation mapping → canonical keys",
    "copilot.step3.impact": "100% consistent analysis regardless of format",
    "copilot.step4.result": "Suggested polar coordinates, score computation, requestAnimationFrame animation and interactive hover",
    "copilot.step4.impact": "HealthRadar — zero dependencies, pure SVG",
    "copilot.step5.result": "Created filter system with CODE_EXTENSIONS, IMPORTANT_FILES and IGNORED_PATTERNS to keep tree compact",
    "copilot.step5.impact": "Optimized prompt, faster analysis",
    "copilot.step6.result": "LanguageRing with cubic ease-out animation, hover glow, 35+ official GitHub colors and HSL fallback",
    "copilot.step6.impact": "Unique visualization that impresses",

    // Archetypes
    "archetype.pioneer.label": "Pioneer",
    "archetype.pioneer.desc": "Innovates rapidly, moves fast and tests new ideas fearlessly.",
    "archetype.pioneer.insight": "This repo has an exploratory spirit — prioritizes experimentation over perfection.",
    "archetype.guardian.label": "Guardian",
    "archetype.guardian.desc": "Prioritizes stability, documentation and best practices above all.",
    "archetype.guardian.insight": "Robust and well-maintained project — follows standards and values maintainability.",
    "archetype.architect.label": "Architect",
    "archetype.architect.desc": "Designs complex and sophisticated structures with multiple layers.",
    "archetype.architect.insight": "Sophisticated architecture with separation of concerns and technical depth.",
    "archetype.sprinter.label": "Sprinter",
    "archetype.sprinter.desc": "Fast commits, short cycles, total focus on immediate delivery.",
    "archetype.sprinter.insight": "Speed is the motto — rapid deliveries and constant iteration.",
    "archetype.scholar.label": "Scholar",
    "archetype.scholar.desc": "Documents everything, maintains wikis and impeccable READMEs.",
    "archetype.scholar.insight": "Pedagogical repository — ideal for learning and understanding. Exemplary documentation.",
    "archetype.community.label": "Community",
    "archetype.community.desc": "Community-focused — active issues, topics, high social engagement.",
    "archetype.community.insight": "Vibrant community — many contributors and active ecosystem interaction.",

    // Traits
    "trait.polyglot": "Polyglot",
    "trait.polyglot.desc": "Masters multiple languages",
    "trait.monolith": "Monolithic",
    "trait.monolith.desc": "One dominant language (>80%)",
    "trait.social": "Social",
    "trait.social.desc": "High community engagement",
    "trait.solo": "Solo",
    "trait.solo.desc": "Personal project or small team",
    "trait.ancient": "Veteran",
    "trait.ancient.desc": "Repository over 3 years old",
    "trait.fresh": "Newcomer",
    "trait.fresh.desc": "Recently created",
    "trait.documented": "Documented",
    "trait.documented.desc": "Good documentation and metadata",
    "trait.mysterious": "Mysterious",
    "trait.mysterious.desc": "Lacks basic documentation",
    "trait.popular": "Popular",
    "trait.popular.desc": "Many stars and attention",
    "trait.niche": "Niche",
    "trait.niche.desc": "Specialized project",
    "trait.active": "Active",
    "trait.active.desc": "Recently updated",
    "trait.dormant": "Dormant",
    "trait.dormant.desc": "No recent updates",
    "trait.licensed": "Licensed",
    "trait.licensed.desc": "Open source license defined",
    "trait.forkable": "Forkable",
    "trait.forkable.desc": "Many forks — reusable code",

    // Dimensions
    "dim.innovation": "Innovation",
    "dim.innovation.desc": "Ability to innovate and experiment — based on repo age, activity and size",
    "dim.stability": "Stability",
    "dim.stability.desc": "Maturity and reliability — license, documentation, time of existence",
    "dim.community": "Community",
    "dim.community.desc": "Social engagement — stars, forks, open issues, topics",
    "dim.documentation": "Documentation",
    "dim.documentation.desc": "Documentation quality — description, license, homepage, wiki, topics",
    "dim.activity": "Activity",
    "dim.activity.desc": "Update frequency — last push, recent issues, active status",

    // AnalysisResult
    "analysis.resultTitle": "Analysis Result",
    "analysis.sections": "sections",
    "analysis.copy": "Copy",
    "analysis.copied": "Copied!",
    "analysis.export": "Export .md",
    "analysis.langMismatch": "This analysis was generated in another language. Re-analyze to see it in the current language.",
    "analysis.reAnalyze": "Re-analyze",
    "analysis.loading1": "Virtually cloning repository...",
    "analysis.loading2": "Analyzing file structure...",
    "analysis.loading3": "Examining dependencies and stack...",
    "analysis.loading4": "Consulting artificial intelligence...",
    "analysis.loading5": "Generating architecture insights...",
    "analysis.loading6": "Evaluating strengths and weaknesses...",
    "analysis.loading7": "Preparing improvement suggestions...",
    "analysis.loading8": "Finalizing complete analysis...",

    // Section labels
    "section.RESUMO_ARQUITETURAL": "Architectural Summary",
    "section.STACK": "Stack Explanation",
    "section.PONTOS_FORTES": "Strengths",
    "section.PONTOS_FRACOS": "Weaknesses",
    "section.SUGESTOES_MELHORIA": "Improvement Suggestions",
    "section.TAREFAS_INICIANTES": "Beginner Tasks",

    // CopilotBanner
    "copilot.title": "Built with Copilot CLI",
    "copilot.subtitle": "Every feature of this app was architected with",
    "copilot.inTerminal": "in the terminal",
    "copilot.showTerminal": "Show terminal",
    "copilot.showUsage": "Show usage",
    "copilot.category.arch": "Architecture",
    "copilot.category.debug": "Debugging",
    "copilot.category.api": "API Design",
    "copilot.category.viz": "Visualization",
    "copilot.category.perf": "Performance",
    "copilot.category.ux": "UX/Frontend",
    "copilot.impact": "Impact",
    "copilot.stat.commands": "CLI Commands",
    "copilot.stat.bugs": "Bugs resolved",
    "copilot.stat.features": "Features generated",
    "copilot.stat.time": "Time saved",

    // Footer
    "footer.builtWith": "Built with React, Express & AI",
    "footer.challenge": "GitHub Copilot CLI Challenge 2026",
    "footer.author": "Made with purpose by DARIO-engineer",

    // Age labels
    "age.year": "year",
    "age.years": "years",
    "age.month": "month",
    "age.months": "months",
  },

  pt: {
    // Header
    "header.subtitle": "Entenda qualquer repositório GitHub em segundos",
    "header.badge": "Powered by AI Analysis",

    // Hero
    "hero.title1": "Análise inteligente de",
    "hero.title2": "repositórios GitHub",
    "hero.desc": "Cole a URL de qualquer repositório público e receba em segundos: resumo arquitetural, análise da stack, avaliação técnica e sugestões de melhoria.",

    // Form
    "form.placeholder": "https://github.com/user/repo",
    "form.button": "Analisar",
    "form.loading": "Analisando...",
    "form.validation": "Insira uma URL válida do GitHub (ex: https://github.com/user/repo)",

    // History
    "history.title": "Analisados recentemente",
    "history.clear": "Limpar",

    // Error
    "error.title": "Erro na análise",

    // RepoStats
    "stats.lastPush": "Último push",
    "stats.license": "Licença",
    "stats.open": "Abrir",
    "stats.showMore": "Ver mais...",
    "stats.showLess": "Ver menos",
    "stats.today": "Hoje",
    "stats.yesterday": "Ontem",
    "stats.daysAgo": "d atrás",
    "stats.langDNA": "DNA Linguístico",
    "stats.healthRadar": "Radar de Saúde",

    // ArchitectureGraph
    "arch.title": "Mapa Arquitetural",
    "arch.subtitle": "Grafo interativo da estrutura do projeto",
    "arch.loading": "Mapeando arquitetura...",
    "arch.modules": "módulos",
    "arch.files": "arquivos",
    "arch.clickToReorg": "clique para reorganizar",
    "arch.legendFrontend": "Frontend/Core",
    "arch.legendBackend": "Backend/API",
    "arch.legendTests": "Tests",
    "arch.legendConfig": "Config/Utils",
    "arch.legendAssets": "Assets/Styles",
    "arch.legendFiles": "Files",

    // RepoPersonality
    "personality.title": "Personalidade do Repo",
    "personality.subtitle": "Análise de personalidade baseada em metadados do repositório",
    "personality.age": "Idade",
    "personality.size": "Tamanho",
    "personality.lastPush": "Ult. push",
    "personality.traitsTitle": "Características detectadas",
    "personality.dimensionsTitle": "Dimensões de personalidade",
    "personality.comparisonTitle": "Comparação entre arquétipos",
    "personality.today": "hoje",
    "personality.dAgo": "d atrás",
    "personality.wAgo": "sem atrás",
    "personality.mAgo": "m atrás",

    // Copilot CLI_STEPS
    "copilot.step1.result": "Copilot sugeriu criar services/github.js, services/ai.js e routes/analyze.js com separação de responsabilidades",
    "copilot.step1.impact": "Código modular, testável e escalável",
    "copilot.step2.result": "Identificou que imports ES são hoisted antes de dotenv.config() — sugeriu import 'dotenv/config' como primeiro import",
    "copilot.step2.impact": "Bug crítico resolvido em segundos",
    "copilot.step3.result": "Gerou fuzzy-matching com strip de acentos, regex universal de headers e mapeamento de variações → chaves canônicas",
    "copilot.step3.impact": "Análise 100% consistente independente do formato",
    "copilot.step4.result": "Sugeriu coordenadas polares, computação de scores, animação com requestAnimationFrame e hover interativo",
    "copilot.step4.impact": "HealthRadar — zero dependências, puro SVG",
    "copilot.step5.result": "Criou sistema de filtros com CODE_EXTENSIONS, IMPORTANT_FILES e IGNORED_PATTERNS para manter o tree compacto",
    "copilot.step5.impact": "Prompt otimizado, análise mais rápida",
    "copilot.step6.result": "LanguageRing com cubic ease-out animation, hover glow, 35+ cores oficiais do GitHub e fallback HSL",
    "copilot.step6.impact": "Visualização única que impressiona",

    // Archetypes
    "archetype.pioneer.label": "Desbravador",
    "archetype.pioneer.desc": "Inova rapidamente, move-se com velocidade e testa ideias novas sem medo.",
    "archetype.pioneer.insight": "Este repositório tem espírito exploratório — prioriza experimentação sobre perfeição.",
    "archetype.guardian.label": "Guardião",
    "archetype.guardian.desc": "Prioriza estabilidade, documentação e boas práticas acima de tudo.",
    "archetype.guardian.insight": "Projeto robusto e bem cuidado — segue padrões e valoriza manutenibilidade.",
    "archetype.architect.label": "Arquiteto",
    "archetype.architect.desc": "Projeta estruturas complexas e sofisticadas com múltiplas camadas.",
    "archetype.architect.insight": "Arquitetura sofisticada com separação de responsabilidades e profundidade técnica.",
    "archetype.sprinter.label": "Velocista",
    "archetype.sprinter.desc": "Commit rápido, ciclo curto, foco total na entrega imediata.",
    "archetype.sprinter.insight": "Velocidade é o lema — entregas rápidas e iteração constante.",
    "archetype.scholar.label": "Estudioso",
    "archetype.scholar.desc": "Documenta tudo, mantém wikis e READMEs impecáveis.",
    "archetype.scholar.insight": "Repositório pedagógico — ideal para aprender e entender. Documentação exemplar.",
    "archetype.community.label": "Comunitário",
    "archetype.community.desc": "Foco na comunidade — issues ativas, tópicos, alto engajamento social.",
    "archetype.community.insight": "Comunidade vibrante — muitos contribuidores e interação ativa no ecossistema.",

    // Traits
    "trait.polyglot": "Poliglota",
    "trait.polyglot.desc": "Domina múltiplas linguagens",
    "trait.monolith": "Monolítico",
    "trait.monolith.desc": "Uma linguagem dominante (>80%)",
    "trait.social": "Social",
    "trait.social.desc": "Alto engajamento da comunidade",
    "trait.solo": "Solo",
    "trait.solo.desc": "Projeto pessoal ou de time pequeno",
    "trait.ancient": "Veterano",
    "trait.ancient.desc": "Repo com mais de 3 anos de vida",
    "trait.fresh": "Novato",
    "trait.fresh.desc": "Criado recentemente",
    "trait.documented": "Documentado",
    "trait.documented.desc": "Boa documentação e metadados",
    "trait.mysterious": "Misterioso",
    "trait.mysterious.desc": "Falta documentação básica",
    "trait.popular": "Popular",
    "trait.popular.desc": "Muitas estrelas e atenção",
    "trait.niche": "Nicho",
    "trait.niche.desc": "Projeto especializado",
    "trait.active": "Ativo",
    "trait.active.desc": "Atualizado recentemente",
    "trait.dormant": "Adormecido",
    "trait.dormant.desc": "Sem atualizações recentes",
    "trait.licensed": "Licenciado",
    "trait.licensed.desc": "Licença open source definida",
    "trait.forkable": "Forkável",
    "trait.forkable.desc": "Muitos forks — código reutilizável",

    // Dimensions
    "dim.innovation": "Inovação",
    "dim.innovation.desc": "Capacidade de inovar e experimentar — baseado em idade do repo, atividade e tamanho",
    "dim.stability": "Estabilidade",
    "dim.stability.desc": "Maturidade e confiabilidade — licença, documentação, tempo de existência",
    "dim.community": "Comunidade",
    "dim.community.desc": "Engajamento social — estrelas, forks, issues abertas, tópicos",
    "dim.documentation": "Documentação",
    "dim.documentation.desc": "Qualidade da documentação — descrição, licença, homepage, wiki, tópicos",
    "dim.activity": "Atividade",
    "dim.activity.desc": "Frequência de atualizações — último push, issues recentes, status ativo",

    // AnalysisResult
    "analysis.resultTitle": "Resultado da Análise",
    "analysis.sections": "seções",
    "analysis.copy": "Copiar",
    "analysis.copied": "Copiado!",
    "analysis.export": "Exportar .md",
    "analysis.langMismatch": "Esta análise foi gerada em outro idioma. Re-analise para ver no idioma atual.",
    "analysis.reAnalyze": "Re-analisar",
    "analysis.loading1": "Clonando repositório virtualmente...",
    "analysis.loading2": "Analisando estrutura de arquivos...",
    "analysis.loading3": "Examinando dependências e stack...",
    "analysis.loading4": "Consultando a inteligência artificial...",
    "analysis.loading5": "Gerando insights de arquitetura...",
    "analysis.loading6": "Avaliando pontos fortes e fracos...",
    "analysis.loading7": "Preparando sugestões de melhoria...",
    "analysis.loading8": "Finalizando análise completa...",

    // Section labels
    "section.RESUMO_ARQUITETURAL": "Resumo Arquitetural",
    "section.STACK": "Explicação da Stack",
    "section.PONTOS_FORTES": "Pontos Fortes",
    "section.PONTOS_FRACOS": "Pontos Fracos",
    "section.SUGESTOES_MELHORIA": "Sugestões de Melhoria",
    "section.TAREFAS_INICIANTES": "Tarefas para Iniciantes",

    // CopilotBanner
    "copilot.title": "Construído com Copilot CLI",
    "copilot.subtitle": "Cada feature deste app foi arquitetada com",
    "copilot.inTerminal": "no terminal",
    "copilot.showTerminal": "Ver terminal",
    "copilot.showUsage": "Ver uso",
    "copilot.category.arch": "Arquitetura",
    "copilot.category.debug": "Debugging",
    "copilot.category.api": "API Design",
    "copilot.category.viz": "Visualização",
    "copilot.category.perf": "Performance",
    "copilot.category.ux": "UX/Frontend",
    "copilot.impact": "Impacto",
    "copilot.stat.commands": "Comandos CLI",
    "copilot.stat.bugs": "Bugs resolvidos",
    "copilot.stat.features": "Features geradas",
    "copilot.stat.time": "Tempo salvo",

    // Footer
    "footer.builtWith": "Built with React, Express & AI",
    "footer.challenge": "GitHub Copilot CLI Challenge 2026",
    "footer.author": "Made with purpose by DARIO-engineer",

    // Age labels
    "age.year": "ano",
    "age.years": "anos",
    "age.month": "mês",
    "age.months": "meses",
  },
};

const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem(LANG_KEY) || "en";
    } catch {
      return "en";
    }
  });

  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const next = prev === "en" ? "pt" : "en";
      try { localStorage.setItem(LANG_KEY, next); } catch {}
      return next;
    });
  }, []);

  const setLanguage = useCallback((l) => {
    setLang(l);
    try { localStorage.setItem(LANG_KEY, l); } catch {}
  }, []);

  const t = useCallback(
    (key, fallback) => translations[lang]?.[key] ?? translations.en?.[key] ?? fallback ?? key,
    [lang]
  );

  return (
    <I18nContext.Provider value={{ lang, t, toggleLang, setLanguage }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
