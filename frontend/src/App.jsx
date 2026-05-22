import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./Landing";
import Register from "./Register";
import Login from "./Login";
import Verify from "./Verify";
import Dashboard from "./Dashboard";
import MacrosPage from "./MacrosPage";
import "./App.css";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify/:token" element={<Verify />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/macros"
          element={
            <PrivateRoute>
              <MacrosPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
