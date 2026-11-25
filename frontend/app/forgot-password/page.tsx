"use client";

import React, { useState } from "react";
import Link from "next/link";
import AuthLayout from "@/components/AuthLayout";
import { Icon } from "@/components/FigmaIcons";
import { forgotPassword } from "@/lib/authApi";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [statusMsg, setStatusMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    setLoading(true);

    try {
      const response = await forgotPassword(email);
      setStatusMsg({
        type: "success",
        text: response?.message || "Reset link sent! Please check your inbox.",
      });
    } catch (err: any) {
      console.error("Forgot password failed:", err);
      setStatusMsg({
        type: "error",
        text: err?.message || "Something went wrong. Please verify your email and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="A fresh start."
      description="Enter your email to request a password reset link."
    >
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
          Email address
          <input
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading || statusMsg?.type === "success"}
          />
        </label>

        <button className="auth-submit" type="submit" disabled={loading || statusMsg?.type === "success"}>
          <span>{loading ? "Sending..." : "Send reset link"}</span>
          <Icon name="arrowLeft" size={17} />
        </button>
      </form>

      <p className="auth-switch">
        Remember your password?{" "}
        <Link href="/login" style={{color:"white"}} >
          Log in
          <Icon name="chevron" size={13} />
        </Link>
      </p>
    </AuthLayout>
  );
}
