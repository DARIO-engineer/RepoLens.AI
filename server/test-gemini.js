import dotenv from "dotenv";
dotenv.config();

import { GeminiService } from "./services/gemini.js";

const g = new GeminiService();

console.log("API Key exists:", !!g.apiKey);
console.log("API Key length:", (g.apiKey || "").length);

try {
    const models = await g.discoverAvailableModels();
    console.log("Available models:", models.slice(0, 5));

    if (models.length === 0) {
        console.log("No models found — API key may be invalid or expired.");
    } else {
        // Quick test with a simple prompt
        const testPrompt = g.buildPrompt(
            { name: "test-repo", description: "A test", stargazers_count: 5, forks_count: 1, open_issues_count: 2, topics: ["test"], license: { name: "MIT" } },
            { JavaScript: 5000, TypeScript: 3000 },
            "# Test Repo\nThis is a test repository.",
            "src/\n  index.js\n  utils.js"
        );
        console.log("Prompt length:", testPrompt.length);
        const result = await g.generateAnalysis(testPrompt);
        console.log("\n=== RESULT (first 1500 chars) ===");
        console.log(result.slice(0, 1500));
        console.log("\n=== SECTIONS FOUND ===");
        const sections = result.match(/^## \w+/gm);
        console.log(sections);
    }
} catch (e) {
    console.error("Error:", e.message);
    if (e.response) {
        console.error("Status:", e.response.status);
        console.error("Data:", JSON.stringify(e.response.data).slice(0, 500));
    }
}
