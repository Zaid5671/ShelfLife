import fetch from "node-fetch";
import * as cheerio from "cheerio";
import Groq from "groq-sdk";
import Link from "../models/Link.js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function getGroqChatCompletion(content) {
  const prompt = `
    Analyze the following web content and return a JSON object with the following structure:
    {
      "title": "A concise, catchy title for the content",
      "summary": "A 2-3 sentence summary of the key points. Should be engaging and informative.",
      "vibe": "Choose ONE of the following vibes that best fits the content: High-Signal, Educational, Chaotic, Cursed",
      "icon": "Provide a single emoji that represents the content's theme."
    }

    Here is the content:
    ---
    ${content.slice(0, 7000)}
    ---
  `;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 250,
      top_p: 1,
      response_format: { type: "json_object" },
    });

    const result = chatCompletion.choices[0]?.message?.content;
    if (!result) {
      throw new Error("Groq API returned no result.");
    }
    return JSON.parse(result);
  } catch (error) {
    console.error("Groq API Error:", error);
    // Fallback to a default object in case of AI failure
    return {
      title: "Content Analysis Failed",
      summary: "The AI summarizer could not process this content.",
      vibe: "Cursed",
      icon: "💀",
    };
  }
}

async function getCategoryFromSummary(summary) {
  const prompt = `
    Based on the following summary, what is the best single-word category for this content?
    Return a JSON object with a single key "category". For example: {"category": "Technology"}.

    Do not use generic terms like "Informative" or "Article". Be specific, like "Programming", "Health", "Science", "History", "Business", "Art", etc.

    Summary:
    ---
    ${summary}
    ---
  `;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_tokens: 50,
      top_p: 1,
      response_format: { type: "json_object" },
    });

    const result = chatCompletion.choices[0]?.message?.content;
    if (!result) {
      throw new Error("Groq API returned no category result.");
    }
    const parsedResult = JSON.parse(result);
    return parsedResult.category || "General";
  } catch (error) {
    console.error("Groq Category API Error:", error);
    return "General"; // Fallback category
  }
}

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

    // 3. Extract content
    const scrapedTitle =
      $("title").first().text() || $("h1").first().text() || "No title found";
    $("script, style, nav, footer, header, aside").remove();
    const content = $("body").text().replace(/\s\s+/g, " ").trim();

    if (!content) {
      return res
        .status(400)
        .json({ message: "Could not extract content from the URL." });
    }

    // 4. Get AI-powered analysis
    const aiAnalysis = await getGroqChatCompletion(content);

    // 4.5. Get AI-powered category
    const category = await getCategoryFromSummary(aiAnalysis.summary);

    // 5. Create and save the new Link
    const newLink = new Link({
      user: userId,
      originalUrl: url,
      title: aiAnalysis.title || scrapedTitle,
      summary: aiAnalysis.summary,
      vibe: category, // Use the new dynamic category
      icon: aiAnalysis.icon,
      source: new URL(url).hostname.replace(/^www\./, ""),
      content, // Storing full content for future use
      decay: 0, // New links have no decay
    });

    await newLink.save();

    res.status(201).json(newLink);
  } catch (error) {
    console.error("Ingestion error:", error);
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

// @desc    Delete a link
// @route   DELETE /api/links/:id
// @access  Private
export const deleteLink = async (req, res) => {
  try {
    const deletedLink = await Link.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!deletedLink) {
      return res.status(404).json({ message: "Link not found" });
    }

    res.json({ message: "Link deleted successfully", id: deletedLink._id });
  } catch (error) {
    console.error("Error deleting link:", error);
    res.status(500).json({ message: "Server error while deleting link" });
  }
};
