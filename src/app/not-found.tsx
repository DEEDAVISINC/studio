import React from "react";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle, #ff512f 0%, #dd2476 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontFamily: "monospace",
      }}
    >
      <h1 style={{ fontSize: "4rem", marginBottom: "1rem", letterSpacing: "0.2em" }}>
        404
      </h1>
      <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        Page Not Found
      </h2>
      <p style={{ fontSize: "1.2rem", maxWidth: 500, textAlign: "center" }}>
        Sorry, the page you are looking for does not exist. Please check the URL or return to the homepage.
      </p>
    </div>
  );
}
