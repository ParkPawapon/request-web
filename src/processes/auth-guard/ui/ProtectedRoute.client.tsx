"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import {
  getHomePathForUser,
  isAllowedRole,
  logoutSession,
  refreshCurrentUser,
  type AuthRole,
  type SessionUser,
} from "@/entities/session";
import { SessionContextProvider } from "@/entities/session/lib/session-context.client";
import { FullPageLoader } from "@/shared/ui/full-page-loader";

type GuardState = Readonly<{
  loading: boolean;
  me: SessionUser | null;
  ok: boolean;
}>;

type ProtectedRouteProps = Readonly<{
  allow: readonly AuthRole[];
  children: ReactNode;
}>;

export function ProtectedRoute({ allow, children }: ProtectedRouteProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [state, setState] = useState<GuardState>({
    loading: true,
    me: null,
    ok: false,
  });

  useEffect(() => {
    let alive = true;
    const controller = new AbortController();

    async function checkSession() {
      setState((current) => ({ ...current, loading: true }));
      try {
        const me = await refreshCurrentUser(controller.signal);
        if (!alive) return;

        if (!me) {
          setState({ loading: false, me: null, ok: false });
          router.replace("/");
          return;
        }

        if (!isAllowedRole(me, allow)) {
          setState({ loading: false, me, ok: false });
          router.replace(getHomePathForUser(me));
          return;
        }

        setState({ loading: false, me, ok: true });
      } catch {
        if (!alive) return;
        setState({ loading: false, me: null, ok: false });
        router.replace("/");
      }
    }

    void checkSession();
    return () => {
      alive = false;
      controller.abort();
    };
  }, [allow, pathname, router]);

  const value = useMemo(
    () => ({
      logout: async () => {
        await logoutSession();
        router.replace("/");
      },
      me: state.me,
    }),
    [router, state.me],
  );

  if (state.loading) {
    return <FullPageLoader label="กำลังตรวจสอบสิทธิ์เข้าสู่ระบบ..." />;
  }

  if (!state.ok) {
    return null;
  }

  return (
    <SessionContextProvider value={value}>{children}</SessionContextProvider>
  );
}
