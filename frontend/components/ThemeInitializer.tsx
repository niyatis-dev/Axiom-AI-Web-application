"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchSettings } from "@/lib/settingsApi";

export default function ThemeInitializer() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const applyTheme = (theme: string, accent_color?: string, compact_mode?: boolean, animations?: boolean) => {
      const root = document.documentElement;
      
      // Handle theme
      const isLight = theme === 'light' || (theme === 'system' && window.matchMedia?.('(prefers-color-scheme: light)').matches);
      if (isLight) {
        root.dataset.theme = 'light';
        root.classList.add('light');
        root.classList.remove('dark');
      } else {
        root.dataset.theme = 'dark';
        root.classList.add('dark');
        root.classList.remove('light');
      }

      // Handle accent color
      if (accent_color) {
        root.style.setProperty('--accent', accent_color);
        root.style.setProperty('--accent-color', accent_color);
      } else {
        root.style.removeProperty('--accent');
        root.style.removeProperty('--accent-color');
      }

      // Handle compact mode
      root.dataset.compact = String(Boolean(compact_mode));
      if (compact_mode) {
        root.classList.add('compact');
      } else {
        root.classList.remove('compact');
      }

      // Handle animations
      root.dataset.motion = String(animations !== false);
      if (animations === false) {
        root.classList.add('no-animations');
      } else {
        root.classList.remove('no-animations');
      }
    };

    if (isAuthenticated) {
      fetchSettings().then((data) => {
        if (data?.appearance) {
          applyTheme(
            data.appearance.theme || 'dark',
            data.appearance.accent_color,
            data.appearance.compact_mode,
            data.appearance.animations !== false
          );
        }
      }).catch(console.error);
    } else {
      // Apply defaults for guests
      applyTheme('dark', '#6366f1', false, true);
    }
  }, [isAuthenticated]);

  return null;
}
