import { Client } from '@notionhq/client'
import 'dotenv/config'

const notion = new Client({ auth: process.env.NEXT_PUBLIC_NOTION_API_KEY })

export const PAGES = {
  BANNERS: process.env.NEXT_PUBLIC_NOTION_PAGE_ID_BANNERS as string,
  CONTACT: process.env.NEXT_PUBLIC_NOTION_PAGE_ID_CONTACT as string,
  HOME: process.env.NEXT_PUBLIC_NOTION_PAGE_ID_HOME as string,
  MEMBERSHIP: process.env.NEXT_PUBLIC_NOTION_PAGE_ID_MEMBERSHIP as string,
  SERVICES: process.env.NEXT_PUBLIC_NOTION_PAGE_ID_SERVICES as string,
  TERMS: process.env.NEXT_PUBLIC_NOTION_PAGE_ID_TERMS as string,
}

// --- DATA ---

const slides = [
  {
    actionText: 'Explorar la Galería',
    actionTextEn: 'Explore the Gallery',
    actionUrl: '/store',
    alt: 'Espacio de Impulso Galería',
    imageUrl:
      'https://xhsidbbijujrdjjymhbs.supabase.co/storage/v1/object/public/images/general/CrutityStudio-3378.webp',
    order: 1,
    parallaxFactor: 1.2,
    subtitle: 'Descubre obras únicas de artistas emergentes y consagrados.',
    subtitleEn: 'Discover unique works by emerging and established artists.',
    title: 'Explora un Mundo de Arte',
    titleEn: 'Explore a World of Art',
  },
  {
    actionText: 'Ver Eventos',
    actionTextEn: 'View Events',
    actionUrl: '/store/events',
    alt: 'Exposición de arte contemporáneo',
    imageUrl:
      'https://xhsidbbijujrdjjymhbs.supabase.co/storage/v1/object/public/images/general/CrutityStudio-3381.webp',
    order: 2,
    parallaxFactor: 1.1,
    subtitle: 'Sumérgete en experiencias artísticas inolvidables.',
    subtitleEn: 'Immerse yourself in unforgettable artistic experiences.',
    title: 'Eventos y Exposiciones Exclusivas',
    titleEn: 'Exclusive Events and Exhibitions',
  },
  {
    actionText: 'Conocer Servicios',
    actionTextEn: 'Learn about Services',
    actionUrl: '/services', // ROUTES.STORE.SERVICES.PATH
    alt: 'Detalle de una obra de arte',
    imageUrl:
      'https://xhsidbbijujrdjjymhbs.supabase.co/storage/v1/object/public/images/general/IMG_3321-scaled-16-9-rectangle.webp',
    order: 3,
    parallaxFactor: 1.5,
    subtitle: 'Nuestra colección curada tiene algo especial para cada amante del arte.',
    subtitleEn: 'Our curated collection has something special for every art lover.',
    title: 'Encuentra la Pieza Perfecta',
    titleEn: 'Find the Perfect Piece',
  },
]

const services = [
  {
    description:
      'Desarrollamos artistas a través de la venta de obra original y gráfica (fotografía, serigrafía, grabado) de talentos mexicanos consagrados, emergentes y nuevos.',
    descriptionEn:
      'We develop artists through the sale of original and graphic works (photography, serigraphy, engraving) by established, emerging, and new Mexican talents.',
    features: [
      'Obra original certificada',
      'Gráfica limitada',
      'Artistas emergentes',
      'Asesoría personalizada',
    ],
    featuresEn: [
      'Certified original work',
      'Limited edition graphics',
      'Emerging artists',
      'Personalized advice',
    ],
    iconName: 'DollarSign',
    id: '1',
    imageUrl:
      'https://xhsidbbijujrdjjymhbs.supabase.co/storage/v1/object/public/images/general/expo-colectiva.jpg',
    order: 1,
    popular: true,
    price: 'Desde $500',
    priceEn: 'From $500',
    size: 'large',
    title: 'Venta de Obra Original',
    titleEn: 'Original Art Sales',
  },
  {
    description:
      'Mantenemos altos estándares de calidad para la conservación de obras de arte, recuerdos, fotografías y objetos valiosos.',
    descriptionEn:
      'We maintain high quality standards for the conservation of artworks, memorabilia, photographs, and valuable objects.',
    features: ['Marcos premium', 'Cristales UV', 'Conservación museística', 'Garantía de por vida'],
    featuresEn: ['Premium frames', 'UV glass', 'Museum conservation', 'Lifetime warranty'],
    iconName: 'Frame',
    id: '2',
    imageUrl:
      'https://xhsidbbijujrdjjymhbs.supabase.co/storage/v1/object/public/images/general/IMG_3321-scaled.webp',
    order: 2,
    price: 'Cotización',
    priceEn: 'Quote',
    title: 'Enmarcado Profesional',
    titleEn: 'Professional Framing',
  },
  {
    description:
      'Equipos de alta calidad para reproducciones de arte y variedad de papeles para satisfacer todas las necesidades.',
    descriptionEn:
      'High-quality equipment for art reproductions and a variety of papers to meet all needs.',
    features: ['Impresión Giclée', 'Papeles de museo', 'Ediciones limitadas', 'Control de color'],
    featuresEn: ['Giclée printing', 'Museum papers', 'Limited editions', 'Color control'],
    iconName: 'Printer',
    id: '3',
    imageUrl:
      'https://xhsidbbijujrdjjymhbs.supabase.co/storage/v1/object/public/images/general/IMG_9333.jpeg',
    order: 3,
    price: 'Cotización',
    priceEn: 'Quote',
    title: 'Estudio de Impresión',
    titleEn: 'Printing Studio',
  },
  {
    description:
      'El arte como inversión mantiene su valor y se comporta de manera diferente a otros activos financieros.',
    descriptionEn:
      'Art as an investment maintains its value and behaves differently from other financial assets.',
    features: [
      'Asesoría especializada',
      'Valuación profesional',
      'Portfolio diversificado',
      'ROI documentado',
    ],
    featuresEn: [
      'Specialized advice',
      'Professional valuation',
      'Diversified portfolio',
      'Documented ROI',
    ],
    iconName: 'TrendingUp',
    id: '4',
    imageUrl:
      'https://xhsidbbijujrdjjymhbs.supabase.co/storage/v1/object/public/images/general/Mira-de-frente-a-tus-suenos-y-ellos-te-observaran-desde-la-gloria-dnomada-arte-huesos-tigre-art-gold-color-dorado-tiger-vida-corazon-de-tigre-una-obra-que-se-inspira-en-la-inmortalidad-del-s.jpg',
    order: 4,
    popular: true,
    price: 'Consultoría',
    priceEn: 'Consultancy',
    size: 'large',
    title: 'Inversión en Arte',
    titleEn: 'Art Investment',
  },
  {
    description:
      'Facilita el colgado de cuadros con una gama completa de sistemas de colgaje profesionales.',
    descriptionEn:
      'Facilitates picture hanging with a complete range of professional hanging systems.',
    features: ['Sistemas modulares', 'Hardware premium', 'Instalación incluida', 'Soporte técnico'],
    featuresEn: [
      'Modular systems',
      'Premium hardware',
      'Installation included',
      'Technical support',
    ],
    iconName: 'Image',
    id: '5',
    imageUrl:
      'https://xhsidbbijujrdjjymhbs.supabase.co/storage/v1/object/public/images/general/unnamed%20(1).png',
    order: 5,
    price: 'Cotización',
    priceEn: 'Quote',
    title: 'Sistema de Colgajes',
    titleEn: 'Hanging Systems',
  },
  {
    description:
      'Impresión especializada de revistas, folletos, catálogos y libros de arte en grandes cantidades.',
    descriptionEn:
      'Specialized printing of magazines, brochures, catalogs, and art books in large quantities.',
    features: ['Diseño editorial', 'Acabados premium', 'Tirajes grandes', 'Distribución'],
    featuresEn: ['Editorial design', 'Premium finishes', 'Large print runs', 'Distribution'],
    iconName: 'BookOpen',
    id: '6',
    imageUrl:
      'https://xhsidbbijujrdjjymhbs.supabase.co/storage/v1/object/public/images/general/WhatsApp-Image-2024-03-11-at-6.06.29-PM.jpeg',
    order: 6,
    price: 'Cotización',
    priceEn: 'Quote',
    title: 'Fabricación de Catálogos',
    titleEn: 'Catalog Manufacturing',
  },
]

