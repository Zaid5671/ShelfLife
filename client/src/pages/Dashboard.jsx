import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ScrollAnimationCanvas from "../components/ScrollAnimationCanvas";
import FloatingOrbs from "../components/FloatingOrbs";
import RadialProgress from "../components/RadialProgress";

// ─── UTILITY: DecryptedText ──────────────────────────────────────────────────
function DecryptedText({ text = "", trigger = false, speed = 25 }) {
  const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
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
    bg: "rgba(0, 214, 255, 0.02)",
    pill: "rgba(0, 214, 255, 0.1)",
    pillTxt: "#00D6FF",
    border: "rgba(0, 214, 255, 0.15)",
    shadow: "rgba(0, 214, 255, 0.2)",
  },
  Educational: {
    bg: "rgba(0, 80, 255, 0.02)",
    pill: "rgba(0, 80, 255, 0.1)",
    pillTxt: "#0050FF",
    border: "rgba(0, 80, 255, 0.15)",
    shadow: "rgba(0, 80, 255, 0.2)",
  },
  Chaotic: {
    bg: "rgba(255, 213, 74, 0.02)",
    pill: "rgba(255, 213, 74, 0.1)",
    pillTxt: "#FFD54A",
    border: "rgba(255, 213, 74, 0.15)",
    shadow: "rgba(255, 213, 74, 0.2)",
  },
  Cursed: {
    bg: "rgba(124, 58, 237, 0.02)",
    pill: "rgba(124, 58, 237, 0.1)",
    pillTxt: "#7C3AED",
    border: "rgba(124, 58, 237, 0.15)",
    shadow: "rgba(124, 58, 237, 0.2)",
  },
};

const LOADING_PHRASES = [
  "INITIALIZING NEURAL SCRAPER...",
  "BYPASSING PAYWALLS...",
  "EXTRACTING CONTEXTUAL VIBES...",
  "DISTILLING INFORMATION...",
  "GENERATING SHELFLIFE SUMMARY...",
];

