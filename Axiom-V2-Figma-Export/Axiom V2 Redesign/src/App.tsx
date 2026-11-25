import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import Settings, { SettingsIcon, defaultPreferences } from "./Settings";

type IconName =
  | "plus"
  | "panel"
  | "chat"
  | "sun"
  | "moon"
  | "chevron"
  | "arrow"
  | "attach"
  | "copy"
  | "refresh"
  | "edit"
  | "close"
  | "more"
  | "logout"
  | "eye"
  | "check"
  | "arrowLeft";
function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    plus: <path d="M12 5v14M5 12h14" />,
    panel: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="3" />
        <path d="M9 4v16M5.8 8h.4M5.8 11h.4" />
      </>
    ),
    chat: (
      <path d="M20 11.5a7.8 7.8 0 0 1-8 7.5 9 9 0 0 1-3.5-.7L4 20l1.4-4A7.2 7.2 0 0 1 4 11.5 7.8 7.8 0 0 1 12 4a7.8 7.8 0 0 1 8 7.5Z" />
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="3.5" />
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </>
    ),
    moon: <path d="M20.5 13A8.6 8.6 0 0 1 11 3.5 8.6 8.6 0 1 0 20.5 13Z" />,
    chevron: <path d="m9 5 7 7-7 7" />,
    arrow: <path d="M12 19V5m-6 6 6-6 6 6" />,
    attach: <path d="m8 13 6.5-6.5a2.5 2.5 0 0 1 3.5 3.5l-8.5 8.5a4 4 0 0 1-5.7-5.7L12 4.5" />,
    copy: (
      <>
        <rect x="8" y="8" width="12" height="13" rx="2" />
        <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
      </>
    ),
    refresh: (
      <>
        <path d="M20 7v5h-5M4 17v-5h5" />
        <path d="M6 7a7 7 0 0 1 11-1l3 6M4 12l3 6a7 7 0 0 0 11-1" />
      </>
    ),
    edit: (
      <>
        <path d="m15 4 5 5M4 20l5-1L20 8a3.5 3.5 0 0 0-5-5L4 14Z" />
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    more: (
      <>
        <circle cx="5" cy="12" r="1" />
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
      </>
    ),
    logout: (
      <>
        <path d="M9 4H5v16h4m6-12 4 4-4 4M9 12h10" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    arrowLeft: <path d="M20 12H4m6-6-6 6 6 6" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function Mark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="29"
      height="29"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <path d="m4 25 10.2-18a2 2 0 0 1 3.5 0L28 25h-5.2L16 12.8 9.2 25H4Z" fill="currentColor" />
      <path d="m12.8 25 3.2-5.7 3.2 5.7h-6.4Z" fill="var(--accent)" />
    </svg>
  );
}

type Message = {
  id: number;
  role: "user" | "assistant";
  text: string;
  rich?: boolean;
  attachment?: string;
};
type Conversation = { id: string; title: string; group: string; messages: Message[] };
const opening =
  "I’ve been feeling scattered lately. How can I build a daily routine that helps me focus without feeling too rigid?";
const richText =
  "The best routine gives your day a rhythm, not a rulebook. Start with a few small anchors and leave room for being human.\n1. Give your morning a gentle starting point\n2. Work with your energy, not against it\n3. Create a small shutdown ritual\nStart with just one of these tomorrow. A routine that sticks is one you actually want to come back to.";
