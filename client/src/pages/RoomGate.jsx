import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// ─── ANIMATED BACKGROUND GRID ─────────────────────────────────────────────────
function GridBg() {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 0,
      backgroundImage: `
        linear-gradient(rgba(192,132,252,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(192,132,252,0.04) 1px, transparent 1px)
      `,
      backgroundSize: "48px 48px",
      maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)",
    }}/>
  );
}

// ─── ROOM ID DISPLAY ──────────────────────────────────────────────────────────
function RoomIdDisplay({ roomId }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        background: "rgba(192,132,252,0.08)",
        border: "1px solid rgba(192,132,252,0.3)",
        borderRadius: 20, padding: "32px",
        textAlign: "center",
      }}
    >
      <p style={{
        fontFamily: "'DM Sans',sans-serif", fontSize: 13,
        color: "rgba(255,255,255,0.5)", margin: "0 0 12px",
        letterSpacing: "0.1em", textTransform: "uppercase",
      }}>Your Room ID</p>

      <div style={{
        fontFamily: "'Syne',sans-serif", fontSize: 48, fontWeight: 900,
        letterSpacing: "0.2em", color: "#c084fc",
        textShadow: "0 0 40px rgba(192,132,252,0.5)",
        marginBottom: 20,
      }}>{roomId}</div>

      <p style={{
        fontFamily: "'DM Sans',sans-serif", fontSize: 13,
        color: "rgba(255,255,255,0.4)", margin: "0 0 20px",
      }}>Share this ID + your password with your team</p>

      <button onClick={copy} style={{
        background: copied ? "rgba(29,158,117,0.15)" : "rgba(192,132,252,0.12)",
        border: `1px solid ${copied ? "rgba(29,158,117,0.4)" : "rgba(192,132,252,0.3)"}`,
        color: copied ? "#1D9E75" : "#c084fc",
        padding: "10px 28px", borderRadius: 999,
        fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14,
        cursor: "pointer", transition: "all 0.3s",
      }}>
        {copied ? "✓ Copied!" : "Copy Room ID"}
      </button>
    </motion.div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function RoomGate() {
  const navigate  = useNavigate();
  const [tab, setTab]           = useState("join");    // "join" | "create"
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [createdRoom, setCreatedRoom] = useState(null); // { roomId, name }

  // Create form
  const [createName, setCreateName]   = useState("");
  const [createPass, setCreatePass]   = useState("");

  // Join form
  const [joinId, setJoinId]     = useState("");
  const [joinPass, setJoinPass] = useState("");

  const token = localStorage.getItem("token");

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const { data } = await axios.post(
        "/api/rooms/create",
        { name: createName, password: createPass },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCreatedRoom(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const { data } = await axios.post(
        "/api/rooms/join",
        { roomId: joinId, password: joinPass },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Store room info in sessionStorage so Dashboard can read it
      sessionStorage.setItem("shelfRoomId",   data.roomId);
      sessionStorage.setItem("shelfRoomName", data.name);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to join room");
    } finally {
      setLoading(false);
    }
  };

  const enterCreatedRoom = () => {
    sessionStorage.setItem("shelfRoomId",   createdRoom.roomId);
    sessionStorage.setItem("shelfRoomName", createdRoom.name);
    navigate("/");
  };

  // ── Input style helper ─────────────────────────────────────────────────────
  const inputStyle = {
    width: "100%", padding: "14px 18px", borderRadius: 14,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#f0f2f5", fontFamily: "'DM Sans',sans-serif",
    fontSize: 15, outline: "none", boxSizing: "border-box",
    transition: "border-color 0.25s, background 0.25s",
  };

  const btnStyle = {
    width: "100%", padding: "15px",
    background: "linear-gradient(135deg, #8b5cf6, #d946ef)",
    border: "none", borderRadius: 14,
    color: "#fff", fontFamily: "'Syne',sans-serif",
    fontWeight: 800, fontSize: 16, cursor: "pointer",
    transition: "opacity 0.2s, transform 0.2s",
    marginTop: 4,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        body { margin:0; background:#050810; color:#e8eaf0; font-family:'DM Sans',sans-serif; min-height:100vh; overflow-x:hidden; }
        * { box-sizing:border-box; }
        input:focus { background:rgba(255,255,255,0.07) !important; border-color:rgba(192,132,252,0.5) !important; box-shadow: 0 0 0 3px rgba(192,132,252,0.1); }
        input::placeholder { color:rgba(255,255,255,0.2); }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
      `}</style>

      <GridBg/>

      {/* Ambient orbs */}
      <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none" }}>
        <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(139,92,246,0.12),transparent 70%)", top:-100, left:-100 }}/>
        <div style={{ position:"absolute", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(217,70,239,0.1),transparent 70%)", bottom:-80, right:-80 }}/>
      </div>

      <div style={{
        position:"relative", zIndex:1,
        minHeight:"100vh", display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        padding:"40px 20px",
      }}>
        {/* Logo */}
        <motion.div
          initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.6 }}
          style={{ display:"flex", alignItems:"center", gap:12, marginBottom:48 }}
        >
          <div style={{
            width:44, height:44, borderRadius:14,
            background:"linear-gradient(135deg,#c084fc,#d946ef)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:22, fontWeight:900, color:"#fff",
            fontFamily:"'Syne',sans-serif",
            boxShadow:"0 0 30px rgba(192,132,252,0.4)",
            animation:"float 3s ease-in-out infinite",
          }}>S</div>
          <span style={{
            fontFamily:"'Syne',sans-serif", fontWeight:900, fontSize:26,
            background:"linear-gradient(135deg,#c084fc,#f0f2f5)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
          }}>ShelfLife</span>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.5, delay:0.1 }}
          style={{
            width:"100%", maxWidth:460,
            background:"rgba(10,12,24,0.85)",
            border:"1px solid rgba(255,255,255,0.08)",
            borderRadius:24, padding:"36px",
            backdropFilter:"blur(24px)",
            boxShadow:"0 24px 80px rgba(0,0,0,0.6)",
          }}
        >
          {/* If a room was just created, show the success state */}
          {createdRoom ? (
            <>
              <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:900, fontSize:24, margin:"0 0 8px", color:"#fff" }}>
                Room Created! 🎉
              </h2>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:"rgba(255,255,255,0.4)", margin:"0 0 28px" }}>
                Share the Room ID and your password with your teammates.
              </p>
              <RoomIdDisplay roomId={createdRoom.roomId}/>
              <button onClick={enterCreatedRoom} style={{ ...btnStyle, marginTop:20 }}>
                Enter the Shelf →
              </button>
            </>
          ) : (
            <>
              <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:900, fontSize:24, margin:"0 0 6px", color:"#fff" }}>
                Enter your Shelf
              </h2>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:"rgba(255,255,255,0.4)", margin:"0 0 28px" }}>
                Create a new shared space or join one with a Room ID.
              </p>

              {/* Tabs */}
              <div style={{ display:"flex", background:"rgba(255,255,255,0.04)", borderRadius:12, padding:4, marginBottom:28 }}>
                {["join","create"].map((t) => (
                  <button key={t} onClick={() => { setTab(t); setError(""); }} style={{
                    flex:1, padding:"10px", borderRadius:9, border:"none",
                    background: tab===t ? "rgba(139,92,246,0.2)" : "transparent",
                    color: tab===t ? "#c084fc" : "rgba(255,255,255,0.4)",
                    fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14,
                    cursor:"pointer", transition:"all 0.25s",
                    boxShadow: tab===t ? "0 0 0 1px rgba(139,92,246,0.3)" : "none",
                  }}>
                    {t === "join" ? "🚪 Join Room" : "✨ Create Room"}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {/* ── JOIN FORM ── */}
                {tab === "join" && (
                  <motion.form key="join"
                    initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}
                    exit={{ opacity:0, x:10 }} transition={{ duration:0.2 }}
                    onSubmit={handleJoin}
                    style={{ display:"flex", flexDirection:"column", gap:14 }}
                  >
                    <div>
                      <label style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"rgba(255,255,255,0.4)", letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:6 }}>
                        Room ID
                      </label>
                      <input
                        style={{ ...inputStyle, fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, letterSpacing:"0.15em", textTransform:"uppercase", textAlign:"center" }}
                        placeholder="A3F9B2"
                        value={joinId}
                        onChange={(e) => setJoinId(e.target.value.toUpperCase())}
                        maxLength={6}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"rgba(255,255,255,0.4)", letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:6 }}>
                        Password
                      </label>
                      <input
                        style={inputStyle}
                        type="password"
                        placeholder="Enter room password"
                        value={joinPass}
                        onChange={(e) => setJoinPass(e.target.value)}
                        required
                      />
                    </div>
                    {error && (
                      <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"#e24b4a", margin:0, padding:"10px 14px", background:"rgba(226,75,74,0.08)", borderRadius:10, border:"1px solid rgba(226,75,74,0.2)" }}>
                        ⚠ {error}
                      </p>
                    )}
                    <button type="submit" style={btnStyle} disabled={loading}
                      onMouseEnter={e => e.currentTarget.style.opacity="0.9"}
                      onMouseLeave={e => e.currentTarget.style.opacity="1"}
                    >
                      {loading ? "Joining..." : "Join Room →"}
                    </button>
                  </motion.form>
                )}

                {/* ── CREATE FORM ── */}
                {tab === "create" && (
                  <motion.form key="create"
                    initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }}
                    exit={{ opacity:0, x:-10 }} transition={{ duration:0.2 }}
                    onSubmit={handleCreate}
                    style={{ display:"flex", flexDirection:"column", gap:14 }}
                  >
                    <div>
                      <label style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"rgba(255,255,255,0.4)", letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:6 }}>
                        Shelf Name (optional)
                      </label>
                      <input
                        style={inputStyle}
                        placeholder="e.g. Rayan & Siddh's Archive"
                        value={createName}
                        onChange={(e) => setCreateName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"rgba(255,255,255,0.4)", letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:6 }}>
                        Room Password
                      </label>
                      <input
                        style={inputStyle}
                        type="password"
                        placeholder="Choose a password for your team"
                        value={createPass}
                        onChange={(e) => setCreatePass(e.target.value)}
                        required
                      />
                    </div>
                    {error && (
                      <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"#e24b4a", margin:0, padding:"10px 14px", background:"rgba(226,75,74,0.08)", borderRadius:10, border:"1px solid rgba(226,75,74,0.2)" }}>
                        ⚠ {error}
                      </p>
                    )}
                    <button type="submit" style={btnStyle} disabled={loading}
                      onMouseEnter={e => e.currentTarget.style.opacity="0.9"}
                      onMouseLeave={e => e.currentTarget.style.opacity="1"}
                    >
                      {loading ? "Creating..." : "Create Room →"}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Skip option */}
              <p style={{ textAlign:"center", marginTop:24, marginBottom:0 }}>
                <button onClick={() => {
                    // Decode the JWT to get userId, use it as a stable personal room key
                    const token = localStorage.getItem("token");
                    const payload = JSON.parse(atob(token.split(".")[1]));
                    const personalRoomId = "PERSONAL_" + payload.user.id;
                    sessionStorage.setItem("shelfRoomId", personalRoomId);
                    sessionStorage.setItem("shelfRoomName", "My Personal Shelf");
                    navigate("/");
                  }} style={{
                  background:"none", border:"none",
                  color:"rgba(255,255,255,0.25)", fontFamily:"'DM Sans',sans-serif",
                  fontSize:13, cursor:"pointer",
                  textDecoration:"underline", textDecorationColor:"rgba(255,255,255,0.1)",
                }}>
                  Skip — use personal shelf
                </button>
              </p>
            </>
          )}
        </motion.div>
      </div>
    </>
  );
}
