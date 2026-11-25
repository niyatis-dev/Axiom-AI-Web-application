import { useEffect, useRef, useState } from "react";

export type Preferences = {
  compact: boolean;
  animations: boolean;
  accent: string;
  length: string;
  personality: string;
  markdown: boolean;
  memory: boolean;
  longTerm: boolean;
};
export const defaultPreferences: Preferences = {
  compact: false,
  animations: true,
  accent: "",
  length: "Balanced",
  personality: "Adaptive",
  markdown: true,
  memory: true,
  longTerm: false,
};
type Tab = "Profile" | "Appearance" | "AI" | "Memory" | "About";
const tabPaths: Record<Tab, React.ReactNode> = {
  Profile: (
    <>
      <circle cx="12" cy="8" r="3" />
      <path d="M5 21v-3a7 7 0 0 1 14 0v3" />
    </>
  ),
  Appearance: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3a9 9 0 0 0 0 18Z" />
    </>
  ),
  AI: <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" />,
  Memory: (
    <>
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0" />
    </>
  ),
  About: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6m0-10v.1" />
    </>
  ),
};
export function SettingsIcon({ tab = "Appearance" }: { tab?: Tab }) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {tabPaths[tab]}
    </svg>
  );
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
          aria-pressed={option === value}
          className={option === value ? "chosen" : ""}
          key={option}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export default function Settings({
  initialTab,
  onClose,
  theme,
  setTheme,
  preferences,
  onSave,
  name,
  email,
  birthday,
  onProfileSave,
}: {
  initialTab: Tab;
  onClose: () => void;
  theme: "dark" | "light";
  setTheme: (theme: "dark" | "light") => void;
  preferences: Preferences;
  onSave: (preferences: Preferences) => void;
  name: string;
  email: string;
  birthday: string;
  onProfileSave: (name: string, email: string, birthday: string) => void;
}) {
  const [tab, setTab] = useState(initialTab);
  const [draft, setDraft] = useState(preferences);
  const [profileName, setProfileName] = useState(name);
  const [profileEmail, setProfileEmail] = useState(email);
  const [dob, setDob] = useState(birthday);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const modal = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const update = <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };
  useEffect(() => {
    const prior = document.activeElement as HTMLElement | null;
    modal.current?.focus();
    function keydown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "Tab") {
        const elements = modal.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input:not(:disabled), select, [tabindex="0"]',
        );
        if (!elements?.length) return;
        const first = elements[0],
          last = elements[elements.length - 1];
        if (
          e.shiftKey &&
          (document.activeElement === first || document.activeElement === modal.current)
        ) {
          e.preventDefault();
          last.focus();
        } else if (
          !e.shiftKey &&
          (document.activeElement === last || document.activeElement === modal.current)
        ) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", keydown);
    return () => {
      document.removeEventListener("keydown", keydown);
      prior?.focus();
    };
  }, [onClose]);
  return (
    <div className="settings-backdrop" onClick={onClose}>
      <div
        ref={modal}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        className="settings-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <nav className="settings-nav" aria-label="Settings sections">
          <div className="settings-nav-title">
            Make it yours<span>YOUR PREFERENCES</span>
          </div>
          {(Object.keys(tabPaths) as Tab[]).map((item) => (
            <button
              key={item}
              aria-current={tab === item ? "page" : undefined}
              className={tab === item ? "active" : ""}
              onClick={() => {
                setTab(item);
                setSaved(false);
                if (content.current) content.current.scrollTop = 0;
              }}
            >
              <SettingsIcon tab={item} />
              <span>{item === "AI" ? "AI preferences" : item}</span>
            </button>
          ))}
          <div className="settings-nav-footer">
            <span className="status-dot" />
            Personal space
          </div>
        </nav>
        <section className="settings-main">
          <header className="settings-header">
            <div>
              <span className="eyebrow">A SPACE THAT FEELS LIKE YOU</span>
              <h2 id="settings-title">{tab === "AI" ? "AI preferences" : tab}</h2>
            </div>
            <button
              className="icon-button settings-close"
              aria-label="Close settings"
              onClick={onClose}
            >
              ×
            </button>
          </header>
          <div className="settings-body" ref={content}>
            {tab === "Appearance" && (
              <>
                <p className="settings-intro">A quieter workspace. Your kind of atmosphere.</p>
                <div className="theme-previews" role="group" aria-label="Theme">
                  {(["light", "dark"] as const).map((t) => (
                    <button
                      className={`theme-preview ${t} ${theme === t ? "chosen" : ""}`}
                      key={t}
                      aria-pressed={theme === t}
                      onClick={() => setTheme(t)}
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
                      ["", "Axiom purple"],
                      ["#91ada5", "Sage"],
                      ["#8fa9ce", "Slate blue"],
                      ["#c7a88c", "Sand"],
                    ].map(([color, label]) => (
                      <button
                        key={label}
                        aria-label={label}
                        aria-pressed={draft.accent === color}
                        style={{ background: color || "#b2a0e8" }}
                        onClick={() => update("accent", color)}
                      >
                        {draft.accent === color ? "✓" : ""}
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
                    value={draft.compact}
                    onChange={(v) => update("compact", v)}
                  />
                </div>
                <div className="setting-row">
                  <div>
                    <h3>Animations & depth</h3>
                    <p>Gentle movement and dimensional details.</p>
                  </div>
                  <Toggle
                    label="Animations and depth"
                    value={draft.animations}
                    onChange={(v) => update("animations", v)}
                  />
                </div>
              </>
            )}
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
                    value={draft.length}
                    options={["Short", "Balanced", "Detailed"]}
                    onChange={(v) => update("length", v)}
                  />
                </div>
                <div className="setting-row">
                  <div>
                    <h3>Markdown</h3>
                    <p>Use formatted headings, lists, and emphasis.</p>
                  </div>
                  <Toggle
                    label="Markdown"
                    value={draft.markdown}
                    onChange={(v) => update("markdown", v)}
                  />
                </div>
                <div className="setting-row stacked">
                  <div>
                    <h3>Personality</h3>
                    <p>A tone that fits the way you think.</p>
                  </div>
                  <Choices
                    label="Personality"
                    value={draft.personality}
                    options={["Adaptive", "Professional", "Creative"]}
                    onChange={(v) => update("personality", v)}
                  />
                </div>
                <p className="settings-footnote">
                  Try these preferences in your next demo response. No live AI service is connected.
                </p>
              </>
            )}
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
                    value={draft.memory}
                    onChange={(v) => update("memory", v)}
                  />
                </div>
                <div className={`setting-row ${!draft.memory ? "setting-disabled" : ""}`}>
                  <div>
                    <h3>Long-term memory</h3>
                    <p>Keep useful details beyond a single session.</p>
                  </div>
                  <Toggle
                    label="Long-term memory"
                    disabled={!draft.memory}
                    value={draft.memory && draft.longTerm}
                    onChange={(v) => update("longTerm", v)}
                  />
                </div>
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
                <p className="settings-footnote">
                  Preview only. Memory controls are illustrative; no personal information is stored
                  or sent.
                </p>
              </>
            )}
            {tab === "About" && (
              <>
                <div className="about-brand">
                  <h3>Intelligence, with intention.</h3>
                  <p>A little clarity. A different perspective.</p>
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
                <p className="settings-footnote">
                  This interactive redesign is a React prototype. AI, authentication, and memory
                  services are not connected.
                </p>
              </>
            )}
            {tab === "Profile" && (
              <>
                <div className="profile-hero">
                  <span className="profile-avatar-3d">
                    {(profileName || name).charAt(0).toUpperCase()}
                  </span>
                  <h3>{name}</h3>
                  <span className="version-badge">Free plan</span>
                  <button className="profile-edit" onClick={() => setEditing(!editing)}>
                    {editing ? "Cancel editing" : "Edit profile"}
                  </button>
                </div>
                <form
                  id="profile-form"
                  className="profile-fields"
                  onSubmit={(e) => {
                    e.preventDefault();
                    onProfileSave(profileName.trim(), profileEmail, dob);
                    setEditing(false);
                    setSaved(true);
                  }}
                >
                  <label>
                    Username
                    <input
                      required
                      value={profileName}
                      onChange={(e) => {
                        setProfileName(e.target.value);
                        setSaved(false);
                      }}
                      disabled={!editing}
                    />
                  </label>
                  <label>
                    Email address
                    <input
                      type="email"
                      required
                      value={profileEmail}
                      placeholder="Add your email address"
                      onChange={(e) => {
                        setProfileEmail(e.target.value);
                        setSaved(false);
                      }}
                      disabled={!editing}
                    />
                  </label>
                  <label>
                    Date of birth <span>Optional</span>
                    <input
                      type={editing ? "date" : "text"}
                      value={editing ? dob : dob || "Not set"}
                      onChange={(e) => {
                        setDob(e.target.value);
                        setSaved(false);
                      }}
                      max={new Date().toISOString().split("T")[0]}
                      disabled={!editing}
                    />
                  </label>
                </form>
                <p className="settings-footnote">Profile changes are for this demo session only.</p>
              </>
            )}
          </div>
          <footer className="settings-footer">
            <span>
              {saved
                ? "Changes saved for this session"
                : tab === "Appearance"
                  ? "Theme updates instantly"
                  : "Your space. Your preferences."}
            </span>
            {tab !== "About" && (
              <button
                className="settings-save"
                type={tab === "Profile" ? "submit" : "button"}
                form={tab === "Profile" ? "profile-form" : undefined}
                disabled={tab === "Profile" && !editing}
                onClick={
                  tab === "Profile"
                    ? undefined
                    : () => {
                        onSave(draft);
                        setSaved(true);
                      }
                }
              >
                {saved ? "Saved ✓" : "Save changes"}
              </button>
            )}
          </footer>
        </section>
      </div>
    </div>
  );
}
