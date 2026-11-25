"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/FigmaIcons";
import { useAuth } from "@/context/AuthContext";

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

const validateDob = (dobString: string): string | null => {
  if (!dobString || !dobString.trim()) return null;
  const trimmed = dobString.trim();

  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return "Invalid date of birth format. Must be YYYY-MM-DD.";
  }

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);

  const dateObj = new Date(year, month - 1, day);
  if (
    dateObj.getFullYear() !== year ||
    dateObj.getMonth() !== month - 1 ||
    dateObj.getDate() !== day
  ) {
    return "Invalid calendar date.";
  }

  if (year < 1900) {
    return "Date of birth year must be 1900 or later.";
  }

  if (year > 2016) {
    return "Date of birth must be 2016 or earlier.";
  }

  const now = new Date();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  if (dateObj > todayEnd) {
    return "Date of birth cannot be in the future.";
  }

  return null;
};

export default function ProfileModal({ open, onClose }: ProfileModalProps) {
  const { user, updateProfile } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [dob, setDob] = useState("");
  const [avatar, setAvatar] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open && user) {
      setUsername(user.username || "");
      setDob(user.dob ? user.dob.split("T")[0] : "");
      setAvatar(user.avatar || "");
      setIsEditing(false);
      setError("");
      setSaved(false);
    }
  }, [open, user]);

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

  if (!mounted || !open) return null;

  const displayName = username || user?.username || "User";
  const avatarLetter = (displayName || "A").charAt(0).toUpperCase();

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");

    const trimmed = username.trim();
    if (!trimmed) {
      setError("Username cannot be empty");
      return;
    }

    if (dob && dob.trim()) {
      const dobError = validateDob(dob.trim());
      if (dobError) {
        setError(dobError);
        return;
      }
    }

    setSaving(true);
    try {
      await updateProfile({
        username: trimmed,
        avatar: avatar ? avatar : null,
        dob: dob && dob.trim() ? dob.trim() : null,
      });
      setIsEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setError(err?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setUsername(user.username || "");
      setDob(user.dob ? user.dob.split("T")[0] : "");
      setAvatar(user.avatar || "");
    }
    setIsEditing(false);
    setError("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("Image size must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatar(event.target.result as string);
        setError("");
      }
    };
    reader.onerror = () => {
      setError("Failed to read the file");
    };
    reader.readAsDataURL(file);
  };

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="profile-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="profile-dialog-header">
          <h2>Profile</h2>
          <button
            type="button"
            className="icon-button"
            aria-label="Close profile"
            onClick={onClose}
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        {/* Hero */}
        <div className="profile-hero">
          {isEditing && (
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleFileChange}
            />
          )}

          <div className="profile-avatar-wrap">
            {avatar ? (
              <img
                src={avatar}
                alt="Avatar"
                className="profile-avatar-3d"
                style={{ objectFit: "cover" }}
              />
            ) : (
              <span className="profile-avatar-3d">
                {avatarLetter}
              </span>
            )}

            {isEditing && (
              <button
                type="button"
                className="profile-avatar-upload"
                onClick={() => fileInputRef.current?.click()}
                title="Change avatar"
              >
                <Icon name="edit" size={11} />
              </button>
            )}
          </div>

          <h3>{displayName}</h3>

          <span className="version-badge">
            Free plan
          </span>

          <button
            type="button"
            className="profile-edit"
            onClick={() => {
              if (isEditing) {
                handleCancel();
              } else {
                setIsEditing(true);
              }
            }}
          >
            {isEditing ? "Cancel editing" : "Edit profile"}
          </button>
        </div>

        {/* Error / Success Alerts */}
        {error && <div className="profile-alert error">{error}</div>}
        {saved && <div className="profile-alert success">Profile updated successfully ✓</div>}

        {/* Profile Fields Form */}
        <form id="profile-form" className="profile-fields" onSubmit={handleSave}>
          <label>
            Username
            <input
              type="text"
              required
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
              }}
              disabled={!isEditing}
            />
          </label>

          <label>
            Email address
            <input
              type="email"
              value={user?.email || "Not provided"}
              disabled
              title="Email cannot be edited directly"
            />
          </label>

          <label>
            Date of birth <span>Optional</span>
            <input
              type={isEditing ? "date" : "text"}
              value={isEditing ? dob : (dob || "Not set")}
              onChange={(e) => {
                setDob(e.target.value);
                setError("");
              }}
              max={new Date().toISOString().split("T")[0]}
              disabled={!isEditing}
            />
          </label>

          {isEditing && (
            <div className="profile-actions">
              <button
                type="button"
                className="profile-cancel-btn"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="save-button"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>,
    document.body
  );
}