const benefits = [
  { id: '1', order: 1, text: 'Venta de obras', textEn: 'Art Sales' },
  {
    id: '2',
    order: 2,
    text: 'Impresión digital para reproducciones giclée',
    textEn: 'Digital printing for Giclée reproductions',
  },
  { id: '3', order: 3, text: 'Exposición internacional', textEn: 'International Exposure' },
  { id: '4', order: 4, text: 'Publicidad', textEn: 'Advertising' },
  { id: '5', order: 5, text: 'Pagos seguros', textEn: 'Secure Payments' },
  { id: '6', order: 6, text: 'Sin exclusividad', textEn: 'No Exclusivity' },
  {
    id: '7',
    order: 7,
    text: 'Nos encargamos de generar tus guías de envío',
    textEn: 'We generate your shipping guides',
  },
]

const features = [
  {
    description: 'Transacciones seguras y protección de tus obras',
    descriptionEn: 'Secure transactions and protection of your works',
    iconName: 'Shield',
    id: '1',
    order: 1,
    title: 'SEGURIDAD',
    titleEn: 'SECURITY',
  },
  {
    description: 'Presencia en exposiciones internacionales prestigiosas',
    descriptionEn: 'Presence in prestigious international exhibitions',
    iconName: 'Star',
    id: '2',
    order: 2,
    title: 'RECONOCIMIENTO',
    titleEn: 'RECOGNITION',
  },
  {
    description: 'Atención personalizada en cada paso del proceso',
    descriptionEn: 'Personalized attention at every step of the process',
    iconName: 'Headphones',
    id: '3',
    order: 3,
    title: 'SOPORTE',
    titleEn: 'SUPPORT',
  },
  {
    description: 'Impresiones giclée de máxima calidad profesional',
    descriptionEn: 'Maximum professional quality Giclée prints',
    iconName: 'Settings',
    id: '4',
    order: 4,
    title: 'CALIDAD',
    titleEn: 'QUALITY',
  },
]

const termsSections = [
  {
    content: 'La dirección de nuestra web es: http://impulsogaleria.com.',
    contentEn: 'Our website address is: http://impulsogaleria.com.',
    id: '1',
    order: 1,
    title: 'Quiénes somos',
    titleEn: 'Who we are',
  },
  {
    content:
      'Cuando los visitantes dejan comentarios en la web, recopilamos los datos que se muestran en el formulario de comentarios, así como la dirección IP del visitante y la cadena de agentes de usuario del navegador para ayudar a la detección de spam.\n\nUna cadena anónima creada a partir de tu dirección de correo electrónico (también llamada hash) puede ser proporcionada al servicio de Gravatar para ver si la estás usando. La política de privacidad del servicio Gravatar está disponible aquí: https://automattic.com/privacy/. Después de la aprobación de tu comentario, la imagen de tu perfil es visible para el público en el contexto de su comentario.',
    contentEn:
      'When visitors leave comments on the site we collect the data shown in the comments form, and also the visitor’s IP address and browser user agent string to help spam detection.\n\nAn anonymized string created from your email address (also called a hash) may be provided to the Gravatar service to see if you are using it. The Gravatar service privacy policy is available here: https://automattic.com/privacy/. After approval of your comment, your profile picture is visible to the public in the context of your comment.',
    id: '2',
    order: 2,
    title: 'Comentarios',
    titleEn: 'Comments',
  },
  {
    content:
      'Si subes imágenes a la web deberías evitar subir imágenes con datos de ubicación (GPS EXIF) incluidos. Los visitantes de la web pueden descargar y extraer cualquier dato de localización de las imágenes de la web.',
    contentEn:
      'If you upload images to the website, you should avoid uploading images with embedded location data (EXIF GPS) included. Visitors to the website can download and extract any location data from images on the website.',
    id: '3',
    order: 3,
    title: 'Medios',
    titleEn: 'Media',
  },
  {
    content:
      'Si dejas un comentario en nuestro sitio puedes elegir guardar tu nombre, dirección de correo electrónico y web en cookies. Esto es para tu comodidad, para que no tengas que volver a rellenar tus datos cuando dejes otro comentario. Estas cookies tendrán una duración de un año.\n\nSi tienes una cuenta y te conectas a este sitio, instalaremos una cookie temporal para determinar si tu navegador acepta cookies. Esta cookie no contiene datos personales y se elimina al cerrar el navegador.\n\nCuando inicias sesión, también instalaremos varias cookies para guardar tu información de inicio de sesión y tus opciones de visualización de pantalla. Las cookies de inicio de sesión duran dos días, y las cookies de opciones de pantalla duran un año. Si seleccionas "Recordarme", tu inicio de sesión perdurará durante dos semanas. Si sales de tu cuenta, las cookies de inicio de sesión se eliminarán.\n\nSi editas o publicas un artículo se guardará una cookie adicional en tu navegador. Esta cookie no incluye datos personales y simplemente indica el ID del artículo que acabas de editar. Caduca después de 1 día.',
    contentEn:
      'If you leave a comment on our site you may opt-in to saving your name, email address and website in cookies. These are for your convenience so that you do not have to fill in your details again when you leave another comment. These cookies will last for one year.\n\nIf you visit our login page, we will set a temporary cookie to determine if your browser accepts cookies. This cookie contains no personal data and is discarded when you close your browser.\n\nWhen you log in, we will also set up several cookies to save your login information and your screen display choices. Login cookies last for two days, and screen options cookies last for a year. If you select "Remember Me", your login will persist for two weeks. If you log out of your account, the login cookies will be removed.\n\nIf you edit or publish an article, an additional cookie will be saved in your browser. This cookie includes no personal data and simply indicates the post ID of the article you just edited. It expires after 1 day.',
    id: '4',
    order: 4,
    title: 'Cookies',
    titleEn: 'Cookies',
  },
  {
    content:
      'Los artículos de este sitio pueden incluir contenido incrustado (por ejemplo, vídeos, imágenes, artículos, etc.). El contenido incrustado de otras web se comporta exactamente de la misma manera que si el visitante hubiera visitado la otra web.\n\nEstas web pueden recopilar datos sobre ti, utilizar cookies, incrustar un seguimiento adicional de terceros, y supervisar tu interacción con ese contenido incrustado, incluido el seguimiento de tu interacción con el contenido incrustado si tienes una cuenta y estás conectado a esa web.',
    contentEn:
      'Articles on this site may include embedded content (e.g. videos, images, articles, etc.). Embedded content from other websites behaves in the exact same way as if the visitor has visited the other website.\n\nThese websites may collect data about you, use cookies, embed additional third-party tracking, and monitor your interaction with that embedded content, including tracking your interaction with the embedded content if you have an account and are logged in to that website.',
    id: '5',
    order: 5,
    title: 'Contenido incrustado de otros sitios web',
    titleEn: 'Embedded content from other websites',
  },
  {
    content:
      'Si solicitas un restablecimiento de contraseña, tu dirección IP será incluida en el correo electrónico de restablecimiento.',
    contentEn:
      'If you request a password reset, your IP address will be included in the reset email.',
    id: '6',
    order: 6,
    title: 'Con quién compartimos tus datos',
    titleEn: 'Who we share your data with',
  },
  {
    content:
      'Si dejas un comentario, el comentario y sus metadatos se conservan indefinidamente. Esto es para que podamos reconocer y aprobar comentarios sucesivos automáticamente en lugar de mantenerlos en una cola de moderación.\n\nDe los usuarios que se registran en nuestra web (si los hay), también almacenamos la información personal que proporcionan en su perfil de usuario. Todos los usuarios pueden ver, editar o eliminar su información personal en cualquier momento (excepto que no pueden cambiar su nombre de usuario). Los administradores de la web también pueden ver y editar esa información.',
    contentEn:
      'If you leave a comment, the comment and its metadata are retained indefinitely. This is so we can recognize and approve any follow-up comments automatically instead of holding them in a moderation queue.\n\nFor users that register on our website (if any), we also store the personal information they provide in their user profile. All users can see, edit, or delete their personal information at any time (except they cannot change their username). Website administrators can also see and edit that information.',
    id: '7',
    order: 7,
    title: 'Cuánto tiempo conservamos tus datos',
    titleEn: 'How long we retain your data',
  },
  {
    content:
      'Si tienes una cuenta o has dejado comentarios en esta web, puedes solicitar recibir un archivo de exportación de los datos personales que tenemos sobre ti, incluyendo cualquier dato que nos hayas proporcionado. También puedes solicitar que eliminemos cualquier dato personal que tengamos sobre ti. Esto no incluye ningún dato que estemos obligados a conservar con fines administrativos, legales o de seguridad.',
    contentEn:
      'If you have an account on this site, or have left comments, you can request to receive an exported file of the personal data we hold about you, including any data you have provided to us. You can also request that we erase any personal data we hold about you. This does not include any data we are obliged to keep for administrative, legal, or security purposes.',
    id: '8',
    order: 8,
    title: 'Qué derechos tienes sobre tus datos',
    titleEn: 'What rights you have over your data',
  },
  {
    content:
      'Los comentarios de los visitantes puede que los revise un servicio de detección automática de spam.',
    contentEn: 'Visitor comments may be checked through an automated spam detection service.',
    id: '9',
    order: 9,
    title: 'Dónde enviamos tus datos',
    titleEn: 'Where your data is sent',
  },
]

