import "./App.css";
import { Routes, Route, useNavigate } from "react-router-dom";

import Header from "./components/Header";
import ProfilePage from "./components/Pages/ProfilePage";
import HomePage from "./components/Pages/HomePage";

export default function App() {
  const navigate = useNavigate();

  function handleOpenCart() {
    const next = new URLSearchParams(window.location.search);
    next.set("cart", "1");
    navigate({ pathname: "/", search: next.toString() });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onOpenCart={handleOpenCart}
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
