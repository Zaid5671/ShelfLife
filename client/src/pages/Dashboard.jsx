import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../hooks/useSocket";

// ─── DecryptedText ────────────────────────────────────────────────────────────
function DecryptedText({ text = "", trigger = false, speed = 25 }) {
  const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  const [display, setDisplay] = useState(text);
  const timerRef = useRef(null);

  useEffect(() => {
    clearTimeout(timerRef.current);
    if (!trigger) { setDisplay(text); return; }
    let frame = 0;
    const steps = text.length * 2;
    const tick = () => {
      frame++;
      const revealed = Math.floor((frame / steps) * text.length);
      setDisplay(
        text.split("").map((ch, i) =>
          i < revealed ? ch : ch === " " ? " " : CHARS[Math.floor(Math.random() * CHARS.length)]
        ).join("")
      );
      if (revealed < text.length) timerRef.current = setTimeout(tick, speed);
      else setDisplay(text);
    };
    timerRef.current = setTimeout(tick, speed);
    return () => clearTimeout(timerRef.current);
  }, [trigger, text, speed]);

  return <>{display}</>;
}

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const VIBE_CFG = {
  "High-Signal": { bg: "linear-gradient(145deg,#0a3d28,#1a6b4a,#0d4535)", pill: "#1D9E75", pillTxt: "#d0f5e8", border: "rgba(29,158,117,0.4)" },
  Educational:   { bg: "linear-gradient(145deg,#091f3d,#163a6b,#0c2d52)", pill: "#2275c4", pillTxt: "#c8e3fb", border: "rgba(34,117,196,0.4)" },
  Chaotic:       { bg: "linear-gradient(145deg,#3d0920,#7a1545,#4d0c2a)", pill: "#b83a68", pillTxt: "#fce8f0", border: "rgba(184,58,104,0.4)" },
  Cursed:        { bg: "linear-gradient(145deg,#2a1600,#5a3008,#3d2005)", pill: "#c47f1a", pillTxt: "#fef0d0", border: "rgba(196,127,26,0.4)" },
};

const LOADING_PHRASES = [
  "INITIALIZING NEURAL SCRAPER...",
  "BYPASSING PAYWALLS...",
  "EXTRACTING CONTEXTUAL VIBES...",
  "DISTILLING INFORMATION...",
  "GENERATING SHELFLIFE SUMMARY...",
];

const WEATHER_CFG = {
  STORMY: { icon: "⛈️", label: "Stormy", color: "#2275c4", glow: "rgba(34,117,196,0.25)" },
  BREEZY: { icon: "🌤️", label: "Breezy", color: "#1D9E75", glow: "rgba(29,158,117,0.25)" },
  FOGGY:  { icon: "🌫️", label: "Foggy",  color: "#888780", glow: "rgba(136,135,128,0.2)" },
};

const REACTION_EMOJIS = ["🔥", "💀", "⚡", "👀", "🤯"];

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function Navbar({ onlineCount, weather, roomId, roomName }) {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const wCfg = WEATHER_CFG[weather] || WEATHER_CFG.FOGGY;

  const handleLeaveRoom = () => {
    sessionStorage.removeItem("shelfRoomId");
    sessionStorage.removeItem("shelfRoomName");
    navigate("/room");
  };

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
      height: 70, padding: "0 36px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: scrolled ? "rgba(5,8,16,0.92)" : "rgba(5,8,16,0.3)",
      backdropFilter: "blur(18px)",
      borderBottom: `1px solid ${scrolled ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)"}`,
      transition: "all 0.35s ease",
    }}>
      {/* Logo */}
      <div style={{
        fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20,
        color: "#c084fc", display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
      }} onClick={() => navigate("/")}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: "linear-gradient(135deg,#c084fc,#d946ef)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, fontWeight: 800, color: "#fff",
        }}>S</div>
        ShelfLife
      </div>

      {/* Room badge */}
      {roomId && (
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "6px 14px", borderRadius: 999,
          background: "rgba(192,132,252,0.1)",
          border: "1px solid rgba(192,132,252,0.25)",
          cursor: "pointer",
        }} onClick={handleLeaveRoom} title="Click to leave room">
          <span style={{ fontSize: 13 }}>🏠</span>
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#c084fc", fontWeight: 600 }}>
            {roomName || roomId}
          </span>
          <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 11, color: "rgba(192,132,252,0.6)", fontWeight: 700, letterSpacing: "0.08em" }}>
            {roomId}
          </span>
        </div>
      )}

      {/* Shelf Weather badge */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "5px 14px", borderRadius: 999, marginRight: 16,
        background: wCfg.glow,
        border: `1px solid ${wCfg.color}50`,
        transition: "all 0.6s ease",
      }}>
        <span style={{ fontSize: 15 }}>{wCfg.icon}</span>
        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: wCfg.color, fontWeight: 600 }}>
          {wCfg.label}
        </span>
      </div>

      {/* Online count */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 20 }}>
        <span style={{
          width: 8, height: 8, borderRadius: "50%", background: "#d946ef",
          boxShadow: "0 0 10px #d946ef", animation: "pulse 2s infinite",
        }}/>
        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
          {onlineCount} online
        </span>
      </div>

      <button onClick={() => { localStorage.removeItem("token"); navigate("/login"); }} style={{
        padding: "8px 16px", borderRadius: "8px",
        border: "1px solid rgba(217,70,239,0.5)",
        background: "transparent", color: "#d946ef",
        fontFamily: "'DM Sans',sans-serif", fontWeight: 600,
        fontSize: "14px", cursor: "pointer",
      }}>Logout</button>
    </nav>
  );
}