const pageContent = [
  // --- LANDING PAGE ---
  // Hero
  {
    component: 'hero',
    key: 'landing.hero.title',
    page: 'landing',
    valueEn: 'Welcome to Impulso Gallery',
    valueEs: 'Bienvenido a Impulso Galería',
  },
  {
    component: 'hero',
    key: 'landing.hero.subtitle',
    page: 'landing',
    valueEn:
      'Impulso Gallery aims to create a space that promotes art as a cultural platform; driving the development of emerging and established artists, to provide quality to our clients.',
    valueEs:
      'Impulso Galería tiene como objetivo crear un espacio que fomente el arte como plataforma cultural; impulsando el desarrollo de artistas emergentes, y de artistas consolidados, para así brindar calidad a nuestros clientes.',
  },
  {
    component: 'hero',
    key: 'landing.hero.statsCount',
    page: 'landing',
    valueEn: '500+',
    valueEs: '500+',
  },
  {
    component: 'hero',
    key: 'landing.hero.statsLabel',
    page: 'landing',
    valueEn: 'Artworks',
    valueEs: 'Obras',
  },
  {
    component: 'hero',
    key: 'landing.hero.liveLabel',
    page: 'landing',
    valueEn: 'LIVE EXPERIENCES',
    valueEs: 'EXPERIENCIAS EN VIVO',
  },
  {
    component: 'hero',
    key: 'landing.hero.discoverMore',
    page: 'landing',
    valueEn: 'Discover more',
    valueEs: 'Descubre más',
  },
  {
    component: 'hero',
    key: 'landing.hero.videoUrl',
    page: 'landing',
    valueEn:
      'https://xhsidbbijujrdjjymhbs.supabase.co/storage/v1/object/public/images/general/impulso.mp4',
    valueEs:
      'https://xhsidbbijujrdjjymhbs.supabase.co/storage/v1/object/public/images/general/impulso.mp4',
  },
  {
    component: 'hero',
    key: 'landing.hero.videoPoster',
    page: 'landing',
    valueEn:
      'https://xhsidbbijujrdjjymhbs.supabase.co/storage/v1/object/public/images/general/impulso.webp',
    valueEs:
      'https://xhsidbbijujrdjjymhbs.supabase.co/storage/v1/object/public/images/general/impulso.webp',
  },

  // Landing Sections
  {
    component: 'section',
    key: 'landing.section.obras.title',
    page: 'landing',
    valueEn: 'Selected Artworks',
    valueEs: 'Obras Seleccionadas',
  },
  {
    component: 'section',
    key: 'landing.section.obras.subtitle',
    page: 'landing',
    valueEn:
      'Discover unique, carefully curated pieces that capture the essence of contemporary art',
    valueEs:
      'Descubre piezas únicas cuidadosamente curadas que capturan la esencia del arte contemporáneo',
  },
  {
    component: 'section',
    key: 'landing.section.obras.actionText',
    page: 'landing',
    valueEn: 'Explore Gallery',
    valueEs: 'Explorar Galería',
  },

  {
    component: 'section',
    key: 'landing.section.artistas.title',
    page: 'landing',
    valueEn: 'Featured Artists',
    valueEs: 'Artistas Destacados',
  },
  {
    component: 'section',
    key: 'landing.section.artistas.subtitle',
    page: 'landing',
    valueEn: 'Meet the exceptional talent of our community of emerging and established artists',
    valueEs:
      'Conoce el talento excepcional de nuestra comunidad de artistas emergentes y consagrados',
  },
  {
    component: 'section',
    key: 'landing.section.artistas.actionText',
    page: 'landing',
    valueEn: 'View All Artists',
    valueEs: 'Ver Todos los Artistas',
  },

  {
    component: 'section',
    key: 'landing.section.eventos.title',
    page: 'landing',
    valueEn: 'Upcoming Events',
    valueEs: 'Próximos Eventos',
  },
  {
    component: 'section',
    key: 'landing.section.eventos.subtitle',
    page: 'landing',
    valueEn:
      'Immerse yourself in unique artistic experiences that will transform your perspective of art',
    valueEs:
      'Sumérgete en experiencias artísticas únicas que transformarán tu perspectiva del arte',
  },
  {
    component: 'section',
    key: 'landing.section.eventos.actionText',
    page: 'landing',
    valueEn: 'View All Events',
    valueEs: 'Ver Todos los Eventos',
  },

  {
    component: 'section',
    key: 'landing.section.servicios.title',
    page: 'landing',
    valueEn: 'Our Services',
    valueEs: 'Nuestros Servicios',
  },
  {
    component: 'section',
    key: 'landing.section.servicios.subtitle',
    page: 'landing',
    valueEn:
      'We offer a full range of specialized services for the art world, from original artwork sales to high-quality technical services',
    valueEs:
      'Ofrecemos una gama completa de servicios especializados para el mundo del arte, desde la venta de obra original hasta servicios técnicos de alta calidad',
  },
  {
    component: 'section',
    key: 'landing.section.servicios.actionText',
    page: 'landing',
    valueEn: 'View All Services',
    valueEs: 'Ver Todos los Servicios',
  },

  {
    component: 'section',
    key: 'landing.section.membresia.title',
    page: 'landing',
    valueEn: 'Sell your artworks',
    valueEs: 'Vende tus obras',
  },
  {
    component: 'section',
    key: 'landing.section.membresia.subtitle',
    page: 'landing',
    valueEn: 'Get a membership plan and enjoy the great benefits of selling your art with us',
    valueEs:
      'Adquiere un plan de membresía y disfruta de los grandes beneficios de vender tu arte con nosotros',
  },
  {
    component: 'section',
    key: 'landing.section.membresia.actionText',
    page: 'landing',
    valueEn: 'Learn more',
    valueEs: 'Más información',
  },

  {
    component: 'section',
    key: 'landing.section.blog.title',
    page: 'landing',
    valueEn: 'Latest Articles',
    valueEs: 'Últimos Artículos',
  },
  {
    component: 'section',
    key: 'landing.section.blog.subtitle',
    page: 'landing',
    valueEn: 'Explore the latest stories from the art world and our creative community',
    valueEs: 'Explora las historias más recientes del mundo del arte y nuestra comunidad creativa',
  },
  {
    component: 'section',
    key: 'landing.section.blog.actionText',
    page: 'landing',
    valueEn: 'View all Blog',
    valueEs: 'Ver todo el Blog',
  },

  // Landing Services CTA
  {
    component: 'cta',
    key: 'landing.services.cta.title',
    page: 'landing',
    valueEn: 'Need a customized service?',
    valueEs: '¿Necesitas un servicio personalizado?',
  },
  {
    component: 'cta',
    key: 'landing.services.cta.subtitle',
    page: 'landing',
    valueEn: 'Contact our team to develop a specific solution for your artistic needs',
    valueEs:
      'Contacta con nuestro equipo para desarrollar una solución específica para tus necesidades artísticas',
  },
  {
    component: 'cta',
    key: 'landing.services.cta.button',
    page: 'landing',
    valueEn: 'View Details',
    valueEs: 'Ver Detalles',
  },
  {
    component: 'cta',
    key: 'landing.services.cta.moreLabel',
    page: 'landing',
    valueEn: 'more',
    valueEs: 'más',
  },

  // Landing Membership Card
  {
    component: 'card',
    key: 'landing.membership.benefitsTitle',
    page: 'landing',
    valueEn: 'Benefits for you',
    valueEs: 'Beneficios para ti',
  },
  {
    component: 'card',
    key: 'landing.membership.cardTitle',
    page: 'landing',
    valueEn: 'My Impulso Space',
    valueEs: 'Mi espacio Impulso',
  },
  {
    component: 'card',
    key: 'landing.membership.priceLabel',
    page: 'landing',
    valueEn: 'FOR ONLY',
    valueEs: 'POR SOLO',
  },
  {
    component: 'card',
    key: 'landing.membership.price',
    page: 'landing',
    valueEn: '$500.00',
    valueEs: '$500.00',
  },
  {
    component: 'card',
    key: 'landing.membership.period',
    page: 'landing',
    valueEn: 'MXN/monthly',
    valueEs: 'MXN/mensual',
  },
  {
    component: 'card',
    key: 'landing.membership.button',
    page: 'landing',
    valueEn: 'Purchase',
    valueEs: 'Adquirir',
  },

  // Landing misc
  {
    component: 'section',
    key: 'landing.events.freeEntry',
    page: 'landing',
    valueEn: 'Free entry',
    valueEs: 'Entrada gratuita',
  },
  {
    component: 'section',
    key: 'landing.events.eventLabel',
    page: 'landing',
    valueEn: 'Event',
    valueEs: 'Evento',
  },

  // --- MEMBERSHIP PAGE ---
  {
    component: 'hero',
    key: 'membership.hero.badge',
    page: 'membership',
    valueEn: 'Premium Membership',
    valueEs: 'Membresía Premium',
  },
  {
    component: 'hero',
    key: 'membership.hero.title',
    page: 'membership',
    valueEn: 'Sell your artworks',
    valueEs: 'Vende tus obras',
  },
  {
    component: 'hero',
    key: 'membership.hero.titleAccent',
    page: 'membership',
    valueEn: 'with us',
    valueEs: 'con nosotros',
  },
  {
    component: 'hero',
    key: 'membership.hero.subtitle',
    page: 'membership',
    valueEn: 'Get a membership plan and enjoy the great benefits of selling your art with us',
    valueEs:
      'Adquiere un plan de membresía y disfruta de los grandes beneficios de vender tu arte con nosotros',
  },
  {
    component: 'hero',
    key: 'membership.hero.tagline',
    page: 'membership',
    valueEn: 'Join our community of successful artists',
    valueEs: 'Únete a nuestra comunidad de artistas exitosos',
  },
  {
    component: 'section',
    key: 'membership.page.featuresHeading',
    page: 'membership',
    valueEn: 'WHY IMPULSO GALLERY?',
    valueEs: '¿POR QUÉ IMPULSO GALERÍA?',
  },
  {
    component: 'card',
    key: 'membership.card.heading',
    page: 'membership',
    valueEn: 'We will take care of all your needs',
    valueEs: 'Nos ocuparemos de todas tus necesidades',
  },
  {
    component: 'card',
    key: 'membership.card.paragraph',
    page: 'membership',
    valueEn:
      'We specialize in selling artworks by national, new, established, and emerging artists. Our qualified team can help you determine and achieve the best price for your work, through effective online promotion.',
    valueEs:
      'Somos especialistas en vender obras de arte de artistas nacionales, nuevos, establecidos y emergentes. Nuestro equipo calificado puede ayudarlo a determinar y lograr el mejor precio por su trabajo, a través de una promoción efectiva en línea.',
  },
  {
    component: 'card',
    key: 'membership.card.title',
    page: 'membership',
    valueEn: 'Sell your artworks',
    valueEs: 'Vende tus obras',
  },
  {
    component: 'card',
    key: 'membership.card.subtitle',
    page: 'membership',
    valueEn: 'My Impulso Space',
    valueEs: 'Mi espacio Impulso',
  },
  {
    component: 'card',
    key: 'membership.card.description',
    page: 'membership',
    valueEn: 'GET A MEMBERSHIP PLAN AND ENJOY THE GREAT BENEFITS OF SELLING YOUR ART WITH US.',
    valueEs:
      'ADQUIERA UN PLAN DE MEMBRESÍA Y DISFRUTE DE LOS GRANDES BENEFICIOS DE VENDER SU ARTE CON NOSOTROS.',
  },
  {
    component: 'card',
    key: 'membership.card.button',
    page: 'membership',
    valueEn: 'More information',
    valueEs: 'Más información',
  },
  {
    component: 'card',
    key: 'membership.card.benefitsTitle',
    page: 'membership',
    valueEn: 'Benefits for you',
    valueEs: 'Beneficios para ti',
  },
  {
    component: 'card',
    key: 'membership.card.purchaseButton',
    page: 'membership',
    valueEn: 'Purchase',
    valueEs: 'Adquirir',
  },
  {
    component: 'card',
    key: 'membership.card.price',
    page: 'membership',
    valueEn: '500.00',
    valueEs: '500.00',
  },
  {
    component: 'card',
    key: 'membership.card.currency',
    page: 'membership',
    valueEn: '$',
    valueEs: '$',
  },
  {
    component: 'card',
    key: 'membership.card.period',
    page: 'membership',
    valueEn: 'MXN/monthly',
    valueEs: 'MXN/mensual',
  },
  {
    component: 'card',
    key: 'membership.card.priceLabel',
    page: 'membership',
    valueEn: 'FOR ONLY',
    valueEs: 'POR SOLO',
  },
  {
    component: 'cta',
    key: 'membership.cta.title',
    page: 'membership',
    valueEn: 'Ready to start your artistic journey?',
    valueEs: '¿Listo para comenzar tu viaje artístico?',
  },
  {
    component: 'cta',
    key: 'membership.cta.subtitle',
    page: 'membership',
    valueEn: 'Join our community of successful artists and take your art to the next level',
    valueEs: 'Únete a nuestra comunidad de artistas exitosos y lleva tu arte al siguiente nivel',
  },
  {
    component: 'cta',
    key: 'membership.cta.button',
    page: 'membership',
    valueEn: 'Get Membership',
    valueEs: 'Obtener Membresía',
  },

  // --- SERVICES PAGE ---
  {
    component: 'hero',
    key: 'services.hero.title',
    page: 'services',
    valueEn: 'Services that',
    valueEs: 'Servicios que',
  },
  {
    component: 'hero',
    key: 'services.hero.titleAccent',
    page: 'services',
    valueEn: 'Transform Ideas',
    valueEs: 'Transforman Ideas',
  },
  {
    component: 'hero',
    key: 'services.hero.subtitle',
    page: 'services',
    valueEn:
      'From original artwork sales to cutting-edge technical services, we create artistic experiences that transcend the conventional',
    valueEs:
      'Desde la venta de obra original hasta servicios técnicos de vanguardia, creamos experiencias artísticas que trascienden lo convencional',
  },
  {
    component: 'cta',
    key: 'services.cta.title',
    page: 'services',
    valueEn: 'Need something more specific?',
    valueEs: '¿Necesitas algo más específico?',
  },
  {
    component: 'cta',
    key: 'services.cta.subtitle',
    page: 'services',
    valueEn: 'We develop customized solutions for every artistic project',
    valueEs: 'Desarrollamos soluciones personalizadas para cada proyecto artístico',
  },
  {
    component: 'cta',
    key: 'services.cta.button',
    page: 'services',
    valueEn: 'Personalized Consulting',
    valueEs: 'Consultoría Personalizada',
  },

  // --- TERMS PAGE ---
  {
    component: 'hero',
    key: 'terms.hero.badge',
    page: 'terms',
    valueEn: 'Privacy Policy',
    valueEs: 'Política de Privacidad',
  },
  {
    component: 'hero',
    key: 'terms.hero.title',
    page: 'terms',
    valueEn: 'Terms and',
    valueEs: 'Términos y',
  },
  {
    component: 'hero',
    key: 'terms.hero.titleAccent',
    page: 'terms',
    valueEn: 'Conditions',
    valueEs: 'Condiciones',
  },
  {
    component: 'hero',
    key: 'terms.hero.subtitle',
    page: 'terms',
    valueEn:
      'Learn about our privacy policies and terms of use for a transparent and secure experience',
    valueEs:
      'Conoce nuestras políticas de privacidad y términos de uso para una experiencia transparente y segura',
  },
  {
    component: 'hero',
    key: 'terms.hero.tagline',
    page: 'terms',
    valueEn: 'Important information about the use of our services',
    valueEs: 'Información importante sobre el uso de nuestros servicios',
  },
  {
    component: 'cta',
    key: 'terms.cta.title',
    page: 'terms',
    valueEn: 'Have a question?',
    valueEs: '¿Tienes alguna pregunta?',
  },
  {
    component: 'cta',
    key: 'terms.cta.subtitle',
    page: 'terms',
    valueEn: 'If you need clarification on our terms and conditions, do not hesitate to contact us',
    valueEs:
      'Si necesitas aclaraciones sobre nuestros términos y condiciones, no dudes en contactarnos',
  },
  {
    component: 'cta',
    key: 'terms.cta.button',
    page: 'terms',
    valueEn: 'Contact Support',
    valueEs: 'Contactar Soporte',
  },

  // --- ARTISTS PAGE ---
  {
    component: 'section',
    key: 'artists.grid.title',
    page: 'artists',
    valueEn: 'Our Artists',
    valueEs: 'Nuestros Artistas',
  },
  {
    component: 'section',
    key: 'artists.grid.subtitle',
    page: 'artists',
    valueEn: 'Meet the exceptional talent of our creative community',
    valueEs: 'Conoce el talento excepcional de nuestra comunidad creativa',
  },
  {
    component: 'section',
    key: 'artists.grid.counter',
    page: 'artists',
    valueEn: 'artists',
    valueEs: 'artistas',
  },
  {
    component: 'section',
    key: 'artists.grid.emptyTitle',
    page: 'artists',
    valueEn: 'No artists available',
    valueEs: 'No hay artistas disponibles',
  },
  {
    component: 'section',
    key: 'artists.grid.emptyText',
    page: 'artists',
    valueEn: 'There are currently no artists available. Come back soon to discover new talent.',
    valueEs:
      'En este momento no hay artistas disponibles. Vuelve pronto para descubrir nuevo talento.',
  },
  {
    component: 'section',
    key: 'artists.error.title',
    page: 'artists',
    valueEn: 'Error loading artists',
    valueEs: 'Error al cargar artistas',
  },
  {
    component: 'section',
    key: 'artists.error.text',
    page: 'artists',
    valueEn: 'We could not load the artist information. Please try again later.',
    valueEs: 'No pudimos cargar la información de los artistas. Por favor, intenta más tarde.',
  },
  {
    component: 'filter',
    key: 'artists.filter.all',
    page: 'artists',
    valueEn: 'All artists',
    valueEs: 'Todos los artistas',
  },
  {
    component: 'filter',
    key: 'artists.filter.allTypes',
    page: 'artists',
    valueEn: 'All types',
    valueEs: 'Todos los tipos',
  },
]

