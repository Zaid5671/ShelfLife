import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

// ─── UTILITY: DecryptedText ──────────────────────────────────────────────────
function DecryptedText({ text = "", trigger = false, speed = 25 }) {
  const CHARS =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  const [display, setDisplay] = useState(text);
  const timerRef = useRef(null);

  useEffect(() => {
    clearTimeout(timerRef.current);
    if (!trigger) {
      setDisplay(text);
      return;
    }
    let frame = 0;
    const steps = text.length * 2;
    const tick = () => {
      frame++;
      const revealed = Math.floor((frame / steps) * text.length);
      setDisplay(
        text
          .split("")
          .map((ch, i) =>
            i < revealed
              ? ch
              : ch === " "
                ? " "
                : CHARS[Math.floor(Math.random() * CHARS.length)],
          )
          .join(""),
      );
      if (revealed < text.length) timerRef.current = setTimeout(tick, speed);
      else setDisplay(text);
    };
    timerRef.current = setTimeout(tick, speed);
    return () => clearTimeout(timerRef.current);
  }, [trigger, text, speed]);

  return <>{display}</>;
}

// ─── DATA & CONFIG ───────────────────────────────────────────────────────────
const VIBE_CFG = {
  "High-Signal": {
    bg: "linear-gradient(145deg,#0a3d28,#1a6b4a,#0d4535)",
    pill: "#1D9E75",
    pillTxt: "#d0f5e8",
    border: "rgba(29, 158, 117, 0.4)",
  },
  Educational: {
    bg: "linear-gradient(145deg,#091f3d,#163a6b,#0c2d52)",
    pill: "#2275c4",
    pillTxt: "#c8e3fb",
    border: "rgba(34, 117, 196, 0.4)",
  },
  Chaotic: {
    bg: "linear-gradient(145deg,#3d0920,#7a1545,#4d0c2a)",
    pill: "#b83a68",
    pillTxt: "#fce8f0",
    border: "rgba(184, 58, 104, 0.4)",
  },
  Cursed: {
    bg: "linear-gradient(145deg,#2a1600,#5a3008,#3d2005)",
    pill: "#c47f1a",
    pillTxt: "#fef0d0",
    border: "rgba(196, 127, 26, 0.4)",
  },
};

const LOADING_PHRASES = [
  "INITIALIZING NEURAL SCRAPER...",
  "BYPASSING PAYWALLS...",
  "EXTRACTING CONTEXTUAL VIBES...",
  "DISTILLING INFORMATION...",
  "GENERATING SHELFLIFE SUMMARY...",
];

