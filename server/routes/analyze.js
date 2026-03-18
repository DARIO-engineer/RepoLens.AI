import express from "express";
import { analyzeRepository } from "../controllers/analyzeController.js";

const router = express.Router();

router.post("/", analyzeRepository);

export default router;
