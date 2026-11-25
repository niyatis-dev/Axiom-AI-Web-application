"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Icon, SettingsIcon, SettingsTab } from "@/components/FigmaIcons";
import { useAuth } from "@/context/AuthContext";
import { fetchSettings, updateSettings, fetchMemories } from "@/lib/settingsApi";

interface SettingsModalProps {
  initialTab?: SettingsTab;
  open: boolean;
  onClose: () => void;
}

interface MemoryItem {
  memory_id: string;
  category: string;
  key: string;
  memory: string;
  created_at: string;
}

function Toggle({
  value,
  onChange,
  label,
  disabled = false,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={value}
      disabled={disabled}
      className={`setting-toggle ${value ? "on" : ""}`}
      onClick={() => onChange(!value)}
    >
      <span />
    </button>
  );
}

function Choices({
  value,
  options,
  onChange,
  label,
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  label: string;
}) {
  return (
    <div className="setting-choices" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          type="button"
          aria-pressed={option.toLowerCase() === value.toLowerCase()}
          className={option.toLowerCase() === value.toLowerCase() ? "chosen" : ""}
          key={option}
          onClick={() => onChange(option.toLowerCase())}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export default function SettingsModal({
  initialTab = "Appearance",
  open,
  onClose,
}: SettingsModalProps) {
  const { user, isAuthenticated, updateProfile } = useAuth();

  const [tab, setTab] = useState<SettingsTab>(initialTab);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Appearance state
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [accent, setAccent] = useState<string>("#b2a0e8");
  const [compact, setCompact] = useState<boolean>(false);
  const [animations, setAnimations] = useState<boolean>(true);

  // AI state
  const [responseLength, setResponseLength] = useState<"short" | "balanced" | "detailed">("balanced");
  const [markdown, setMarkdown] = useState<boolean>(true);
  const [personality, setPersonality] = useState<"adaptive" | "professional" | "creative">("adaptive");

  // Memory state
  const [memoryEnabled, setMemoryEnabled] = useState<boolean>(true);
  const [longTermMemory, setLongTermMemory] = useState<boolean>(true);
  const [memories, setMemories] = useState<MemoryItem[]>([]);

  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      setTab(initialTab);
      setSaved(false);
    }
  }, [open, initialTab]);

  // Load existing settings and memories
  useEffect(() => {
    if (!open) return;

    async function loadData() {
      setLoading(true);
      try {
        if (isAuthenticated) {
          const [settingsData, memoriesData] = await Promise.all([
            fetchSettings().catch(() => null),
            fetchMemories().catch(() => []),
          ]);

          if (settingsData) {
            if (settingsData.appearance) {
              setTheme(settingsData.appearance.theme === "light" ? "light" : "dark");
              setAccent(settingsData.appearance.accent_color || "#b2a0e8");
              setCompact(Boolean(settingsData.appearance.compact_mode));
              setAnimations(settingsData.appearance.animations !== false);
            }
            if (settingsData.ai) {
              setResponseLength(settingsData.ai.response_length || "balanced");
              setMarkdown(settingsData.ai.markdown_enabled !== false);
              setPersonality(settingsData.ai.personality || "adaptive");
            }
            if (settingsData.memory) {
              setMemoryEnabled(settingsData.memory.memory_enabled !== false);
              setLongTermMemory(settingsData.memory.allow_long_term_memory !== false);
            }
          }

          if (Array.isArray(memoriesData)) {
            setMemories(memoriesData);
          }
        } else {
          // Defaults from DOM
          const root = document.documentElement;
          setTheme(root.dataset.theme === "light" ? "light" : "dark");
          setAccent(root.style.getPropertyValue("--accent") || "#b2a0e8");
          setCompact(root.dataset.compact === "true");
          setAnimations(root.dataset.motion !== "false");
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [open, isAuthenticated, user]);

  // Apply appearance changes dynamically
  const handleThemeChange = (newTheme: "dark" | "light") => {
    setTheme(newTheme);
    const root = document.documentElement;
    root.dataset.theme = newTheme;
    if (newTheme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
      root.classList.remove("light");
    }
  };

  const handleAccentChange = (newAccent: string) => {
    setAccent(newAccent);
    const root = document.documentElement;
    if (newAccent) {
      root.style.setProperty("--accent", newAccent);
      root.style.setProperty("--accent-color", newAccent);
    } else {
      root.style.removeProperty("--accent");
      root.style.removeProperty("--accent-color");
    }
  };

  const handleCompactChange = (val: boolean) => {
    setCompact(val);
    const root = document.documentElement;
    root.dataset.compact = String(val);
    if (val) root.classList.add("compact");
    else root.classList.remove("compact");
  };

  const handleAnimationsChange = (val: boolean) => {
    setAnimations(val);
    const root = document.documentElement;
    root.dataset.motion = String(val);
    if (!val) root.classList.add("no-animations");
    else root.classList.remove("no-animations");
  };

  // Keyboard navigation & escape key
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Save full settings to backend
  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      if (isAuthenticated) {
        await updateSettings({
          appearance: {
            theme,
            accent_color: accent,
            compact_mode: compact,
            animations,
          },
          ai: {
            response_length: responseLength,
            markdown_enabled: markdown,
            personality,
          },
          memory: {
            memory_enabled: memoryEnabled,
            allow_long_term_memory: longTermMemory,
          },
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error("Failed to save settings:", e);
      alert("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!mounted || !open) return null;

  const tabs: SettingsTab[] = ["Appearance", "AI", "Memory", "About"];

  return createPortal(
    <div className="settings-backdrop" onClick={onClose}>
      <div
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        className="settings-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Settings Navigation Sidebar */}
        <nav className="settings-nav" aria-label="Settings sections">
          <div className="settings-nav-title">Settings</div>

          {tabs.map((item) => (
            <button
              key={item}
              type="button"
              aria-current={tab === item ? "page" : undefined}
              className={tab === item ? "active" : ""}
              onClick={() => {
                setTab(item);
                setSaved(false);
                if (contentRef.current) contentRef.current.scrollTop = 0;
              }}
            >
              <SettingsIcon tab={item} />
              <span>{item === "AI" ? "AI preferences" : item}</span>
            </button>
          ))}
        </nav>

        {/* Settings Main Content Area */}
        <section className="settings-main">
          <header className="settings-header">
            <div>
              <h2 id="settings-title">{tab === "AI" ? "AI preferences" : tab}</h2>
            </div>
            <button
              type="button"
              className="icon-button settings-close"
              aria-label="Close settings"
              onClick={onClose}
            >
              ×
            </button>
          </header>

          <div className="settings-body" ref={contentRef}>
            {loading ? (
              <div style={{ padding: "40px 0", textAlign: "center", color: "var(--muted)" }}>
                Loading settings...
              </div>
            ) : (
              <>
                {/* Appearance Tab */}
                {tab === "Appearance" && (
                  <>
                    <p className="settings-intro">A quieter workspace. Your kind of atmosphere.</p>
                    <div className="theme-previews" role="group" aria-label="Theme">
                      {(["light", "dark"] as const).map((t) => (
                        <button
                          type="button"
                          className={`theme-preview ${t} ${theme === t ? "chosen" : ""}`}
                          key={t}
                          aria-pressed={theme === t}
                          onClick={() => handleThemeChange(t)}
                        >
                          <span className="mini-window">
                            <i className="mini-sidebar" />
                            <i className="mini-message" />
                            <i className="mini-answer" />
                            <i className="mini-composer" />
                          </span>
                          <span className="theme-preview-label">
                            {t === "dark" ? "Graphite" : "Pearl"}
                            <span className="selection-circle">{theme === t ? "✓" : ""}</span>
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="setting-row">
                      <div>
                        <h3>Accent color</h3>
                        <p>A subtle signature, never a distraction.</p>
                      </div>
                      <div className="accent-swatches">
                        {[
                          ["#b2a0e8", "Axiom purple"],
                          ["#91ada5", "Sage"],
                          ["#8fa9ce", "Slate blue"],
                          ["#c7a88c", "Sand"],
                        ].map(([color, label]) => (
                          <button
                            type="button"
                            key={label}
                            aria-label={label}
                            aria-pressed={accent === color}
                            style={{ background: color }}
                            onClick={() => handleAccentChange(color)}
                          >
                            {accent === color ? "✓" : ""}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="setting-row">
                      <div>
                        <h3>Compact mode</h3>
                        <p>A little less spacing. More room for the conversation.</p>
                      </div>
                      <Toggle
                        label="Compact mode"
                        value={compact}
                        onChange={handleCompactChange}
                      />
                    </div>

                    <div className="setting-row">
                      <div>
                        <h3>Animations & depth</h3>
                        <p>Gentle movement and dimensional details.</p>
                      </div>
                      <Toggle
                        label="Animations and depth"
                        value={animations}
                        onChange={handleAnimationsChange}
                      />
                    </div>
                  </>
                )}

                {/* AI Tab */}
                {tab === "AI" && (
                  <>
                    <p className="settings-intro">Shape the way Axiom responds to you.</p>

                    <div className="setting-row stacked">
                      <div>
                        <h3>Response length</h3>
                        <p>Just enough detail, or room to go deeper.</p>
                      </div>
                      <Choices
                        label="Response length"
                        value={responseLength}
                        options={["Short", "Balanced", "Detailed"]}
                        onChange={(v) => setResponseLength(v as any)}
                      />
                    </div>

                    <div className="setting-row">
                      <div>
                        <h3>Markdown</h3>
                        <p>Use formatted headings, lists, and emphasis.</p>
                      </div>
                      <Toggle
                        label="Markdown"
                        value={markdown}
                        onChange={(v) => setMarkdown(v)}
                      />
                    </div>

                    <div className="setting-row stacked">
                      <div>
                        <h3>Personality</h3>
                        <p>A tone that fits the way you think.</p>
                      </div>
                      <Choices
                        label="Personality"
                        value={personality}
                        options={["Adaptive", "Professional", "Creative"]}
                        onChange={(v) => setPersonality(v as any)}
                      />
                    </div>
                  </>
                )}

                {/* Memory Tab */}
                {tab === "Memory" && (
                  <>
                    <p className="settings-intro">Continuity when you want it. Control, always.</p>

                    <div className="setting-row">
                      <div>
                        <h3>Enable memory</h3>
                        <p>Let Axiom build context across conversations.</p>
                      </div>
                      <Toggle
                        label="Enable memory"
                        value={memoryEnabled}
                        onChange={(v) => setMemoryEnabled(v)}
                      />
                    </div>

                    <div className={`setting-row ${!memoryEnabled ? "setting-disabled" : ""}`}>
                      <div>
                        <h3>Long-term memory</h3>
                        <p>Keep useful details beyond a single session.</p>
                      </div>
                      <Toggle
                        label="Long-term memory"
                        disabled={!memoryEnabled}
                        value={memoryEnabled && longTermMemory}
                        onChange={(v) => setLongTermMemory(v)}
                      />
                    </div>

                    {memories.length === 0 ? (
                      <div className="memory-empty">
                        <span className="memory-symbol">
                          <SettingsIcon tab="Memory" />
                        </span>
                        <h3>A clean slate.</h3>
                        <p>
                          No stored memories yet.
                          <br />
                          Your thoughts have room to grow.
                        </p>
                      </div>
                    ) : (
                      <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                        <h4 style={{ fontSize: "13px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase" }}>
                          Stored Memories ({memories.length})
                        </h4>
                        {memories.map((m) => (
                          <div
                            key={m.memory_id}
                            style={{
                              padding: "12px",
                              borderRadius: "8px",
                              background: "var(--surface)",
                              border: "1px solid var(--border)",
                              fontSize: "13px",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                              <span style={{ fontWeight: 600, color: "var(--accent)" }}>{m.category}</span>
                              <span style={{ fontSize: "11px", color: "var(--muted)" }}>{m.key}</span>
                            </div>
                            <p style={{ margin: 0, color: "var(--text)" }}>{m.memory}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* About Tab */}
                {tab === "About" && (
                  <>
                    <div className="about-brand">
                      <h3>Axiom V2</h3>
                      <p>An intelligent AI assistant for exploration, reasoning, and productivity.</p>
                    </div>

                    <div className="setting-row">
                      <h3>Version</h3>
                      <span className="version-badge">2.0</span>
                    </div>

                    <div className="setting-row">
                      <h3>Built by</h3>
                      <span>Niyati Sompura</span>
                    </div>

                    <div className="setting-row stacked">
                      <div>
                        <h3>Original product stack</h3>
                        <p>The foundation of the Axiom product.</p>
                      </div>
                      <div className="stack-tags">
                        {["FastAPI", "GPT", "MongoDB", "Next.js"].map((t) => (
                          <span key={t}>{t}</span>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          <footer className="settings-footer">
            <span>
              {saved
                ? "Changes saved successfully ✓"
                : tab === "Appearance"
                  ? "Theme updates instantly"
                  : ""}
            </span>

            {tab !== "About" && (
              <button
                type="button"
                className="settings-save"
                disabled={saving}
                onClick={handleSave}
              >
                {saving ? "Saving..." : saved ? "Saved ✓" : "Save changes"}
              </button>
            )}
          </footer>
        </section>
      </div>
    </div>,
    document.body
  );
}
