import type { CSSProperties, PropsWithChildren, ReactNode } from "react";

const overlayStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  padding: "1rem",
  color: "#f8fafc",
  fontFamily: "Inter, system-ui, sans-serif",
};

const panelStyle: CSSProperties = {
  background: "rgba(15, 23, 42, 0.78)",
  border: "1px solid rgba(148, 163, 184, 0.35)",
  borderRadius: "16px",
  boxShadow: "0 20px 45px rgba(15, 23, 42, 0.28)",
  backdropFilter: "blur(12px)",
};

interface HUDOverlayProps extends PropsWithChildren {
  topLeft?: ReactNode;
  topRight?: ReactNode;
  bottomLeft?: ReactNode;
  bottomRight?: ReactNode;
}

export function HUDOverlay({
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
  children,
}: HUDOverlayProps) {
  return (
    <div style={overlayStyle} data-testid="hud-overlay">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "1rem",
          alignItems: "flex-start",
        }}
      >
        {topLeft ? (
          <div
            style={{ ...panelStyle, padding: "0.9rem 1rem", pointerEvents: "auto", minWidth: 220 }}
          >
            {topLeft}
          </div>
        ) : null}
        {topRight ? (
          <div
            style={{ ...panelStyle, padding: "0.9rem 1rem", pointerEvents: "auto", minWidth: 220 }}
          >
            {topRight}
          </div>
        ) : null}
      </div>
      {children ? <div style={{ flex: 1, position: "relative" }}>{children}</div> : null}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "1rem",
          alignItems: "flex-end",
        }}
      >
        {bottomLeft ? (
          <div
            style={{ ...panelStyle, padding: "0.9rem 1rem", pointerEvents: "auto", minWidth: 220 }}
          >
            {bottomLeft}
          </div>
        ) : null}
        {bottomRight ? (
          <div
            style={{ ...panelStyle, padding: "0.9rem 1rem", pointerEvents: "auto", minWidth: 220 }}
          >
            {bottomRight}
          </div>
        ) : null}
      </div>
    </div>
  );
}

interface ScreenProps {
  title: string;
  subtitle: string;
  actions?: ReactNode;
  accent?: string;
  testId?: string;
}

function ScreenShell({ title, subtitle, actions, accent = "#38bdf8", testId }: ScreenProps) {
  return (
    <div
      data-testid={testId}
      style={{
        position: "absolute",
        inset: 0,
        display: "grid",
        placeItems: "center",
        background:
          "radial-gradient(circle at top, rgba(56, 189, 248, 0.2), rgba(2, 6, 23, 0.96) 60%)",
        padding: "1.5rem",
      }}
    >
      <div
        style={{
          ...panelStyle,
          width: "min(560px, 100%)",
          padding: "2rem",
          textAlign: "center",
          pointerEvents: "auto",
        }}
      >
        <div
          style={{
            color: accent,
            textTransform: "uppercase",
            letterSpacing: "0.24em",
            fontSize: "0.75rem",
            marginBottom: "0.75rem",
          }}
        >
          Arcade Cabinet
        </div>
        <h1 style={{ margin: 0, fontSize: "clamp(2rem, 4vw, 3.5rem)", color: "#f8fafc" }}>
          {title}
        </h1>
        <p style={{ marginTop: "1rem", lineHeight: 1.6, color: "#cbd5e1" }}>{subtitle}</p>
        {actions ? (
          <div
            style={{
              marginTop: "1.5rem",
              display: "flex",
              gap: "0.75rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  );
}

interface StartScreenProps extends ScreenProps {
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
}

export function StartScreen({ primaryAction, secondaryAction, ...props }: StartScreenProps) {
  return (
    <ScreenShell
      {...props}
      testId={props.testId ?? "start-screen"}
      actions={
        <>
          {primaryAction}
          {secondaryAction}
        </>
      }
    />
  );
}

export function GameOverScreen(props: ScreenProps) {
  return <ScreenShell {...props} testId={props.testId ?? "game-over-screen"} accent="#fb7185" />;
}

export function OverlayButton({
  children,
  style,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      style={{
        borderRadius: 999,
        border: "1px solid rgba(148, 163, 184, 0.45)",
        background: "linear-gradient(135deg, rgba(56, 189, 248, 0.3), rgba(59, 130, 246, 0.55))",
        color: "#f8fafc",
        padding: "0.8rem 1.1rem",
        fontWeight: 700,
        cursor: "pointer",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
