"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { Icon, Mark } from "@/components/FigmaIcons";
import { useChat } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";

interface MessageBubbleProps {
  role: "user" | "assistant" | "system";
  content: string;
  index: number;
  isLast?: boolean;
  document?: {
    document_id: string;
    filename: string;
    mime_type?: string;
    type?: string;
    content?: string;
  };
}

export default function MessageBubble({
  role,
  content,
  index,
  document,
}: MessageBubbleProps) {
  const isUser = role === "user";
  const { regenerateResponse, editMessage } = useChat();
  const { user } = useAuth();

  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [isSaving, setIsSaving] = useState(false);

  const userName = user?.username || "You";
  const avatarLetter = (userName || "Y").charAt(0).toUpperCase();

  const isThinking = !isUser && content === "Thinking...";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy:", e);
    }
  };

  const handleSaveEdit = async () => {
    const trimmed = editContent.trim();
    if (!trimmed || trimmed === content) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    try {
      await editMessage(index, trimmed);
      setIsEditing(false);
    } catch (e) {
      console.error("Error saving edit:", e);
    } finally {
      setIsSaving(false);
    }
  };

  if (isThinking) {
    return (
      <div className="thinking" role="status">
        <Mark size={20} />
        <span>
          Axiom is thinking<span className="thinking-dots">...</span>
        </span>
      </div>
    );
  }

  if (isUser) {
    return (
      <article className="user-message">
        <div className="message-eyebrow">
          <span>{userName}</span>
          <span className="tiny-avatar">{avatarLetter}</span>
        </div>

        <div className="user-bubble">
          {document && (
            <div className="message-attachment" style={{ marginBottom: "8px" }}>
              <Icon name="attach" size={14} />
              <span>{document.filename}</span>
              {document.content && document.type === "image" && (
                <img
                  src={`data:${document.mime_type || "image/png"};base64,${document.content}`}
                  alt={document.filename}
                  style={{
                    maxHeight: "160px",
                    maxWidth: "100%",
                    borderRadius: "8px",
                    marginTop: "6px",
                    display: "block",
                  }}
                />
              )}
            </div>
          )}

          {isEditing ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                style={{
                  width: "100%",
                  minHeight: "60px",
                  background: "var(--surface)",
                  color: "var(--text)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  padding: "8px",
                  fontSize: "14px",
                  fontFamily: "inherit",
                }}
              />
              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => {
                    setEditContent(content);
                    setIsEditing(false);
                  }}
                  style={{ fontSize: "12px", width: "auto", padding: "4px 8px" }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  style={{
                    background: "var(--accent)",
                    color: "var(--bg)",
                    border: "none",
                    borderRadius: "6px",
                    padding: "4px 12px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          ) : (
            <span>{content}</span>
          )}
        </div>

        {!isEditing && (
          <button
            type="button"
            className="edit-message"
            onClick={() => {
              setEditContent(content);
              setIsEditing(true);
            }}
          >
            <Icon name="edit" size={12} />
            Edit message
          </button>
        )}
      </article>
    );
  }

  return (
    <article className="assistant-message">
      <div className="assistant-heading">
        <span className="assistant-mark">
          <Mark size={20} />
        </span>
        <strong>Axiom</strong>
        <span className="ai-label">AI</span>
      </div>

      <div className="assistant-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            p: ({ children }) => <p style={{ margin: "0 0 12px 0", lineHeight: 1.6 }}>{children}</p>,
            code({ className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              return match ? (
                <pre
                  style={{
                    background: "var(--sidebar)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    padding: "12px",
                    overflowX: "auto",
                    margin: "12px 0",
                  }}
                >
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              ) : (
                <code
                  style={{
                    background: "var(--surface)",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    fontSize: "0.9em",
                  }}
                  {...props}
                >
                  {children}
                </code>
              );
            },
            ul: ({ children }) => <ul style={{ paddingLeft: "20px", margin: "8px 0" }}>{children}</ul>,
            ol: ({ children }) => <ol style={{ paddingLeft: "20px", margin: "8px 0" }}>{children}</ol>,
            li: ({ children }) => <li style={{ margin: "4px 0" }}>{children}</li>,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>

      <div className="message-actions">
        <button type="button" onClick={handleCopy} title="Copy response">
          <Icon name={copied ? "check" : "copy"} size={14} />
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
        <button
          type="button"
          onClick={() => regenerateResponse()}
          title="Regenerate response"
        >
          <Icon name="refresh" size={14} />
          <span>Regenerate</span>
        </button>
      </div>
    </article>
  );
}