// --- BANNERS DATA (goes to PAGES.BANNERS) ---

const bannerContent = [
  // Registration Banner
  {
    component: 'banner',
    key: 'banners.registration.title',
    valueEn: 'Discover the art that inspires you',
    valueEs: 'Descubre el arte que te inspira',
  },
  {
    component: 'banner',
    key: 'banners.registration.subtitle',
    valueEn: 'Join our creative community',
    valueEs: 'Únete a nuestra comunidad creativa',
  },
  {
    component: 'banner',
    key: 'banners.registration.button',
    valueEn: 'Sign up',
    valueEs: 'Registrarse',
  },
  {
    component: 'banner',
    key: 'banners.registration.closeLabel',
    valueEn: 'Close banner',
    valueEs: 'Cerrar banner',
  },

  // Registration Dialog
  {
    component: 'dialog',
    key: 'banners.dialog.title',
    valueEn: 'Join our community!',
    valueEs: '¡Únete a nuestra comunidad!',
  },
  {
    component: 'dialog',
    key: 'banners.dialog.subtitle',
    valueEn: 'Sign up for exclusive content, special offers, and a personalized experience',
    valueEs:
      'Regístrate para acceder a contenido exclusivo, ofertas especiales y una experiencia personalizada',
  },
  {
    component: 'dialog',
    key: 'banners.dialog.imageUrl',
    valueEn:
      'https://xhsidbbijujrdjjymhbs.supabase.co/storage/v1/object/public/images/general/CrutityStudio-3378.webp',
    valueEs:
      'https://xhsidbbijujrdjjymhbs.supabase.co/storage/v1/object/public/images/general/CrutityStudio-3378.webp',
  },
  {
    component: 'dialog',
    key: 'banners.dialog.imageAlt',
    valueEn: 'Registration',
    valueEs: 'Registro',
  },
  {
    component: 'dialog',
    key: 'banners.dialog.benefit1',
    valueEn: 'Access to exclusive products',
    valueEs: 'Acceso a productos exclusivos',
  },
  {
    component: 'dialog',
    key: 'banners.dialog.benefit2',
    valueEn: 'Personalized shopping experience',
    valueEs: 'Experiencia de compra personalizada',
  },
  {
    component: 'dialog',
    key: 'banners.dialog.couponTemplate',
    valueEn: '{value}% off your first purchase with code:',
    valueEs: '{value}% de descuento en tu primera compra con el código:',
  },
  {
    component: 'dialog',
    key: 'banners.dialog.copySuccess',
    valueEn: 'Code copied to clipboard',
    valueEs: 'Código copiado al portapapeles',
  },
  {
    component: 'dialog',
    key: 'banners.dialog.registerButton',
    valueEn: 'Sign up now',
    valueEs: 'Registrarse ahora',
  },
  {
    component: 'dialog',
    key: 'banners.dialog.dismissButton',
    valueEn: 'Later',
    valueEs: 'Más tarde',
  },
]

