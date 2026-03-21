import { User } from "@/types/user";

export interface AuthState {
  loading: boolean;
  error?: string;
  user?: User;
  mode: "login" | "signup";
  role: "passenger" | "operator";
}

export type AuthAction =
  | { type: "START" }
  | { type: "SUCCESS"; user: User }
  | { type: "FAIL"; error: string }
  | { type: "SET_MODE"; mode: AuthState["mode"] }
  | { type: "SET_ROLE"; role: AuthState["role"] }
  | { type: "RESET" };

export const initialAuthState: AuthState = {
  loading: false,
  mode: "login",
  role: "passenger",
};

export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "START":
      return { ...state, loading: true, error: undefined };
    case "SUCCESS":
      return { ...state, loading: false, user: action.user, error: undefined };
    case "FAIL":
      return { ...state, loading: false, error: action.error };
    case "SET_MODE":
      return { ...state, mode: action.mode };
    case "SET_ROLE":
      return { ...state, role: action.role };
    case "RESET":
      return initialAuthState;
    default:
      return state;
  }
}