// ─── LIVE CURSORS ─────────────────────────────────────────────────────────────
function LiveCursors({ cursors }) {
  return (
    <>
      {Object.entries(cursors).map(([socketId, pos]) => (
        <div key={socketId} style={{
          position: "fixed",
          left: `${pos.x}%`, top: `${pos.y}%`,
          pointerEvents: "none", zIndex: 9998,
          transition: "left 0.08s linear, top 0.08s linear",
          transform: "translate(-2px, -2px)",
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 2L16 8L9 10L7 16L2 2Z" fill="#d946ef" stroke="#fff" strokeWidth="1"/>
          </svg>
          <div style={{
            marginTop: 2, background: "#d946ef", color: "#fff",
            fontSize: 10, fontWeight: 700, fontFamily: "'DM Sans',sans-serif",
            padding: "2px 8px", borderRadius: 999, whiteSpace: "nowrap",
            boxShadow: "0 2px 8px rgba(217,70,239,0.5)",
          }}>{pos.username}</div>
        </div>
      ))}
    </>
  );
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ message, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 4000); return () => clearTimeout(t); }, []);
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, x: "-50%" }}
      animate={{ opacity: 1, y: 0,  x: "-50%" }}
      exit={{   opacity: 0, y: 20,  x: "-50%" }}
      style={{
        position: "fixed", bottom: 32, left: "50%",
        zIndex: 9999, whiteSpace: "nowrap",
        background: "rgba(29,158,117,0.15)",
        border: "1px solid rgba(29,158,117,0.4)",
        borderRadius: 999, padding: "10px 20px",
        fontFamily: "'DM Sans',sans-serif", fontSize: 13,
        color: "#1D9E75", fontWeight: 600,
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
      }}
    >{message}</motion.div>
  );
}

