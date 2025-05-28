import React, { createContext, useReducer, useEffect } from "react";
import { AuthState, AuthContextType, RegisterData } from "@/types";
import { userStorage, initializeDemoData } from "@/lib/localStorage";

// Create context
export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  error: null,
  login: async () => { throw new Error("Function not implemented") },
  register: async () => { throw new Error("Function not implemented") },
  logout: async () => { throw new Error("Function not implemented") },
  clearError: () => { /* Function not implemented */ }
});

// Define action types
type AuthAction =
  | { type: "LOGIN_START" | "REGISTER_START" | "LOGOUT_START" | "CLEAR_ERROR" }
  | { type: "LOGIN_SUCCESS" | "REGISTER_SUCCESS"; payload: any }
  | { type: "LOGIN_FAILURE" | "REGISTER_FAILURE" | "LOGOUT_FAILURE"; payload: string }
  | { type: "LOGOUT_SUCCESS" }
  | { type: "INIT_COMPLETE" };

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
    case "INIT_COMPLETE":
      return {
        ...state,
        isLoading: false,
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
        
        // Initialize demo data if needed
        initializeDemoData();
        
        // Check if user is logged in
        const user = userStorage.get();
        const isLoggedIn = userStorage.isLoggedIn();
        
        if (user && isLoggedIn) {
          console.log("User authenticated from localStorage:", user);
          dispatch({ type: "LOGIN_SUCCESS", payload: user });
        } else {
          console.log("No authenticated user found");
          dispatch({ type: "INIT_COMPLETE" });
        }
      } catch (error) {
        console.error("Authentication check error:", error);
        dispatch({ type: "INIT_COMPLETE" });
      }
    };

    checkAuth();
  }, []);

  // Login function (no backend, just localStorage)
  const login = async (username: string, password: string) => {
    dispatch({ type: "LOGIN_START" });
    try {
      console.log("Attempting login with username:", username);
      
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simple demo authentication
      if (username === "demo" && password === "demo123") {
        const user = userStorage.login(username);
        console.log("Login successful:", user);
        dispatch({ type: "LOGIN_SUCCESS", payload: user });
      } else {
        throw new Error("Credenciales incorrectas");
      }
    } catch (error) {
      let errorMessage = "Error al iniciar sesión";
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error("Login error:", errorMessage);
      }
      dispatch({ type: "LOGIN_FAILURE", payload: errorMessage });
      throw error;
    }
  };

  // Register function (simplified for demo)
  const register = async (userData: RegisterData) => {
    dispatch({ type: "REGISTER_START" });
    try {
      console.log("Attempting registration with username:", userData.username);
      
      // Simulate registration delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if username already exists (in this demo, only 'demo' is taken)
      if (userData.username.toLowerCase() === 'demo') {
        throw new Error("Este usuario ya existe");
      }
      
      // Create new user
      const user = userStorage.login(userData.username);
      console.log("Registration successful:", user);
      dispatch({ type: "REGISTER_SUCCESS", payload: user });
    } catch (error) {
      let errorMessage = "Error al registrarse";
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error("Registration error:", errorMessage);
      }
      dispatch({ type: "REGISTER_FAILURE", payload: errorMessage });
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    dispatch({ type: "LOGOUT_START" });
    try {
      console.log("Attempting to logout");
      
      // Clear localStorage
      userStorage.clear();
      
      console.log("Logout successful");
      dispatch({ type: "LOGOUT_SUCCESS" });
    } catch (error) {
      let errorMessage = "Error al cerrar sesión";
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error("Logout error:", errorMessage);
      }
      dispatch({ type: "LOGOUT_FAILURE", payload: errorMessage });
      throw error;
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