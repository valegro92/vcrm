/**
 * UI Configuration Context
 * Manages schema-driven UI configuration for the app
 *
 * SAFE IMPLEMENTATION: Falls back to defaults if anything fails
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/api';

// Default config (fallback if API fails)
const DEFAULT_CONFIG = {
  version: "1.0",
  theme: {
    mode: "light",
    primaryColor: "#6366f1",
    accentColor: "#8b5cf6",
    borderRadius: "medium",
    density: "normal"
  },
  navigation: {
    position: "sidebar",
    collapsed: false,
    showLabels: true
  },
  homePage: "dashboard",
  pages: {},
  globalSettings: {
    dateFormat: "DD/MM/YYYY",
    currency: "EUR",
    language: "it",
    forfettarioLimit: 85000,
    showAIChat: true
  }
};

const UIConfigContext = createContext(null);

export function UIConfigProvider({ children, isAuthenticated }) {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDefault, setIsDefault] = useState(true);

  // Load config from API
  const loadConfig = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const data = await api.getUIConfig();
      if (data && data.config) {
        setConfig(data.config);
        setIsDefault(data.isDefault || false);
        applyTheme(data.config.theme);
      }
    } catch (err) {
      console.error('[UIConfig] Failed to load config, using defaults:', err);
      setError(err.message);
      // Keep using default config - app continues to work
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Apply theme CSS variables
  const applyTheme = useCallback((theme) => {
    if (!theme) return;

    const root = document.documentElement;

    // Apply mode (light/dark)
    if (theme.mode) {
      root.setAttribute('data-theme', theme.mode);
    }

    // Apply primary color and generate palette
    if (theme.primaryColor) {
      root.style.setProperty('--brand-primary', theme.primaryColor);
      root.style.setProperty('--primary-500', theme.primaryColor);
      // Generate lighter/darker variants
      root.style.setProperty('--primary-400', adjustColor(theme.primaryColor, 20));
      root.style.setProperty('--primary-600', adjustColor(theme.primaryColor, -20));
      root.style.setProperty('--primary-100', adjustColor(theme.primaryColor, 80));
      root.style.setProperty('--primary-50', adjustColor(theme.primaryColor, 90));
    }

    // Apply accent color
    if (theme.accentColor) {
      root.style.setProperty('--brand-secondary', theme.accentColor);
    }

    // Apply border radius
    if (theme.borderRadius) {
      const radiusMap = {
        none: '0px',
        small: '6px',
        medium: '12px',
        large: '20px'
      };
      root.style.setProperty('--radius-md', radiusMap[theme.borderRadius] || '12px');
    }

    // Apply density
    if (theme.density) {
      const densityMap = {
        compact: '0.85',
        normal: '1',
        comfortable: '1.15'
      };
      root.style.setProperty('--density-scale', densityMap[theme.density] || '1');
    }

    // Apply font size
    if (theme.fontSize) {
      const fontSizeMap = {
        small: '13px',
        medium: '14px',
        large: '16px'
      };
      root.style.setProperty('--font-size-base', fontSizeMap[theme.fontSize] || '14px');
    }

    // Apply font family
    if (theme.fontFamily) {
      const fontFamilyMap = {
        system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        inter: '"Inter", -apple-system, sans-serif',
        roboto: '"Roboto", -apple-system, sans-serif'
      };
      root.style.setProperty('--font-family', fontFamilyMap[theme.fontFamily] || fontFamilyMap.system);
    }
  }, []);

  // Update theme
  const updateTheme = useCallback(async (newTheme) => {
    try {
      await api.updateUITheme(newTheme);
      const updatedConfig = {
        ...config,
        theme: { ...config.theme, ...newTheme }
      };
      setConfig(updatedConfig);
      applyTheme(updatedConfig.theme);
      return { success: true };
    } catch (err) {
      console.error('[UIConfig] Failed to update theme:', err);
      return { success: false, error: err.message };
    }
  }, [config, applyTheme]);

  // Reset to default
  const resetConfig = useCallback(async () => {
    try {
      const data = await api.resetUIConfig();
      if (data && data.config) {
        setConfig(data.config);
        setIsDefault(true);
        applyTheme(data.config.theme);
      }
      return { success: true };
    } catch (err) {
      console.error('[UIConfig] Failed to reset config:', err);
      return { success: false, error: err.message };
    }
  }, [applyTheme]);

  // Load config when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadConfig();
    } else {
      // Reset to default when logged out
      setConfig(DEFAULT_CONFIG);
      setIsDefault(true);
    }
  }, [isAuthenticated, loadConfig]);

  const value = {
    config,
    loading,
    error,
    isDefault,
    updateTheme,
    resetConfig,
    reloadConfig: loadConfig
  };

  return (
    <UIConfigContext.Provider value={value}>
      {children}
    </UIConfigContext.Provider>
  );
}

// Hook to use UI config
export function useUIConfig() {
  const context = useContext(UIConfigContext);
  if (!context) {
    // Return safe defaults if used outside provider
    return {
      config: DEFAULT_CONFIG,
      loading: false,
      error: null,
      isDefault: true,
      updateTheme: async () => ({ success: false }),
      resetConfig: async () => ({ success: false }),
      reloadConfig: async () => {}
    };
  }
  return context;
}

// Helper: Adjust color brightness
function adjustColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, (num >> 8 & 0x00FF) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
  return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
}

export default UIConfigContext;
