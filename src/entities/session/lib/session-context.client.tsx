"use client";

import { createContext, useContext } from "react";

import type { SessionUser } from "../model/types";

export type SessionContextValue = Readonly<{
  logout: () => Promise<void>;
  me: SessionUser | null;
}>;

const SessionContext = createContext<SessionContextValue | null>(null);

export const SessionContextProvider = SessionContext.Provider;

export function useSession(): SessionContextValue {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error("useSession must be used inside ProtectedRoute.");
  }
  return value;
}
