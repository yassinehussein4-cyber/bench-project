import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchProductsPage, fetchCategoriesFromCMS } from "./lib/cms";
import type { CmsProduct, CmsCategory } from "./lib/cms";

type CmsParams = { page: number; limit: number; categoryId?: string; query?: string };

type CmsState = {
    products: CmsProduct[];
    categories: CmsCategory[];
    total: number;
    pages: number;
    loading: boolean;
    error: string | null;
    params: CmsParams;
    setParams: (p: Partial<CmsParams>) => void;
    refresh: () => Promise<void>;
};

const CmsCtx = createContext<CmsState | null>(null);

export function CmsProvider({ children }: { children: React.ReactNode }) {
    const [products, setProducts] = useState<CmsProduct[]>([]);
    const [categories, setCategories] = useState<CmsCategory[]>([]);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [params, setParamsState] = useState<CmsParams>({
        page: 0,
        limit: 12,
        categoryId: "all",
        query: "",
    });
    const setParams = (p: Partial<CmsParams>) => setParamsState((s) => ({ ...s, ...p }));

    const load = async () => {
        try {
            setLoading(true);
            setError(null);

            if (categories.length === 0) {
                const cat = await fetchCategoriesFromCMS();
                setCategories(cat);
            }

            const pageData = await fetchProductsPage(params);
            setProducts(pageData.items);
            setTotal(pageData.total);
            setPages(pageData.pages);
        } catch (e: any) {
            setError(e?.message ?? "Failed to load CMS data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [params.page, params.limit, params.categoryId, params.query]);

    const value = useMemo<CmsState>(
        () => ({
            products,
            categories,
            total,
            pages,
            loading,
            error,
            params,
            setParams,
            refresh: load,
        }),
        [products, categories, total, pages, loading, error, params]
    );

    return <CmsCtx.Provider value={value}>{children}</CmsCtx.Provider>;
}

export function useCms() {
    const ctx = useContext(CmsCtx);
    if (!ctx) throw new Error("useCms must be used inside <CmsProvider>");
    return ctx;
}