// ─── NAVBAR COMPONENT ────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        height: 70,
        padding: "0 36px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: scrolled ? "rgba(5, 8, 16, 0.9)" : "rgba(5, 8, 16, 0.3)",
        backdropFilter: "blur(18px)",
        borderBottom: `1px solid ${scrolled ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)"}`,
        transition: "all 0.35s ease",
      }}
    >
      {/* Logo */}
      <div
        style={{
          fontFamily: "'Syne',sans-serif",
          fontWeight: 800,
          fontSize: 20,
          color: "#c084fc",
          display: "flex",
          alignItems: "center",
          gap: 10,
          cursor: "pointer",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: "linear-gradient(135deg, #c084fc, #d946ef)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            fontWeight: 800,
            color: "#fff",
          }}
        >
          S
        </div>
        ShelfLife
      </div>

      {/* Live badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#d946ef",
            boxShadow: "0 0 10px #d946ef",
            animation: "pulse 2s infinite",
          }}
        />
        <span
          style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: 13,
            color: "rgba(255,255,255,0.5)",
            fontWeight: 500,
          }}
        >
          System Online
        </span>
      </div>
    </nav>
  );
}

// ─── CARD COMPONENT ──────────────────────────────────────────────────────────
function GridCard({ card, index }) {
  const v = VIBE_CFG[card.vibe] || VIBE_CFG["Educational"];
  const isDecayed = card.decay > 30;
  const sat = isDecayed ? `saturate(${(100 - card.decay) / 100})` : "";
  const decayCol =
    card.decay > 50 ? "#e24b4a" : card.decay > 20 ? "#c47f1a" : v.pill;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.05,
        type: "spring",
        stiffness: 200,
        damping: 20,
      }}
      whileHover={{ y: -5, scale: 1.02, boxShadow: `0 12px 30px ${v.border}` }}
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        background: isDecayed
          ? "linear-gradient(145deg,#121212,#1a1a1a)"
          : v.bg,
        border: `1px solid ${isDecayed ? "rgba(255,255,255,0.06)" : v.border}`,
        borderRadius: "20px",
        padding: "28px",
        overflow: "hidden",
        cursor: "pointer",
        position: "relative",
        filter: sat,
        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
      }}
    >
      {/* Vibe and Time */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontFamily: "'Syne',sans-serif",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.06em",
            padding: "4px 12px",
            borderRadius: 999,
            background: isDecayed ? "rgba(255,255,255,0.1)" : v.pill,
            color: isDecayed ? "rgba(255,255,255,0.38)" : v.pillTxt,
          }}
        >
          {card.icon} &nbsp; {card.vibe}
        </span>
        <span
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.4)",
            fontFamily: "'DM Sans',sans-serif",
          }}
        >
          {new Date(card.createdAt).toLocaleDateString()}
        </span>
      </div>

      {/* Title */}
      <h3
        style={{
          fontFamily: "'Syne',sans-serif",
          fontSize: 18,
          fontWeight: 800,
          lineHeight: 1.3,
          margin: 0,
          color: isDecayed ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.95)",
        }}
      >
        {card.title}
      </h3>

      {/* Summary */}
      <p
        style={{
          fontFamily: "'DM Sans',sans-serif",
          fontSize: 14,
          fontWeight: 300,
          lineHeight: 1.6,
          margin: 0,
          flex: 1,
          color: isDecayed ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.7)",
        }}
      >
        {card.summary}
      </p>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 12,
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
          🔗 {card.source}
        </span>
        {card.decay > 0 && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              borderRadius: 999,
              padding: "2px 8px",
              border: `1px solid ${decayCol}55`,
              color: decayCol,
            }}
          >
            {card.decay}% decayed
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ─── DASHBOARD PAGE ──────────────────────────────────────────────────────────
export default function Dashboard() {
  const [cards, setCards] = useState([]);
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success
  const [summaryData, setSummaryData] = useState(null);
  const [loadingPhraseIdx, setLoadingPhraseIdx] = useState(0);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("/api/links", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCards(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching links:", error);
        setCards([]); // Also set to empty array on error
      }
    };
    fetchLinks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    setStatus("loading");
    setSummaryData(null);
    setLoadingPhraseIdx(0);

    const phraseInterval = setInterval(() => {
      setLoadingPhraseIdx((prev) =>
        Math.min(prev + 1, LOADING_PHRASES.length - 1),
      );
    }, 1000);

    try {
      const token = localStorage.getItem("token");
      const { data: newCard } = await axios.post(
        "/api/links/ingest",
        { url },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      clearInterval(phraseInterval);
      setSummaryData(newCard);
      setStatus("success");
      setUrl("");

      setTimeout(() => {
        setCards((prev) => [newCard, ...prev]);
        setStatus("idle");
        setSummaryData(null);
      }, 3500);
    } catch (error) {
      console.error("Error ingesting link:", error);
      clearInterval(phraseInterval);
      setStatus("idle");
      // You might want to show an error message to the user here
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        
        body { 
          margin: 0; 
          background: linear-gradient(180deg, #050810 0%, #0a0515 50%, #050810 100%); 
          color: #e8eaf0; 
          overflow-x: hidden; 
          font-family: 'DM Sans', sans-serif; 
          min-height: 100vh;
        }
        * { box-sizing: border-box; }

        .url-input {
          flex: 1;
          padding: 18px 24px;
          border-radius: 16px;
          background: rgba(0, 0, 0, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #f0f2f5;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          font-size: 18px;
          letter-spacing: 0.5px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          outline: none;
          box-shadow: inset 0 2px 10px rgba(0,0,0,0.5);
        }
        .url-input:focus {
          background: rgba(255, 255, 255, 0.06);
          border-color: #8b5cf6;
          box-shadow: 0 0 20px rgba(139, 92, 246, 0.2), inset 0 2px 10px rgba(0,0,0,0.2);
        }
        .url-input::placeholder { color: rgba(255, 255, 255, 0.25); }

        .submit-btn {
          padding: 0 36px;
          border-radius: 16px;
          border: 1px solid rgba(139, 92, 246, 0.5);
          background: rgba(139, 92, 246, 0.15);
          color: #d946ef;
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .submit-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #8b5cf6, #d946ef);
          color: #fff;
          border-color: transparent;
          box-shadow: 0 0 25px rgba(217, 70, 239, 0.5);
          transform: translateY(-2px);
        }
        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          filter: grayscale(1);
        }

        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .scanner-line {
          position: absolute;
          top: 0; left: 0; right: 0; height: 100%;
          background: linear-gradient(to bottom, transparent, rgba(217, 70, 239, 0.4) 50%, #d946ef 50%, transparent);
          animation: scan 2s linear infinite;
          pointer-events: none;
        }
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>

      <Navbar />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: "120px",
          paddingInline: "24px",
          paddingBottom: "100px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* UPPER SECTION: ADD LINK */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ width: "100%", maxWidth: "760px", marginBottom: "60px" }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h1
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "56px",
                fontWeight: 800,
                letterSpacing: "-0.5px",
                margin: "0 0 16px",
                background:
                  "linear-gradient(135deg, #ffffff 30%, #c084fc 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                lineHeight: 1.1,
              }}
            >
              Add to your ShelfLife
            </h1>
            <p
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "18px",
                fontWeight: 400,
                color: "rgba(255,255,255,0.5)",
                margin: 0,
              }}
            >
              Paste any URL. We'll extract the essence and categorize it.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              gap: "12px",
              marginBottom: "40px",
              position: "relative",
            }}
          >
            <input
              type="url"
              className="url-input"
              placeholder="https://example.com/article..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={status !== "idle"}
            />
            <button
              type="submit"
              className="submit-btn"
              disabled={status !== "idle" || !url}
            >
              {status === "loading" ? "Scanning..." : "Digest Link"}
            </button>
          </form>

          {/* Dynamic Section (Loading / Success) */}
          <div style={{ minHeight: "150px" }}>
            <AnimatePresence mode="wait">
              {/* LOADING STATE */}
              {status === "loading" && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  style={{ overflow: "hidden" }}
                >
                  <div
                    style={{
                      position: "relative",
                      background: "rgba(0, 0, 0, 0.8)",
                      border: "1px solid rgba(139, 92, 246, 0.4)",
                      borderRadius: "16px",
                      padding: "40px 30px",
                      textAlign: "center",
                      overflow: "hidden",
                      backdropFilter: "blur(12px)",
                    }}
                  >
                    <div className="scanner-line" />

                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        border: "2px dashed #d946ef",
                        margin: "0 auto 20px",
                        animation: "spin 4s linear infinite",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          background: "#d946ef",
                          borderRadius: "50%",
                          boxShadow: "0 0 10px #d946ef",
                        }}
                      />
                    </div>

                    <h3
                      style={{
                        fontFamily: "'Syne', sans-serif",
                        color: "#d946ef",
                        fontSize: "18px",
                        fontWeight: 800,
                        letterSpacing: "0.15em",
                        margin: 0,
                      }}
                    >
                      <DecryptedText
                        text={LOADING_PHRASES[loadingPhraseIdx]}
                        trigger={true}
                        speed={30}
                      />
                    </h3>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "rgba(255,255,255,0.5)",
                        marginTop: "12px",
                        fontFamily: "monospace",
                        letterSpacing: "0.5px",
                      }}
                    >
                      &gt; AI model active. Please hold while we process the
                      DOM...
                    </p>
                  </div>
                </motion.div>
              )}

              {/* SUCCESS SUMMARY STATE */}
              {status === "success" && summaryData && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }} // Fades out before dropping into grid
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                  <div
                    style={{
                      background: "rgba(0, 0, 0, 0.8)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "20px",
                      padding: "32px",
                      boxShadow: "0 24px 50px rgba(0,0,0,0.8)",
                      position: "relative",
                      overflow: "hidden",
                      backdropFilter: "blur(12px)",
                    }}
                  >
                    {/* Glassmorphism gradient glow */}
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "1px",
                        background:
                          "linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.8), transparent)",
                      }}
                    />

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "16px",
                      }}
                    >
                      <span
                        style={{
                          background: "rgba(139, 92, 246, 0.1)",
                          color: "#c084fc",
                          border: "1px solid rgba(139, 92, 246, 0.3)",
                          padding: "4px 12px",
                          borderRadius: "999px",
                          fontSize: "12px",
                          fontWeight: 600,
                          letterSpacing: "0.05em",
                          fontFamily: "'Syne', sans-serif",
                        }}
                      >
                        {summaryData.vibe}
                      </span>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "rgba(255,255,255,0.3)",
                        }}
                      >
                        Analysis Complete
                      </span>
                    </div>

                    <h2
                      style={{
                        fontFamily: "'Syne', sans-serif",
                        fontSize: "28px",
                        fontWeight: 800,
                        letterSpacing: "-0.5px",
                        margin: "0 0 16px",
                        color: "#f0f2f5",
                      }}
                    >
                      <DecryptedText
                        text={summaryData.title}
                        trigger={true}
                        speed={20}
                      />
                    </h2>

                    <p
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "16px",
                        fontWeight: 300,
                        lineHeight: 1.7,
                        color: "rgba(255,255,255,0.8)",
                        margin: 0,
                        paddingLeft: "16px",
                        borderLeft: "2px solid #8b5cf6",
                      }}
                    >
                      <DecryptedText
                        text={summaryData.summary}
                        trigger={true}
                        speed={5}
                      />
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* LOWER SECTION: GRID OF LINKS */}
        <div style={{ width: "100%" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              paddingBottom: "16px",
              marginBottom: "32px",
            }}
          >
            <h2
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: "24px",
                fontWeight: 800,
                margin: 0,
                color: "#fff",
              }}
            >
              Your Collection
            </h2>
            <span
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: "14px",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {cards.length} Links
            </span>
          </div>

          <motion.div
            layout
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "24px",
            }}
          >
            <AnimatePresence>
              {cards.map((card, idx) => (
                <motion.div
                  key={card._id}
                  layout
                  initial={{ opacity: 0, scale: 0.8, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <GridCard card={card} index={idx} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </>
  );
}
