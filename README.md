# RepoLens AI

> **Understand any GitHub repository in seconds** — AI-powered analysis with stunning visualizations

[![Live Demo](https://img.shields.io/badge/Live-repolens--ai.vercel.app-000?logo=vercel)](https://repolens-ai.vercel.app)
[![Built with Copilot CLI](https://img.shields.io/badge/Built%20with-GitHub%20Copilot%20CLI-8957e5?logo=github)](https://github.com/features/copilot)
[![Gemini AI](https://img.shields.io/badge/Gemini-AI-4285f4?logo=google)](https://ai.google.dev)

## What is RepoLens AI?

RepoLens AI is a web application that provides instant, comprehensive analysis of any public GitHub repository. Paste a repo URL and get:

- **Architectural Summary** — Project structure and design patterns
- **Stack Analysis** — Technologies, frameworks, and dependencies
- **Strengths & Weaknesses** — What the project does well and areas for improvement
- **Suggestions** — Actionable improvement ideas
- **Beginner Tasks** — Good first issues for new contributors

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
| Backend | Express 5, Google Gemini AI, GitHub REST API |
| Deploy | Vercel (serverless functions) |
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
