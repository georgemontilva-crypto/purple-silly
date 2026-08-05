# Purple Organics - Project TODO

## Setup & Config
- [x] Configurar tema, fuentes (Google Fonts) y CSS global con colores de Purple Organics
- [x] Configurar variables de entorno para Shopify Storefront API (pendiente token del usuario)
- [x] Crear contexto del carrito (CartContext) con Shopify Storefront API

## Componentes Base
- [x] AnnouncementBar - marquee animado "25% OFF ALL SUBSCRIPTIONS + FREE SHIPPING"
- [x] Navbar - logo, menú SHOP dropdown, links WHAT IS KANNA? / BLOG / FAQ, ícono carrito con contador
- [x] Footer - 3 columnas (Customer Care, About, Contact Us), redes sociales, disclaimer

## Secciones Home
- [x] Hero section - imagen de fondo, título, subtítulo, badge, botón CTA
- [x] ChooseYourRide - 2 columnas con imágenes y texto superpuesto
- [x] MeetTheLineup - tabs Party Tablets / Daily Mood Gummies + carrusel de productos desde Shopify API
- [x] Benefits - 4 íconos: Elevated Mood, Social Ease, Sharp Focus, Happy Landings
- [x] FAQ - acordeón con 7 preguntas sobre Kanna
- [x] Newsletter - input email + botón "SIGN UP FOR TEXTS"

## Integración Shopify
- [x] Shopify Storefront API client (fetch productos, colecciones)
- [x] Gestión de carrito (createCart, addToCart, updateCart)
- [x] Redirect a checkout de Shopify
- [x] Storefront Access Token como variable de entorno VITE_SHOPIFY_STOREFRONT_TOKEN
- [x] SHOPIFY_STORE_DOMAIN como variable de entorno
- [x] Integración Shopify server-side con Client Credentials Grant (Admin API)
- [x] tRPC router shopify: products, product, collections, createCheckout
- [x] CartContext refactorizado para usar tRPC server-side (sin secrets en frontend)
- [x] MeetTheLineup actualizado para consumir datos via tRPC
- [x] Credenciales configuradas: SHOPIFY_SHOP=purple-co-magic.myshopify.com

## Páginas Adicionales
- [x] Página /collections/all - catálogo completo de productos
- [x] Página /products/:handle - detalle de producto con variantes y Add to Cart
- [x] Drawer de carrito lateral con gestión completa

## Calidad
- [x] Esquinas redondeadas en todos los elementos (mejora sobre original)
- [x] Placeholders grises con medidas para imágenes pendientes
- [x] Responsive design (mobile-first)
- [x] Tests vitest para Shopify client
- [x] Checkpoint final

## Cambios Purple Organics (sesión actual)
- [x] Navbar dropdown estilo Purple Organics: "Get Groovy" header + 3 tarjetas (Silly Dots, Silly Euphoria, Silly Bites Gummies) con colores por producto
- [x] AnnouncementBar: texto más grande (0.875rem), más espaciado entre items, 5 mensajes de Purple Organics
- [x] HeroSection: fondo gris placeholder full-width (1920×1080px), sin imágenes flotantes, copy actualizado con info real de Silly Dots (mushrooms + nootropics, Mega/Hero/Super Dose)
- [x] ChooseYourRide: 3 tarjetas de líneas de producto con placeholders grises 800×600px (Silly Dots, Silly Euphoria, Silly Bites Gummies)
- [x] ChooseYourRide: tabs de 3 categorías (Silly Dots / Silly Euphoria / Silly Bites Gummies) con 3 sub-productos por categoría con placeholders grises
- [x] MeetTheLineup: eliminados tabs, todos los productos de la tienda, fondo animado canvas humo púrpura + glassmorfismo en tarjetas
