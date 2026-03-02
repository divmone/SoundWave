import { useState } from "react";
import { MOCK_PRODUCTS, MOCK_STATS } from "./api";

// ─────────────────────────────────────────────
//  GLOBAL CSS
// ─────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Outfit:wght@400;500;600;700;800;900&display=swap');

  :root {
    --red:      #e61e2b;
    --red-dark: #b01620;
    --red-glow: rgba(230,30,43,0.22);
    --bg:       #0c0c0e;
    --bg2:      #141417;
    --bg3:      #1c1c22;
    --border:   #27272f;
    --border2:  #33333d;
    --text:     #eeeef5;
    --text2:    #9090a8;
    --text3:    #50505f;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Outfit', sans-serif;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }

  ::selection { background: var(--red); color: #fff; }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--red); }

  /* ══ shimmer keyframe ══ */
  @keyframes shimmer {
    0%   { background-position: 200% center; }
    100% { background-position: -200% center; }
  }

  /* ══ shimmer BUTTON ══ */
  .btn-shine {
    background: linear-gradient(
      90deg,
      var(--red-dark) 0%,
      #ff3344 25%,
      #ff6070 50%,
      #ff3344 75%,
      var(--red-dark) 100%
    );
    background-size: 300% 100%;
    animation: shimmer 2.8s linear infinite;
    border: none;
    color: #fff;
    cursor: pointer;
    font-family: 'Outfit', sans-serif;
    font-weight: 800;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    transition: transform 0.15s, box-shadow 0.2s;
  }

  .btn-shine:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 28px var(--red-glow), 0 2px 8px rgba(0,0,0,0.5);
  }

  .btn-shine:active { transform: translateY(0); }

  /* ══ ghost shimmer BUTTON ══ */
  .btn-ghost {
    position: relative;
    overflow: hidden;
    background: transparent;
    border: 1.5px solid var(--border2);
    color: var(--text2);
    cursor: pointer;
    font-family: 'Outfit', sans-serif;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    transition: border-color 0.2s, color 0.2s, box-shadow 0.25s;
  }

  .btn-ghost::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      105deg,
      transparent 30%,
      rgba(230,30,43,0.18) 50%,
      transparent 70%
    );
    transform: translateX(-120%);
    transition: none;
  }

  .btn-ghost:hover {
    border-color: var(--red);
    color: #fff;
    box-shadow: 0 0 18px var(--red-glow);
  }

  .btn-ghost:hover::after {
    transform: translateX(120%);
    transition: transform 0.55s ease;
  }

  /* ══ waveform animate ══ */
  @keyframes waveBar {
    0%, 100% { transform: scaleY(1); }
    50%       { transform: scaleY(1.75); }
  }

  /* ══ cards appear ══ */
  @keyframes cardIn {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ══ modal ══ */
  @keyframes overlayIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes modalIn {
    from { opacity: 0; transform: scale(0.93) translateY(14px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }

  /* ══ logo dot pulse ══ */
  @keyframes dotPulse {
    0%, 100% { box-shadow: 0 0 6px var(--red); }
    50%       { box-shadow: 0 0 16px var(--red), 0 0 28px var(--red-glow); }
  }

  /* ══ red top stripe shimmer ══ */
  @keyframes stripeShimmer {
    0%   { background-position: 200% center; }
    100% { background-position: -200% center; }
  }
`;

// ─────────────────────────────────────────────
//  UPLOAD MODAL
// ─────────────────────────────────────────────
function UploadModal({ onClose }) {
  const [form, setForm] = useState({ title: "", creator: "", price: "", category: "alerts", tags: "" });
  const [file, setFile]         = useState(null);
  const [dragging, setDragging] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = () => {
    if (!form.title.trim() || !form.creator.trim() || !form.price) return;
    /* ── Backend hook ──────────────────────────────────────────
       const fd = new FormData();
       fd.append("audio", file);
       fd.append("data", JSON.stringify({
         ...form,
         tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
       }));
       await api.createProduct(fd);
    ─────────────────────────────────────────────────────────── */
    setSubmitted(true);
  };

  const inp = {
    width: "100%",
    padding: "0.7rem 0.95rem",
    background: "var(--bg)",
    border: "1.5px solid var(--border2)",
    borderRadius: 6,
    color: "var(--text)",
    fontSize: "0.9rem",
    fontFamily: "'Outfit', sans-serif",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  const lbl = {
    display: "block",
    fontSize: "0.68rem", fontWeight: 700,
    letterSpacing: 2, color: "var(--text3)",
    marginBottom: 6, textTransform: "uppercase",
  };

  const focus = (e) => {
    e.target.style.borderColor = "var(--red)";
    e.target.style.boxShadow   = "0 0 0 3px var(--red-glow)";
  };
  const blur = (e) => {
    e.target.style.borderColor = "var(--border2)";
    e.target.style.boxShadow   = "none";
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 999,
      background: "rgba(6,6,9,0.88)", backdropFilter: "blur(12px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "1rem",
      animation: "overlayIn 0.22s ease both",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "var(--bg2)",
        border: "1px solid var(--border2)",
        borderRadius: 12,
        width: "100%", maxWidth: 510,
        maxHeight: "92vh", overflowY: "auto",
        animation: "modalIn 0.3s cubic-bezier(.22,.68,0,1.2) both",
      }}>

        {/* Modal header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "1.4rem 1.8rem",
          borderBottom: "1px solid var(--border)",
        }}>
          <div>
            <div style={{ fontSize: "0.66rem", letterSpacing: 3, color: "var(--red)", fontWeight: 700, marginBottom: 4 }}>
              NEW UPLOAD
            </div>
            <div style={{ fontSize: "1.2rem", fontWeight: 800, letterSpacing: -0.4 }}>
              Share your sound
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "var(--bg3)", border: "1px solid var(--border)", cursor: "pointer",
            width: 34, height: 34, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--text2)", fontSize: "0.9rem",
            transition: "color 0.2s, border-color 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "var(--red)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--text2)"; e.currentTarget.style.borderColor = "var(--border)"; }}
          >✕</button>
        </div>

        {submitted ? (
          <div style={{ padding: "3.5rem 2rem", textAlign: "center" }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "rgba(230,30,43,0.12)",
              border: "1px solid rgba(230,30,43,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.8rem", margin: "0 auto 1.2rem",
            }}>🎵</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: 8 }}>
              Track uploaded!
            </div>
            <div style={{ color: "var(--text2)", fontSize: "0.9rem", marginBottom: "2rem", lineHeight: 1.7 }}>
              Your sound is queued for review.<br />
              We'll notify you within 24h.
            </div>
            <button className="btn-shine" onClick={onClose}
              style={{ padding: "0.75rem 2.2rem", borderRadius: 7, fontSize: "0.8rem" }}>
              Done
            </button>
          </div>
        ) : (
          <div style={{ padding: "1.6rem 1.8rem" }}>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}
              onClick={() => document.getElementById("_fileInput").click()}
              style={{
                border: `2px dashed ${dragging ? "var(--red)" : file ? "var(--red-dark)" : "var(--border2)"}`,
                borderRadius: 8, padding: "1.8rem 1.5rem",
                textAlign: "center", marginBottom: "1.4rem",
                background: dragging ? "rgba(230,30,43,0.05)" : "var(--bg3)",
                cursor: "pointer",
                transition: "border-color 0.2s, background 0.2s",
              }}
            >
              <input id="_fileInput" type="file" accept="audio/*" style={{ display: "none" }}
                onChange={(e) => setFile(e.target.files[0])} />
              <div style={{ fontSize: "1.6rem", marginBottom: 8 }}>{file ? "🎧" : "📁"}</div>
              <div style={{ fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
                {file ? file.name : "Drop audio file here or click to browse"}
              </div>
              <div style={{ fontSize: "0.76rem", color: "var(--text3)" }}>
                {file ? `${(file.size/1024/1024).toFixed(2)} MB` : "MP3 · WAV · OGG — max 50 MB"}
              </div>
            </div>

            {/* Fields row 1 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label style={lbl}>Title *</label>
                <input style={inp} placeholder="Epic Drop Alert" value={form.title}
                  onChange={set("title")} onFocus={focus} onBlur={blur} />
              </div>
              <div>
                <label style={lbl}>Creator handle *</label>
                <input style={inp} placeholder="@YourName" value={form.creator}
                  onChange={set("creator")} onFocus={focus} onBlur={blur} />
              </div>
            </div>

            {/* Fields row 2 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label style={lbl}>Price (USD) *</label>
                <input style={inp} placeholder="9.99" type="number" min="0" value={form.price}
                  onChange={set("price")} onFocus={focus} onBlur={blur} />
              </div>
              <div>
                <label style={lbl}>Category</label>
                <select style={{ ...inp, cursor: "pointer" }} value={form.category}
                  onChange={set("category")} onFocus={focus} onBlur={blur}>
                  {["alerts","transitions","jingles","ui","stingers"].map(c => (
                    <option key={c} value={c} style={{ background: "var(--bg2)" }}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tags */}
            <div style={{ marginBottom: "1.6rem" }}>
              <label style={lbl}>Tags (comma separated)</label>
              <input style={inp} placeholder="Alert, Epic, Cinematic" value={form.tags}
                onChange={set("tags")} onFocus={focus} onBlur={blur} />
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button className="btn-ghost" onClick={onClose}
                style={{ flex: 1, padding: "0.82rem", borderRadius: 7, fontSize: "0.78rem" }}>
                Cancel
              </button>
              <button className="btn-shine" onClick={handleSubmit}
                style={{ flex: 2, padding: "0.82rem", borderRadius: 7, fontSize: "0.8rem" }}>
                Upload Sound →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  WAVEFORM
// ─────────────────────────────────────────────
function Waveform({ bars, playing }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, height: 56 }}>
      {bars.map((h, i) => (
        <div key={i} style={{
          flex: 1, minWidth: 3, borderRadius: 3,
          background: playing
            ? `hsl(${355 + (i % 8)}, 88%, ${52 + (i % 4) * 3}%)`
            : i % 4 === 0 ? "var(--text)"
            : i % 2 === 0 ? "#38383f"
            : "#25252b",
          height: `${h}%`,
          transformOrigin: "50% 100%",
          transition: "background 0.3s",
          animation: playing
            ? `waveBar ${0.44 + (i % 6) * 0.08}s ease-in-out ${i * 0.03}s infinite`
            : "none",
        }} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
//  TAG
// ─────────────────────────────────────────────
function Tag({ label }) {
  return (
    <span style={{
      padding: "3px 9px",
      background: "var(--bg)",
      border: "1px solid var(--border2)",
      borderRadius: 4,
      fontSize: "0.66rem", fontWeight: 700,
      letterSpacing: 1.2, color: "var(--text2)",
      textTransform: "uppercase",
      fontFamily: "'Space Mono', monospace",
    }}>{label}</span>
  );
}

// ─────────────────────────────────────────────
//  PRODUCT CARD
// ─────────────────────────────────────────────
function ProductCard({ product, delay }) {
  const [hovered, setHovered]   = useState(false);
  const [playing, setPlaying]   = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "var(--bg3)" : "var(--bg2)",
        border: `1px solid ${hovered ? "#44444f" : "var(--border)"}`,
        borderRadius: 10,
        padding: "1.25rem",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        transition: "background 0.2s, border-color 0.25s, box-shadow 0.3s, transform 0.28s",
        transform: hovered ? "translateY(-5px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 16px 48px rgba(0,0,0,0.55), 0 0 0 1px var(--red-dark), inset 0 1px 0 rgba(255,255,255,0.04)"
          : "0 2px 8px rgba(0,0,0,0.28)",
        animation: `cardIn 0.44s ease ${delay}s both`,
      }}
    >
      {/* Top shimmer stripe */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: hovered
          ? "linear-gradient(90deg, var(--red-dark), #ff6070, var(--red), #ff6070, var(--red-dark))"
          : "var(--border)",
        backgroundSize: "300% 100%",
        animation: hovered ? "stripeShimmer 2s linear infinite" : "none",
        transition: "background 0.3s",
      }} />

      {/* Waveform block */}
      <div style={{
        background: "var(--bg)",
        border: "1px solid var(--border)",
        borderRadius: 7,
        padding: "9px 11px 10px",
        marginBottom: "1rem",
      }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5,
        }}>
          <span style={{
            fontSize: "0.6rem", letterSpacing: 2, fontWeight: 700,
            color: playing ? "var(--red)" : "var(--text3)",
            fontFamily: "'Space Mono', monospace",
            transition: "color 0.2s",
          }}>
            {playing ? "● PLAYING" : "PREVIEW"}
          </span>
          <span style={{ fontSize: "0.6rem", color: "var(--text3)", fontFamily: "'Space Mono', monospace" }}>
            0:08
          </span>
        </div>
        <Waveform bars={product.bars} playing={playing} />
      </div>

      {/* Info */}
      <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text)", letterSpacing: -0.3, marginBottom: 3 }}>
        {product.title}
      </div>
      <div style={{
        fontSize: "0.74rem", color: "var(--text3)", marginBottom: "0.8rem",
        fontFamily: "'Space Mono', monospace",
      }}>
        {product.creator}
      </div>

      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: "1.1rem" }}>
        {product.tags.map((t) => <Tag key={t} label={t} />)}
      </div>

      {/* Price + actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
          <span style={{ fontSize: "0.8rem", color: "var(--red)", fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>$</span>
          <span style={{ fontSize: "1.65rem", fontWeight: 900, letterSpacing: -1.5, fontFamily: "'Space Mono', monospace" }}>
            {product.price}
          </span>
        </div>

        <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
          {/* Play */}
          <button
            onClick={(e) => { e.stopPropagation(); setPlaying(p => !p); }}
            style={{
              width: 36, height: 36, borderRadius: "50%",
              background: playing ? "var(--red)" : "var(--bg3)",
              border: `1.5px solid ${playing ? "var(--red)" : "var(--border2)"}`,
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s",
              boxShadow: playing ? "0 0 14px var(--red-glow)" : "none",
              flexShrink: 0,
            }}
          >
            {playing ? (
              <svg width="9" height="9" viewBox="0 0 9 9"><rect x="0" y="0" width="3" height="9" rx="1" fill="white"/><rect x="6" y="0" width="3" height="9" rx="1" fill="white"/></svg>
            ) : (
              <svg width="9" height="9" viewBox="0 0 9 9"><polygon points="1,0 9,4.5 1,9" fill="white"/></svg>
            )}
          </button>

          {/* Buy */}
          <button
            onClick={(e) => e.stopPropagation()}
            className="btn-shine"
            style={{ padding: "0 1rem", height: 36, borderRadius: 6, fontSize: "0.7rem", letterSpacing: 1 }}
          >
            Buy
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  STATS
// ─────────────────────────────────────────────
function StatsBar({ stats }) {
  const items = [
    { icon: "🎵", value: stats.sounds,    label: "Sound Effects" },
    { icon: "🎙️", value: stats.creators,  label: "Creators" },
    { icon: "📡", value: stats.streamers, label: "Happy Streamers" },
    { icon: "💸", value: stats.paid,      label: "Paid to Artists" },
  ];
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "repeat(4,1fr)",
      border: "1px solid var(--border)", borderRadius: 10,
      overflow: "hidden", margin: "4rem 0",
    }}>
      {items.map((item, i) => (
        <div key={i}
          onMouseEnter={e => e.currentTarget.style.background = "var(--bg3)"}
          onMouseLeave={e => e.currentTarget.style.background = "var(--bg2)"}
          style={{
            padding: "2rem 1.5rem", textAlign: "center",
            borderRight: i < 3 ? "1px solid var(--border)" : "none",
            background: "var(--bg2)", transition: "background 0.2s",
          }}
        >
          <div style={{ fontSize: "1.4rem", marginBottom: 8 }}>{item.icon}</div>
          <div style={{
            fontSize: "2rem", fontWeight: 900, letterSpacing: -2,
            fontFamily: "'Space Mono', monospace", marginBottom: 5,
          }}>{item.value}</div>
          <div style={{ fontSize: "0.68rem", letterSpacing: 2, color: "var(--text3)", fontWeight: 700, textTransform: "uppercase" }}>
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
//  CATEGORIES
// ─────────────────────────────────────────────
const CATS = [
  { id: "all", label: "All" }, { id: "alerts", label: "Alerts" },
  { id: "transitions", label: "Transitions" }, { id: "jingles", label: "Jingles" },
  { id: "ui", label: "UI Sounds" }, { id: "stingers", label: "Stingers" },
];

// ─────────────────────────────────────────────
//  APP
// ─────────────────────────────────────────────
export default function App() {
  const [products]              = useState(MOCK_PRODUCTS);
  const [stats]                 = useState(MOCK_STATS);
  const [category, setCategory] = useState("all");
  const [search, setSearch]     = useState("");
  const [modalOpen, setModal]   = useState(false);
  const [searchFocus, setFocus] = useState(false);

  // ── uncomment when backend ready ──
  // useEffect(() => { api.getProducts(category, search).then(setProducts); }, [category, search]);
  // useEffect(() => { api.getStats().then(setStats); }, []);

  const filtered = products.filter((p) => {
    const mc = category === "all" || p.category === category;
    const mq = !search || p.title.toLowerCase().includes(search.toLowerCase())
                       || p.creator.toLowerCase().includes(search.toLowerCase());
    return mc && mq;
  });

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      {modalOpen && <UploadModal onClose={() => setModal(false)} />}

      {/* ── HEADER ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(12,12,14,0.9)", backdropFilter: "blur(18px)",
        borderBottom: "1px solid var(--border)",
      }}>
        <div style={{
          maxWidth: 1300, margin: "0 auto", padding: "0 2rem",
          height: 60, display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{
            fontFamily: "'Space Mono', monospace", fontWeight: 700,
            fontSize: "0.95rem", letterSpacing: 4,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "var(--red)",
              display: "inline-block",
              animation: "dotPulse 2s ease-in-out infinite",
            }} />
            SOUNDWAVE
          </div>

          <nav style={{ display: "flex", gap: "1.8rem", alignItems: "center" }}>
            {["Browse", "Creators", "Pricing"].map((l) => (
              <a key={l} href="#" style={{
                color: "var(--text2)", textDecoration: "none",
                fontSize: "0.85rem", fontWeight: 600, letterSpacing: 0.3,
                transition: "color 0.2s",
              }}
                onMouseEnter={e => e.target.style.color = "var(--text)"}
                onMouseLeave={e => e.target.style.color = "var(--text2)"}
              >{l}</a>
            ))}
            <button className="btn-shine" onClick={() => setModal(true)}
              style={{ padding: "0.5rem 1.25rem", borderRadius: 6, fontSize: "0.76rem" }}>
              Upload
            </button>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 1300, margin: "0 auto", padding: "0 2rem", position: "relative" }}>

        {/* ── HERO ── */}
        <section style={{ padding: "5rem 0 3rem" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            marginBottom: "1.5rem", padding: "5px 14px",
            background: "rgba(230,30,43,0.07)", border: "1px solid rgba(230,30,43,0.18)",
            borderRadius: 20,
          }}>
            <span style={{
              width: 5, height: 5, borderRadius: "50%",
              background: "var(--red)", boxShadow: "0 0 6px var(--red)",
            }} />
            <span style={{
              fontSize: "0.68rem", letterSpacing: 3, fontWeight: 700,
              color: "var(--red)", fontFamily: "'Space Mono', monospace",
            }}>MARKETPLACE FOR STREAMERS</span>
          </div>

          <h1 style={{
            fontSize: "clamp(3rem, 6.5vw, 6rem)",
            fontWeight: 900, lineHeight: 1.0, letterSpacing: "-3px",
            marginBottom: "1.5rem", maxWidth: 820,
          }}>
            Premium Audio.<br />
            <span style={{ color: "var(--text2)" }}>Zero </span>
            <span style={{
              background: "linear-gradient(90deg, var(--red-dark) 0%, #ff3344 25%, #ff7070 50%, #ff3344 75%, var(--red-dark) 100%)",
              backgroundSize: "300% 100%",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "shimmer 3s linear infinite",
            }}>Compromise.</span>
          </h1>

          <p style={{
            fontSize: "1rem", color: "var(--text2)",
            maxWidth: 490, lineHeight: 1.8, marginBottom: "2.5rem",
          }}>
            Hand-crafted alerts, transitions, and stingers from world-class
            sound designers. Make your stream impossible to ignore.
          </p>

          {/* Search */}
          <div style={{ position: "relative", maxWidth: 530 }}>
            <div style={{
              position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)",
              opacity: 0.3, pointerEvents: "none",
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <input
              type="text" placeholder="Search sounds, creators, packs..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
              style={{
                width: "100%", padding: "0.82rem 2.8rem 0.82rem 2.6rem",
                background: "var(--bg2)",
                border: `1.5px solid ${searchFocus ? "var(--red-dark)" : "var(--border2)"}`,
                borderRadius: 8, color: "var(--text)", fontSize: "0.9rem",
                fontFamily: "'Outfit', sans-serif", outline: "none",
                boxShadow: searchFocus ? "0 0 0 3px var(--red-glow)" : "none",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer",
                color: "var(--text3)", fontSize: "0.95rem", lineHeight: 1,
              }}>✕</button>
            )}
          </div>
        </section>

        {/* ── FILTER TABS ── */}
        <div style={{
          display: "flex", alignItems: "center",
          borderBottom: "1px solid var(--border)", marginBottom: "2.5rem",
          flexWrap: "wrap", gap: "0",
        }}>
          {CATS.map((cat) => (
            <button key={cat.id} onClick={() => setCategory(cat.id)} style={{
              padding: "0.85rem 1.3rem", background: "transparent", border: "none",
              borderBottom: `2px solid ${category === cat.id ? "var(--red)" : "transparent"}`,
              color: category === cat.id ? "var(--text)" : "var(--text3)",
              fontWeight: category === cat.id ? 800 : 600,
              fontSize: "0.85rem", cursor: "pointer", whiteSpace: "nowrap",
              transition: "color 0.15s", fontFamily: "'Outfit', sans-serif", marginBottom: -1,
            }}
              onMouseEnter={e => { if (category !== cat.id) e.currentTarget.style.color = "var(--text2)"; }}
              onMouseLeave={e => { if (category !== cat.id) e.currentTarget.style.color = "var(--text3)"; }}
            >{cat.label}</button>
          ))}
          <span style={{
            marginLeft: "auto", padding: "0 0.5rem",
            fontFamily: "'Space Mono', monospace", fontSize: "0.68rem",
            color: "var(--text3)", letterSpacing: 1,
          }}>{filtered.length} results</span>
        </div>

        {/* ── GRID ── */}
        {filtered.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "6rem 2rem",
            border: "1px solid var(--border)", borderRadius: 10, background: "var(--bg2)", marginBottom: "4rem",
          }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🎧</div>
            <div style={{ fontWeight: 800, fontSize: "1.05rem", marginBottom: 6 }}>No sounds found</div>
            <div style={{ color: "var(--text2)", fontSize: "0.88rem" }}>Try a different search or category</div>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(285px, 1fr))",
            gap: "1.1rem", marginBottom: "0.5rem",
          }}>
            {filtered.map((p, i) => <ProductCard key={p.id} product={p} delay={i * 0.055} />)}
          </div>
        )}

        {/* ── STATS ── */}
        <StatsBar stats={stats} />

        {/* ── CTA ── */}
        <div style={{
          position: "relative", overflow: "hidden",
          border: "1px solid var(--border)", borderRadius: 10,
          padding: "3rem 2.5rem",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: "2rem", background: "var(--bg2)", marginBottom: "4rem",
        }}>
          <div style={{
            position: "absolute", right: -80, top: -80,
            width: 280, height: 280, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(230,30,43,0.09) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />
          <div>
            <div style={{
              fontSize: "0.66rem", letterSpacing: 4, color: "var(--red)",
              fontWeight: 700, marginBottom: 10, fontFamily: "'Space Mono', monospace",
            }}>FOR CREATORS</div>
            <div style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 900, letterSpacing: -1, marginBottom: 8, lineHeight: 1.2 }}>
              Sell your sounds.<br />
              <span style={{ color: "var(--text2)" }}>Keep 80% revenue.</span>
            </div>
            <div style={{ color: "var(--text2)", fontSize: "0.9rem" }}>
              Join 3,500+ sound designers already earning on SoundWave.
            </div>
          </div>
          <button className="btn-shine" onClick={() => setModal(true)}
            style={{ padding: "1rem 2.4rem", borderRadius: 8, fontSize: "0.83rem", whiteSpace: "nowrap" }}>
            Start Selling →
          </button>
        </div>

      </main>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: "1px solid var(--border)",
        padding: "2rem",
        maxWidth: 1300, margin: "0 auto",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: "1rem",
      }}>
        <div style={{
          fontFamily: "'Space Mono', monospace", fontSize: "0.7rem",
          letterSpacing: 3, color: "var(--text3)",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ width: 6, height: 6, background: "var(--red)", borderRadius: "50%", display: "block" }} />
          SOUNDWAVE © 2026
        </div>
        <div style={{ display: "flex", gap: "1.6rem" }}>
          {["About","FAQ","Terms","Contact"].map((l) => (
            <a key={l} href="#" style={{
              color: "var(--text3)", textDecoration: "none",
              fontSize: "0.76rem", fontWeight: 600, letterSpacing: 1,
              transition: "color 0.2s",
            }}
              onMouseEnter={e => e.target.style.color = "var(--text)"}
              onMouseLeave={e => e.target.style.color = "var(--text3)"}
            >{l}</a>
          ))}
        </div>
      </footer>
    </>
  );
}