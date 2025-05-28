import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Image, 
  Sparkles, 
  Zap, 
  Check,
  Home,
  Palette,
  Clock,
  CreditCard,
  Star,
  Users,
  Shield,
  Wand2
} from 'lucide-react';

export default function Landing() {
  const features = [
    {
      icon: Wand2,
      title: 'Transformación Inteligente',
      description: 'Convierte espacios vacíos en hogares amueblados con IA avanzada'
    },
    {
      icon: Palette,
      title: '8+ Estilos Profesionales',
      description: 'Moderno, minimalista, nórdico, mediterráneo y más'
    },
    {
      icon: Zap,
      title: 'Resultados en Minutos',
      description: 'Procesamiento rápido con resultados de calidad profesional'
    },
    {
      icon: Home,
      title: 'Diseñado para Inmobiliarias',
      description: 'Herramientas específicas para el mercado inmobiliario'
    }
  ];
  
  const plans = [
    {
      name: 'Gratis',
      price: '0€',
      period: 'para siempre',
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
      period: '/mes',
      credits: 100,
      features: [
        '100 transformaciones/mes',
        'Prioridad en procesamiento',
        'Soporte prioritario',
        'Sin marca de agua',
        'Historial completo'
      ],
      popular: true
    },
    {
      name: 'Empresa',
      price: '99€',
      period: '/mes',
      credits: -1,
      features: [
        'Transformaciones ilimitadas',
        'API personalizada',
        'Soporte dedicado 24/7',
        'Facturación personalizada',
        'Formación incluida'
      ]
    }
  ];
  
  const testimonials = [
    {
      name: "María García",
      role: "Agente Inmobiliario",
      content: "Esta herramienta ha revolucionado la forma en que presento las propiedades. Los clientes pueden visualizar el potencial real de cada espacio.",
      rating: 5
    },
    {
      name: "Carlos Rodríguez",
      role: "Director de Inmobiliaria",
      content: "Hemos reducido los costos de home staging en un 90% y las propiedades se venden un 40% más rápido.",
      rating: 5
    },
    {
      name: "Ana Martínez",
      role: "Diseñadora de Interiores",
      content: "La calidad de las transformaciones es impresionante. Mis clientes quedan sorprendidos con los resultados.",
      rating: 5
    }
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
          <div className="font-bold text-xl">
            Realtor<span className="text-primary">360</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Iniciar Sesión</Button>
            </Link>
            <Link href="/register">
              <Button>Empezar Gratis</Button>
            </Link>
          </div>
        </div>
      </nav>
      
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-16">
        <div className="absolute inset-0 bg-grid-gray-100 bg-grid-16 [mask-image:radial-gradient(ellipse_at_center,white,transparent_70%)]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          <Badge className="mb-4" variant="secondary">
            <Sparkles className="h-3 w-3 mr-1" />
            Powered by AI
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Transforma propiedades vacías en
            <span className="text-primary block mt-2">hogares de ensueño</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Home staging virtual con inteligencia artificial. Muestra el potencial real de cada propiedad en segundos y vende más rápido.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8">
                Prueba Gratis - Sin tarjeta
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Ver Demo
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-500">
            Usuario demo: <code className="bg-gray-100 px-2 py-1 rounded">demo</code> | 
            Contraseña: <code className="bg-gray-100 px-2 py-1 rounded ml-2">demo123</code>
          </p>
        </div>
      </div>
      
      {/* Demo Image */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="relative rounded-xl overflow-hidden shadow-2xl">
          <img 
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
            alt="Transformación de ejemplo"
            className="w-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <Badge className="mb-2 bg-green-500 text-white">
              <Check className="h-3 w-3 mr-1" />
              Transformación completada
            </Badge>
            <p className="text-lg font-medium">De espacio vacío a hogar moderno en 45 segundos</p>
          </div>
        </div>
      </div>
      
      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Todo lo que necesitas para vender más rápido
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Herramientas profesionales diseñadas específicamente para agentes inmobiliarios
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-2 hover:border-primary/20 transition-colors">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="bg-primary/5 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">2,500+</div>
              <p className="text-gray-600">Propiedades transformadas</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">45 seg</div>
              <p className="text-gray-600">Tiempo promedio de procesamiento</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">98%</div>
              <p className="text-gray-600">Satisfacción del cliente</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Testimonials */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-lg text-gray-600">
            Miles de profesionales ya están transformando su negocio
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Pricing Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Planes simples y transparentes
          </h2>
          <p className="text-lg text-gray-600">
            Empieza gratis y escala según tus necesidades
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative ${plan.popular ? 'border-primary border-2' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-white">Más Popular</Badge>
                </div>
              )}
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
                
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link href="/register">
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {index === 0 ? 'Empezar Gratis' : 'Elegir Plan'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-primary py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Listo para transformar tu negocio inmobiliario?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Únete a miles de profesionales que ya están vendiendo más rápido
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Comenzar Ahora - Es Gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <div className="font-bold text-xl mb-2">
                Realtor<span className="text-primary">360</span>
              </div>
              <p className="text-sm text-gray-600">
                Transformando el sector inmobiliario con IA
              </p>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <Link href="/pricing">
                <span className="hover:text-primary cursor-pointer">Precios</span>
              </Link>
              <span className="text-gray-400">|</span>
              <span className="text-gray-400">Soporte (Próximamente)</span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-400">API (Próximamente)</span>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
            © 2024 Realtor360. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}