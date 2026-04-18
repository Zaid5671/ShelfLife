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
    // 1. Fetch the HTML from the URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }
    const html = await response.text();

    // 2. Parse the HTML with Cheerio
    const $ = cheerio.load(html);

    // 3. Extract the title and content
    const title =
      $("title").first().text() || $("h1").first().text() || "No title found";

    // Simple content extraction (can be improved)
    // This removes script/style tags and gets the text from the body
    $("script, style, nav, footer, header, aside").remove();
    const content = $("body").text().replace(/\s\s+/g, " ").trim();
    const summary = content.slice(0, 200) + (content.length > 200 ? "..." : "");
    const source = new URL(url).hostname.replace(/^www\./, "");

    if (!content) {
      return res
        .status(400)
        .json({ message: "Could not extract content from the URL." });
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
    console.error("Scraping error:", error);
    res.status(500).json({
      message:
        "Failed to ingest link. The URL may be invalid or the site may block scraping.",
    });
  }
};

// @desc    Get all links for a user
// @route   GET /api/links
// @access  Private
export const getLinks = async (req, res) => {
  try {
    const links = await Link.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(links);
  } catch (error) {
    console.error("Error fetching links:", error);
    res.status(500).send("Server Error");
  }
};
