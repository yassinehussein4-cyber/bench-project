import "./App.css";
import { useEffect, useMemo, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Header from "./components/Header";
import Filters from "./components/Filters";
import ProductGrid from "./components/ProductGrid";
import ProductPanel from "./components/ProductPanel";
import CartView from "./components/CartView";
import CheckoutDrawer from "./components/CheckoutDrawer";
import OrderPlacedModal from "./components/OrderPlacedModal";
import ProfilePage from "./components/ProfilePage";

import { fetchProducts, fetchCategoriesFromCMS } from "./lib/cms";
import { useDebouncedValue } from "./lib/useDebouncedValue";

export default function App() {
  const location = useLocation();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<{ id: string; title: string }[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState("all");
  const [openProduct, setOpenProduct] = useState<any>(null);

  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [sortBy, setSortBy] = useState<string>("default");

  const isProfilePage = location.pathname === "/profile";

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [p, c] = await Promise.all([fetchProducts(), fetchCategoriesFromCMS()]);
        setProducts(p);
        setCategories([{ id: "all", title: "All" }, ...c]);
      } catch (e) {
        console.error(e);
        setErr("Failed to load CMS content.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const visibleProducts = useMemo(() => {
    let list =
      activeCategoryId === "all"
        ? products
        : products.filter((p) => p.categoryId === activeCategoryId);

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case "price-asc":
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        list = [...list].sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "name-desc":
        list = [...list].sort((a, b) => b.title.localeCompare(a.title));
        break;
    }

    return list;
  }, [products, activeCategoryId, sortBy, debouncedSearch]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onOpenCart={() => setShowCart(true)} onOpenProfile={() => (window.location.href = "/profile")} />

      <main className="container">
        <Routes>
          <Route
            path="/"
            element={
              <>
                {err && <div className="text-red-600 font-semibold">{err}</div>}

{/* NEW */}
<section className="toolbar">
  <div className="toolbar__side"></div>

  <div className="toolbar__search">
    <input
      type="text"
      placeholder="Search products…"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="toolbar__searchInput"
    />
  </div>

  <div className="toolbar__side toolbar__sort">
    <select
      value={sortBy}
      onChange={(e) => setSortBy(e.target.value)}
      className="select"
      aria-label="Sort products"
    >
      <option value="default">Sort: Featured</option>
      <option value="price-asc">Price · Low → High</option>
      <option value="price-desc">Price · High → Low</option>
      <option value="name-asc">Name · A → Z</option>
      <option value="name-desc">Name · Z → A</option>
    </select>
  </div>
</section>

<div className="filter-row">
  <Filters
    categories={categories}
    category={activeCategoryId}
    onSelect={setActiveCategoryId}
  />
</div>


                {loading ? (
                  <div>Loading…</div>
                ) : (
                  <ProductGrid
                    products={visibleProducts}
                    onSelectProduct={setOpenProduct}
                  />
                )}
              </>
            }
          />

          <Route path="/profile" element={<ProfilePage slug="owner" />} />
        </Routes>
      </main>

      {!isProfilePage && (
        <>
          <ProductPanel product={openProduct} onClose={() => setOpenProduct(null)} />

          {showCart && (
            <CartView
              onClose={() => setShowCart(false)}
              onCheckout={() => {
                setShowCart(false);
                setShowCheckout(true);
              }}
            />
          )}

          {showCheckout && (
            <CheckoutDrawer
              onClose={() => setShowCheckout(false)}
              onPlaced={() => { setShowOrderModal(true); setShowCheckout(false); }}
              />
          )}

          {showOrderModal && <OrderPlacedModal onClose={() => setShowOrderModal(false)} />}
        </>
      )}
    </div>
  );
}
