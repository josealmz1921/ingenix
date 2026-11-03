'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onIdTokenChanged, signOut, type User } from 'firebase/auth';
import { getClientAuth } from '@/src/firebase/firebase';

type Access = { loading: boolean; user: User | null; isAdmin: boolean; error: string };
const AuthContext = createContext<Access>({ loading: true, user: null, isAdmin: false, error: '' });

/** UI protection only. Every data endpoint independently checks identity and claims. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [access, setAccess] = useState<Access>({
    loading: true,
    user: null,
    isAdmin: false,
    error: '',
  });

  useEffect(() => {
    let generation = 0;
    let disposed = false;
    let unsubscribe = () => {};

    async function connect() {
      try {
        const { getClientAuth } = await import('@/src/firebase/firebase');
        if (disposed) return;
        unsubscribe = onIdTokenChanged(getClientAuth(), async (user) => {
          const current = ++generation;
          // Refreshing a token must not unmount an editor and discard its local draft.
          setAccess((previous) =>
            user && previous.user?.uid === user.uid && !previous.loading
              ? previous
              : { loading: true, user: null, isAdmin: false, error: '' },
          );
          try {
            const isAdmin = user ? (await user.getIdTokenResult()).claims.admin === true : false;
            if (current === generation) setAccess({ loading: false, user, isAdmin, error: '' });
          } catch {
            if (current === generation) {
              setAccess({
                loading: false,
                user: null,
                isAdmin: false,
                error: 'No se pudo verificar la sesión.',
              });
            }
          }
        });
      } catch (error) {
        if (!disposed) {
          setAccess({
            loading: false,
            user: null,
            isAdmin: false,
            error: error instanceof Error ? error.message : 'Acceso no disponible.',
          });
        }
      }
    }

    void connect();
    return () => {
      disposed = true;
      generation++;
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={access}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAdminAccess = () => useContext(AuthContext);
export const logout = () => signOut(getClientAuth());
