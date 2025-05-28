import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowRight, 
  Image, 
  Sparkles, 
  Zap, 
  Check,
  Home,
  Palette,
  Clock,
  CreditCard
} from 'lucide-react';

export default function Landing() {
  const features = [
    {
      icon: Image,
      title: 'Transformación con IA',
      description: 'Convierte espacios vacíos en hogares amueblados con un clic'
    },
    {
      icon: Palette,
      title: 'Múltiples Estilos',
      description: 'Elige entre moderno, minimalista, lujoso y más estilos'
    },
    {
      icon: Zap,
      title: 'Resultados Rápidos',
      description: 'Obtén imágenes transformadas en menos de 60 segundos'
    },
    {
      icon: Home,
      title: 'Hecho para Inmobiliarias',
      description: 'Herramientas diseñadas específicamente para el sector'
    }
  ];
  
  const plans = [
    {
      name: 'Gratis',
      price: '0€',
      credits: 5,
      features: [
        '5 transformaciones gratis',
        'Todos los estilos disponibles',
        'Editor de anotaciones',
        'Descarga en alta calidad'
      ]
    },
    {
      name: 'Profesional',
      price: '29€',
      credits: 100,
      features: [
        '100 transformaciones/mes',
        'Prioridad en procesamiento',
        'Soporte prioritario',
        'Sin marca de agua'
      ],
      popular: true
    },
    {
      name: 'Empresa',
      price: '99€',
      credits: -1,
      features: [
        'Transformaciones ilimitadas',
        'API personalizada',
        'Soporte dedicado',
        'Facturación personalizada'
      ]
    }
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-gray-100 bg-grid-16 [mask-image:radial-gradient(ellipse_at_center,white,transparent_70%)]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Transforma tus propiedades con
            <span className="text-primary block mt-2">Inteligencia Artificial</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Convierte espacios vacíos en hogares de ensueño. Ahorra tiempo y dinero en home staging virtual con resultados profesionales en segundos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8">
                Prueba Gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Demo: demo/demo123
              </Button>
            </Link>
          </div>
          
          {/* Demo Image */}
          <div className="mt-12 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-gray-50 to-transparent z-10 pointer-events-none"></div>
            <img 
              src="/sample/demo-transformation.jpg" 
              alt="Ejemplo de transformación"
              className="rounded-lg shadow-2xl mx-auto max-w-4xl w-full"
            />
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas para vender más rápido
            </h2>
            <p className="text-lg text-gray-600">
              Herramientas profesionales diseñadas para inmobiliarias modernas
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-full mb-4">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      
      {/* How it Works */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tan fácil como 1, 2, 3
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary text-white rounded-full text-2xl font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Sube tu imagen
              </h3>
              <p className="text-gray-600">
                Arrastra o selecciona la foto del espacio que quieres transformar
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary text-white rounded-full text-2xl font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Elige el estilo
              </h3>
              <p className="text-gray-600">
                Selecciona entre diferentes estilos y personaliza con anotaciones
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary text-white rounded-full text-2xl font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Descarga el resultado
              </h3>
              <p className="text-gray-600">
                Obtén tu imagen transformada lista para usar en tus anuncios
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Pricing Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Planes para cada necesidad
            </h2>
            <p className="text-lg text-gray-600">
              Sin compromisos, cancela cuando quieras
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card key={index} className={plan.popular ? 'ring-2 ring-primary' : ''}>
                <CardContent className="p-6">
                  {plan.popular && (
                    <div className="text-center mb-4">
                      <span className="bg-primary text-white text-sm font-medium px-3 py-1 rounded-full">
                        Más Popular
                      </span>
                    </div>
                  )}
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    <div className="text-4xl font-bold text-gray-900">
                      {plan.price}
                      {plan.price !== '0€' && <span className="text-lg text-gray-600">/mes</span>}
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      {plan.credits === -1 ? 'Transformaciones ilimitadas' : `${plan.credits} transformaciones`}
                    </div>
                  </div>
                  
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link href="/register">
                    <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                      Empezar ahora
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="py-16 bg-primary">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Listo para transformar tu negocio inmobiliario?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8">
            Únete a cientos de inmobiliarias que ya están vendiendo más rápido
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Empieza tu prueba gratuita
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400">
              © 2025 Realtor 360. Hecho con ❤️ para inmobiliarias innovadoras.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}