const initialConversations: Conversation[] = [
  {
    id: "focus",
    title: "A little more focus",
    group: "Today",
    messages: [
      { id: 1, role: "user", text: opening },
      { id: 2, role: "assistant", text: richText, rich: true },
    ],
  },
  {
    id: "ideas",
    title: "A fresh perspective",
    group: "Today",
    messages: [
      { id: 3, role: "user", text: "How can I find a fresh perspective on a creative project?" },
      {
        id: 4,
        role: "assistant",
        text: "Step away from the solution for a moment and revisit the question. What are you really trying to say, and who needs to hear it?\nTry writing down three completely different ways to approach the same idea. Give yourself permission to make the first two imperfect.",
      },
    ],
  },
  {
    id: "next",
    title: "Getting started with Next.js",
    group: "Yesterday",
    messages: [
      { id: 5, role: "user", text: "What is Next.js?" },
      {
        id: 6,
        role: "assistant",
        text: "Next.js is a React framework for building web applications. It brings routing, server rendering, and tools for loading data together in one place.\nIf you already know React, start with a small project: create a page, add a second route, and then explore how server and client components work together.",
      },
    ],
  },
  {
    id: "news",
    title: "This week in AI",
    group: "Yesterday",
    messages: [
      { id: 7, role: "user", text: "Help me make sense of this week’s AI news." },
      {
        id: 8,
        role: "assistant",
        text: "Happy to help you cut through the noise. Share an article or a few headlines, and we can look at what changed, why it matters, and what is still uncertain.\nThis prototype does not have access to live news.",
      },
    ],
  },
  {
    id: "flutter",
    title: "Exploring Flutter",
    group: "Previous 7 days",
    messages: [
      { id: 9, role: "user", text: "Tell me about Flutter." },
      {
        id: 10,
        role: "assistant",
        text: "Flutter is a toolkit for building applications across mobile, web, and desktop from a shared Dart codebase. Its widget-based approach gives you fine control over the interface.\nAre you exploring it for a new project or comparing it with a framework you already use?",
      },
    ],
  },
  {
    id: "morning",
    title: "A good place to start",
    group: "Previous 7 days",
    messages: [
      { id: 11, role: "user", text: "Hi, Axiom! Good morning. How have you been?" },
      {
        id: 12,
        role: "assistant",
        text: "Good morning. I’m here and ready to help. What’s on your mind today?",
      },
    ],
  },
];

function demoReply(text: string) {
  if (/routine|focus|habit|morning/i.test(text))
    return "Let’s make it manageable. Choose one thing that matters for tomorrow and give it a small, specific place in your day.\nTry 25 minutes of uninterrupted time before opening messages. Keep a notepad nearby for distractions, and take a real break afterward.\nThe goal isn’t a perfect day. It’s a small promise you can keep. What time of day do you usually feel most clear-headed?";
  if (/hi|hello|hey/i.test(text) && text.length < 35)
    return "Hello. It’s good to have you here. What would you like to work through today?";
  return "A useful place to start is to make the question a little more concrete. What outcome would feel most helpful to you?\nWe can break it into smaller steps, explore a different perspective, or turn your thoughts into a clear first draft.\nThis is a prototype response, not a live AI answer.";
}

