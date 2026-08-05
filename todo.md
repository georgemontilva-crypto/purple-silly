# Ferris Wheel - Project TODO

## Setup & Config
- [x] Configurar tema, fuentes (Google Fonts) y CSS global con colores de Ferris Wheel
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
