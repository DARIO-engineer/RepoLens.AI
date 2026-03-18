import axios from "axios";

export class GitHubService {
    constructor() {
        this.baseHeaders = {
            Accept: "application/vnd.github+json",
            "User-Agent": "repolens-ai",
            ...(process.env.GITHUB_TOKEN?.trim()
                ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN.trim()}` }
                : {}),
        };
        this.http = axios.create({
            timeout: Number(process.env.GITHUB_TIMEOUT_MS) || 10000,
            maxContentLength: 2 * 1024 * 1024,
            maxBodyLength: 2 * 1024 * 1024,
            headers: this.baseHeaders,
        });
    }

    parseRepoUrl(repoUrl) {
        let parsedUrl;
        try {
            parsedUrl = new URL(repoUrl);
        } catch {
            const error = new Error("URL de repositório inválida.");
            error.status = 400;
            throw error;
        }

        const validHosts = new Set(["github.com", "www.github.com"]);
        if (parsedUrl.protocol !== "https:" || !validHosts.has(parsedUrl.hostname.toLowerCase())) {
            const error = new Error("Apenas URLs HTTPS públicas do GitHub são suportadas.");
            error.status = 400;
            throw error;
        }

        const pathParts = parsedUrl.pathname.replace(/^\/+|\/+$/g, "").split("/");
        const owner = pathParts[0];
        const repo = pathParts[1]?.replace(/\.git$/i, "");

        if (!owner || !repo) {
            const error = new Error("URL de repositório inválida.");
            error.status = 400;
            throw error;
        }

        if (!/^[A-Za-z0-9_.-]+$/.test(owner) || !/^[A-Za-z0-9_.-]+$/.test(repo)) {
            const error = new Error("O repositório informado contém caracteres inválidos.");
            error.status = 400;
            throw error;
        }

        return { owner, repo };
    }

    async getRepositoryData(owner, repo) {
        const response = await this.http.get(
            `https://api.github.com/repos/${owner}/${repo}`,
        );
        return response.data;
    }

    async getLanguages(owner, repo) {
        const response = await this.http.get(
            `https://api.github.com/repos/${owner}/${repo}/languages`,
        );
        return response.data;
    }

    async getReadme(owner, repo) {
        const response = await this.http.get(
            `https://api.github.com/repos/${owner}/${repo}/readme`,
            {
                headers: {
                    ...this.baseHeaders,
                    Accept: "application/vnd.github.v3.raw",
                },
            }
        );
        return String(response.data || "").slice(0, 12000);
    }

    async getRepositoryTree(owner, repo) {
        // Extensions that are relevant for code analysis
        const CODE_EXTENSIONS = new Set([
            ".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs",
            ".py", ".pyw",
            ".java", ".kt", ".kts",
            ".go",
            ".rs",
            ".rb",
            ".php",
            ".c", ".h", ".cpp", ".hpp", ".cc",
            ".cs",
            ".swift",
            ".dart",
            ".vue", ".svelte", ".astro",
            ".html", ".css", ".scss", ".sass", ".less",
            ".sql",
            ".sh", ".bash", ".zsh",
            ".lua", ".r", ".R", ".jl", ".ex", ".exs", ".erl",
            ".json", ".yaml", ".yml", ".toml", ".env.example",
            ".graphql", ".gql", ".proto",
        ]);

        // Files worth showing even without a code extension
        const IMPORTANT_FILES = new Set([
            "Dockerfile", "docker-compose.yml", "docker-compose.yaml",
            "Makefile", "CMakeLists.txt", "Cargo.toml", "go.mod",
            "package.json", "tsconfig.json", "vite.config.js", "vite.config.ts",
            "next.config.js", "next.config.mjs", "tailwind.config.js",
            ".eslintrc.js", ".eslintrc.json", "eslint.config.js",
            ".prettierrc", ".gitignore", "requirements.txt", "setup.py",
            "pyproject.toml", "Gemfile", "build.gradle", "pom.xml",
        ]);

        // Directories/patterns to always exclude
        const IGNORED_PATTERNS = [
            /^node_modules\//,
            /^\.git\//,
            /^dist\//,
            /^build\//,
            /^out\//,
            /^\.next\//,
            /^\.nuxt\//,
            /^vendor\//,
            /^__pycache__\//,
            /^\.cache\//,
            /^coverage\//,
            /^\.vscode\//,
            /^\.idea\//,
            /\/node_modules\//,
            /\/dist\//,
            /\/\.git\//,
        ];

        // Files to always exclude
        const IGNORED_FILES = new Set([
            "package-lock.json", "yarn.lock", "pnpm-lock.yaml",
            "composer.lock", "Gemfile.lock", "Cargo.lock",
            ".DS_Store", "Thumbs.db",
        ]);

        try {
            const response = await this.http.get(
                `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`,
            );

            const items = (response.data?.tree || []).filter((item) => {
                const path = item.path;

                // Exclude ignored directories
                if (IGNORED_PATTERNS.some((p) => p.test(path))) return false;

                // Exclude ignored files
                const filename = path.split("/").pop();
                if (IGNORED_FILES.has(filename)) return false;

                // Exclude binary/media files
                if (/\.(png|jpg|jpeg|gif|svg|ico|webp|bmp|mp3|mp4|wav|avi|mov|zip|tar|gz|rar|7z|pdf|ttf|woff|woff2|eot|otf)$/i.test(filename)) return false;

                // Keep directories (for structure)
                if (item.type === "tree") return true;

                // Keep files with code extensions
                const ext = filename.includes(".") ? "." + filename.split(".").pop().toLowerCase() : "";
                if (CODE_EXTENSIONS.has(ext)) return true;

                // Keep important config files
                if (IMPORTANT_FILES.has(filename)) return true;

                return false;
            });

            const tree = items
                .slice(0, 120)
                .map((item) => `${item.type === "tree" ? "📁" : "📄"} ${item.path}`)
                .join("\n");

            return tree;
        } catch {
            return "";
        }
    }

    async getRepositoryInfo(repoUrl) {
        const { owner, repo } = this.parseRepoUrl(repoUrl);

        const [repoData, languages, readmeContent, tree] = await Promise.all([
            this.getRepositoryData(owner, repo),
            this.getLanguages(owner, repo),
            this.getReadme(owner, repo).catch(() => ""),
            this.getRepositoryTree(owner, repo).catch(() => ""),
        ]);

        return {
            owner,
            repo,
            repoData,
            languages,
            readmeContent,
            tree,
        };
    }
}