// --- CONTACT DATA (goes to PAGES.CONTACT) ---

const contactContent = [
  // Contact Info
  {
    component: 'info',
    key: 'contact.info.address',
    valueEn:
      'Hacienda Escolásticas 107, Jardines de la Hacienda, 76180 Santiago de Querétaro, Querétaro.',
    valueEs:
      'Hacienda Escolásticas 107, Jardines de la Hacienda, 76180 Santiago de Querétaro, Querétaro.',
  },
  {
    component: 'info',
    key: 'contact.info.description',
    valueEn:
      'An immersive experience where every work tells a unique story. Explore. Discover. Transform.',
    valueEs:
      'Una experiencia inmersiva donde cada obra cuenta una historia única. Explora. Descubre. Transforma.',
  },
  {
    component: 'info',
    key: 'contact.info.emailInfo',
    valueEn: 'info@impulsogaleria.com',
    valueEs: 'info@impulsogaleria.com',
  },
  {
    component: 'info',
    key: 'contact.info.emailSupport',
    valueEn: 'soporte@impulsogaleria.com',
    valueEs: 'soporte@impulsogaleria.com',
  },
  {
    component: 'info',
    key: 'contact.info.phone',
    valueEn: '4425826262',
    valueEs: '4425826262',
  },
  {
    component: 'info',
    key: 'contact.info.whatsappUrl',
    valueEn: 'https://wa.me/4425826262',
    valueEs: 'https://wa.me/4425826262',
  },

  // WhatsApp Button
  {
    component: 'whatsapp',
    key: 'contact.whatsapp.greeting',
    valueEn: 'Hi! 👋 Need help?',
    valueEs: '¡Hola! 👋 ¿Necesitas ayuda?',
  },
  {
    component: 'whatsapp',
    key: 'contact.whatsapp.subtitle',
    valueEn: 'Discover our gallery, events, and experiences',
    valueEs: 'Descubre nuestra galeria, eventos y experiencias',
  },
  {
    component: 'whatsapp',
    key: 'contact.whatsapp.buttonLabel',
    valueEn: 'Contact via WhatsApp',
    valueEs: 'Contactar por WhatsApp',
  },
  {
    component: 'whatsapp',
    key: 'contact.whatsapp.buttonTitle',
    valueEn: 'Message us on WhatsApp!',
    valueEs: '¡Escríbenos por WhatsApp!',
  },
  {
    component: 'whatsapp',
    key: 'contact.whatsapp.closeLabel',
    valueEn: 'Close message',
    valueEs: 'Cerrar mensaje',
  },

  // Footer Labels
  {
    component: 'footer',
    key: 'contact.footer.contactTitle',
    valueEn: 'Contact',
    valueEs: 'Contacto',
  },
  {
    component: 'footer',
    key: 'contact.footer.addressLabel',
    valueEn: 'Address',
    valueEs: 'Dirección',
  },
  {
    component: 'footer',
    key: 'contact.footer.emailLabel',
    valueEn: 'Email',
    valueEs: 'Email',
  },
  {
    component: 'footer',
    key: 'contact.footer.phoneLabel',
    valueEn: 'Phone',
    valueEs: 'Teléfono',
  },
  {
    component: 'footer',
    key: 'contact.footer.linksTitle',
    valueEn: 'Links',
    valueEs: 'Enlaces',
  },
  {
    component: 'footer',
    key: 'contact.footer.socialTitle',
    valueEn: 'Social Media',
    valueEs: 'Redes Sociales',
  },
  {
    component: 'footer',
    key: 'contact.footer.copyright',
    valueEn: 'Impulso Galería. All rights reserved.',
    valueEs: 'Impulso Galería. Todos los derechos reservados.',
  },
  {
    component: 'footer',
    key: 'contact.footer.termsLink',
    valueEn: 'Terms of Use',
    valueEs: 'Términos de Uso',
  },
]

