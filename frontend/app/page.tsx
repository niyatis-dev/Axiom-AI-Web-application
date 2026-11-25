"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import ChatWindow from "@/components/ChatWindow";
import ChatInput from "@/components/ChatInput";
import SettingsModal from "@/components/SettingsModal";
import ProfileModal from "@/components/ProfileModal";
import { SettingsTab, Icon } from "@/components/FigmaIcons";
import { useChat } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const {
    messages,
    input,
    setInput,
    sendMessage,
    isRestoring,
    conversationId,
    selectedConversation,
    renameConversation,
  } = useChat();

  const { loading: authLoading } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  // Rename modal state
  const [renameOpen, setRenameOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  // Toast notification state
  const [notice, setNotice] = useState("");

  const handleOpenSettings = (tab: SettingsTab) => {
    setSettingsTab(tab);
  };

  const handleRenameRequest = () => {
    setNewTitle(selectedConversation?.title || "");
    setRenameOpen(true);
  };

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !conversationId) return;
    try {
      await renameConversation(conversationId, newTitle.trim());
      setRenameOpen(false);
      setNotice("Conversation renamed");
      setTimeout(() => setNotice(""), 3000);
    } catch (err) {
      console.error("Failed to rename conversation:", err);
    }
  };

  const handleSelectSuggestion = (text: string) => {
    setInput(text);
  };

  if (authLoading) {
    return (
      <main className="app" style={{ alignItems: "center", justifyContent: "center" }}>
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </main>
    );
  }

  return (
    <div className={`app ${collapsed ? "sidebar-collapsed" : ""}`}>
      {/* Mobile scrim backdrop */}
      {sidebarOpen && (
        <button
          type="button"
          className="mobile-scrim"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        openSettings={handleOpenSettings}
        openProfile={() => setProfileOpen(true)}
      />

      {/* Main Content Area */}
      <main className="main">
        <Header
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          setSidebar={setSidebarOpen}
          onRenameRequest={handleRenameRequest}
        />

        {isRestoring ? (
          <div className="flex-1 flex items-center justify-center h-full">
            <div className="w-7 h-7 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          </div>
        ) : (
          <ChatWindow
            messages={messages}
            onSelectSuggestion={handleSelectSuggestion}
          />
        )}

        <ChatInput
          input={input}
          setInput={setInput}
          sendMessage={sendMessage}
        />
      </main>

      {/* Settings Modal */}
      {settingsTab && (
        <SettingsModal
          initialTab={settingsTab}
          open={Boolean(settingsTab)}
          onClose={() => setSettingsTab(null)}
        />
      )}

      {/* Profile Modal */}
      {profileOpen && (
        <ProfileModal
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
        />
      )}

      {/* Rename Conversation Modal */}
      {renameOpen && (
        <div className="modal-backdrop" onClick={() => setRenameOpen(false)}>
          <form
            className="rename-modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleRenameSubmit}
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
              <button type="button" onClick={() => setRenameOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="save-button">
                Save changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toast Notification */}
      {notice && (
        <div className="toast" role="status">
          <Icon name="check" size={16} />
          <span>{notice}</span>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
          >
            <Icon name="close" size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
