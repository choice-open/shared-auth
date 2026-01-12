/**
 * Store 工具函数
 */

import type { Observable } from "@legendapp/state";
import type { TokenStorage } from "../api";
import type { AuthState, SessionUser } from "../types";
import type { StoreActions } from "./actions";

export function getCurrentUser(
  authStore: Observable<AuthState>
): SessionUser | null {
  return authStore.user.get();
}

export function getCurrentUserId(
  authStore: Observable<AuthState>
): string | null {
  return authStore.user.get()?.id ?? null;
}

export function isAuthenticated(authStore: Observable<AuthState>): boolean {
  return authStore.isAuthenticated.get();
}

export function isLoading(authStore: Observable<AuthState>): boolean {
  return authStore.loading.get();
}

export function isLoaded(authStore: Observable<AuthState>): boolean {
  return authStore.isLoaded.get();
}

export async function waitForAuth(
  authStore: Observable<AuthState>
): Promise<void> {
  if (authStore.isLoaded.get()) return;

  return new Promise((resolve) => {
    const check = () => {
      if (authStore.isLoaded.get()) {
        resolve();
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  });
}

export function getAuthTokenSync(tokenStorage: TokenStorage): string | null {
  return tokenStorage.get();
}

export async function getAuthToken(
  tokenStorage: TokenStorage
): Promise<string | null> {
  return tokenStorage.get();
}

export function getAuthHeadersSync(
  tokenStorage: TokenStorage
): Record<string, string> {
  const token = tokenStorage.get();
  if (!token) return {};
  return { Authorization: `Bearer ${encodeURIComponent(token)}` };
}

export async function getAuthHeaders(
  tokenStorage: TokenStorage
): Promise<Record<string, string>> {
  return getAuthHeadersSync(tokenStorage);
}

export function handle401Response(
  response: Response,
  storeActions: StoreActions
): Response {
  if (response.status === 401) {
    storeActions.handleUnauthorized();
  }
  return response;
}

export function createUserManager(authStore: Observable<AuthState>) {
  return {
    getUser: () => getCurrentUser(authStore),
    getUserId: () => getCurrentUserId(authStore),
  };
}
