import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Filters from "../components/Filters";
import ProductGrid from "../components/ProductGrid";
import ProductPanel from "../components/ProductPanel";
import CartView from "../components/CartView";
import CheckoutDrawer from "../components/CheckoutDrawer";
import OrderPlacedModal from "../components/OrderPlacedModal";
import { fetchProducts, fetchCategoriesFromCMS } from "../lib/cms";
import { useDebouncedValue } from "../lib/useDebouncedValue";

export default function HomePage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const categoryParam = searchParams.get("category") || "all";
    const searchQuery = searchParams.get("search") || "";
    const sortOption = searchParams.get("sort") || "default";
    const selectedProductId = searchParams.get("product");
    const isCartOpen = searchParams.get("cart") === "1";
    const isCheckoutOpen = searchParams.get("checkout") === "1";
    const isOrderPlacedOpen = searchParams.get("placed") === "1";

    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<{ id: string; title: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorText, setErrorText] = useState<string | null>(null);

    const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);

    useEffect(() => {
        (async () => {
            try {
                setIsLoading(true);
                const [p, c] = await Promise.all([fetchProducts(), fetchCategoriesFromCMS()]);
                setProducts(p);
                setCategories([{ id: "all", title: "All" }, ...c]);
            } catch (e) {
                console.error(e);
                setErrorText("Failed to load CMS content.");
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    const visibleProducts = useMemo(() => {
        let list = categoryParam === "all" ? products : products.filter(p => p.categoryId === categoryParam);
        const needle = debouncedSearchQuery.trim().toLowerCase();
        if (needle) {
            list = list.filter(
                p => p.title.toLowerCase().includes(needle) || p.description?.toLowerCase().includes(needle)
            );
        }
        switch (sortOption) {
            case "price-asc": return [...list].sort((a, b) => a.price - b.price);
            case "price-desc": return [...list].sort((a, b) => b.price - a.price);
            case "name-asc": return [...list].sort((a, b) => a.title.localeCompare(b.title));
            case "name-desc": return [...list].sort((a, b) => b.title.localeCompare(a.title));
            default: return list;
        }
    }, [products, categoryParam, debouncedSearchQuery, sortOption]);

    const updateParams = (changes: Record<string, string | null | undefined>) => {
        const next = new URLSearchParams(searchParams);
        for (const [key, value] of Object.entries(changes)) {
            if (!value || value === "default") next.delete(key);
            else next.set(key, value);
        }
        setSearchParams(next, { replace: true });
    };

    const setParam = (k: string, v?: string) => updateParams({ [k]: v });

    const selectedProduct =
        selectedProductId && products.find(p => String(p.id) === String(selectedProductId));

    return (
        <>
            {errorText && <div className="text-red-600 font-semibold">{errorText}</div>}

            <section className="toolbar">
                <div className="toolbar__side" />
                <div className="toolbar__search">
                    <input
                        type="text"
                        placeholder="Search products…"
                        value={searchQuery}
                        onChange={(e) => setParam("search", e.target.value)}
                        className="toolbar__searchInput"
                        aria-label="Search products"
                    />
                </div>
                <div className="toolbar__side toolbar__sort">
                    <select
                        value={sortOption}
                        onChange={(e) => setParam("sort", e.target.value)}
                        className="select"
                        aria-label="Sort products"
                    >
                        <option value="default">Sort: Featured</option>
                        <option value="price-asc">Price · Low → High</option>
                        <option value="price-desc">Price · High · Low</option>
                        <option value="name-asc">Name · A → Z</option>
                        <option value="name-desc">Name · Z → A</option>
                    </select>
                </div>
            </section>

            <div className="filter-row">
                <Filters
                    categories={categories}
                    category={categoryParam}
                    onSelect={(id) => setParam("category", id)}
                />
            </div>

            {isLoading ? (
                <div>Loading…</div>
            ) : (
                <ProductGrid
                    products={visibleProducts}
                    onSelectProduct={(p) => setParam("product", String(p.id))}
                />
            )}

            {selectedProduct && (
                <ProductPanel product={selectedProduct} onClose={() => setParam("product")} />
            )}

            {isCartOpen && (
                <CartView
                    onClose={() => setParam("cart")}
                    onCheckout={() =>
                        updateParams({ cart: null, checkout: "1" }) 
                    }
                />
            )}

            {isCheckoutOpen && (
                <CheckoutDrawer
                    onClose={() => setParam("checkout")}
                    onPlaced={() =>
                        updateParams({ checkout: null, placed: "1" })
                    }
                />
            )}

            {isOrderPlacedOpen && (
                <OrderPlacedModal
                    onClose={() => {
                        updateParams({ placed: null });
                        navigate("/", { replace: true });
                    }}
                />
            )}
        </>
    );
}
