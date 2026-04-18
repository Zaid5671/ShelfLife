import express from "express";
import { ingestLink, getLinks, archiveLink, restoreLink, deleteLink } from "../controllers/linkController.js";
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

// @route   PUT /api/links/:id/archive
// @desc    Archive a link
// @access  Private
router.put("/:id/archive", authMiddleware, archiveLink);

// @route   PUT /api/links/:id/restore
// @desc    Restore a link
// @access  Private
router.put("/:id/restore", authMiddleware, restoreLink);

// @route   DELETE /api/links/:id
// @desc    Delete a link permanently
// @access  Private
router.delete("/:id", authMiddleware, deleteLink);

export default router;
