"use client";

// Last-resort error page (replaces the root layout), so it carries its own styles.
export default function GlobalError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en-KE">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, sans-serif",
          background: "#010C1B",
          color: "#e8eef7",
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          textAlign: "center",
          padding: 24,
        }}
      >
        <div>
          <p style={{ color: "#00DACE", fontWeight: 700, letterSpacing: "0.1em" }}>
            HUMAN SOLUTIONS
          </p>
          <h1 style={{ fontSize: 32 }}>Something went wrong</h1>
          <p style={{ color: "#a3b3c9" }}>Please try again, or call +254 725 742 737.</p>
          <button
            onClick={() => retry()}
            style={{
              marginTop: 16,
              background: "#4D8CE6",
              color: "#010C1B",
              border: 0,
              borderRadius: 8,
              padding: "12px 20px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