export default function App() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [view, setView] = useState<"chat" | "login" | "signup" | "reset">("chat");
  const [conversations, setConversations] = useState(initialConversations);
  const [active, setActive] = useState("focus");
  const [sidebar, setSidebar] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [profileMenu, setProfileMenu] = useState(false);
  const [moreMenu, setMoreMenu] = useState(false);
  const [draft, setDraft] = useState("");
  const [attachment, setAttachment] = useState("");
  const [thinking, setThinking] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const [notice, setNotice] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("Nyatis");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [rename, setRename] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [settingsTab, setSettingsTab] = useState<"Profile" | "Appearance" | null>(null);
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [profileEmail, setProfileEmail] = useState("");
  const [birthday, setBirthday] = useState("");
  const closeSettings = useCallback(() => setSettingsTab(null), []);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const current = conversations.find((c) => c.id === active);
  const messages = current?.messages ?? [];
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.compact = String(preferences.compact);
    root.dataset.motion = String(preferences.animations);
    if (preferences.accent) root.style.setProperty("--accent", preferences.accent);
    else root.style.removeProperty("--accent");
  }, [preferences]);
  useEffect(() => {
    if (messages.length > 2 || thinking)
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, thinking]);
  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(timeout);
  }, [notice]);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  function newChat() {
    const id = String(Date.now());
    setConversations((prev) => [
      { id, title: "New conversation", group: "Today", messages: [] },
      ...prev,
    ]);
    setActive(id);
    setDraft("");
    setAttachment("");
    setSidebar(false);
    setView("chat");
    inputRef.current?.focus();
  }
  function send(event?: FormEvent) {
    event?.preventDefault();
    if ((!draft.trim() && !attachment) || thinking) return;
    const text = draft.trim() || `Let’s take a look at ${attachment}.`;
    const id = active;
    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      text,
      attachment: attachment || undefined,
    };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              title: c.messages.length ? c.title : text.slice(0, 32),
              messages: [...c.messages, userMessage],
            }
          : c,
      ),
    );
    setDraft("");
    setAttachment("");
    setThinking(true);
    timer.current = setTimeout(() => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                messages: [
                  ...c.messages,
                  {
                    id: Date.now(),
                    role: "assistant",
                    text: userMessage.attachment
                      ? `You attached ${userMessage.attachment}. File analysis is not connected in this prototype, but you can paste a passage here to explore the conversation experience.`
                      : formatDemoReply(text),
                  },
                ],
              }
            : c,
        ),
      );
      setThinking(false);
    }, 950);
  }
  function regenerate(message: Message) {
    if (thinking) return;
    const id = active;
    setThinking(true);
    timer.current = setTimeout(() => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === message.id
                    ? {
                        ...m,
                        rich: false,
                        text: "Think of your routine as a few anchors, not a packed schedule.\nStart your day with one clear priority. Protect a short block of distraction-free time, then leave space to reset. At the end of the day, write down what can wait until tomorrow.\nConsistency comes from making it easy to begin again, not from getting every day right.",
                      }
                    : m,
                ),
              }
            : c,
        ),
      );
      setThinking(false);
    }, 700);
  }
  async function copy(message: Message) {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(message.id);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setNotice("Clipboard is unavailable in this browser.");
    }
  }
  function formatDemoReply(text: string) {
    let response = demoReply(text);
    if (preferences.length === "Short") response = response.split("\n")[0];
    if (preferences.length === "Detailed")
      response +=
        "\nA practical next step: write down your goal, choose the smallest action you can take today, and decide how you will know it helped. Revisit it tomorrow and adjust rather than starting over.";
    if (preferences.personality === "Professional")
      response = "Here is a practical approach.\n" + response;
    if (preferences.personality === "Creative")
      response = "Think of this as a small experiment, not a final answer.\n" + response;
    return response;
  }
  function authSubmit(e: FormEvent) {
    e.preventDefault();
    if (view === "reset") {
      setNotice("Prototype only — no reset email was sent.");
      return;
    }
    if (view === "signup" && authName.trim()) setName(authName.trim());
    else if (authEmail.trim()) setName(authEmail.split("@")[0]);
    setView("chat");
    setNotice("You’re in. This is a demo session; no account was created.");
  }
  function openSettings(tab: "Profile" | "Appearance") {
    setSettingsTab(tab);
    setProfileMenu(false);
    setSidebar(false);
  }

  return (
    <div className={`app ${collapsed ? "sidebar-collapsed" : ""}`}>
      {view === "chat" ? (
        <>
          {sidebar && (
            <button
              className="mobile-scrim"
              aria-label="Close navigation"
              onClick={() => setSidebar(false)}
            />
          )}
          <aside className={`sidebar ${sidebar ? "is-open" : ""}`}>
            <div className="sidebar-brand">
              <a
                className="brand"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActive("focus");
                  setSidebar(false);
                }}
              >
                <Mark />
                <span>
                  axiom<span className="brand-period">.</span>
                </span>
                <span className="version">V2</span>
              </a>
              <button
                className="icon-button collapse-button"
                title="Collapse sidebar"
                onClick={() => {
                  setCollapsed(true);
                  setSidebar(false);
                }}
              >
                <Icon name="panel" size={17} />
              </button>
              <button
                className="icon-button mobile-close"
                aria-label="Close sidebar"
                onClick={() => setSidebar(false)}
              >
                <Icon name="close" />
              </button>
            </div>
            <button className="new-chat" onClick={newChat}>
              <Icon name="plus" size={17} />
              <span>New conversation</span>
              <span className="new-chat-hint">↗</span>
            </button>
            <div className="conversation-list">
              <div className="list-heading">YOUR CONVERSATIONS</div>
              {["Today", "Yesterday", "Previous 7 days"].map((group) => (
                <div className="conversation-group" key={group}>
                  <h3>{group}</h3>
                  {conversations
                    .filter((c) => c.group === group)
                    .map((c) => (
                      <button
                        key={c.id}
                        className={`conversation-link ${c.id === active ? "active" : ""}`}
                        onClick={() => {
                          setActive(c.id);
                          setSidebar(false);
                          setDraft("");
                          setAttachment("");
                        }}
                      >
                        <Icon name="chat" size={16} />
                        <span>{c.title}</span>
                        {c.id === active && <i />}
                      </button>
                    ))}
                </div>
              ))}
            </div>
            <div className="sidebar-bottom">
              <div className="sidebar-note">
                <span className="status-dot" />
                <span>A little clarity, always.</span>
              </div>
              <div className="profile-container">
                {profileMenu && (
                  <div className="profile-menu popover">
                    <div className="menu-caption">YOUR ACCOUNT · DEMO</div>
                    <button onClick={() => openSettings("Profile")}>
                      <SettingsIcon tab="Profile" />
                      Your profile
                    </button>
                    <button onClick={() => openSettings("Appearance")}>
                      <SettingsIcon />
                      Settings
                    </button>
                    <button
                      onClick={() => {
                        setView("login");
                        setProfileMenu(false);
                      }}
                    >
                      <Icon name="logout" size={16} /> Log in to Axiom
                    </button>
                    <button
                      onClick={() => {
                        setView("signup");
                        setProfileMenu(false);
                      }}
                    >
                      <Icon name="plus" size={16} /> Create an account
                    </button>
                  </div>
                )}
                <button
                  className="profile-button"
                  aria-expanded={profileMenu}
                  onClick={() => setProfileMenu(!profileMenu)}
                >
                  <span className="avatar">{name.charAt(0).toUpperCase()}</span>
                  <span className="profile-info">
                    <strong>{name}</strong>
                    <span>Personal account</span>
                  </span>
                  <Icon name="more" size={19} />
                </button>
              </div>
            </div>
          </aside>
          <main className="main">
            <header className="chat-header">
              <div className="header-location">
                <button
                  className="icon-button show-sidebar"
                  title="Open sidebar"
                  onClick={() => {
                    setCollapsed(false);
                    setSidebar(true);
                  }}
                >
                  <Icon name="panel" />
                </button>
                <span className="header-workspace">Personal space</span>
                <span className="header-slash">/</span>
                <span className="header-title">{current?.title || "New conversation"}</span>
              </div>
              <div className="header-actions">
                <div className="more-container">
                  <button
                    className="icon-button"
                    aria-label="Conversation options"
                    aria-expanded={moreMenu}
                    onClick={() => setMoreMenu(!moreMenu)}
                  >
                    <Icon name="more" size={20} />
                  </button>
                  {moreMenu && (
                    <div className="popover conversation-menu">
                      <button
                        onClick={() => {
                          setNewTitle(current?.title || "");
                          setRename(true);
                          setMoreMenu(false);
                        }}
                      >
                        <Icon name="edit" size={15} />
                        Rename conversation
                      </button>
                      <button
                        onClick={() => {
                          setConversations((prev) => prev.filter((c) => c.id !== active));
                          setMoreMenu(false);
                          newChat();
                        }}
                      >
                        <Icon name="close" size={15} />
                        Delete conversation
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </header>
            <div className="chat-scroll">
              {messages.length ? (
                <div className="thread">
                  <div className="conversation-start">
                    <span />
                    Today, 9:41 AM
                    <span />
                  </div>
                  {messages.map((message) =>
                    message.role === "user" ? (
                      <article className="user-message" key={message.id}>
                        <div className="message-eyebrow">
                          <span>You</span>
                          <span className="tiny-avatar">{name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="user-bubble">
                          {message.attachment && (
                            <div className="message-attachment">
                              <Icon name="attach" size={14} />
                              {message.attachment}
                            </div>
                          )}
                          {message.text}
                        </div>
                        <button
                          className="edit-message"
                          onClick={() => {
                            setDraft(message.text);
                            inputRef.current?.focus();
                          }}
                        >
                          <Icon name="edit" size={12} />
                          Edit message
                        </button>
                      </article>
                    ) : (
                      <article className="assistant-message" key={message.id}>
                        <div className="assistant-heading">
                          <span className="assistant-mark">
                            <Mark />
                          </span>
                          <strong>Axiom</strong>
                          <span className="ai-label">AI</span>
                        </div>
                        <div className="assistant-content">
                          {message.rich && preferences.markdown ? (
                            <>
                              <p>
                                The best routine gives your day a{" "}
                                <strong>rhythm, not a rulebook.</strong> Start with a few small
                                anchors and leave room for being human.
                              </p>
                              <div className="routine-steps">
                                <div className="routine-step">
                                  <span className="step-number">01</span>
                                  <div>
                                    <h3>Give your morning a gentle starting point</h3>
                                    <p>
                                      Before reaching for your phone, take ten minutes for yourself.
                                      A glass of water, a little movement, or writing down your one
                                      priority for the day.
                                    </p>
                                  </div>
                                </div>
                                <div className="routine-step">
                                  <span className="step-number">02</span>
                                  <div>
                                    <h3>Work with your energy, not against it</h3>
                                    <p>
                                      Notice when you naturally feel most alert. Protect that time
                                      for your hardest work, and let the quieter hours hold the
                                      lighter tasks.
                                    </p>
                                  </div>
                                </div>
                                <div className="routine-step">
                                  <span className="step-number">03</span>
                                  <div>
                                    <h3>Create a small shutdown ritual</h3>
                                    <p>
                                      Spend five minutes closing open loops. Note what’s done,
                                      choose tomorrow’s first step, and give yourself permission to
                                      switch off.
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="takeaway">
                                <span className="takeaway-line" />
                                <p>
                                  Start with just one of these tomorrow. A routine that sticks is
                                  one you actually want to come back to.
                                </p>
                              </div>
                            </>
                          ) : (
                            message.text
                              .split("\n")
                              .filter(Boolean)
                              .map((p, i) => <p key={i}>{p}</p>)
                          )}
                        </div>
                        <div className="message-actions">
                          <button onClick={() => copy(message)} title="Copy response">
                            <Icon name={copied === message.id ? "check" : "copy"} size={14} />
                            <span>{copied === message.id ? "Copied" : "Copy"}</span>
                          </button>
                          <button
                            onClick={() => regenerate(message)}
                            disabled={thinking}
                            title="Regenerate response"
                          >
                            <Icon name="refresh" size={14} />
                            <span>Regenerate</span>
                          </button>
                        </div>
                      </article>
                    ),
                  )}
                  {thinking && (
                    <div className="thinking" role="status">
                      <Mark />
                      <span>
                        Axiom is thinking<span className="thinking-dots">...</span>
                      </span>
                    </div>
                  )}
                  <div ref={endRef} />
                </div>
              ) : (
                <div className="empty-state">
                  <div className="welcome-symbol">
                    <Mark />
                  </div>
                  <span className="eyebrow">A LITTLE SPACE FOR BIG IDEAS</span>
                  <h1>What’s on your mind?</h1>
                  <p>
                    A question, a first draft, a different perspective.
                    <br />
                    Let’s find a little clarity together.
                  </p>
                  <div className="suggestions">
                    {[
                      "Help me find my focus",
                      "Explain something simply",
                      "Give an idea a fresh perspective",
                    ].map((text) => (
                      <button
                        onClick={() => {
                          setDraft(text);
                          inputRef.current?.focus();
                        }}
                        key={text}
                      >
                        {text}
                        <Icon name="chevron" size={15} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="composer-area">
              <div className="composer-width">
                {messages.length === 2 && current?.id === "focus" && (
                  <div className="followups">
                    <span>Keep exploring</span>
                    <button
                      onClick={() => {
                        setDraft("Help me plan a gentler morning");
                        inputRef.current?.focus();
                      }}
                    >
                      A gentler morning
                      <Icon name="plus" size={12} />
                    </button>
                    <button
                      onClick={() => {
                        setDraft("How do I make this routine stick?");
                        inputRef.current?.focus();
                      }}
                    >
                      Making it stick
                      <Icon name="plus" size={12} />
                    </button>
                  </div>
                )}
                <form className="composer" onSubmit={send}>
                  {attachment && (
                    <div className="attachment-chip">
                      <Icon name="attach" size={14} />
                      {attachment}
                      <button
                        type="button"
                        aria-label="Remove attachment"
                        onClick={() => setAttachment("")}
                      >
                        <Icon name="close" size={13} />
                      </button>
                    </div>
                  )}
                  <textarea
                    ref={inputRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Ask a question. Explore an idea."
                    rows={2}
                    aria-label="Message Axiom"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                        e.preventDefault();
                        send();
                      }
                    }}
                  />
                  <div className="composer-toolbar">
                    <div className="composer-tools">
                      <input
                        ref={fileRef}
                        type="file"
                        hidden
                        onChange={(e) => {
                          setAttachment(e.target.files?.[0]?.name || "");
                          e.target.value = "";
                        }}
                      />
                      <button
                        type="button"
                        className="icon-button attach-button"
                        title="Attach a file"
                        onClick={() => fileRef.current?.click()}
                      >
                        <Icon name="attach" size={19} />
                      </button>
                    </div>
                    <div className="send-tools">
                      <span>↵ to send</span>
                      <button
                        type="submit"
                        className="send-button"
                        aria-label="Send message"
                        disabled={(!draft.trim() && !attachment) || thinking}
                      >
                        <Icon name="arrow" size={20} />
                      </button>
                    </div>
                  </div>
                </form>
                <div className="composer-disclaimer">
                  <span>A little intelligence. A lot of possibility.</span>
                  <span>Axiom can make mistakes. Check important information.</span>
                </div>
              </div>
            </div>
          </main>
        </>
      ) : (
        <main className="auth-page">
          <header className="auth-header">
            <a
              href="#"
              className="auth-home-link"
              onClick={(e) => {
                e.preventDefault();
                setView("chat");
              }}
            >
              <Icon name="arrowLeft" size={18} />
              <span>Your conversations</span>
            </a>
            <button className="auth-appearance" onClick={() => openSettings("Appearance")}>
              <SettingsIcon />
              <span>Appearance</span>
            </button>
          </header>
          <div className="auth-layout">
            <section className="auth-story">
              <span className="eyebrow">
                <span className="status-dot" />
                YOUR SPACE TO THINK CLEARER
              </span>
              <h1>
                A little intelligence.
                <br />A world of
                <br />
                <span>possibility.</span>
              </h1>
              <p>
                For the questions worth asking.
                <br />
                The ideas worth exploring.
                <br />
                And everything in between.
              </p>
              <div className="sculpture" aria-hidden="true">
                <div className="sculpture-shadow" />
                <div className="sculpture-ring ring-a" />
                <div className="sculpture-ring ring-b" />
                <div className="sculpture-ring ring-c" />
                <div className="sculpture-core">
                  <Mark />
                </div>
                <span className="sculpture-caption">A NEW DIMENSION OF THINKING</span>
              </div>
              <div className="story-footer">
                <span className="small-rule" />A different perspective starts here.
              </div>
            </section>
            <section className="auth-form-section">
              <button className="back-to-chat" onClick={() => setView("chat")}>
                <Icon name="arrowLeft" size={16} />
                Back to conversation
              </button>
              <div className="auth-form-wrap">
                <span className="auth-form-icon">
                  <Mark />
                </span>
                <span className="eyebrow">YOUR SPACE TO THINK CLEARER</span>
                <h2>
                  {view === "signup"
                    ? "Make room for possibility."
                    : view === "reset"
                      ? "A fresh start."
                      : "Good to have you back."}
                </h2>
                <p className="auth-description">
                  {view === "signup"
                    ? "Your next great idea starts with a conversation."
                    : view === "reset"
                      ? "Enter your email to request a password reset."
                      : "Pick up your thoughts right where you left them."}
                </p>
                <form className="auth-form" onSubmit={authSubmit}>
                  {view === "signup" && (
                    <label>
                      Your name
                      <input
                        autoComplete="name"
                        placeholder="How should we call you?"
                        required
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                      />
                    </label>
                  )}
                  <label>
                    {view === "login" ? "Email or username" : "Email address"}
                    <input
                      type={view === "login" ? "text" : "email"}
                      placeholder={
                        view === "login" ? "Enter your email or username" : "you@example.com"
                      }
                      autoComplete={view === "login" ? "username" : "email"}
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      required
                    />
                  </label>
                  {view !== "reset" && (
                    <label>
                      <span className="password-label">
                        Password
                        {view === "login" && (
                          <button type="button" onClick={() => setView("reset")}>
                            Forgot password?
                          </button>
                        )}
                      </span>
                      <span className="password-input">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder={
                            view === "signup"
                              ? "Create a password (8+ characters)"
                              : "Enter your password"
                          }
                          autoComplete={view === "signup" ? "new-password" : "current-password"}
                          minLength={view === "signup" ? 8 : 1}
                          required
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
                  )}
                  <button className="auth-submit" type="submit">
                    {view === "signup"
                      ? "Create your account"
                      : view === "reset"
                        ? "Send reset link"
                        : "Log in"}
                    <Icon name="arrowLeft" size={17} />
                  </button>
                </form>
                {view !== "reset" && (
                  <>
                    <div className="auth-divider">
                      <span />
                      or continue with
                      <span />
                    </div>
                    <button
                      className="google-button"
                      onClick={() =>
                        setNotice("Google sign-in is not connected in this interactive prototype.")
                      }
                    >
                      <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          d="M21.8 12.2c0-.7-.1-1.4-.2-2.1H12v4h5.5a4.7 4.7 0 0 1-2 3.1v2.6h3.3c1.9-1.8 3-4.3 3-7.6Z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 22c2.7 0 5-.9 6.8-2.4l-3.3-2.6c-.9.6-2.1 1-3.5 1a6 6 0 0 1-5.7-4.2H2.9v2.7A10.2 10.2 0 0 0 12 22Z"
                          fill="#34A853"
                        />
                        <path
                          d="M6.3 13.8a6 6 0 0 1 0-3.6V7.5H2.9a10 10 0 0 0 0 9l3.4-2.7Z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A9.7 9.7 0 0 0 12 2a10.2 10.2 0 0 0-9.1 5.5l3.4 2.7A6 6 0 0 1 12 6Z"
                          fill="#EA4335"
                        />
                      </svg>
                      Continue with Google
                    </button>
                  </>
                )}
                <p className="auth-switch">
                  {view === "signup"
                    ? "Already have an account?"
                    : view === "reset"
                      ? "Remember your password?"
                      : "New to Axiom?"}{" "}
                  <button
                    onClick={() => {
                      setView(view === "login" ? "signup" : "login");
                      setShowPassword(false);
                    }}
                  >
                    {view === "login" ? "Create an account" : "Log in"}
                    <Icon name="chevron" size={13} />
                  </button>
                </p>
                <p className="prototype-note">Interactive preview · No account required</p>
              </div>
            </section>
          </div>
          <footer className="auth-footer">
            <span>© {new Date().getFullYear()} Axiom</span>
            <span>Thoughtfully built for curious minds.</span>
          </footer>
        </main>
      )}
      {settingsTab && (
        <Settings
          initialTab={settingsTab}
          onClose={closeSettings}
          theme={theme}
          setTheme={setTheme}
          preferences={preferences}
          onSave={setPreferences}
          name={name}
          email={profileEmail || authEmail}
          birthday={birthday}
          onProfileSave={(nextName, email, dob) => {
            setName(nextName);
            setProfileEmail(email);
            setBirthday(dob);
          }}
        />
      )}
      {notice && (
        <div className="toast" role="status">
          <Icon name="check" size={16} />
          {notice}
          <button aria-label="Dismiss notification" onClick={() => setNotice("")}>
            <Icon name="close" size={15} />
          </button>
        </div>
      )}
      {rename && (
        <div className="modal-backdrop" onClick={() => setRename(false)}>
          <form
            className="rename-modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              if (!newTitle.trim()) return;
              setConversations((prev) =>
                prev.map((c) => (c.id === active ? { ...c, title: newTitle.trim() } : c)),
              );
              setRename(false);
            }}
          >
            <h2>Rename conversation</h2>
            <label>
              Conversation name
              <input
                autoFocus
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />
            </label>
            <div>
              <button type="button" onClick={() => setRename(false)}>
                Cancel
              </button>
              <button type="submit" className="save-button">
                Save changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
