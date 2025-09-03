// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./dashboard"; // make sure this file exists as src/dashboard.jsx

// Simple Welcome component with a button to go to /login
const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Welcome to FitSync</h1>
      <button
        onClick={() => navigate("/login")}
        style={{ marginTop: "20px", padding: "10px 20px", background: "blue", color: "white", fontSize: "16px" }}
      >
        Login
      </button>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Redirect any unknown route to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
