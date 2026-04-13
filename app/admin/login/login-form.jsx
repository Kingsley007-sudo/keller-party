"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginForm({ nextPath }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ password })
    });

    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error || "Login failed.");
      setIsSubmitting(false);
      return;
    }

    router.replace(nextPath);
    router.refresh();
  }

  return (
    <div className="request-card">
      <form className="request-form" onSubmit={handleSubmit}>
        <div className="form-header">
          <div>
            <p className="flow-label">Admin authentication</p>
            <h3>Sign in</h3>
          </div>
        </div>

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Admin password"
            autoComplete="current-password"
          />
        </label>

        {error ? <p className="field-error form-error-banner">{error}</p> : null}

        <button type="submit" className="primary-button" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Enter admin"}
        </button>
      </form>
    </div>
  );
}