const socialLinks = [
  {
    handle: '/impulsogaleria',
    name: 'Facebook',
    order: 1,
    url: 'https://facebook.com/impulsogaleria',
  },
  {
    handle: '@impulsogaleria',
    name: 'Instagram',
    order: 2,
    url: 'https://instagram.com/impulsogaleria',
  },
  {
    handle: '@impulsogaleria',
    name: 'YouTube',
    order: 3,
    url: 'https://youtube.com/@impulsogaleria',
  },
  {
    handle: '@impulsogaleria',
    name: 'TikTok',
    order: 4,
    url: 'https://tiktok.com/@impulsogaleria',
  },
]

const navigationLinks = [
  {
    nameEn: 'Gallery',
    nameEs: 'Galería',
    order: 1,
    path: '/store',
  },
  {
    nameEn: 'Events',
    nameEs: 'Eventos',
    order: 2,
    path: '/store/events',
  },
  {
    nameEn: 'Terms and conditions',
    nameEs: 'Términos y condiciones',
    order: 3,
    path: '/store/terms',
  },
]

// --- FUNCTIONS ---

async function createDatabase(pageId: string, title: string, properties: any) {
  console.log(`Creating database: ${title}`)
  try {
    const db = await notion.databases.create({
      initial_data_source: { properties },
      parent: { page_id: pageId, type: 'page_id' },
      title: [{ text: { content: title } }],
    } as any)
    console.log(`✓ Created database: ${db.id}`)

    // Fetch full database to get data_source_id
    const database = (await notion.databases.retrieve({ database_id: db.id })) as any
    const dataSourceId = database.data_sources[0].id

    // Fetch properties from the data source
    const fullDataSource = (await notion.dataSources.retrieve({
      data_source_id: dataSourceId,
    })) as any
    console.log('  Properties:', Object.keys(fullDataSource.properties as object))

    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Return combined object for backward compatibility
    return { ...database, properties: fullDataSource.properties }
  } catch (error: any) {
    if (error.code === 'object_not_found') {
      console.error(`Page ${pageId} not found. Ensure the integration has access.`)
    }
    throw error
  }
}

