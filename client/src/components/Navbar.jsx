import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem 2rem",
        backgroundColor: "rgba(10, 25, 47, 0.85)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <Link
        to="/"
        style={{
          textDecoration: "none",
          color: "#e8eaf0",
          fontFamily: "'Syne', sans-serif",
          fontWeight: 800,
          fontSize: "24px",
        }}
      >
        ShelfLife
      </Link>
      <button
        onClick={handleLogout}
        style={{
          padding: "8px 16px",
          borderRadius: "8px",
          border: "none",
          background: "linear-gradient(135deg, #1D9E75, #0f6e56)",
          color: "#d0f5e8",
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 600,
          fontSize: "14px",
          cursor: "pointer",
          transition: "all 0.3s ease",
        }}
      >
        Logout
      </button>
    </nav>
  );
};

export default Navbar;
