import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, useMotionValue, useTransform } from "framer-motion";

// ─── REACT BITS: Hyperspeed (Canvas-based Star Warp) ─────────────────────────
function Hyperspeed({ speed = 1, starColor = "#1D9E75", bgColor = "#080b12" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const numStars = 400;
    let stars = [];

    const initStars = () => {
      stars = [];
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * 2000 - 1000,
          y: Math.random() * 2000 - 1000,
          z: Math.random() * 2000,
          pz: Math.random() * 2000,
        });
      }
    };

    const draw = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        star.z -= 15 * speed;

        if (star.z < 1) {
          star.z = 2000;
          star.x = Math.random() * 2000 - 1000;
          star.y = Math.random() * 2000 - 1000;
          star.pz = 2000;
        }

        const fov = 300;
        const x = cx + (star.x / star.z) * fov;
        const y = cy + (star.y / star.z) * fov;
        const px = cx + (star.x / star.pz) * fov;
        const py = cy + (star.y / star.pz) * fov;

        star.pz = star.z;

        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(x, y);

        const intensity = 1 - star.z / 2000;
        ctx.strokeStyle = `rgba(29, 158, 117, ${intensity})`;
        ctx.lineWidth = intensity * 2;
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    initStars();
    draw();

    return () => cancelAnimationFrame(animationFrameId);
  }, [speed, bgColor, starColor]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}

// ─── PREMIUM LIQUID GLASS CARD ──────────────────────────────────────────────
function LiquidGlassCard({ children }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth parallax tilt based on mouse position
  const rotateX = useTransform(y, [-200, 200], [4, -4]);
  const rotateY = useTransform(x, [-200, 200], [-4, 4]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{ perspective: 1200, width: "100%", maxWidth: "420px" }}
      className="floating-wrapper"
    >
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          width: "100%",
          padding: "48px 40px",
          borderRadius: "30px",
          position: "relative",
          overflow: "hidden",
          backgroundColor: "rgba(12, 18, 28, 0.42)",
          backgroundImage: "linear-gradient(135deg, rgba(0,214,255,0.08) 0%, rgba(255,255,255,0.03) 50%, rgba(124,58,237,0.06) 100%)",
          backdropFilter: "blur(40px) saturate(180%)",
          WebkitBackdropFilter: "blur(40px) saturate(180%)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow: "0 25px 80px rgba(0,0,0,0.45), 0 0 40px rgba(0,214,255,0.08), inset 0 1px 0 rgba(255,255,255,0.15)",
          transition: "border-color 0.4s ease, box-shadow 0.4s ease",
          transformStyle: "preserve-3d"
        }}
        whileHover={{
          borderColor: "rgba(0, 214, 255, 0.3)",
          boxShadow: "0 30px 90px rgba(0,0,0,0.5), 0 0 60px rgba(0,214,255,0.15), inset 0 1px 0 rgba(255,255,255,0.25)",
        }}
      >
        <div className="sheen" />
        <div style={{ position: "relative", zIndex: 2, transform: "translateZ(30px)" }}>
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const { username, email, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5001/api/users/register",
        formData,
      );
      localStorage.setItem("token", res.data.token);
      navigate("/");
    } catch (err) {
      const message = err.response?.data?.message || err.message || "An error occurred during registration.";
      setErrorMsg(message);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
          background: #080b12; 
          color: #e8eaf0; 
          overflow-x: hidden; 
          font-family: 'Inter', sans-serif;
        }

        /* Form Inputs */
        .glass-input {
          width: 100%;
          padding: 16px 20px;
          margin-bottom: 16px;
          border-radius: 16px;
          background: rgba(12, 18, 28, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(255,255,255,0.95);
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          outline: none;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
        }
        .glass-input:focus {
          background: rgba(12, 18, 28, 0.5);
          border-color: rgba(0, 214, 255, 0.4);
          box-shadow: 0 0 20px rgba(0, 214, 255, 0.15), inset 0 1px 0 rgba(255,255,255,0.05);
        }
        .glass-input::placeholder {
          color: rgba(255, 255, 255, 0.35);
        }

        /* Submit Button */
        .submit-btn {
          width: 100%;
          padding: 16px;
          border-radius: 16px;
          border: none;
          background: linear-gradient(135deg, #19C37D, #00D6FF);
          color: #ffffff;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 16px;
          letter-spacing: 0.3px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          margin-top: 12px;
          box-shadow: 0 8px 24px rgba(25, 195, 125, 0.3), inset 0 1px 1px rgba(255,255,255,0.4);
        }
        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(0, 214, 255, 0.4), inset 0 1px 1px rgba(255,255,255,0.5);
        }

        /* Light Sheen */
        .sheen {
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent);
          transform: skewX(-20deg);
          animation: sheen 6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          pointer-events: none;
        }

        @keyframes sheen {
          0% { left: -100%; }
          20% { left: 200%; }
          100% { left: 200%; }
        }

        .floating-wrapper {
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
      `}</style>

      {/* Background - Hyperspeed */}
      <Hyperspeed speed={1.2} />

      {/* Gradual Blur Overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          maskImage: "linear-gradient(to bottom, transparent 10%, black 90%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 10%, black 90%)",
        }}
      />

      {/* Main Content Area */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <LiquidGlassCard>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <img 
              src="/brand-logo-v2.png" 
              alt="ShelfLife Logo" 
              style={{ 
                height: "64px", 
                width: "auto", 
                objectFit: "contain",
                margin: "0 auto 24px",
                filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))"
              }} 
            />
            <h1
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 800,
                fontSize: "32px",
                letterSpacing: "-0.5px",
                color: "#ffffff",
                marginBottom: "8px",
              }}
            >
              Sign Up
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,0.65)",
                fontSize: "15px",
                fontWeight: 400,
              }}
            >
              Create your ShelfLife account
            </p>
          </div>

          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ 
                color: '#ff4d4d', 
                background: 'rgba(255, 77, 77, 0.1)', 
                padding: '12px', 
                borderRadius: '12px', 
                marginBottom: '20px', 
                textAlign: 'center', 
                fontSize: '14px',
                border: '1px solid rgba(255,77,77,0.2)'
              }}
            >
              {errorMsg}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={onSubmit}>
            <div>
              <input
                className="glass-input"
                type="text"
                placeholder="Name"
                name="username"
                value={username}
                onChange={onChange}
                required
              />
            </div>
            <div>
              <input
                className="glass-input"
                type="email"
                placeholder="Email Address"
                name="email"
                value={email}
                onChange={onChange}
                required
              />
            </div>
            <div>
              <input
                className="glass-input"
                type="password"
                placeholder="Password"
                name="password"
                value={password}
                onChange={onChange}
                minLength="6"
                required
              />
            </div>
            <button className="submit-btn" type="submit">Sign Up</button>
          </form>

          {/* Footer */}
          <p
            style={{
              textAlign: "center",
              marginTop: "32px",
              fontSize: "14px",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            Already have an account?{" "}
            <Link
              to="/login"
              style={{
                color: "#00D6FF",
                textDecoration: "none",
                fontWeight: 600,
                transition: "color 0.2s ease"
              }}
              onMouseOver={(e) => { e.target.style.color = "#00FFB2" }}
              onMouseOut={(e) => { e.target.style.color = "#00D6FF" }}
            >
              Sign In
            </Link>
          </p>
        </LiquidGlassCard>
      </div>
    </>
  );
};

export default Register;
