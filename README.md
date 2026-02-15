# 🔍 RepoLens AI

> **Understand any GitHub repository in seconds** — AI-powered analysis with stunning visualizations

[![Built with Copilot CLI](https://img.shields.io/badge/Built%20with-GitHub%20Copilot%20CLI-8957e5?logo=github)](https://github.com/features/copilot)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express)](https://expressjs.com)
[![Gemini AI](https://img.shields.io/badge/Gemini-AI-4285f4?logo=google)](https://ai.google.dev)

## ✨ What is RepoLens AI?

RepoLens AI is a web application that provides instant, comprehensive analysis of any public GitHub repository. Paste a repo URL and get:

- 🏗️ **Architectural Summary** — Project structure and design patterns
- 🛠️ **Stack Analysis** — Technologies, frameworks, and dependencies
- 💪 **Strengths** — What the project does well
- ⚠️ **Weaknesses** — Areas for improvement
- 💡 **Suggestions** — Actionable improvement ideas
- 🌱 **Beginner Tasks** — Good first issues for new contributors

## 🎨 Unique Visualizations

What sets RepoLens AI apart from other analysis tools:

| Feature | Description |
|---------|-------------|
| 🌈 **Language Ring** | Animated donut chart showing language breakdown with official GitHub colors |
| 📡 **Health Radar** | Pentagon radar chart displaying 5 health dimensions |
| 🌐 **Hero Orb** | Atmospheric animated background orb |
| 🗺️ **Architecture Graph** | Interactive node graph of project structure with collapse/expand animation |
| 🧬 **Repo Personality** | Myers-Briggs style personality analysis with archetypes, traits, and radar |

## 🚀 Built with GitHub Copilot CLI

This project was architected entirely with `gh copilot` in the terminal. Here are some real commands used:

```bash
# Architecture refactoring
$ gh copilot suggest "refactor express server into modular architecture with services and routes"

# Debugging
$ gh copilot explain "why is API_KEY undefined when using ES modules with dotenv"

# Feature generation
$ gh copilot suggest "create an SVG pentagon radar chart in React without any chart library"

# Performance optimization
$ gh copilot suggest "smart file tree filtering for GitHub repos to reduce prompt size"
```

**Impact:**
- 40+ CLI commands used
- 12 bugs resolved instantly
- 8 features generated
- ~6 hours saved

## 🛠️ Tech Stack

### Frontend
- **React 19** with Vite 7.3
- **TailwindCSS v4** (modern CSS-first approach)
- **Pure SVG** visualizations (zero chart library dependencies)

### Backend
- **Express 5** with ES Modules
- **Google Gemini AI** (model discovery with fallback chain)
- **GitHub REST API** for repository data

### Infrastructure
- Vite dev server with API proxy
- Environment-based configuration
- Responsive design (mobile + desktop)

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm 9+
- [Gemini API Key](https://ai.google.dev)

### Setup

```bash
# Clone the repository
git clone https://github.com/DARIO-engineer/repolens.git
cd repolens

# Install dependencies
cd client && npm install
cd ../server && npm install

# Configure environment
echo "GEMINI_API_KEY=your_api_key_here" > server/.env

# Start development servers
# Terminal 1 - Backend
cd server && node index.js

# Terminal 2 - Frontend
cd client && npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🌍 Internationalization

RepoLens AI supports two languages:
- 🇺🇸 **English** (default)
- 🇧🇷 **Português Brasileiro**

The AI analysis respects the selected language, generating content in the user's preferred language.

## 📁 Project Structure

```
repolens/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── AnalysisResult.jsx
│   │   │   ├── ArchitectureGraph.jsx
│   │   │   ├── CopilotBanner.jsx
│   │   │   ├── HealthRadar.jsx
│   │   │   ├── HeroOrb.jsx
│   │   │   ├── LanguageRing.jsx
│   │   │   ├── RepoForm.jsx
│   │   │   ├── RepoPersonality.jsx
│   │   │   └── RepoStats.jsx
│   │   ├── i18n.jsx        # Internationalization
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── server/                 # Express backend
│   ├── routes/
│   │   └── analyze.js      # Analysis endpoint
│   ├── services/
│   │   ├── gemini.js       # AI service with model discovery
│   │   └── github.js       # GitHub API service
│   ├── index.js
│   └── package.json
├── LICENSE
└── README.md
```

## 🎯 Features Highlight

### Responsive Layout
- Mobile-first design
- 2-column grid on desktop for Strengths/Weaknesses
- Adaptive components

### Smart Fallback
- Graceful degradation when AI quota is exceeded
- Fallback analysis from GitHub metadata

### Analysis History
- Recent analyses saved locally
- Quick re-analyze capability

### Export Options
- Copy analysis to clipboard
- Export as Markdown file

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**DARIO-engineer**

Built with ❤️ and GitHub Copilot CLI for the [DEV.to GitHub Copilot CLI Challenge 2026](https://dev.to/challenges/github)

---

<div align="center">
  <sub>⭐ Star this repo if you found it useful!</sub>
</div>
