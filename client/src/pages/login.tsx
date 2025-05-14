import React, { useState } from 'react';
import { Link } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingButton } from '@/components/ui/loading-button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAuth } from '@/hooks/use-auth';

const formSchema = z.object({
  username: z.string().min(1, 'El nombre de usuario es requerido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export default function Login() {
  const { login, error, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      await login(values.username, values.password);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Realtor<span className="text-secondary">360</span>
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Revoluciona el marketing inmobiliario con IA
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Iniciar sesión</CardTitle>
            <CardDescription>
              Accede a tu cuenta para gestionar tus proyectos inmobiliarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 rounded-md bg-red-50 text-red-800 text-sm">
                {error}
              </div>
            )}
            
            <div className="mb-4 p-3 rounded-md bg-blue-50 border border-blue-200 text-blue-800 text-sm">
              <p className="font-medium mb-1">Cuenta de demostración disponible:</p>
              <p><span className="font-medium">Usuario:</span> demo</p>
              <p><span className="font-medium">Contraseña:</span> demo123</p>
              <p className="mt-1 text-xs text-blue-600">Usa esta cuenta para explorar todas las funcionalidades de la plataforma.</p>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usuario</FormLabel>
                      <FormControl>
                        <Input placeholder="Ingresa tu nombre de usuario" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Ingresa tu contraseña" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex gap-2">
                  <LoadingButton
                    type="submit"
                    className="flex-1"
                    isLoading={isSubmitting}
                  >
                    Iniciar sesión
                  </LoadingButton>
                  
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => {
                      form.setValue('username', 'demo');
                      form.setValue('password', 'demo123');
                    }}
                  >
                    Usar demo
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600">
              ¿No tienes una cuenta?{' '}
              <Link href="/register" className="font-medium text-primary hover:underline">
                Regístrate
              </Link>
            </p>
          </CardFooter>
        </Card>
        
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Al iniciar sesión, aceptas nuestros{' '}
            <span className="text-primary hover:underline cursor-pointer">
              Términos de servicio
            </span>{' '}
            y{' '}
            <span className="text-primary hover:underline cursor-pointer">
              Política de privacidad
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