// ─── CARD COMPONENT ──────────────────────────────────────────────────────────
function GridCard({ card, index }) {
  const v = VIBE_CFG[card.vibe] || VIBE_CFG["Educational"];
  const isDecayed = card.decay > 30;
  const decayCol = card.decay > 50 ? "#EF4444" : card.decay > 20 ? "#FFD54A" : v.pillTxt;

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
      whileHover={{ y: -8, scale: 1.02, boxShadow: `0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)` }}
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        background: isDecayed ? "rgba(255, 255, 255, 0.01)" : v.bg,
        backdropFilter: "blur(32px) saturate(180%)",
        WebkitBackdropFilter: "blur(32px) saturate(180%)",
        border: `1px solid ${isDecayed ? "rgba(255,255,255,0.04)" : v.border}`,
        borderRadius: "32px",
        padding: "32px",
        overflow: "hidden",
        cursor: "pointer",
        position: "relative",
        boxShadow: "0 12px 40px 0 rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
        transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
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
            fontFamily: "'Inter', sans-serif",
            fontSize: "13px",
            fontWeight: 600,
            padding: "6px 14px",
            borderRadius: "999px",
            background: isDecayed ? "rgba(255,255,255,0.03)" : v.pill,
            color: isDecayed ? "rgba(255,255,255,0.4)" : v.pillTxt,
            border: `1px solid ${isDecayed ? "transparent" : v.border}`
          }}
        >
          {card.icon} &nbsp; {card.vibe}
        </span>
        <span
          style={{
            fontSize: "13px",
            color: "rgba(255,255,255,0.4)",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {new Date(card.createdAt).toLocaleDateString()}
        </span>
      </div>

      {/* Title */}
      <h3
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "20px",
          fontWeight: 700,
          lineHeight: 1.3,
          letterSpacing: "-0.3px",
          margin: 0,
          color: isDecayed ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.92)",
        }}
      >
        {card.title}
      </h3>

      {/* Summary */}
      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "15px",
          fontWeight: 400,
          lineHeight: 1.6,
          margin: 0,
          flex: 1,
          color: isDecayed ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.60)",
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
          paddingTop: 20,
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <span style={{ fontSize: "13px", fontFamily: "'Inter', sans-serif", color: "rgba(255,255,255,0.4)", flex: 1, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
          🔗 {card.source}
        </span>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          {card.decay > 0 && (
            <RadialProgress percentage={card.decay} color={decayCol} size={28} />
          )}
          <button
            onClick={async (e) => {
              e.stopPropagation();
              if(window.confirm("Move to Graveyard?")) {
                const token = localStorage.getItem("token");
                try {
                  await axios.put(`/api/links/${card._id}/archive`, {}, { headers: { Authorization: `Bearer ${token}` } });
                  window.dispatchEvent(new CustomEvent('linkArchived', { detail: card._id }));
                } catch (err) {
                  console.error(err);
                }
              }
            }}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.8)",
              borderRadius: "10px",
              padding: "8px 14px",
              fontSize: "12px",
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            onMouseOver={(e) => {
              e.target.style.background = "rgba(255,255,255,0.1)";
              e.target.style.color = "rgba(255,255,255,1)";
              e.target.style.borderColor = "rgba(255,255,255,0.2)";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "rgba(255,255,255,0.03)";
              e.target.style.color = "rgba(255,255,255,0.8)";
              e.target.style.borderColor = "rgba(255,255,255,0.1)";
            }}
          >
            Archive
          </button>
        </div>
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
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("/api/links?archived=false", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCards(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching links:", error);
        setCards([]); // Also set to empty array on error
      }
    };
    fetchLinks();

    const handleArchive = (e) => {
      setCards(prev => prev.filter(c => c._id !== e.detail));
    };
    window.addEventListener('linkArchived', handleArchive);
    return () => window.removeEventListener('linkArchived', handleArchive);
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
    }, 1500);

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
    }
  };

  return (
    <>
      <style>{`
        body { 
          margin: 0; 
          background: #000000; 
          color: rgba(255,255,255,0.92); 
          overflow-x: hidden; 
          font-family: 'Inter', sans-serif; 
          min-height: 100vh;
        }
        * { box-sizing: border-box; }

        .url-input {
          flex: 1;
          padding: 20px 28px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(24px) saturate(150%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(255,255,255,0.92);
          font-family: 'Inter', sans-serif;
          font-weight: 400;
          font-size: 16px;
          letter-spacing: 0.2px;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          outline: none;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.2);
        }
        .url-input:focus {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(0, 214, 255, 0.4);
          box-shadow: 0 0 0 4px rgba(0, 214, 255, 0.1), inset 0 1px 0 rgba(255,255,255,0.1);
        }
        .url-input::placeholder { color: rgba(255, 255, 255, 0.4); }

        .submit-btn {
          padding: 0 36px;
          border-radius: 20px;
          border: 1px solid rgba(0, 80, 255, 0.3);
          background: rgba(0, 80, 255, 0.15);
          backdrop-filter: blur(24px);
          color: #00D6FF;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(0, 80, 255, 0.2);
        }
        .submit-btn:hover:not(:disabled) {
          background: rgba(0, 80, 255, 0.3);
          color: #fff;
          border-color: rgba(0, 214, 255, 0.5);
          box-shadow: 0 8px 24px rgba(0, 214, 255, 0.3);
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
          background: linear-gradient(to bottom, transparent, rgba(0, 214, 255, 0.2) 50%, #00D6FF 50%, transparent);
          animation: scan 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          pointer-events: none;
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>

      <Navbar />

      <div ref={containerRef} style={{ position: 'relative', width: '100%', minHeight: '400vh' }}>
        {/* Sticky Canvas Container */}
        <div style={{ position: 'sticky', top: 0, left: 0, width: '100%', height: '100vh', overflow: 'hidden', zIndex: 0 }}>
          <ScrollAnimationCanvas scrollYProgress={scrollYProgress} frameCount={240} imagePath="/1st/ezgif-frame-" />
          <FloatingOrbs />
        </div>

        {/* Overlay Content */}
        <div style={{ position: 'relative', zIndex: 10, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '-100vh' }}>
          <div
            style={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              paddingTop: "112px",
              paddingInline: "32px",
              paddingBottom: "100px",
              maxWidth: "1200px",
              width: "100%",
              margin: "0 auto",
            }}
          >
            {/* UPPER SECTION: ADD LINK */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{ width: "100%", maxWidth: "800px", marginBottom: "80px" }}
            >
              {/* Header */}
              <div style={{ textAlign: "center", marginBottom: "40px" }}>
                <h1
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "64px",
                    fontWeight: 700,
                    letterSpacing: "-2px",
                    margin: "0 0 16px",
                    color: "rgba(255,255,255,0.95)",
                    lineHeight: 1.1,
                  }}
                >
                  Add to your ShelfLife
                </h1>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
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
                  gap: "16px",
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
                      exit={{ opacity: 0, height: 0, scale: 0.98 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      style={{ overflow: "hidden" }}
                    >
                      <div
                        style={{
                          position: "relative",
                          background: "rgba(255, 255, 255, 0.02)",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                          borderRadius: "32px",
                          padding: "40px 30px",
                          textAlign: "center",
                          overflow: "hidden",
                          backdropFilter: "blur(32px) saturate(150%)",
                          WebkitBackdropFilter: "blur(32px) saturate(150%)",
                          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)",
                        }}
                      >
                        <div className="scanner-line" />

                        <div
                          style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "50%",
                            border: "2px solid rgba(0, 214, 255, 0.3)",
                            borderTopColor: "#00D6FF",
                            margin: "0 auto 24px",
                            animation: "spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        />

                        <h3
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            color: "#00D6FF",
                            fontSize: "16px",
                            fontWeight: 600,
                            letterSpacing: "0.5px",
                            margin: 0,
                          }}
                        >
                          <DecryptedText
                            text={LOADING_PHRASES[loadingPhraseIdx]}
                            trigger={true}
                            speed={20}
                          />
                        </h3>
                        <p
                          style={{
                            fontSize: "13px",
                            color: "rgba(255,255,255,0.4)",
                            marginTop: "12px",
                            fontFamily: "'Inter', sans-serif",
                          }}
                        >
                          Intelligence active. Processing content structure...
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
                      exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    >
                      <div
                        style={{
                          background: "rgba(255, 255, 255, 0.03)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: "32px",
                          padding: "40px",
                          boxShadow: "0 24px 50px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
                          position: "relative",
                          overflow: "hidden",
                          backdropFilter: "blur(32px) saturate(150%)",
                          WebkitBackdropFilter: "blur(32px) saturate(150%)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            marginBottom: "20px",
                          }}
                        >
                          <span
                            style={{
                              background: "rgba(0, 214, 255, 0.1)",
                              color: "#00D6FF",
                              border: "1px solid rgba(0, 214, 255, 0.2)",
                              padding: "4px 12px",
                              borderRadius: "999px",
                              fontSize: "12px",
                              fontWeight: 600,
                              fontFamily: "'Inter', sans-serif",
                            }}
                          >
                            {summaryData.vibe}
                          </span>
                          <span
                            style={{
                              fontSize: "12px",
                              fontFamily: "'Inter', sans-serif",
                              color: "rgba(255,255,255,0.4)",
                            }}
                          >
                            Analysis Complete
                          </span>
                        </div>

                        <h2
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: "24px",
                            fontWeight: 700,
                            letterSpacing: "-0.5px",
                            margin: "0 0 16px",
                            color: "rgba(255,255,255,0.95)",
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
                            fontFamily: "'Inter', sans-serif",
                            fontSize: "15px",
                            fontWeight: 400,
                            lineHeight: 1.6,
                            color: "rgba(255,255,255,0.60)",
                            margin: 0,
                            paddingLeft: "16px",
                            borderLeft: "2px solid rgba(255,255,255,0.1)",
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
            <div style={{ width: "100%", marginTop: "60vh" }}>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "20px",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  paddingBottom: "24px",
                  marginBottom: "40px",
                  flexWrap: "wrap",
                }}
              >
                <h2
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "24px",
                    fontWeight: 600,
                    margin: 0,
                    color: "rgba(255,255,255,0.95)",
                    textShadow: "0 2px 10px rgba(0,0,0,0.35)",
                  }}
                >
                  Your Collection
                </h2>
                
                {/* Search Bar */}
                <div style={{ position: 'relative', flex: 1, minWidth: "250px", maxWidth: "350px" }}>
                  <input
                    type="text"
                    placeholder="Search by title, vibe, or source..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 16px 12px 40px",
                      borderRadius: "16px",
                      background: "rgba(255, 255, 255, 0.02)",
                      backdropFilter: "blur(16px)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                      color: "rgba(255,255,255,0.92)",
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "14px",
                      transition: "all 0.3s ease",
                      outline: "none",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
                    }}
                    onFocus={(e) => {
                      e.target.style.background = "rgba(255, 255, 255, 0.05)";
                      e.target.style.borderColor = "rgba(0, 214, 255, 0.3)";
                    }}
                    onBlur={(e) => {
                      e.target.style.background = "rgba(255, 255, 255, 0.02)";
                      e.target.style.borderColor = "rgba(255, 255, 255, 0.06)";
                    }}
                  />
                  <svg style={{ position: 'absolute', left: 14, top: 13, width: 16, height: 16, fill: "none", stroke: "rgba(255,255,255,0.4)", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }} viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
                
                <motion.span
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    color: "rgba(255,255,255,0.75)",
                    fontSize: "14px",
                    fontFamily: "'Inter', sans-serif",
                    whiteSpace: "nowrap",
                    textShadow: "0 2px 10px rgba(0,0,0,0.35)",
                  }}
                >
                  {cards.filter(card => 
                    card.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    card.vibe?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    card.source?.toLowerCase().includes(searchQuery.toLowerCase())
                  ).length} / {cards.length} Links
                </motion.span>
              </motion.div>

              <motion.div
                layout
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                  gap: "28px",
                }}
              >
                <AnimatePresence>
                  {cards
                    .filter(card => 
                      card.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      card.vibe?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      card.source?.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((card, idx) => (
                    <motion.div
                      key={card._id}
                      layout
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, filter: "blur(8px)" }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                      <GridCard card={card} index={idx} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
