import fetch from "node-fetch";
import * as cheerio from "cheerio";
import Link from "../models/Link.js";

// @desc    Scrape and save a new link
// @route   POST /api/links/ingest
// @access  Private
export const ingestLink = async (req, res) => {
  const { url, roomId } = req.body; // ← roomId now comes from the frontend
  const userId = req.user.id;

  if (!url) {
    return res.status(400).json({ message: "URL is required" });
  }

  try {
    // 1. Fetch the HTML from the URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }
    const html = await response.text();

    // 2. Parse with Cheerio
    const $ = cheerio.load(html);
    const title =
      $("title").first().text() || $("h1").first().text() || "No title found";

    $("script, style, nav, footer, header, aside").remove();
    const content = $("body").text().replace(/\s\s+/g, " ").trim();
    const summary = content.slice(0, 200) + (content.length > 200 ? "..." : "");
    const source = new URL(url).hostname.replace(/^www\./, "");

    if (!content) {
      return res
        .status(400)
        .json({ message: "Could not extract content from the URL." });
    }

    // 3. Save to DB — attach roomId if provided
    const newLink = new Link({
      user: userId,
      roomId: roomId || null, // ← store which room this belongs to
      originalUrl: url,
      title,
      summary,
      source,
      content,
      vibe: "Educational",
      icon: "📘",
      decay: Math.floor(Math.random() * 10),
    });

    await newLink.save();

    // 4. ── WEBSOCKET: Broadcast new link ONLY to the relevant room ──────────
    const io = req.app.locals.io;
    if (io) {
      if (roomId) {
        // Emit only to sockets that have joined this socket.io room
        io.to(roomId).emit("message", {
          type: "LINK_ADDED",
          card: newLink,
          addedBy: req.user.username || "Someone",
        });
      } else {
        // No room — broadcast globally (personal shelf, fallback)
        io.emit("message", {
          type: "LINK_ADDED",
          card: newLink,
          addedBy: req.user.username || "Someone",
        });
      }
    }

    res.status(201).json(newLink);
  } catch (error) {
    console.error("Scraping error:", error);
    res.status(500).json({
      message:
        "Failed to ingest link. The URL may be invalid or the site may block scraping.",
    });
  }
};

// @desc    Get all links — filtered by roomId if provided
// @route   GET /api/links?roomId=XXXX
// @access  Private
export const getLinks = async (req, res) => {
  try {
    const { roomId } = req.query;

    let query;
    if (roomId) {
      // Fetch links belonging to this specific room
      query = { roomId: roomId.toUpperCase().trim() };
    } else {
      // Fetch only the user's personal (non-room) links
      query = { user: req.user.id, roomId: null };
    }

    const links = await Link.find(query).sort({ createdAt: -1 });
    res.json(links);
  } catch (error) {
    console.error("Error fetching links:", error);
    res.status(500).send("Server Error");
  }
};
