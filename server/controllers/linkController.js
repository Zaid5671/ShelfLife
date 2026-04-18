import fetch from "node-fetch";
import * as cheerio from "cheerio";
import Link from "../models/Link.js";

// @desc    Scrape and save a new link
// @route   POST /api/links/ingest
// @access  Private
export const ingestLink = async (req, res) => {
  const { url } = req.body;
  const userId = req.user.id;

  if (!url) {
    return res.status(400).json({ message: "URL is required" });
  }

  try {
    let title = "Protected Site";
    let content = "The content of this site could not be extracted due to anti-bot protection or a network error.";
    let summary = content;
    let source = "Unknown";
    
    try {
      source = new URL(url).hostname.replace(/^www\./, "");
    } catch (e) {
      // ignore
    }

    try {
      // 1. Fetch the HTML from the URL
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5'
        }
      });
      
      if (response.ok) {
        const html = await response.text();

        // 2. Parse the HTML with Cheerio
        const $ = cheerio.load(html);

        // 3. Extract the title and content
        const extractedTitle = $("title").first().text() || $("h1").first().text();
        if (extractedTitle) title = extractedTitle.trim();

        // Simple content extraction
        $("script, style, nav, footer, header, aside").remove();
        const extractedContent = $("body").text().replace(/\s\s+/g, " ").trim();
        
        if (extractedContent) {
           content = extractedContent;
           summary = content.slice(0, 200) + (content.length > 200 ? "..." : "");
        }
      } else {
        console.warn(`Failed to fetch URL: ${response.statusText}`);
      }
    } catch (fetchError) {
      console.warn("Could not fetch URL for scraping, falling back to defaults:", fetchError.message);
    }

    // 4. Create and save the new Link
    const newLink = new Link({
      user: userId,
      originalUrl: url,
      title,
      summary,
      source,
      content, // Storing full content for future use
      vibe: "Educational", // Placeholder
      icon: "📘", // Placeholder
      decay: Math.floor(Math.random() * 10), // Placeholder
    });

    await newLink.save();

    res.status(201).json(newLink);
  } catch (error) {
    console.error("Database or saving error:", error);
    res.status(500).json({
      message: "Failed to save link to database.",
    });
  }
};

// @desc    Get all links for a user
// @route   GET /api/links
// @access  Private
export const getLinks = async (req, res) => {
  try {
    const isArchived = req.query.archived === 'true';
    const links = await Link.find({ user: req.user.id, isArchived }).sort({
      createdAt: -1,
    });
    res.json(links);
  } catch (error) {
    console.error("Error fetching links:", error);
    res.status(500).send("Server Error");
  }
};

// @desc    Archive a link
// @route   PUT /api/links/:id/archive
// @access  Private
export const archiveLink = async (req, res) => {
  try {
    const link = await Link.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isArchived: true, decay: 100 },
      { new: true }
    );
    if (!link) return res.status(404).json({ message: "Link not found" });
    res.json(link);
  } catch (error) {
    console.error("Error archiving link:", error);
    res.status(500).send("Server Error");
  }
};

// @desc    Restore a link
// @route   PUT /api/links/:id/restore
// @access  Private
export const restoreLink = async (req, res) => {
  try {
    const link = await Link.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isArchived: false, decay: 0 },
      { new: true }
    );
    if (!link) return res.status(404).json({ message: "Link not found" });
    res.json(link);
  } catch (error) {
    console.error("Error restoring link:", error);
    res.status(500).send("Server Error");
  }
};

// @desc    Delete a link permanently
// @route   DELETE /api/links/:id
// @access  Private
export const deleteLink = async (req, res) => {
  try {
    const link = await Link.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!link) return res.status(404).json({ message: "Link not found" });
    res.json({ message: "Link removed" });
  } catch (error) {
    console.error("Error deleting link:", error);
    res.status(500).send("Server Error");
  }
};
