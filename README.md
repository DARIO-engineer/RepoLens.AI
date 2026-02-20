# RepoLens AI

> **Understand any GitHub repository in seconds** — AI-powered deep analysis using Google Gemini with stunning interactive visualizations

[![Live Demo](https://img.shields.io/badge/Live-repolens--ai.vercel.app-000?logo=vercel)](https://repolens-ai.vercel.app)
[![Built with Copilot CLI](https://img.shields.io/badge/Built%20with-GitHub%20Copilot%20CLI-8957e5?logo=github)](https://github.com/features/copilot)
[![Gemini AI](https://img.shields.io/badge/Powered%20by-Google%20Gemini%20AI-4285f4?logo=google)](https://ai.google.dev)
[![React 19](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev)

## What is RepoLens AI?

RepoLens AI is a web application that provides instant, comprehensive analysis of any public GitHub repository using **Google Gemini AI**. Paste a repo URL and get:

- **Architectural Summary** — Project structure and design patterns
- **Stack Analysis** — Technologies, frameworks, and dependencies
- **Strengths & Weaknesses** — What the project does well and areas for improvement
- **Suggestions** — Actionable improvement ideas
- **Beginner Tasks** — Good first issues for new contributors

## Powered by Google Gemini AI

RepoLens AI leverages Google's Gemini models for intelligent repository analysis. The backend features **automatic model discovery and fallback** — it detects which Gemini models are available on your API key and selects the best one:

| Priority | Model | Use Case |
|----------|-------|----------|
| 1st | **Gemini 2.0 Flash** | Fast, high-quality analysis (default) |
| 2nd | Gemini 2.0 Flash Lite | Lightweight fallback |
| 3rd | Gemini 1.5 Flash | Stable alternative |
| 4th | Gemini 1.5 Pro | Deep analysis fallback |

> **Gemini 2.5 Pro compatible** — If you set `GEMINI_MODEL=gemini-2.5-pro` in your `.env`, RepoLens AI will use it as the preferred model. The auto-discovery system also detects Gemini 2.5 models automatically when available on your API key.

This means RepoLens AI **always works** — even as Google releases new models like Gemini 2.5 Pro and beyond, the discovery system adapts automatically.

## Unique Visualizations

What sets RepoLens AI apart from other analysis tools:

| Feature | Description |
|---------|-------------|
| **Language Ring** | Animated donut chart showing language breakdown with official GitHub colors |
| **Health Radar** | Pentagon radar chart displaying 5 health dimensions |
| **Architecture Graph** | Interactive node graph of project structure with collapse/expand |
| **Repo Personality** | Myers-Briggs style personality analysis with archetypes and traits |

## Built with GitHub Copilot CLI

This project was built entirely with `gh copilot` in the terminal:

```bash
$ gh copilot suggest "refactor express server into modular architecture with services and routes"
$ gh copilot explain "why is API_KEY undefined when using ES modules with dotenv"
$ gh copilot suggest "create an SVG pentagon radar chart in React without any chart library"
```

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 19, Vite 7.3, TailwindCSS v4, Pure SVG |
| Backend | Express 5, Google Gemini AI (2.0 Flash + auto-fallback), GitHub REST API |
| Deploy | Vercel (serverless functions) |
| Performance | React.lazy code-splitting, shared API fetch, Vercel Speed Insights |
| Accessibility | WCAG landmarks, ARIA labels, focus-visible, prefers-reduced-motion |
| SEO | Open Graph, Twitter Cards, JSON-LD structured data |
| i18n | English, Português Brasileiro |

## Installation

```bash
# Clone
git clone https://github.com/DARIO-engineer/RepoLens.AI.git
cd RepoLens.AI

# Install
cd client && npm install && cd ../server && npm install

# Configure
echo "GEMINI_API_KEY=your_key" > server/.env

# Optional: use a specific Gemini model (e.g., gemini-2.5-pro)
# echo "GEMINI_MODEL=gemini-2.5-pro" >> server/.env

# Run (two terminals)
cd server && node index.js
cd client && npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Project Structure

```
client/src/
├── components/
│   ├── AnalysisResult.jsx     # AI analysis display
│   ├── ArchitectureGraph.jsx  # Interactive file tree graph
│   ├── HealthRadar.jsx        # Pentagon health chart
│   ├── LanguageRing.jsx       # Language donut chart
│   ├── RepoPersonality.jsx    # MBTI-style personality
│   └── RepoStats.jsx          # Stats dashboard
├── i18n.jsx                   # EN/PT-BR translations
└── App.jsx

server/
├── routes/analyze.js          # POST /api/analyze
└── services/
    ├── gemini.js              # Gemini AI with model fallback
    └── github.js              # GitHub API client
```

## Roadmap

- [ ] Gemini 2.5 Pro as default model when generally available
- [ ] Caching layer for repeated analyses
- [ ] GitHub OAuth for saved reports
- [ ] Alternative AI models (open-source LLMs)
- [ ] PWA support with offline mode
- [ ] CI/CD with GitHub Actions

## Contributing

1. Fork the repo
2. Create a branch (`git checkout -b feature/my-feature`)
3. Commit and push
4. Open a Pull Request

## License

MIT — see [LICENSE](LICENSE)

---

**DARIO-engineer** · Built with GitHub Copilot CLI for the [DEV.to Copilot CLI Challenge 2026](https://dev.to/challenges/github)

*RepoLens AI is compatible with Google Gemini 2.0, Gemini 2.5 Pro, and future Gemini models via automatic model discovery.*
