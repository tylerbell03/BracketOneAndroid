import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useMemo } from "react";
import { create } from "zustand";
import { Platform } from "react-native";
import { useAuthModal, useAuthStore, authKey } from "./store";
import { isJWTValid } from "./jwtUtils";

/**
 * This hook provides authentication functionality.
 * It may be easier to use the `useAuthModal` or `useRequireAuth` hooks
 * instead as those will also handle showing authentication to the user
 * directly.
 */
export const useAuth = () => {
  const { isReady, auth, setAuth } = useAuthStore();
  const { isOpen, close, open } = useAuthModal();

  const initiate = useCallback(async () => {
    try {
      const storedAuth = await SecureStore.getItemAsync(authKey);

      if (!storedAuth) {
        useAuthStore.setState({ auth: null, isReady: true });
        return;
      }

      const auth = JSON.parse(storedAuth);

      // Validate JWT if present
      if (auth?.jwt) {
        if (!isJWTValid(auth.jwt)) {
          // JWT is expired or invalid, clear it
          await SecureStore.deleteItemAsync(authKey);
          useAuthStore.setState({ auth: null, isReady: true });
          return;
        }
      }

      useAuthStore.setState({ auth, isReady: true });
    } catch (error) {
      console.error("Failed to initialize auth:", error);
      // Clear corrupted auth data
      try {
        await SecureStore.deleteItemAsync(authKey);
      } catch (e) {
        // Ignore cleanup errors
      }
      useAuthStore.setState({ auth: null, isReady: true });
    }
  }, []);

  useEffect(() => {}, []);

  const signIn = useCallback(() => {
    open({ mode: "signin" });
  }, [open]);

  const signUp = useCallback(() => {
    open({ mode: "signup" });
  }, [open]);

  const signOut = useCallback(async () => {
    try {
      // Call backend logout endpoint to invalidate session and clear cookies
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      }).catch((err) => {
        // Log but don't block logout on network error
        console.warn("Server logout failed:", err);
      });

      // Clear local auth state
      await setAuth(null);

      close();
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear local state even if server logout fails
      await setAuth(null);
      close();
    }
  }, [setAuth, close]);

  return {
    isReady,
    isAuthenticated: isReady ? !!auth : null,
    signIn,
    signOut,
    signUp,
    auth,
    setAuth,
    initiate,
  };
};

/**
 * This hook will automatically open the authentication modal if the user is not authenticated.
 */
export const useRequireAuth = (options) => {
  const { isAuthenticated, isReady } = useAuth();
  const { open } = useAuthModal();

  useEffect(() => {
    if (!isAuthenticated && isReady) {
      open({ mode: options?.mode });
    }
  }, [isAuthenticated, open, options?.mode, isReady]);
};

export default useAuth;
