import { useContext } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function useAuth() {
  const context = useContext(AuthContext);
  const { toast } = useToast();
  
  // No need to check if context is undefined anymore since we provide default values
  const { login, register, logout, clearError, ...state } = context;
  
  // Enhanced login with toast notifications
  const enhancedLogin = async (username: string, password: string) => {
    try {
      await login(username, password);
      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido a Realtor360",
      });
    } catch (error) {
      toast({
        title: "Error al iniciar sesión",
        description: state.error || "Verifica tus credenciales e intenta nuevamente",
        variant: "destructive",
      });
    }
  };
  
  // Enhanced register with toast notifications
  const enhancedRegister = async (userData: Parameters<typeof register>[0]) => {
    try {
      await register(userData);
      toast({
        title: "Registro exitoso",
        description: "Bienvenido a Realtor360",
      });
    } catch (error) {
      toast({
        title: "Error al registrarse",
        description: state.error || "Verifica tus datos e intenta nuevamente",
        variant: "destructive",
      });
    }
  };
  
  // Enhanced logout with toast notifications
  const enhancedLogout = async () => {
    try {
      await logout();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
    } catch (error) {
      toast({
        title: "Error al cerrar sesión",
        description: state.error || "Ocurrió un error al cerrar sesión",
        variant: "destructive",
      });
    }
  };
  
  return {
    ...state,
    login: enhancedLogin,
    register: enhancedRegister,
    logout: enhancedLogout,
    clearError,
  };
}
