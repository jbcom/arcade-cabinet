import { withBasePath } from "../utils/basePath";

const YEAR = new Date().getFullYear();

const LINKS = [
  { label: "GitHub", href: "https://github.com/jbcom/arcade-cabinet" },
  { label: "Issues", href: "https://github.com/jbcom/arcade-cabinet/issues" },
  { label: "Discussions", href: "https://github.com/jbcom/arcade-cabinet/discussions" },
  { label: "Privacy", href: "/privacy" },
] as const;

const RAINBOW_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#84cc16",
  "#06b6d4",
  "#8b5cf6",
  "#ec4899",
];

export default function Footer() {
  return (
    <footer
      style={{
        padding: "3rem 2rem",
        textAlign: "center",
        borderTop: "1px solid var(--color-border)",
      }}
    >
      {/* Rainbow divider */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "4px",
          marginBottom: "2rem",
        }}
        aria-hidden="true"
      >
        {RAINBOW_COLORS.map((color) => (
          <div
            key={color}
            style={{
              width: "32px",
              height: "3px",
              borderRadius: "999px",
              background: color,
              opacity: 0.8,
            }}
          />
        ))}
      </div>

      {/* Links */}
      <nav
        style={{
          display: "flex",
          gap: "2rem",
          justifyContent: "center",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
        }}
        aria-label="Footer navigation"
      >
        {LINKS.map((link) => (
          <a
            key={link.label}
            href={resolveFooterHref(link.href)}
            target={link.href.startsWith("http") ? "_blank" : undefined}
            rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.875rem",
              color: "var(--color-text-muted)",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-text)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-text-muted)";
            }}
          >
            {link.label}
          </a>
        ))}
      </nav>

      {/* Copyright */}
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.7rem",
          letterSpacing: "0.1em",
          color: "var(--color-text-muted)",
          opacity: 0.6,
        }}
      >
        © {YEAR} ARCADE CABINET — MIT License
      </p>
    </footer>
  );
}

function resolveFooterHref(href: (typeof LINKS)[number]["href"]) {
  return href.startsWith("http") ? href : withBasePath(href as `/${string}`);
}
