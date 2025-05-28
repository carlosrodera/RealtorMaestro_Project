// Demo data for sample properties and transformations
import { initializeDemoData } from './localStorage';

export const sampleImages = {
  livingRoom: '/sample/living-room-empty.jpg',
  livingRoomTransformed: '/sample/living-room-modern.jpg',
  bedroom: '/sample/bedroom-empty.jpg',
  bedroomTransformed: '/sample/bedroom-luxury.jpg',
  kitchen: '/sample/kitchen-empty.jpg',
  kitchenTransformed: '/sample/kitchen-minimalist.jpg',
  bathroom: '/sample/bathroom-empty.jpg',
  bathroomTransformed: '/sample/bathroom-nordic.jpg'
};

export const demoProjects = [
  {
    name: 'Ático en Malasaña',
    description: 'Ático de lujo con terraza en el centro de Madrid',
    propertyData: {
      propertyType: 'Ático',
      price: '450000',
      area: '85',
      bedrooms: '2',
      bathrooms: '2',
      zone: 'Malasaña, Madrid',
      yearBuilt: '1980',
      features: {
        renovated: true,
        elevator: true,
        terrace: true,
        airConditioning: true,
        parking: false,
        pool: false,
        garden: false,
        storage: true
      }
    }
  },
  {
    name: 'Villa en La Moraleja',
    description: 'Villa exclusiva con piscina y jardín',
    propertyData: {
      propertyType: 'Villa',
      price: '1200000',
      area: '450',
      bedrooms: '5',
      bathrooms: '4',
      zone: 'La Moraleja, Madrid',
      yearBuilt: '2005',
      features: {
        renovated: false,
        elevator: false,
        terrace: true,
        airConditioning: true,
        parking: true,
        pool: true,
        garden: true,
        storage: true
      }
    }
  },
  {
    name: 'Piso en Chamberí',
    description: 'Piso reformado en zona prime',
    propertyData: {
      propertyType: 'Piso',
      price: '650000',
      area: '120',
      bedrooms: '3',
      bathrooms: '2',
      zone: 'Chamberí, Madrid',
      yearBuilt: '1950',
      features: {
        renovated: true,
        elevator: true,
        terrace: false,
        airConditioning: true,
        parking: false,
        pool: false,
        garden: false,
        storage: false
      }
    }
  }
];

export const sampleTransformations = [
  {
    style: 'modern',
    name: 'Salón - Estilo Moderno',
    originalImage: sampleImages.livingRoom,
    transformedImage: sampleImages.livingRoomTransformed,
    customPrompt: 'Salón moderno con sofá gris, mesa de centro de cristal y decoración minimalista',
    status: 'completed' as const
  },
  {
    style: 'luxury',
    name: 'Dormitorio - Estilo Lujo',
    originalImage: sampleImages.bedroom,
    transformedImage: sampleImages.bedroomTransformed,
    customPrompt: 'Dormitorio de lujo con cama king size, cabecero tapizado y lámpara de araña',
    status: 'completed' as const
  },
  {
    style: 'minimalist',
    name: 'Cocina - Estilo Minimalista',
    originalImage: sampleImages.kitchen,
    transformedImage: sampleImages.kitchenTransformed,
    customPrompt: 'Cocina minimalista blanca con isla central y electrodomésticos integrados',
    status: 'completed' as const
  },
  {
    style: 'nordic',
    name: 'Baño - Estilo Nórdico',
    originalImage: sampleImages.bathroom,
    transformedImage: sampleImages.bathroomTransformed,
    customPrompt: 'Baño nórdico con tonos blancos, madera natural y plantas',
    status: 'completed' as const
  }
];