async function populateSlides() {
  console.log('\n📸 Populating Carousel Slides...')

  const db = await createDatabase(PAGES.HOME, 'Carousel Slides', {
    'Action Text': { rich_text: {} },
    'Action Text EN': { rich_text: {} },
    'Action Text ES': { rich_text: {} },
    'Action URL': { rich_text: {} },
    'Image URL': { url: {} },
    Order: { number: {} },
    Subtitle: { rich_text: {} },
    'Subtitle EN': { rich_text: {} },
    'Subtitle ES': { rich_text: {} },
    Title: { title: {} },
    'Title EN': { rich_text: {} },
    'Title ES': { rich_text: {} },
  })

  for (const slide of slides) {
    await notion.pages.create({
      parent: { database_id: db.id },
      properties: {
        'Action Text': { rich_text: [{ text: { content: slide.actionText } }] },
        'Action Text EN': { rich_text: [{ text: { content: slide.actionTextEn } }] },
        'Action Text ES': { rich_text: [{ text: { content: slide.actionText } }] },

        'Action URL': { rich_text: [{ text: { content: slide.actionUrl } }] },

        'Image URL': { url: slide.imageUrl },

        Order: { number: slide.order },

        Subtitle: { rich_text: [{ text: { content: slide.subtitle } }] },
        'Subtitle EN': { rich_text: [{ text: { content: slide.subtitleEn } }] },
        'Subtitle ES': { rich_text: [{ text: { content: slide.subtitle } }] },

        Title: { title: [{ text: { content: slide.title } }] },
        'Title EN': { rich_text: [{ text: { content: slide.titleEn } }] },
        'Title ES': { rich_text: [{ text: { content: slide.title } }] },
      },
    })
    console.log(`  ✓ Created slide: ${slide.title}`)
  }
}

async function populateServices() {
  console.log('\n🛠️ Populating Services...')

  const db = await createDatabase(PAGES.SERVICES, 'Full Services', {
    Description: { rich_text: {} },
    'Description EN': { rich_text: {} },
    'Description ES': { rich_text: {} },
    Features: { multi_select: {} },
    'Features EN': { multi_select: {} },
    'Icon Name': { select: { options: services.map((s) => ({ name: s.iconName })) } },
    'Image URL': { url: {} },
    Order: { number: {} },
    Popular: { checkbox: {} },
    Price: { rich_text: {} },
    'Price EN': { rich_text: {} },
    'Price ES': { rich_text: {} },
    Size: { select: { options: [{ name: 'normal' }, { name: 'large' }] } },
    Title: { title: {} },
    'Title EN': { rich_text: {} },
    'Title ES': { rich_text: {} },
  })

  for (const service of services) {
    await notion.pages.create({
      parent: { database_id: db.id },
      properties: {
        Description: { rich_text: [{ text: { content: service.description } }] },
        'Description EN': { rich_text: [{ text: { content: service.descriptionEn } }] },
        'Description ES': { rich_text: [{ text: { content: service.description } }] },

        Features: { multi_select: service.features.map((f) => ({ name: f })) },
        'Features EN': { multi_select: service.featuresEn.map((f) => ({ name: f })) },

        'Icon Name': { select: { name: service.iconName } },
        'Image URL': { url: service.imageUrl },
        Order: { number: service.order },
        Popular: { checkbox: service.popular || false },

        Price: { rich_text: [{ text: { content: service.price || '' } }] },
        'Price EN': { rich_text: [{ text: { content: service.priceEn || '' } }] },
        'Price ES': { rich_text: [{ text: { content: service.price || '' } }] },

        Size: { select: { name: (service.size as string) || 'normal' } },

        Title: { title: [{ text: { content: service.title } }] },
        'Title EN': { rich_text: [{ text: { content: service.titleEn } }] },
        'Title ES': { rich_text: [{ text: { content: service.title } }] },
      },
    })
    console.log(`  ✓ Created service: ${service.title}`)
  }
}

async function populateBenefits() {
  console.log('\n🎁 Populating Benefits...')

  const db = await createDatabase(PAGES.HOME, 'Benefits', {
    Order: { number: {} },
    Text: { title: {} },
    'Text EN': { rich_text: {} },
    'Text ES': { rich_text: {} },
  })

  for (const benefit of benefits) {
    await notion.pages.create({
      parent: { database_id: db.id },
      properties: {
        Order: { number: benefit.order },
        Text: { title: [{ text: { content: benefit.text } }] },
        'Text EN': { rich_text: [{ text: { content: benefit.textEn } }] },
        'Text ES': { rich_text: [{ text: { content: benefit.text } }] },
      },
    })
    console.log(`  ✓ Created benefit: ${benefit.text.substring(0, 20)}...`)
  }
}

