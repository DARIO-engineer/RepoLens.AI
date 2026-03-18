import "dotenv/config";
import express from "express";
import cors from "cors";
import analyzeRouter from "./routes/analyze.js";
import { applyApiHeaders, buildAiUnavailablePayload } from "./services/apiResponses.js";
import { getAiAvailability } from "./services/serviceState.js";

const app = express();
app.disable("x-powered-by");

// Middleware
app.use(cors());
app.use(express.json({ limit: "16kb" }));
app.use((req, res, next) => {
    applyApiHeaders(res);
    next();
});

// Health check
app.get("/health", (_req, res) => {
    const availability = getAiAvailability();
    return res.json({
        ok: true,
        ai: availability,
    });
});

app.get("/status", (req, res) => {
    const lang = req.query?.lang === "pt" ? "pt" : "en";
    const availability = getAiAvailability();

    if (availability.available) {
        return res.json({
            ok: true,
            serviceUnavailable: null,
        });
    }

    return res.status(503).json(buildAiUnavailablePayload(lang, availability));
});

// Routes
app.use("/analyze", analyzeRouter);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
