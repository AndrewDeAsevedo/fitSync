// frontend/src/dashboard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  // Simple logout handler
  const handleLogout = () => {
    // Clear any stored session info (optional, depending on your auth flow)
    localStorage.removeItem("sessionToken");
    navigate("/login"); // redirect back to login
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Dashboard</h1>
      <p>Welcome! You are now logged in to FitSync.</p>
      <button
        onClick={handleLogout}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          background: "red",
          color: "white",
          fontSize: "16px"
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
