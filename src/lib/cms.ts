import { createClient } from "contentful";

export const cms = createClient({
  space: import.meta.env.VITE_CONTENTFUL_SPACE_ID!,
  accessToken: import.meta.env.VITE_CONTENTFUL_DELIVERY_TOKEN!,
  environment: import.meta.env.VITE_CONTENTFUL_ENV || "master",
});

const IMAGE_FIELD_ID = "image";
const CATEGORY_FIELD_ID = "category";

const toHttps = (u?: string) => (u ? (u.startsWith("http") ? u : `https:${u}`) : "");

function resolveAssetUrl(entry: any, includes?: { Asset?: any[] }): string {
  const field = entry?.fields?.[IMAGE_FIELD_ID];
  if (!field) return "";

  if (field?.fields?.file?.url) return toHttps(field.fields.file.url);

  if (Array.isArray(field)) {
    const first = field[0];
    if (first?.fields?.file?.url) return toHttps(first.fields.file.url);
    const linkId = first?.sys?.id;
    if (linkId && includes?.Asset) {
      const asset = includes.Asset.find((a) => a.sys?.id === linkId);
      return toHttps(asset?.fields?.file?.url);
    }
    return "";
  }

  const linkId = field?.sys?.id;
  if (linkId && includes?.Asset) {
    const asset = includes.Asset.find((a) => a.sys?.id === linkId);
    return toHttps(asset?.fields?.file?.url);
  }

  return "";
}

function resolveCategory(entry: any, includes?: { Entry?: any[] }) {
  const ref = entry?.fields?.[CATEGORY_FIELD_ID];
  if (!ref) return { categoryId: null, categoryTitle: null };

  if (ref?.fields?.title) {
    return { categoryId: ref.sys?.id ?? null, categoryTitle: ref.fields.title ?? null };
  }

  const id = ref?.sys?.id;
  if (!id || !includes?.Entry) return { categoryId: id ?? null, categoryTitle: null };
  const hit = includes.Entry.find((e: any) => e.sys?.id === id);
  return { categoryId: id, categoryTitle: hit?.fields?.title ?? null };
}

export type CmsProduct = {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  description?: string;
  categoryId: string | null;
  categoryTitle: string | null;
};

export type CmsCategory = { id: string; title: string; slug?: string };

/** ---- Fetch all products ---- */
export async function fetchProducts(): Promise<CmsProduct[]> {
  if (!import.meta.env.VITE_CONTENTFUL_SPACE_ID || !import.meta.env.VITE_CONTENTFUL_DELIVERY_TOKEN) {
    console.error(" Missing Contentful env vars. Check .env.local.");
  }

  const res = await cms.getEntries({
    content_type: "product",
    order: ["fields.title"],
    include: 2,
  });

  return res.items.map((it: any) => {
    const { categoryId, categoryTitle } = resolveCategory(it, res.includes);
    return {
      id: it.sys.id,
      title: it.fields.title,
      price: Number(it.fields.price),
      imageUrl: resolveAssetUrl(it, res.includes) || "",
      description: it.fields.description || "",
      categoryId,
      categoryTitle,
    };
  });
}

/** ---- Fetch categories  ---- */
export async function fetchCategoriesFromCMS(): Promise<CmsCategory[]> {
  const res = await cms.getEntries({
    content_type: "category",
    order: ["fields.title"],
  });
  return res.items.map((it: any) => ({
    id: it.sys.id,
    title: it.fields.title,
    slug:
      it.fields.slug ||
      (it.fields.title ? String(it.fields.title).toLowerCase().replace(/\s+/g, "-") : undefined),
  }));
}

/** ---- Paged fetch with server-side filter + full-text search ---- */
export async function fetchProductsPage({
  limit = 12,
  page = 0,
  categoryId,
  query,
  order = ["fields.title"],
}: {
  limit?: number;
  page?: number;
  categoryId?: string; 
  query?: string;      
  order?: string[];   
}): Promise<{ items: CmsProduct[]; total: number; pages: number }> {
  const skip = page * limit;
  const params: Record<string, any> = {
    content_type: "product",
    include: 2,
    limit,
    skip,
    order,
  };
  if (categoryId && categoryId !== "all") {
    params[`fields.${CATEGORY_FIELD_ID}.sys.id`] = categoryId;
  }
  if (query && query.trim()) {
    params["query"] = query.trim();
  }

  const res = await cms.getEntries(params);

  const items: CmsProduct[] = res.items.map((it: any) => {
    const { categoryId, categoryTitle } = resolveCategory(it, res.includes);
    return {
      id: it.sys.id,
      title: it.fields.title,
      price: Number(it.fields.price),
      imageUrl: resolveAssetUrl(it, res.includes) || "",
      description: it.fields.description || "",
      categoryId,
      categoryTitle,
    };
  });

  return {
    items,
    total: res.total,
    pages: Math.ceil(res.total / limit),
  };
}


type Profile = {
  id: string;
  slug: string;
  name: string;
  role?: string;
  bio?: string;
  avatarUrl?: string;
};

const https = (u?: string) => (u ? (u.startsWith("http") ? u : `https:${u}`) : "");

export async function fetchProfile(slug = "owner"): Promise<Profile | null> {
  const res = await cms.getEntries({
    content_type: "profile",
    "fields.slug": slug,
    include: 2,
    limit: 1,
  });
  const it: any = res.items?.[0];
  if (!it) return null;

  let url =
    it.fields.avatar?.fields?.file?.url ??
    res.includes?.Asset?.find((a: any) => a.sys?.id === it.fields.avatar?.sys?.id)?.fields?.file?.url;

  return {
    id: it.sys.id,
    slug: it.fields.slug,
    name: it.fields.name,
    role: it.fields.role,
    bio: it.fields.bio,
    avatarUrl: https(url),
  };
}


export default cms;
