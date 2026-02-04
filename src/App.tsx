import "./App.css";
import { Routes, Route, useNavigate } from "react-router-dom";

import Header from "./components/Header";
import ProfilePage from "./components/ProfilePage";
import HomePage from "./components/pages/HomePage";

export default function App() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onOpenCart={() => {
          const next = new URLSearchParams(window.location.search);
          next.set("cart", "1");
          navigate({ pathname: "/", search: next.toString() });
        }}
        onOpenProfile={() => navigate("/profile")}
      />

      <main className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage slug="owner" />} />
        </Routes>
      </main>
    </div>
  );
}
