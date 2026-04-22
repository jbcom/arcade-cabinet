import { useEffect, useRef, useState } from "react";

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgError, setImgError] = useState(false);

  // Animated neon grid canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const dpr = window.devicePixelRatio;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const cols = 20;
      const rows = 10;
      const cellW = w / cols;
      const cellH = h / rows;
      ctx.lineWidth = 0.5;

      for (let i = 0; i <= cols; i++) {
        const x = i * cellW;
        const hue = ((i / cols) * 360 + t * 0.3) % 360;
        ctx.strokeStyle = `hsla(${hue}, 100%, 70%, 0.15)`;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      for (let j = 0; j <= rows; j++) {
        const y = j * cellH;
        const hue = ((j / rows) * 360 + t * 0.3 + 180) % 360;
        ctx.strokeStyle = `hsla(${hue}, 100%, 70%, 0.12)`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          const hue = ((i + j) * 18 + t * 0.5) % 360;
          const pulse = 0.3 + 0.7 * Math.abs(Math.sin(t * 0.02 + i * 0.3 + j * 0.5));
          ctx.fillStyle = `hsla(${hue}, 100%, 75%, ${0.2 * pulse})`;
          ctx.beginPath();
          ctx.arc(i * cellW, j * cellH, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      t += 0.8;
      animId = requestAnimationFrame(draw);
    };

    if (!prefersReducedMotion) {
      draw();
    }
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const base = import.meta.env.BASE_URL;
  const heroImgSrc = `${base}hero.png`.replace(/\/\//g, "/");
  const showImage = !imgError;

  return (
    <section
      style={{
        position: "relative",
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        overflow: "hidden",
        background: "radial-gradient(ellipse 120% 80% at 50% 0%, #1a0a2e 0%, #0a0a0b 60%)",
      }}
    >
      {/* Animated grid canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      />

      {/* Glow orbs */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "10%",
          left: "5%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: "10%",
          right: "5%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      {/* Two-column layout */}
      <div
        className={`hero-grid${showImage ? " hero-grid--with-image" : ""}`}
        style={{
          position: "relative",
          zIndex: 1,
          display: "grid",
          gap: "4rem",
          maxWidth: "1200px",
          width: "100%",
          alignItems: "center",
        }}
      >
        {/* Left: Text content */}
        <div style={{ textAlign: showImage ? "left" : "center" }}>
          {/* Breadcrumb wordmark */}
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "var(--color-text-muted)",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              justifyContent: showImage ? "flex-start" : "center",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "28px",
                height: "2px",
                background: "var(--gradient-rainbow)",
              }}
            />
            <span>Insert coin / choose cabinet</span>
            <span
              style={{
                display: "inline-block",
                width: "28px",
                height: "2px",
                background: "var(--gradient-rainbow)",
              }}
            />
          </div>

          {/* Headline */}
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "clamp(3.5rem, 9vw, 7.5rem)",
              lineHeight: 0.95,
              letterSpacing: "-0.03em",
              marginBottom: "0.2rem",
              background:
                "linear-gradient(135deg, #ef4444 0%, #f97316 12%, #eab308 25%, #84cc16 37%, #06b6d4 50%, #0ea5e9 62%, #8b5cf6 75%, #ec4899 87%, #ef4444 100%)",
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "gradientShift 8s ease infinite",
            }}
          >
            ARCADE
          </h1>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "clamp(3.5rem, 9vw, 7.5rem)",
              lineHeight: 0.95,
              letterSpacing: "-0.03em",
              marginBottom: "1.5rem",
              color: "var(--color-text)",
            }}
          >
            CABINET
          </h1>

          {/* Tagline */}
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1rem, 2vw, 1.35rem)",
              fontWeight: 400,
              color: "var(--color-text-muted)",
              marginBottom: "2.5rem",
              lineHeight: 1.6,
              maxWidth: "480px",
            }}
          >
            Nine cabinet-scale games, each with its own controls, mood, and visual identity. Pick a
            marquee, start the machine, and play full screen.
          </p>

          {/* CTAs */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              flexWrap: "wrap",
              justifyContent: showImage ? "flex-start" : "center",
            }}
          >
            <a
              href="#games"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: "0.95rem",
                padding: "0.8rem 2rem",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #8b5cf6, #0ea5e9)",
                color: "#fff",
                letterSpacing: "0.02em",
                transition: "opacity 0.2s, transform 0.2s",
                display: "inline-block",
                boxShadow: "0 0 30px rgba(139,92,246,0.35)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.opacity = "0.9";
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.opacity = "1";
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
              }}
            >
              Enter Cabinet
            </a>
          </div>
        </div>

        {/* Right: Hero image */}
        {showImage && (
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Rainbow ring glow behind image */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: "-8px",
                borderRadius: "24px",
                background:
                  "linear-gradient(135deg, #ef4444, #f97316, #eab308, #84cc16, #06b6d4, #8b5cf6, #ec4899)",
                backgroundSize: "300% 300%",
                animation: "gradientShift 6s ease infinite",
                filter: "blur(16px)",
                opacity: 0.5,
              }}
            />
            <img
              src={heroImgSrc}
              alt="Arcade Cabinet game selection marquee"
              onError={() => setImgError(true)}
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "520px",
                height: "auto",
                borderRadius: "20px",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 0 0 1px rgba(139,92,246,0.3), 0 40px 80px rgba(0,0,0,0.6)",
                display: "block",
              }}
            />
          </div>
        )}
      </div>

      {/* Scroll indicator */}
      <div
        style={{
          position: "absolute",
          bottom: "2rem",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.5rem",
          color: "var(--color-text-muted)",
          animation: "bounce 2s ease infinite",
        }}
        aria-hidden="true"
      >
        <span
          style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.2em" }}
        >
          SCROLL
        </span>
        <svg width="16" height="24" viewBox="0 0 16 24" fill="none" aria-hidden="true">
          <rect x="1" y="1" width="14" height="22" rx="7" stroke="currentColor" strokeWidth="1.5" />
          <circle
            cx="8"
            cy="8"
            r="2.5"
            fill="currentColor"
            style={{ animation: "scrollDot 2s ease infinite" }}
          />
        </svg>
      </div>

      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(6px); }
        }
        @keyframes scrollDot {
          0% { cy: 8; opacity: 1; }
          100% { cy: 16; opacity: 0; }
        }
        .hero-grid {
          grid-template-columns: 1fr;
        }
        .hero-grid--with-image {
          grid-template-columns: 1fr 1fr;
        }
        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
    </section>
  );
}
