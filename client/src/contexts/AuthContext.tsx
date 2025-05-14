import React, { createContext, useReducer, useEffect } from "react";
import { AuthState, AuthContextType, RegisterData } from "@/types";
import { apiRequest } from "@/lib/queryClient";
import { User } from "@shared/schema";

// Create context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define action types
type AuthAction =
  | { type: "LOGIN_START" | "REGISTER_START" | "LOGOUT_START" | "CLEAR_ERROR" }
  | { type: "LOGIN_SUCCESS" | "REGISTER_SUCCESS"; payload: User }
  | { type: "LOGIN_FAILURE" | "REGISTER_FAILURE" | "LOGOUT_FAILURE"; payload: string }
  | { type: "LOGOUT_SUCCESS" };

// Reducer function
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN_START":
    case "REGISTER_START":
    case "LOGOUT_START":
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case "LOGIN_SUCCESS":
    case "REGISTER_SUCCESS":
      return {
        ...state,
        isLoading: false,
        user: action.payload,
        error: null,
      };
    case "LOGIN_FAILURE":
    case "REGISTER_FAILURE":
    case "LOGOUT_FAILURE":
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case "LOGOUT_SUCCESS":
      return {
        ...state,
        isLoading: false,
        user: null,
        error: null,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Initial state
const initialState: AuthState = {
  user: null,
  isLoading: true,
  error: null,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is logged in on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Checking authentication status...");
        const res = await fetch('/api/auth/user', {
          credentials: 'include',
        });
        
        if (res.ok) {
          const user = await res.json();
          console.log("User authenticated:", user);
          dispatch({ type: "LOGIN_SUCCESS", payload: user });
        } else {
          console.log("Authentication failed:", await res.text());
          dispatch({ type: "LOGOUT_SUCCESS" });
        }
      } catch (error) {
        console.error("Authentication check error:", error);
        dispatch({ type: "LOGOUT_SUCCESS" });
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (username: string, password: string) => {
    dispatch({ type: "LOGIN_START" });
    try {
      console.log("Attempting login with credentials:", { username });
      const res = await apiRequest("POST", "/api/auth/login", { username, password });
      const user = await res.json();
      console.log("Login successful:", user);
      dispatch({ type: "LOGIN_SUCCESS", payload: user });
    } catch (error) {
      let errorMessage = "Error al iniciar sesión";
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error("Login error:", errorMessage);
      }
      dispatch({ type: "LOGIN_FAILURE", payload: errorMessage });
      throw error; // Rethrow to let the hook handle it
    }
  };

  // Register function
  const register = async (userData: RegisterData) => {
    dispatch({ type: "REGISTER_START" });
    try {
      console.log("Attempting registration with username:", userData.username);
      const res = await apiRequest("POST", "/api/auth/register", userData);
      const user = await res.json();
      console.log("Registration successful:", user);
      dispatch({ type: "REGISTER_SUCCESS", payload: user });
    } catch (error) {
      let errorMessage = "Error al registrarse";
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error("Registration error:", errorMessage);
      }
      dispatch({ type: "REGISTER_FAILURE", payload: errorMessage });
      throw error; // Rethrow to let the hook handle it
    }
  };

  // Logout function
  const logout = async () => {
    dispatch({ type: "LOGOUT_START" });
    try {
      console.log("Attempting to logout");
      await apiRequest("POST", "/api/auth/logout", {});
      console.log("Logout successful");
      dispatch({ type: "LOGOUT_SUCCESS" });
    } catch (error) {
      let errorMessage = "Error al cerrar sesión";
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error("Logout error:", errorMessage);
      }
      dispatch({ type: "LOGOUT_FAILURE", payload: errorMessage });
      throw error; // Rethrow to let the hook handle it
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
