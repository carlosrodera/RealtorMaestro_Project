import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { creditsStorage } from '@/lib/localStorage';
import { useToast } from '@/hooks/use-toast';
import { 
  Check, 
  CreditCard, 
  Sparkles,
  Zap,
  Building2,
  Info
} from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

export default function Pricing() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const credits = creditsStorage.get();
  
  const plans = [
    {
      id: 'free',
      name: 'Plan Gratuito',
      icon: Sparkles,
      price: '0€',
      period: '',
      credits: 5,
      features: [
        '5 transformaciones de prueba',
        'Todos los estilos disponibles',
        'Editor de anotaciones completo',
        'Descarga en alta calidad',
        'Soporte por email'
      ],
      buttonText: 'Plan Actual',
      disabled: user?.plan === 'free'
    },
    {
      id: 'basic',
      name: 'Plan Básico',
      icon: Zap,
      price: '19€',
      period: '/mes',
      credits: 20,
      features: [
        '20 transformaciones al mes',
        'Procesamiento prioritario',
        'Sin marca de agua',
        'Historial de 30 días',
        'Soporte prioritario'
      ],
      buttonText: user?.plan === 'basic' ? 'Plan Actual' : 'Actualizar',
      disabled: user?.plan === 'basic',
      popular: true
    },
    {
      id: 'pro',
      name: 'Plan Profesional',
      icon: Building2,
      price: '49€',
      period: '/mes',
      credits: 100,
      features: [
        '100 transformaciones al mes',
        'Procesamiento ultra rápido',
        'API access (próximamente)',
        'Historial ilimitado',
        'Soporte dedicado 24/7'
      ],
      buttonText: user?.plan === 'pro' ? 'Plan Actual' : 'Actualizar',
      disabled: user?.plan === 'pro'
    }
  ];
  
  const handleUpgrade = async (planId: string) => {
    if (planId === 'free' || planId === user?.plan) return;
    
    setIsUpgrading(true);
    
    // Simulate upgrade process
    setTimeout(() => {
      creditsStorage.upgrade(planId as 'basic' | 'pro' | 'enterprise');
      
      toast({
        title: '¡Plan actualizado!',
        description: `Has actualizado al plan ${planId === 'basic' ? 'Básico' : 'Profesional'} exitosamente.`,
      });
      
      setIsUpgrading(false);
      
      // Reload to update UI
      window.location.reload();
    }, 1500);
  };
  
  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Elige el plan perfecto para ti
          </h1>
          <p className="text-lg text-gray-600">
            Transforma más propiedades y vende más rápido
          </p>
        </div>
        
        {/* Current Credits */}
        <Card className="mb-8 bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  Tus créditos actuales
                </h3>
                <p className="text-sm text-gray-600">
                  Cada transformación consume 1 crédito
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">
                  {credits}
                </div>
                <p className="text-sm text-gray-600">
                  créditos restantes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Demo Notice */}
        <Alert className="mb-8">
          <Info className="h-4 w-4" />
          <AlertTitle>Modo Demo</AlertTitle>
          <AlertDescription>
            Esta es una demostración. No se realizarán cargos reales. Los planes se activan instantáneamente para propósitos de prueba.
          </AlertDescription>
        </Alert>
        
        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={plan.popular ? 'ring-2 ring-primary shadow-lg' : ''}
            >
              <CardHeader>
                {plan.popular && (
                  <Badge className="absolute -top-3 right-4">
                    Más Popular
                  </Badge>
                )}
                <div className="flex items-center justify-between mb-4">
                  <plan.icon className="h-8 w-8 text-primary" />
                  {user?.plan === plan.id && (
                    <Badge variant="secondary">Plan Actual</Badge>
                  )}
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {plan.credits} transformaciones
                  {plan.period && ' al mes'}
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full" 
                  variant={plan.popular && !plan.disabled ? 'default' : 'outline'}
                  disabled={plan.disabled || isUpgrading}
                  onClick={() => handleUpgrade(plan.id)}
                >
                  {isUpgrading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      {plan.buttonText}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle>Preguntas Frecuentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-1">
                ¿Cómo funcionan los créditos?
              </h4>
              <p className="text-sm text-gray-600">
                Cada transformación de imagen consume 1 crédito. Los créditos se renuevan mensualmente según tu plan.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">
                ¿Puedo cambiar de plan en cualquier momento?
              </h4>
              <p className="text-sm text-gray-600">
                Sí, puedes actualizar o cancelar tu plan en cualquier momento. Los cambios se aplican inmediatamente.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">
                ¿Qué pasa si se me acaban los créditos?
              </h4>
              <p className="text-sm text-gray-600">
                Si te quedas sin créditos, puedes actualizar tu plan o esperar hasta el próximo mes para la renovación.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">
                ¿Hay algún compromiso de permanencia?
              </h4>
              <p className="text-sm text-gray-600">
                No, todos los planes son mensuales sin compromiso de permanencia. Puedes cancelar cuando quieras.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}