// ─── GRID CARD ────────────────────────────────────────────────────────────────
function GridCard({ card, index, onReact, floatingEmojis }) {
  const v         = VIBE_CFG[card.vibe] || VIBE_CFG["Educational"];
  const isDecayed = card.decay > 30;
  const sat       = isDecayed ? `saturate(${(100 - card.decay) / 100})` : "";
  const decayCol  = card.decay > 50 ? "#e24b4a" : card.decay > 20 ? "#c47f1a" : v.pill;
  const myEmojis  = floatingEmojis.filter((e) => e.cardId === card._id);
  const [pressedEmoji, setPressedEmoji] = useState(null);

  const handleReact = (e, emoji) => {
    e.stopPropagation();
    setPressedEmoji(emoji);
    setTimeout(() => setPressedEmoji(null), 300);
    onReact(card._id, emoji);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 200, damping: 20 }}
      whileHover={{ y: -5, scale: 1.02 }}
      style={{
        width: "100%", display: "flex", flexDirection: "column", gap: 16,
        background: isDecayed ? "linear-gradient(145deg,#121212,#1a1a1a)" : v.bg,
        border: `1px solid ${isDecayed ? "rgba(255,255,255,0.06)" : v.border}`,
        borderRadius: "20px", padding: "28px",
        overflow: "hidden", cursor: "pointer",
        position: "relative", filter: sat,
        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
      }}
    >
      <AnimatePresence>
        {myEmojis.map((e) => (
          <motion.div
            key={e.id}
            initial={{ opacity: 1, y: 10, scale: 0.6, x: "-50%" }}
            animate={{ opacity: 0, y: -70, scale: 1.6, x: "-50%" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: [0.2, 0.8, 0.4, 1] }}
            style={{ position: "absolute", bottom: "60px", left: "50%", fontSize: 32, pointerEvents: "none", zIndex: 20, filter: "drop-shadow(0 0 8px rgba(255,255,255,0.4))" }}
          >{e.emoji}</motion.div>
        ))}
      </AnimatePresence>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{
          fontFamily: "'Syne',sans-serif", fontSize: 11, fontWeight: 700,
          letterSpacing: "0.06em", padding: "4px 12px", borderRadius: 999,
          background: isDecayed ? "rgba(255,255,255,0.1)" : v.pill,
          color:      isDecayed ? "rgba(255,255,255,0.38)" : v.pillTxt,
        }}>{card.icon} &nbsp; {card.vibe}</span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans',sans-serif" }}>
          {new Date(card.createdAt).toLocaleDateString()}
        </span>
      </div>

      <h3 style={{
        fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800,
        lineHeight: 1.3, margin: 0,
        color: isDecayed ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.95)",
      }}>{card.title}</h3>

      <p style={{
        fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 300,
        lineHeight: 1.6, margin: 0, flex: 1,
        color: isDecayed ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.7)",
      }}>{card.summary}</p>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>🔗 {card.source}</span>
        {card.decay > 0 && (
          <span style={{ fontSize: 10, fontWeight: 600, borderRadius: 999, padding: "2px 8px", border: `1px solid ${decayCol}55`, color: decayCol }}>
            {card.decay}% decayed
          </span>
        )}
      </div>

      <div style={{ display: "flex", gap: 6, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        {REACTION_EMOJIS.map((emoji) => (
          <motion.button
            key={emoji}
            onClick={(e) => handleReact(e, emoji)}
            animate={pressedEmoji === emoji ? { scale: [1, 1.5, 0.9, 1.1, 1], rotate: [0, -10, 10, -5, 0] } : { scale: 1 }}
            transition={{ duration: 0.4 }}
            whileHover={{ scale: 1.25, y: -3 }}
            whileTap={{ scale: 0.85 }}
            style={{
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10, padding: "5px 9px", fontSize: 16, cursor: "pointer",
              color: "rgba(255,255,255,0.8)", fontFamily: "inherit", transition: "background 0.15s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.14)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
          >{emoji}</motion.button>
        ))}
      </div>
    </motion.div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();

  // ── Read room from sessionStorage ────────────────────────────────────────────
  const roomId   = sessionStorage.getItem("shelfRoomId")   || null;
  const roomName = sessionStorage.getItem("shelfRoomName") || null;

  const [cards,            setCards]            = useState([]);
  const [url,              setUrl]              = useState("");
  const [status,           setStatus]           = useState("idle");
  const [summaryData,      setSummaryData]      = useState(null);
  const [loadingPhraseIdx, setLoadingPhraseIdx] = useState(0);
  const [searchQuery,      setSearchQuery]      = useState("");
  const [toast,            setToast]            = useState(null);

  // ── Socket — pass roomId so the hook joins the right room ───────────────────
  const { onlineCount, weather, cursors, floatingEmojis, sendCursor, sendReaction, ping } = useSocket(roomId);

  // ── Register callback for incoming LINK_ADDED events ───────────────────────
  useEffect(() => {
    window.__shelfOnLinkAdded = (card, addedBy) => {
      setCards((prev) => {
        if (prev.some((c) => c._id === card._id)) return prev;
        return [card, ...prev];
      });
      setToast(`✦ ${addedBy} just added: "${card.title.slice(0, 40)}..."`);
    };
    return () => { window.__shelfOnLinkAdded = null; };
  }, []);

  // ── Track cursor ────────────────────────────────────────────────────────────
  useEffect(() => {
    const onMove = (e) => {
      sendCursor(
        (e.clientX / window.innerWidth)  * 100,
        (e.clientY / window.innerHeight) * 100,
      );
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [sendCursor]);

  // ── Fetch links on mount — scoped to roomId ─────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        // Pass roomId as query param so the server filters by room
        const params = roomId ? { roomId } : {};
        const { data } = await axios.get("/api/links", {
          headers: { Authorization: `Bearer ${token}` },
          params,
        });
        setCards(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching links:", err);
        setCards([]);
      }
    })();
  }, [roomId]);

  // ── Submit URL ──────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    setStatus("loading");
    setSummaryData(null);
    setLoadingPhraseIdx(0);
    ping();

    const phraseInterval = setInterval(() => {
      setLoadingPhraseIdx((prev) => Math.min(prev + 1, LOADING_PHRASES.length - 1));
    }, 1000);

    try {
      const token = localStorage.getItem("token");
      const { data: newCard } = await axios.post(
        "/api/links/ingest",
        { url, roomId },   // ← send roomId with every ingest
        { headers: { Authorization: `Bearer ${token}` } },
      );
      clearInterval(phraseInterval);
      setSummaryData(newCard);
      setStatus("success");
      setUrl("");

      setTimeout(() => {
        setCards((prev) => {
          if (prev.some((c) => c._id === newCard._id)) return prev;
          return [newCard, ...prev];
        });
        setStatus("idle");
        setSummaryData(null);
      }, 3500);
    } catch (err) {
      console.error("Error ingesting link:", err);
      clearInterval(phraseInterval);
      setStatus("idle");
    }
  };

  const handleReact = useCallback((cardId, emoji) => {
    sendReaction(cardId, emoji);
  }, [sendReaction]);

  const filteredCards = cards.filter((c) =>
    c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.vibe?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.source?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── If no room selected, prompt to join/create ──────────────────────────────
  // (Optional: remove this block if you want to allow personal shelves)
  if (!roomId) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "#050810", color: "#f0f2f5",
        fontFamily: "'DM Sans',sans-serif", gap: 20,
      }}>
        <div style={{ fontSize: 48 }}>🏠</div>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, margin: 0 }}>
          No room selected
        </h2>
        <p style={{ color: "rgba(255,255,255,0.4)", margin: 0 }}>
          Join or create a collaborative shelf to get started.
        </p>
        <button onClick={() => navigate("/room")} style={{
          padding: "12px 32px", borderRadius: 14,
          background: "linear-gradient(135deg,#8b5cf6,#d946ef)",
          border: "none", color: "#fff",
          fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 16,
          cursor: "pointer",
        }}>
          Go to Room Gate →
        </button>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        body { margin:0; background:linear-gradient(180deg,#050810 0%,#0a0515 50%,#050810 100%); color:#e8eaf0; overflow-x:hidden; font-family:'DM Sans',sans-serif; min-height:100vh; }
        * { box-sizing:border-box; }
        .url-input { flex:1; padding:18px 24px; border-radius:16px; background:rgba(0,0,0,0.6); border:1px solid rgba(255,255,255,0.08); color:#f0f2f5; font-family:'DM Sans',sans-serif; font-weight:500; font-size:18px; letter-spacing:0.5px; transition:all 0.3s; outline:none; }
        .url-input:focus { background:rgba(255,255,255,0.06); border-color:#8b5cf6; box-shadow:0 0 20px rgba(139,92,246,0.2); }
        .url-input::placeholder { color:rgba(255,255,255,0.25); }
        .submit-btn { padding:0 36px; border-radius:16px; border:1px solid rgba(139,92,246,0.5); background:rgba(139,92,246,0.15); color:#d946ef; font-family:'Syne',sans-serif; font-weight:800; font-size:16px; cursor:pointer; transition:all 0.3s; display:flex; align-items:center; justify-content:center; }
        .submit-btn:hover:not(:disabled) { background:linear-gradient(135deg,#8b5cf6,#d946ef); color:#fff; border-color:transparent; box-shadow:0 0 25px rgba(217,70,239,0.5); transform:translateY(-2px); }
        .submit-btn:disabled { opacity:0.5; cursor:not-allowed; filter:grayscale(1); }
        @keyframes scan { 0%{transform:translateY(-100%)} 100%{transform:translateY(100%)} }
        .scanner-line { position:absolute; top:0; left:0; right:0; height:100%; background:linear-gradient(to bottom,transparent,rgba(217,70,239,0.4) 50%,#d946ef 50%,transparent); animation:scan 2s linear infinite; pointer-events:none; }
        @keyframes pulse { 0%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.2)} 100%{opacity:1;transform:scale(1)} }
        @keyframes spin { 100%{transform:rotate(360deg)} }
      `}</style>

      <LiveCursors cursors={cursors}/>

      <AnimatePresence>
        {toast && <Toast key="toast" message={toast} onDone={() => setToast(null)}/>}
      </AnimatePresence>

      <Navbar onlineCount={onlineCount} weather={weather} roomId={roomId} roomName={roomName}/>

      <div style={{
        position: "relative", zIndex: 1,
        display: "flex", flexDirection: "column", alignItems: "center",
        paddingTop: "120px", paddingInline: "24px", paddingBottom: "100px",
        maxWidth: "1200px", margin: "0 auto",
      }}>

        {/* ADD LINK SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ width: "100%", maxWidth: "760px", marginBottom: "60px" }}
        >
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h1 style={{
              fontFamily: "'Outfit',sans-serif", fontSize: "56px", fontWeight: 800,
              letterSpacing: "-0.5px", margin: "0 0 16px",
              background: "linear-gradient(135deg,#ffffff 30%,#c084fc 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.1,
            }}>Add to your ShelfLife</h1>
            <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: "18px", fontWeight: 400, color: "rgba(255,255,255,0.5)", margin: 0 }}>
              Paste any URL. We'll extract the essence and categorize it.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", gap: "12px", marginBottom: "40px" }}>
            <input
              type="url" className="url-input"
              placeholder="https://example.com/article..."
              value={url} onChange={(e) => setUrl(e.target.value)}
              disabled={status !== "idle"}
            />
            <button type="submit" className="submit-btn" disabled={status !== "idle" || !url}>
              {status === "loading" ? "Scanning..." : "Digest Link"}
            </button>
          </form>

          <div style={{ minHeight: "150px" }}>
            <AnimatePresence mode="wait">
              {status === "loading" && (
                <motion.div key="loading"
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.4 }}
                  style={{ overflow: "hidden" }}
                >
                  <div style={{
                    position: "relative", background: "rgba(0,0,0,0.8)",
                    border: "1px solid rgba(139,92,246,0.4)", borderRadius: "16px",
                    padding: "40px 30px", textAlign: "center", overflow: "hidden", backdropFilter: "blur(12px)",
                  }}>
                    <div className="scanner-line"/>
                    <div style={{ width: "48px", height: "48px", borderRadius: "50%", border: "2px dashed #d946ef", margin: "0 auto 20px", animation: "spin 4s linear infinite", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: "8px", height: "8px", background: "#d946ef", borderRadius: "50%", boxShadow: "0 0 10px #d946ef" }}/>
                    </div>
                    <h3 style={{ fontFamily: "'Syne',sans-serif", color: "#d946ef", fontSize: "18px", fontWeight: 800, letterSpacing: "0.15em", margin: 0 }}>
                      <DecryptedText text={LOADING_PHRASES[loadingPhraseIdx]} trigger={true} speed={30}/>
                    </h3>
                    <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginTop: "12px", fontFamily: "monospace" }}>
                      &gt; AI model active. Please hold while we process the DOM...
                    </p>
                  </div>
                </motion.div>
              )}

              {status === "success" && summaryData && (
                <motion.div key="success"
                  initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                  <div style={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "32px", position: "relative", overflow: "hidden", backdropFilter: "blur(12px)" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg,transparent,rgba(139,92,246,0.8),transparent)" }}/>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                      <span style={{ background: "rgba(139,92,246,0.1)", color: "#c084fc", border: "1px solid rgba(139,92,246,0.3)", padding: "4px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: 600, letterSpacing: "0.05em", fontFamily: "'Syne',sans-serif" }}>
                        {summaryData.vibe}
                      </span>
                      <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>Analysis Complete</span>
                    </div>
                    <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "28px", fontWeight: 800, margin: "0 0 16px", color: "#f0f2f5" }}>
                      <DecryptedText text={summaryData.title} trigger={true} speed={20}/>
                    </h2>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "16px", fontWeight: 300, lineHeight: 1.7, color: "rgba(255,255,255,0.8)", margin: 0, paddingLeft: "16px", borderLeft: "2px solid #8b5cf6" }}>
                      <DecryptedText text={summaryData.summary} trigger={true} speed={5}/>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* GRID OF LINKS */}
        <div style={{ width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "16px", marginBottom: "32px", flexWrap: "wrap" }}>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "24px", fontWeight: 800, margin: 0, color: "#fff" }}>
              {roomName ? `${roomName}'s Collection` : "Your Collection"}
            </h2>
            <input
              type="text"
              placeholder="Search by title, vibe, or source..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: "1", minWidth: "250px", padding: "10px 16px", borderRadius: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#f0f2f5", fontFamily: "'DM Sans',sans-serif", fontSize: "14px", outline: "none" }}
              onFocus={(e) => { e.target.style.background = "rgba(255,255,255,0.08)"; e.target.style.borderColor = "rgba(217,70,239,0.5)"; }}
              onBlur={(e)  => { e.target.style.background = "rgba(255,255,255,0.05)"; e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
            />
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", fontFamily: "'DM Sans',sans-serif", whiteSpace: "nowrap" }}>
              {filteredCards.length} / {cards.length} Links
            </span>
          </div>

          <motion.div layout style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: "24px" }}>
            <AnimatePresence>
              {filteredCards.map((card, idx) => (
                <motion.div key={card._id} layout initial={{ opacity: 0, scale: 0.8, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}>
                  <GridCard card={card} index={idx} onReact={handleReact} floatingEmojis={floatingEmojis}/>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </>
  );
}