async function populateFeatures() {
  console.log('\n⭐ Populating Features...')

  const db = await createDatabase(PAGES.MEMBERSHIP, 'Features', {
    Description: { rich_text: {} },
    'Description EN': { rich_text: {} },
    'Description ES': { rich_text: {} },
    'Icon Name': { select: {} },
    Order: { number: {} },
    Title: { title: {} },
    'Title EN': { rich_text: {} },
    'Title ES': { rich_text: {} },
  })

  for (const feature of features) {
    await notion.pages.create({
      parent: { database_id: db.id },
      properties: {
        Description: { rich_text: [{ text: { content: feature.description } }] },
        'Description EN': { rich_text: [{ text: { content: feature.descriptionEn } }] },
        'Description ES': { rich_text: [{ text: { content: feature.description } }] },

        'Icon Name': { select: { name: feature.iconName } },
        Order: { number: feature.order },

        Title: { title: [{ text: { content: feature.title } }] },
        'Title EN': { rich_text: [{ text: { content: feature.titleEn } }] },
        'Title ES': { rich_text: [{ text: { content: feature.title } }] },
      },
    })
    console.log(`  ✓ Created feature: ${feature.title}`)
  }
}

async function populateTerms() {
  console.log('\n📜 Populating Terms Sections...')

  const db = await createDatabase(PAGES.TERMS, 'Terms Sections', {
    Content: { rich_text: {} },
    'Content EN': { rich_text: {} },
    'Content ES': { rich_text: {} },
    Order: { number: {} },
    Title: { title: {} },
    'Title EN': { rich_text: {} },
    'Title ES': { rich_text: {} },
  })

  for (const section of termsSections) {
    await notion.pages.create({
      parent: { database_id: db.id },
      properties: {
        Content: { rich_text: [{ text: { content: section.content.substring(0, 2000) } }] },
        'Content EN': { rich_text: [{ text: { content: section.contentEn.substring(0, 2000) } }] },
        'Content ES': { rich_text: [{ text: { content: section.content.substring(0, 2000) } }] },

        Order: { number: section.order },

        Title: { title: [{ text: { content: section.title } }] },
        'Title EN': { rich_text: [{ text: { content: section.titleEn } }] },
        'Title ES': { rich_text: [{ text: { content: section.title } }] },
      },
    })
    console.log(`  ✓ Created section: ${section.title}`)
  }
}

async function populatePageContent() {
  console.log('\n📝 Populating Page Content...')

  const pageOptions = [
    { name: 'landing' },
    { name: 'membership' },
    { name: 'services' },
    { name: 'terms' },
    { name: 'artists' },
  ]

  const componentOptions = [
    { name: 'hero' },
    { name: 'cta' },
    { name: 'section' },
    { name: 'card' },
    { name: 'filter' },
  ]

  const db = await createDatabase(PAGES.HOME, 'Page Content', {
    Component: { select: { options: componentOptions } },
    Key: { title: {} },
    Page: { select: { options: pageOptions } },
    'Value EN': { rich_text: {} },
    'Value ES': { rich_text: {} },
  })

  for (const entry of pageContent) {
    await notion.pages.create({
      parent: { database_id: db.id },
      properties: {
        Component: { select: { name: entry.component } },
        Key: { title: [{ text: { content: entry.key } }] },
        Page: { select: { name: entry.page } },
        'Value EN': { rich_text: [{ text: { content: entry.valueEn.substring(0, 2000) } }] },
        'Value ES': { rich_text: [{ text: { content: entry.valueEs.substring(0, 2000) } }] },
      },
    })
    console.log(`  ✓ Created: ${entry.key}`)
  }
}

async function populateBannerContent() {
  console.log('\n🎯 Populating Banner Content...')

  const componentOptions = [{ name: 'banner' }, { name: 'dialog' }]

  const db = await createDatabase(PAGES.BANNERS, 'Banner Content', {
    Component: { select: { options: componentOptions } },
    Key: { title: {} },
    'Value EN': { rich_text: {} },
    'Value ES': { rich_text: {} },
  })

  for (const entry of bannerContent) {
    await notion.pages.create({
      parent: { database_id: db.id },
      properties: {
        Component: { select: { name: entry.component } },
        Key: { title: [{ text: { content: entry.key } }] },
        'Value EN': { rich_text: [{ text: { content: entry.valueEn.substring(0, 2000) } }] },
        'Value ES': { rich_text: [{ text: { content: entry.valueEs.substring(0, 2000) } }] },
      },
    })
    console.log(`  ✓ Created: ${entry.key}`)
  }
}

async function populateContactContent() {
  console.log('\n📞 Populating Contact Content...')

  const componentOptions = [{ name: 'info' }, { name: 'whatsapp' }, { name: 'footer' }]

  const db = await createDatabase(PAGES.CONTACT, 'Contact Content', {
    Component: { select: { options: componentOptions } },
    Key: { title: {} },
    'Value EN': { rich_text: {} },
    'Value ES': { rich_text: {} },
  })

  for (const entry of contactContent) {
    await notion.pages.create({
      parent: { database_id: db.id },
      properties: {
        Component: { select: { name: entry.component } },
        Key: { title: [{ text: { content: entry.key } }] },
        'Value EN': { rich_text: [{ text: { content: entry.valueEn.substring(0, 2000) } }] },
        'Value ES': { rich_text: [{ text: { content: entry.valueEs.substring(0, 2000) } }] },
      },
    })
    console.log(`  ✓ Created: ${entry.key}`)
  }
}

async function populateSocialLinks() {
  console.log('\n🌐 Populating Social Links...')

  const db = await createDatabase(PAGES.CONTACT, 'Social Links', {
    Handle: { rich_text: {} },
    Name: { title: {} },
    Order: { number: {} },
    URL: { url: {} },
  })

  for (const link of socialLinks) {
    await notion.pages.create({
      parent: { database_id: db.id },
      properties: {
        Handle: { rich_text: [{ text: { content: link.handle } }] },
        Name: { title: [{ text: { content: link.name } }] },
        Order: { number: link.order },
        URL: { url: link.url },
      },
    })
    console.log(`  ✓ Created social link: ${link.name}`)
  }
}

async function populateNavigationLinks() {
  console.log('\n🔗 Populating Navigation Links...')

  const db = await createDatabase(PAGES.CONTACT, 'Navigation Links', {
    'Name EN': { rich_text: {} },
    'Name ES': { title: {} },
    Order: { number: {} },
    Path: { rich_text: {} },
  })

  for (const link of navigationLinks) {
    await notion.pages.create({
      parent: { database_id: db.id },
      properties: {
        'Name EN': { rich_text: [{ text: { content: link.nameEn } }] },
        'Name ES': { title: [{ text: { content: link.nameEs } }] },
        Order: { number: link.order },
        Path: { rich_text: [{ text: { content: link.path } }] },
      },
    })
    console.log(`  ✓ Created nav link: ${link.nameEs}`)
  }
}

async function main() {
  console.log('🚀 Starting Notion content population...\n')

  try {
    await populateSlides()
    await populateServices()
    await populateBenefits()
    await populateFeatures()
    await populateTerms()
    await populatePageContent()
    await populateBannerContent()
    await populateContactContent()
    await populateSocialLinks()
    await populateNavigationLinks()

    console.log('\n✅ All content populated successfully!')
  } catch (error) {
    console.error('\n❌ Error populating content:', error)
    process.exit(1)
  }
}

void main()
