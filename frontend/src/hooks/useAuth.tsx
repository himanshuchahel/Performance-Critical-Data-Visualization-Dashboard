import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  getCurrentUser,
  login as authLogin,
  register as authRegister,
  logout as authLogout,
} from "@/api/auth";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    let cancelled = false;

    setLoading(true);

    getCurrentUser()
      .then((res) => {
        if (cancelled) return;

        if (res.success && res.user) {
          setUser(res.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setUser(null);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authLogin({
        email,
        password,
      });

      if (res.success && res.user) {
        setUser(res.user);
        return;
      }

      throw new Error(res.message || "Login failed");
    },
    []
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await authRegister({
        name,
        email,
        password,
      });

      if (res.success) {
        // Registration does not authenticate the user.
        // User will be redirected to Login.
        return;
      }

      throw new Error(res.message || "Registration failed");
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await authLogout();
    } finally {
      setUser(null);
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return ctx;
}
