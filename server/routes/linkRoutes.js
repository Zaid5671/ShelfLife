import express from "express";
import { ingestLink, getLinks } from "../controllers/linkController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// @route   POST /api/links/ingest
// @desc    Scrape and save a new link
// @access  Private
router.post("/ingest", authMiddleware, ingestLink);

// @route   GET /api/links
// @desc    Get all links for a user
// @access  Private
router.get("/", authMiddleware, getLinks);

export default router;
