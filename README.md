Impulso Web App - E-commerce y Plataforma de Arte

1. Resumen del Proyecto
   impulso_web_app es una aplicación web avanzada construida con Next.js que funciona como un e-commerce headless para la venta de obras de arte. Se conecta a una tienda de Shopify como backend y ofrece una experiencia de usuario rápida y moderna, junto con paneles de control privados para la gestión de productos por parte de artistas y administradores.

El objetivo principal de esta aplicación es ofrecer una interfaz de venta altamente personalizada y, al mismo tiempo, delegar la gestión del inventario a diferentes roles de usuario, todo ello sin necesidad de acceder directamente al panel de administración de Shopify.

2. Arquitectura y Flujo de Trabajo
   El flujo de la aplicación se centra en consumir y gestionar los datos de los productos alojados en Shopify.

Fuente de Datos (Shopify): Shopify actúa como el "cerebro" del backend. Se asume que el inventario de productos en Shopify ya ha sido cargado y enriquecido con "tags inteligentes" a través de un proceso externo (el artwork_inventory_manager). Estos tags son fundamentales para el sistema de filtrado avanzado de la tienda.

Consumo de la API (Storefront): La tienda pública consume los datos de los productos directamente desde Shopify a través de su API de Storefront, lo que garantiza tiempos de carga rápidos y una sincronización perfecta del inventario.

Gestión Delegada (Admin API): La aplicación cuenta con un sistema de roles y permisos que utiliza la API de Admin de Shopify para permitir que usuarios específicos (Artistas, Managers) modifiquen los productos. Esto crea un flujo de gestión seguro y controlado.

Gestión de Usuarios (Prisma): La autenticación, los perfiles de usuario, los roles y los permisos se gestionan internamente a través de una base de datos propia manejada con Prisma.

3. Funcionalidades Clave
   Stack Tecnológico: Next.js, TypeScript, Shopify (Storefront & Admin APIs), Prisma (para usuarios y roles), Tailwind CSS, shadcn/ui.

Tienda Headless: Un e-commerce optimizado para el rendimiento, con navegación fluida y una experiencia de compra moderna.

Sistema de Filtrado Enriquecido (Implementado): Permite a los usuarios descubrir obras de arte a través de filtros detallados como Artista, Tipo de Obra, Rango de Precios, Técnica, Formato y Año. Esta funcionalidad se basa en los "tags inteligentes" preexistentes en los productos de Shopify.

Sistema de Roles y Permisos:

Público: Navega por la tienda, filtra y compra obras de arte.

Artista: Accede a un panel de control personal donde puede visualizar y editar la información de sus propias obras.

Manager/Admin: Tiene acceso a paneles con permisos elevados para la edición de todos los productos y la futura gestión de usuarios.

4. Estado Actual y Roadmap de Desarrollo
   La infraestructura principal de la aplicación está implementada. El enfoque actual está en desarrollar las funcionalidades de los paneles de control para artistas y administradores, así como expandir las capacidades de la plataforma.

✅ Implementado
Infraestructura de autenticación y sistema de roles con Prisma.

Conexión a la API Storefront de Shopify para mostrar productos en la tienda.

Sistema de filtrado avanzado y funcional, que interpreta y utiliza los tags inteligentes de Shopify para ofrecer una experiencia de búsqueda enriquecida.

Diseño base de la tienda y páginas de producto.

🚧 Pendientes por Desarrollar
A continuación, se presenta la lista de tareas prioritarias para completar el ecosistema.

1. Módulo de Exclusividad y Eventos

[ ] Eventos como Productos: Crear un tipo de producto específico para "Eventos", permitiendo su venta y gestión a través de Shopify.

[ ] Módulo de Tickets para Eventos: Desarrollar una sección donde los usuarios que compren acceso a un evento puedan ver y descargar su "boleto" digital.

[ ] Módulo de Gestión Financiera de Eventos: Un panel de administración para ver la rentabilidad, asistencia y otros KPIs de los eventos realizados.

2. Herramientas de Contenido y Administración

[ ] Blog: Crear un sistema de gestión de artículos y noticias para la galería.

[ ] Perfiles Públicos: Desarrollar páginas de perfil públicas para Artistas, mostrando su biografía y obras. Considerar perfiles para Admin, Manager y Support si aplica.

[ ] Módulo de Invoices Personalizados: Crear una herramienta para que Admin/Manager puedan generar y descargar facturas personalizadas para ventas especiales.

3. Módulos de Artista y Administración (En progreso)

[ ] Dashboard Enriquecido: Mejorar los dashboards de los diferentes roles utilizando la Admin API para mostrar datos relevantes (ventas, vistas, etc.).

4. Mejoras Generales y Refinamiento

[ ] Filtro por "Serie": Añadir la "Serie" de una obra como un tag inteligente y un filtro visible en la tienda.

[ ] Pruebas (Testing): Implementar un framework de pruebas (como Jest y React Testing Library) para asegurar la estabilidad del código.

[ ] Optimización de Rendimiento: Analizar y optimizar la carga de imágenes y los tiempos de respuesta de la API.

[ ] UI/UX: Refinar el diseño de los dashboards y la experiencia del usuario en el proceso de filtrado y compra.

[ ] CI/CD: Configurar un pipeline de integración y despliegue continuo para automatizar las actualizaciones.
