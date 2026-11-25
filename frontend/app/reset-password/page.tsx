"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AuthLayout from "@/components/AuthLayout";
import { Icon } from "@/components/FigmaIcons";
import { resetPassword } from "@/lib/authApi";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div style={{ textAlign: "center", padding: "16px 0" }}>
        <p style={{ color: "#ef4444", marginBottom: "12px", fontSize: "14px" }}>
          Invalid or missing reset token.
        </p>
        <Link href="/forgot-password" style={{ color: "var(--accent)", fontSize: "13px" }}>
          Request a new reset link
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (password !== confirmPassword) {
      setStatusMsg({ type: "error", text: "Passwords do not match." });
      return;
    }

    if (password.length < 8) {
      setStatusMsg({ type: "error", text: "Password must be at least 8 characters." });
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      setStatusMsg({ type: "success", text: "Password has been reset! Redirecting to login..." });
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      console.error("Password reset failed:", err);
      setStatusMsg({ type: "error", text: err?.message || "Invalid or expired token." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {statusMsg && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: "8px",
            background:
              statusMsg.type === "error"
                ? "rgba(239, 68, 68, 0.1)"
                : "rgba(16, 185, 129, 0.1)",
            border:
              statusMsg.type === "error"
                ? "1px solid rgba(239, 68, 68, 0.25)"
                : "1px solid rgba(16, 185, 129, 0.25)",
            color: statusMsg.type === "error" ? "#ef4444" : "#10b981",
            fontSize: "13px",
            textAlign: "center",
          }}
        >
          {statusMsg.text}
        </div>
      )}

      <label>
        <span className="password-label">New password</span>
        <span className="password-input">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Create a new password (8+ characters)"
            autoComplete="new-password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading || statusMsg?.type === "success"}
          />
          <button
            type="button"
            className="icon-button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword(!showPassword)}
          >
            <Icon name="eye" size={17} />
          </button>
        </span>
      </label>

      <label>
        <span className="password-label">Confirm new password</span>
        <span className="password-input">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm new password"
            autoComplete="new-password"
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading || statusMsg?.type === "success"}
          />
        </span>
      </label>

      <button className="auth-submit" type="submit" disabled={loading || statusMsg?.type === "success"}>
        <span>{loading ? "Updating..." : "Reset password"}</span>
        <Icon name="arrowLeft" size={17} />
      </button>

      <p className="auth-switch">
        <Link href="/login">
          Back to login
          <Icon name="chevron" size={13} />
        </Link>
      </p>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Create new password."
      description="Choose a strong password to secure your account."
    >
      <Suspense fallback={<div style={{ textAlign: "center", padding: "20px" }}>Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
