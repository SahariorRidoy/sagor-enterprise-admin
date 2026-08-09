"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { ReactNode, useEffect } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { setUser } from "@/redux/featured/auth/authSlice";

type Props = {
  children: ReactNode;
};

function SessionSyncComponent({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (session?.user) {
      dispatch(setUser({
        user: session.user,
        accessToken: (session as any).accessToken ?? null,
      }));
    }
  }, [session, dispatch]);

  return <>{children}</>;
}

export const AuthProvider = ({ children }: Props) => {
  return (
    <SessionProvider>
      <SessionSyncComponent>{children}</SessionSyncComponent>
    </SessionProvider>
  );
};