export const sampleDescriptions = {
  professional: `Descubra este exclusivo ático completamente reformado en el corazón de Malasaña, uno de los barrios más vibrantes y con más personalidad de Madrid. Con 85 m² distribuidos en 2 amplios dormitorios y 2 baños completos, esta propiedad combina a la perfección el encanto del Madrid tradicional con toques contemporáneos.

El salón principal, bañado de luz natural gracias a sus ventanales orientados al este, cuenta con suelos de madera natural y salida directa a una terraza privada de 15m². La cocina, totalmente equipada con electrodomésticos de alta gama, presenta un diseño minimalista con acabados en blanco y una práctica isla central.

El dormitorio principal es un verdadero remanso de paz con su vestidor integrado y baño en suite con ducha efecto lluvia. A escasos minutos a pie encontrará todos los servicios, incluyendo el Metro de Tribunal, innumerables comercios, restaurantes de moda y la emblemática Gran Vía.`,
  
  casual: `¡Echa un vistazo a este increíble ático en pleno Malasaña! Es el piso perfecto si buscas vivir en el centro con todo el rollo del barrio más cool de Madrid.

Tiene 85m² súper bien distribuidos, con 2 habitaciones amplias y 2 baños completos. Lo mejor de todo es la terraza privada de 15m² donde podrás hacer barbacoas con amigos o simplemente relajarte después del trabajo.

Está completamente reformado con mucho gusto - suelos de madera que le dan un toque acogedor, cocina moderna con isla para cocinar mientras charlas con tus invitados, y un salón luminoso perfecto para Netflix & chill.

La ubicación es inmejorable: tienes el metro Tribunal a 5 minutos, mil bares y restaurantes chulos, y la Gran Vía para cuando necesites hacer shopping. ¡No lo dejes escapar!`,
  
  creative: `Imagina despertar cada mañana en tu propio refugio urbano, donde el bullicio creativo de Malasaña se encuentra con la serenidad de tu hogar. Este ático no es simplemente una propiedad; es un lienzo en blanco para escribir tu historia madrileña.

Cada rincón cuenta una historia: el salón, bañado por la luz dorada del amanecer, invita a conversaciones interminables; la terraza privada, tu oasis personal sobre los tejados de Madrid, promete atardeceres inolvidables con vistas a la ciudad que nunca duerme.

La cocina, con su elegante isla central, será testigo de cenas memorables y experimentos culinarios. Los dormitorios, santuarios de paz en medio del vibrante barrio, te abrazan con la calidez de la madera natural y la suavidad de los tonos neutros.

Aquí, en el epicentro cultural de Madrid, donde cada calle esconde una galería, cada esquina un café con historia, tu nuevo hogar te espera para comenzar el próximo capítulo de tu vida.`
};

// Function to load demo images
export async function loadDemoImages() {
  // In a real app, you would download these images
  // For the demo, we'll use placeholder URLs
  const placeholderImages = {
    livingRoom: 'https://images.unsplash.com/photo-1615873968403-89e068629265?w=800&h=600&fit=crop',
    livingRoomTransformed: 'https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=800&h=600&fit=crop',
    bedroom: 'https://images.unsplash.com/photo-1617325247661-675ab4b0ae42?w=800&h=600&fit=crop',
    bedroomTransformed: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&h=600&fit=crop',
    kitchen: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=800&h=600&fit=crop',
    kitchenTransformed: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
    bathroom: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&h=600&fit=crop',
    bathroomTransformed: 'https://images.unsplash.com/photo-1604709177225-055f99402ea3?w=800&h=600&fit=crop'
  };
  
  // Update sample images with real URLs
  Object.assign(sampleImages, placeholderImages);
  
  return sampleImages;
}

// Initialize demo data on first load
export function initializeAppWithDemoData() {
  const isInitialized = localStorage.getItem('realtor360_demo_initialized');
  
  if (!isInitialized) {
    // Load demo images
    loadDemoImages().then(() => {
      // Initialize demo data is already called in localStorage
      initializeDemoData();
      
      // Mark as initialized
      localStorage.setItem('realtor360_demo_initialized', 'true');
    });
  }
}