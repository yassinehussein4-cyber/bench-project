import { useEffect, useMemo, useState } from "react";
import { fetchProfile } from "../../lib/cms";

type Profile = {
  id: string;
  slug: string;
  name: string;
  role?: string;
  bio?: string;
  avatarUrl?: string;
};

export default function ProfilePage({ slug = "owner" }: { slug?: string }) {
  const [p, setP] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetchProfile(slug);
        if (!alive) return;
        setP(res);
      } catch (e) {
        if (!alive) return;
        setErr("Failed to load profile.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [slug]);

  useEffect(() => {
    if (p?.name) document.title = `${p.name} · Profile`;
  }, [p?.name]);

  const initials = useMemo(() => {
    if (!p?.name) return "";
    return p.name
      .split(/\s+/)
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [p?.name]);

  if (loading) {
    return (
      <div className="profile">
        <div className="profile__card">
          <div className="skeleton avatar"></div>
          <div className="skeleton line" style={{ width: "60%" }}></div>
          <div className="skeleton line" style={{ width: "40%" }}></div>
          <div
            className="skeleton block"
            style={{ height: 80, marginTop: 12 }}
          ></div>
        </div>
      </div>
    );
  }

  if (err)
    return (
      <div className="profile">
        <div className="profile__error">{err}</div>
      </div>
    );
  if (!p)
    return (
      <div className="profile">
        <div className="profile__error">Profile not found.</div>
      </div>
    );

  return (
    <div className="profile">
      <div className="profile__card">
        {p.avatarUrl ? (
          <img
            src={p.avatarUrl}
            alt={p.name}
            className="profile__avatar"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div
            className="profile__avatar fallback"
            aria-label={`${p.name} avatar`}
          >
            {initials}
          </div>
        )}

        <h1 className="profile__name">{p.name}</h1>
        {p.role && <p className="profile__role">{p.role}</p>}
        {p.bio && <p className="profile__bio">{p.bio}</p>}

        <div className="profile__actions">
          <button className="btn" onClick={() => window.history.back()}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
