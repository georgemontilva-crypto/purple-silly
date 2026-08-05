# Auditoría — purple-silly (Purple Organics / "Silly")

Repo: `georgemontilva-crypto/purple-silly` · Deploy: Railway
Fecha: 2026-08-05 · Alcance: solo lectura, ningún archivo de código fue modificado.

No existe `CLAUDE.md` en el repo (ni en la raíz ni en subcarpetas), así que esta auditoría se basa en lectura directa del código (`server/`, `client/`, `drizzle/`, `shared/`), `package.json`, `Dockerfile` y `RAILWAY_ENV_VARS.md`.

**Contexto de entorno confirmado en Railway:** `DATABASE_URL`, `JWT_SECRET`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL` están configuradas. `SHOPIFY_SHOP`, `SHOPIFY_CLIENT_ID`, `SHOPIFY_CLIENT_SECRET` **no existen**. Tampoco existen las variables de Manus OAuth (`VITE_APP_ID`, `OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL`, `OWNER_OPEN_ID`) ni las de Manus Forge Storage (`BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY`) — estas últimas ni siquiera aparecen en `RAILWAY_ENV_VARS.md`.

---

## Resumen ejecutivo

El hallazgo más grave no es Shopify — es que **nadie puede iniciar sesión en producción**, incluido el dueño del sitio. Todo el login pasa por OAuth de Manus (`api.manus.im` / `manus.im`), cuyas variables no están configuradas en Railway ni están documentadas como obligatorias. Consecuencia directa: el panel `/admin` completo (productos, categorías, lab reports, assets, usuarios) es inalcanzable hoy, con o sin Shopify.

El segundo hallazgo grave es independiente de Shopify y de Manus: **no hay forma de ver el carrito ni llegar al checkout** — el ícono del carrito enlaza a una ruta `/cart` que no existe, y el drawer lateral de carrito (mencionado en `todo.md` como "completado") nunca se renderiza en ningún lado.

El tercero: hay **dos integraciones de Shopify distintas y mutuamente incompatibles** conviviendo en el mismo código (una vía tRPC server-side con `SHOPIFY_SHOP`/`CLIENT_ID`/`CLIENT_SECRET`, otra vía fetch directo del navegador con `VITE_SHOPIFY_STORE_DOMAIN`/`VITE_SHOPIFY_STOREFRONT_TOKEN`). Configurar solo las variables documentadas en `RAILWAY_ENV_VARS.md` deja la mitad de las páginas de producto mostrando datos falsos de "Ferris Wheel".

---

## 1. Estado real de cada integración

### Shopify — NO configurado, y el código está dividido en dos integraciones incompatibles

| Vía | Dónde | Variables que necesita | Estado |
|---|---|---|---|
| tRPC server-side (Admin API, Client Credentials Grant) | `server/shopify.ts`, `server/routers/shopify.ts` | `SHOPIFY_SHOP`, `SHOPIFY_CLIENT_ID`, `SHOPIFY_CLIENT_SECRET` | Documentada en `RAILWAY_ENV_VARS.md`. No configurada. Usada por `MeetTheLineup.tsx` (home) y `CartContext.tsx` (checkout). |
| Fetch directo desde el navegador (Storefront API) | `client/src/lib/shopify.ts` | `VITE_SHOPIFY_STORE_DOMAIN`, `VITE_SHOPIFY_STOREFRONT_TOKEN` | **No documentada en `RAILWAY_ENV_VARS.md`**, no configurada. Usada por `ShopPage.tsx` y `ProductDetailPage.tsx`. |

`todo.md` afirma que "CartContext refactorizado para usar tRPC server-side (sin secrets en frontend)" — eso es cierto solo para `CartContext`. `ShopPage` y `ProductDetailPage` (las dos páginas de catálogo/producto) siguen usando el cliente antiguo del navegador. Aunque se configuren `SHOPIFY_SHOP`/`CLIENT_ID`/`CLIENT_SECRET` tal como indica `RAILWAY_ENV_VARS.md`, estas dos páginas **seguirían mostrando datos placeholder** porque leen variables `VITE_*` distintas que nadie documentó.

Además, dentro de la propia vía tRPC hay una inconsistencia: `createCart()` en `server/shopify.ts:211-245` (no usado por ningún router) intenta usar `SHOPIFY_STOREFRONT_TOKEN` (otra variable más, tampoco documentada), mientras que el checkout real (`createCheckout` en `server/routers/shopify.ts:51-75`) no llama a Shopify en absoluto — solo arma una URL con el shop domain (ver bug #2 más abajo).

### Cloudflare R2 — configurado y funcional a nivel servidor, pero desconectado del storefront

`server/routers/admin.ts:11-39` (`getR2Client`, `uploadToR2`, `deleteFromR2`) está correctamente implementado con `@aws-sdk/client-s3` y usa exactamente las 5 variables que están configuradas en Railway. El endpoint `admin.assets.upload` sube imágenes a R2 correctamente.

El problema: **ningún componente del storefront lee `admin.assets.listPublic`**. Navbar, Footer, Hero, MeetTheLineup, etc. usan URLs de imagen hardcodeadas (`/manus-storage/...` o placeholders grises). Subir una imagen desde `/admin → Assets` no tiene ningún efecto visible en el sitio — la tabla `siteAssets` se llena, pero nada la consume. Ver bug #7.

Adicionalmente, el upload de PDFs de lab reports (`admin.labReports.create`, `server/routers/admin.ts:154`) **no usa R2** — usa `storagePut()` de `server/storage.ts`, que depende de Manus Forge Storage (`BUILT_IN_FORGE_API_URL`/`BUILT_IN_FORGE_API_KEY`), variables que no existen en Railway. Ver sección 2 y bug #5.

### MySQL — conectado, pero el esquema no se aplica solo

`server/db.ts:9-19` crea la conexión Drizzle de forma perezosa a partir de `DATABASE_URL` (configurada). La lógica de conexión en sí está bien.

Sin embargo, `RAILWAY_ENV_VARS.md` afirma: *"El esquema de la base de datos se aplica en el primer arranque (Drizzle migrations)"* — **esto es falso tal como está el `Dockerfile` hoy**. El `Dockerfile:8-17` solo corre `pnpm run build` y luego `node dist/index.js`. El script `db:push` (`drizzle-kit generate && drizzle-kit migrate`) nunca se invoca automáticamente en ningún punto del arranque. Si la base de MySQL de Railway está vacía, cada query (`users`, `lab_reports`, etc.) fallará con "table doesn't exist" hasta que alguien corra `pnpm db:push` manualmente contra el `DATABASE_URL` de producción.

### Auth / Manus OAuth — completamente roto, no "opcional" como dice la documentación

`RAILWAY_ENV_VARS.md` etiqueta las variables de Manus OAuth como *"opcional — solo si usas login con Manus"*. Eso es engañoso: **es el único mecanismo de login que existe en el código**. No hay login por email/password, ni ningún otro proveedor. Sin `OAUTH_SERVER_URL`, `VITE_APP_ID`, `VITE_OAUTH_PORTAL_URL` y `OWNER_OPEN_ID`, nadie puede autenticarse — ni un usuario normal ni el dueño del sitio. Ver sección 2 para el detalle técnico completo.

---

## 2. Código que depende de servicios de Manus inexistentes en Railway

| Archivo | Servicio Manus del que depende | Qué se rompe |
|---|---|---|
| `server/_core/sdk.ts` (toda la clase `SDKServer`) | `OAUTH_SERVER_URL` (`ENV.oAuthServerUrl`, línea 33-38) — API OAuth de Manus (`webdev.v1.WebDevAuthPublicService`) | `exchangeCodeForToken`, `getUserInfo`, `getUserInfoWithJwt`, `authenticateRequest` fallan siempre. Ningún usuario puede autenticarse. |
| `client/src/const.ts:15-31` (`startLogin`) | `VITE_OAUTH_PORTAL_URL`, `VITE_APP_ID` | `new URL(\`${oauthPortalUrl}/app-auth\`)` con `oauthPortalUrl=""` lanza **`TypeError: Invalid URL`** sin capturar. Cualquier botón "Sign in" que llame a `startLogin()` rompe con una excepción JS no controlada en vez de redirigir. |
| `server/_core/oauth.ts` (`/api/oauth/callback`) | Depende de `sdk.exchangeCodeForToken` / `sdk.getUserInfo` | Si alguna vez se llega a este endpoint (no debería, porque `startLogin` ya falla antes), responde `500 { error: "OAuth callback failed" }`. |
| `server/db.ts:58` | `OWNER_OPEN_ID` (`ENV.ownerOpenId`) | El bootstrap automático de admin (`openId === OWNER_OPEN_ID → role: 'admin'`) nunca se dispara porque nadie llega a tener un `openId` válido — no hay forma de crear un admin. |
| `server/storage.ts` (`storagePut`, `storageGetSignedUrl`) | `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY` (Manus Forge Storage) | `getForgeConfig()` lanza `Error("Storage config missing...")`. Usado por `server/routers/admin.ts:154` (upload de lab reports) y por `server/_core/imageGeneration.ts:99`. |
| `server/_core/storageProxy.ts:12-15` (`GET /manus-storage/*`) | Mismas variables Forge | Responde **`500 "Storage proxy not configured"`** en cada request. Afecta a toda imagen servida vía `/manus-storage/...` (ver tabla de imágenes rotas, bug #6). |
| `server/_core/notification.ts:71-83` (`notifyOwner`) | `BUILT_IN_FORGE_API_URL`/`KEY` (Notification Service de Manus) | Lanza `TRPCError INTERNAL_SERVER_ERROR`. Usado por `systemRouter.notifyOwner` (procedure admin-only, hoy inalcanzable). |
| `server/_core/llm.ts` | LLM Gateway de Manus | **No importado por ningún router ni componente** — código muerto, no rompe nada hoy, pero es deuda de plantilla. |
| `server/_core/imageGeneration.ts` | Forge Storage + servicio de generación de imágenes de Manus | Ídem: no importado por nadie. Código muerto. |
| `server/_core/map.ts` | API de mapas de Manus | No importado por nadie. Código muerto. |
| `server/_core/voiceTranscription.ts` | Servicio de transcripción de Manus | No importado por nadie. Código muerto. |
| `server/_core/dataApi.ts` | Data API de Manus | No importado por nadie. Código muerto. |
| `server/_core/heartbeat.ts` | Heartbeat/keepalive de Manus | No importado por nadie (ni siquiera desde `server/_core/index.ts`). Código muerto. |
| `client/src/components/AIChatBox.tsx` | Pensado para invocar `invokeLLM` en el servidor (ver comentario línea 20-21) | Solo se usa dentro de `ComponentShowcase.tsx`, que no está ruteado. No ejecuta nada en producción. |
| `vite.config.ts:7,153` (`vitePluginManusRuntime()`) | Runtime de Manus para comunicación con el iframe del editor | Se incluye sin condicionar por `NODE_ENV`, a diferencia del debug collector (línea 82-84, que sí se desactiva en producción). No se detectaron llamadas de red salientes en el bundle (`runtime_dist`), así que fuera del entorno Manus probablemente es inerte, pero es peso muerto en cada build de producción. |

**Conclusión de esta sección:** el login (Manus OAuth) y el almacenamiento de archivos "por defecto" (Manus Forge) son las dos dependencias de Manus que **sí rompen funcionalidad activa** en Railway. El resto (`llm.ts`, `imageGeneration.ts`, `map.ts`, `voiceTranscription.ts`, `dataApi.ts`, `heartbeat.ts`, `AIChatBox`, `ManusDialog`, `Map.tsx`) es scaffolding de plantilla que nunca se conectó a nada — no rompe, pero tampoco sirve; es candidato a borrado (sección 4).

---

## 3. Bugs funcionales reales

Ordenados por impacto en el usuario final.

### 🔴 #1 — No existe forma de ver el carrito ni llegar al checkout (independiente de Shopify)
**Archivos:** `client/src/components/Navbar.tsx:283` (`<Link href="/cart">`), `client/src/App.tsx:24-38` (rutas), `client/src/contexts/CartContext.tsx:21-22,117-118` (`isOpen`/`openCart`/`closeCart`).
El ícono del carrito en el navbar apunta a `/cart`, ruta que no existe en `App.tsx` → cae en el catch-all `NotFound`. Por otro lado, `CartContext` expone `isOpen`/`openCart`/`closeCart` (pensado para un drawer lateral, mencionado como "completado" en `todo.md`), pero **ningún componente del árbol renderiza algo condicionado a `cart.isOpen`** — no existe `CartDrawer` en todo el repo. `addItem()` llama `setIsOpen(true)` (línea 75) pero no hay nada escuchando ese estado.
**Impacto:** un usuario que agrega productos al carrito recibe el toast "Added to cart!" y nada más — no puede ver qué hay en el carrito ni pagar, salvo que adivine que debe navegar manualmente a otra parte. Esto rompe el flujo de compra completo, con o sin Shopify configurado.

### 🔴 #2 — El botón de Checkout navega a una URL rota cuando falta Shopify
**Archivos:** `server/routers/shopify.ts:62-75` (`createCheckout`), `client/src/contexts/CartContext.tsx:93-106` (`goToCheckout`).
`createCheckout` arma `` `https://${shop}/cart/${cartItems}` `` con `shop = process.env.SHOPIFY_SHOP ?? ""`. Sin la variable, `shop` es `""`, y el resultado es `https:///cart/123:1` (host vacío). La mutation **no lanza error** — resuelve exitosamente con esa URL malformada — y `goToCheckout` hace `window.location.href = result.checkoutUrl` (línea 100), navegando el navegador a una URL inválida.
**Impacto:** el usuario hace clic en "Checkout" y no ve ningún mensaje de error dentro de la app (el `catch` en `CartContext.tsx:101-102` nunca se dispara porque la promesa no rechaza); el navegador simplemente falla al resolver la URL. Comportamiento confuso, sin feedback.

### 🔴 #3 — Login completamente inalcanzable → panel admin 100% inaccesible
**Archivos:** `client/src/const.ts:24`, `server/_core/sdk.ts` (toda la clase), `client/src/pages/admin/AdminDashboard.tsx:149-158`.
Ver detalle técnico en sección 2. `AdminDashboard.tsx:149` exige `user.role === "admin"`, pero como nadie puede autenticarse, esa condición nunca se cumple para nadie, ni siquiera para el dueño del sitio (`OWNER_OPEN_ID`).
**Impacto:** el CRUD de productos, categorías, lab reports, assets y usuarios existe y está bien construido, pero es 100% inoperable en producción hoy.

### 🟠 #4 — `ShopPage`/`ProductDetailPage` usan una integración de Shopify distinta y no documentada
**Archivos:** `client/src/pages/ShopPage.tsx:4,59-65`, `client/src/pages/ProductDetailPage.tsx:4,44-61`, `client/src/lib/shopify.ts:4-9`.
Ver detalle en sección 1. Consecuencia funcional: incluso configurando `SHOPIFY_SHOP`/`SHOPIFY_CLIENT_ID`/`SHOPIFY_CLIENT_SECRET` como indica `RAILWAY_ENV_VARS.md`, estas dos páginas seguirían mostrando 6 productos ficticios marca "Ferris Wheel" (`ShopPage.tsx:9-16`, `ProductDetailPage.tsx:9-23`) en vez de los productos reales.

### 🟠 #5 — Upload de lab reports usa almacenamiento de Manus en vez de R2
**Archivos:** `server/routers/admin.ts:154`, `server/storage.ts:7-18`.
`admin.labReports.create` llama `storagePut()` (Manus Forge), no `uploadToR2()` como sí hace correctamente `admin.assets.upload` (línea 226 del mismo archivo). Con las variables Forge ausentes, cualquier intento de subir un PDF de lab report lanza `Error: Storage config missing`. Y aunque se subiera, la URL resultante (`/manus-storage/lab-reports/...`) pasa por `storageProxy.ts`, que también depende de Forge y devuelve `500`.
**Impacto:** aun si se arreglara el login (bug #3), el módulo de Lab Reports seguiría sin poder subir ni servir archivos.

### 🟠 #6 — Imágenes rotas en todo el sitio: logo y productos destacados
**Archivos:** `client/src/components/Navbar.tsx:6,16,25,34`, `client/src/components/Footer.tsx:3`, `client/src/components/MeetTheLineup.tsx:7-9`.
Estos archivos referencian directamente `/manus-storage/Purple_Logo_Variations_white_997d1ec1.webp` y tres imágenes de producto (`SuperSillyDots*.webp`). Como `server/_core/storageProxy.ts` devuelve `500` sin las credenciales de Forge, **el logo del header, el logo del footer, las 3 imágenes del dropdown "SHOP" del navbar y las 3 imágenes de fallback de "Meet the Lineup" en el home aparecen como ícono de imagen rota** en cualquier visita al sitio hoy.
**Impacto:** esto no depende de Shopify — pasa siempre, en cualquier página, para cualquier visitante.

### 🟠 #7 — El "Assets Manager" de admin no tiene ningún efecto en el storefront
**Archivos:** `server/routers/admin.ts:202-209` (`assets.listPublic`), grep completo de `client/` confirma cero usos de `listPublic`.
El endpoint existe y funciona (sube a R2 correctamente), pero ningún componente del sitio público lo consulta. Subir/reemplazar una imagen desde `/admin → Assets` no cambia nada en Home, Navbar, Footer, etc., porque esos componentes usan URLs hardcodeadas o placeholders grises fijos en el JSX.
**Impacto:** funcionalidad "fantasma" — el admin cree que está actualizando imágenes del sitio y no pasa nada.

### 🟡 #8 — Las rutas `/collections/:handle` no filtran por colección
**Archivo:** `client/src/pages/ShopPage.tsx:4,55-65`.
La ruta dinámica `/collections/:handle` (definida en `App.tsx:30`) renderiza `ShopPage`, pero `ShopPage` nunca lee `useParams()` — siempre llama `getProducts(24)` sin importar el handle. `/collections/silly-dots`, `/collections/silly-euphoria` y `/collections/silly-bites` (enlazados desde el mega-menú del Navbar, líneas 15, 24, 33) muestran exactamente el mismo catálogo completo sin filtrar.

### 🟡 #9 — Enlaces internos rotos (independientes de Shopify)
Cruce de todos los `href`/`path` de `client/src` contra las rutas registradas en `App.tsx:24-38`:

| Enlace usado | Archivo:línea | Ruta real esperada | Resultado |
|---|---|---|---|
| `/shop` | `Navbar.tsx:172` | `/collections/all` | 404 (NotFound) |
| `/faq` | `Navbar.tsx:256` | `/pages/faq` | 404 (NotFound) |
| `/blogs/news` | `Navbar.tsx:255`, `Footer.tsx:22` | no existe | 404 (NotFound) |
| `/cart` | `Navbar.tsx:283` | no existe | 404 (NotFound) — ver bug #1 |
| `/pages/lab-reports` | `Footer.tsx:17` | `/lab-reports` | Cae en `/pages/:slug` → `PolicyPage` muestra "Page not found." (`PolicyPage.tsx:103-107`) |
| `/pages/what-is-kanna` | `Footer.tsx:21` | `/what-is-silly` | Mismo caso: "Page not found." |
| `/pages/loyalty` | `Footer.tsx:23` | no existe página real | Mismo caso: "Page not found." |

### 🟡 #10 — Contenido legal con la marca equivocada
**Archivo:** `client/src/pages/PolicyPage.tsx:7,19,31,37,42,57,67,73,91`.
Privacy Policy, Terms & Conditions, Shipping Info, Refund Policy y el aviso CCPA referencian "Ferris Wheel" e `info@getferriswheel.com` en vez de "Purple Organics". Lo mismo en `client/src/pages/ContactPage.tsx:58,66` (email y help center). Es contenido legal/de contacto real mostrado al usuario final con datos de la marca anterior.

### 🟡 #11 — `startLogin()` puede lanzar una excepción no controlada
**Archivo:** `client/src/const.ts:24`.
`new URL(\`${oauthPortalUrl}/app-auth\`)` con `oauthPortalUrl` vacío arroja `TypeError: Invalid URL`. Esto se ejecuta desde el botón "Sign in" de `DashboardLayout.tsx:72` (componente no ruteado hoy, ver sección 4) y también sería el resultado de cualquier redirect automático por 401 vía `client/src/main.tsx:13-21`. Bajo impacto real hoy porque nada activo lo dispara, pero es una trampa para cuando se reactive `protectedProcedure`.

### 🟢 #12 — Auto-democión de admin sin confirmación
**Archivo:** `client/src/pages/admin/AdminUsers.tsx:80-91`.
El botón "Revoke Admin"/"Make Admin" ejecuta `updateRole.mutate(...)` directo al `onClick`, sin diálogo de confirmación (a diferencia del botón "Delete" de `AdminLabReports.tsx:224`, que sí usa `confirm(...)`). Un admin puede auto-revocarse por error. Impacto bajo hoy porque el panel es inalcanzable (bug #3).

---

## 4. Componentes y páginas sin usar o sin rutear

Confirmado por búsqueda de imports en todo `client/` y `server/`:

| Archivo | Estado |
|---|---|
| `client/src/pages/ComponentShowcase.tsx` | No está en ninguna `<Route>` de `App.tsx`. Página de catálogo de componentes de la plantilla, ~1400 líneas, muerta. |
| `client/src/components/AIChatBox.tsx` | Solo lo importa `ComponentShowcase.tsx` (que no está ruteada). Sin consumidor real. |
| `client/src/components/Map.tsx` | Cero referencias en todo `client/`. |
| `client/src/components/ManusDialog.tsx` | Cero referencias fuera de sí mismo. |
| `client/src/components/DashboardLayout.tsx` + `DashboardLayoutSkeleton.tsx` | Cero referencias externas. Es un layout de dashboard genérico de plantilla ("Page 1"/"Page 2", `/some-path`) — el admin real (`AdminDashboard.tsx`) tiene su propio layout con tabs y no usa este componente. |
| `server/_core/llm.ts` | No importado por ningún router. |
| `server/_core/imageGeneration.ts` | No importado por ningún router (sí importa `storagePut`, pero nadie lo importa a él). |
| `server/_core/map.ts` | No importado por ningún router. |
| `server/_core/voiceTranscription.ts` | No importado por ningún router. |
| `server/_core/dataApi.ts` | No importado por ningún router. |
| `server/_core/heartbeat.ts` | No importado ni siquiera desde `server/_core/index.ts`. |
| `server/routers/shopify.ts` — procedures `ping` y `product` | Definidos pero nunca invocados desde `client/` (grep de `trpc.shopify.*` solo encuentra usos de `products`, `collections`, `createCheckout`). |
| `server/shopify.ts` — `createCart()` | Definida pero ningún router la importa; el checkout real no usa esta función. |

---

## 5. Formularios y botones que no hacen nada (UI decorativa)

| Elemento | Archivo:línea | Qué aparenta hacer | Qué hace en realidad |
|---|---|---|---|
| Formulario de contacto | `client/src/pages/ContactPage.tsx:9-17` | Enviar un mensaje al negocio | `setTimeout(800ms)` + `toast.success(...)`. No hay `fetch`, `mutation` ni envío de email. El mensaje se descarta. |
| Newsletter (email) | `client/src/components/NewsletterSection.tsx:16-25` | Suscribir el email a una lista de correo | Mismo patrón: `setTimeout` + toast. El email nunca se guarda ni se envía a ningún sitio. Este componente aparece en Home, ShopPage y ProductDetailPage. |
| Botón "SIGN UP FOR TEXTS" | `client/src/components/NewsletterSection.tsx:46-50` | Registrar al usuario para SMS | Solo muestra `toast.info("Text PURPLE to 55555...")`. No hay integración SMS real. |
| Ícono de carrito (navbar) | `client/src/components/Navbar.tsx:283-306` | Abrir el carrito | Enlaza a una ruta inexistente (`/cart`) → 404. Ver bug #1. |

---

## 6. Riesgos de seguridad

### Correcto hoy
- Todos los procedures de escritura sensibles (`admin.users.updateRole`, `admin.categories.*` create/update/delete, `admin.labReports.create/update/delete`, `admin.assets.upload/update/delete`, `system.notifyOwner`) usan `adminProcedure` (`server/_core/trpc.ts:30-45`), que exige `ctx.user.role === 'admin'`. No hay procedures administrativos expuestos como públicos por error.
- `admin.categories.list` y `admin.labReports.list` son `publicProcedure` intencionalmente (catálogo público de lab reports) — correcto, no es un hallazgo.
- No se detectaron secretos reales hardcodeados en el repo (`server/shopify.test.ts` solo contiene strings de ejemplo tipo `"shpat_abc123"` en tests, no credenciales reales — coincide con el commit `46cb7c8 "Remove hardcoded Shopify secret from test file"`, ya corregido). `.env` está vacío y correctamente ignorado por git.
- No hay `define` en `vite.config.ts` que filtre variables de entorno del servidor al bundle del cliente; solo las prefijadas `VITE_*` llegan al frontend, como corresponde.

### Hallazgos

1. **Validación de `contentType` faltante en uploads de admin.** `server/routers/admin.ts:216` (`assets.upload`) y línea 147 (`labReports.create`) aceptan `contentType: z.string()` sin allowlist. Un admin (o una sesión de admin comprometida) puede subir y servir públicamente desde el bucket R2 cualquier tipo de contenido, incluido `text/html`, sin restricción a tipos de imagen/PDF esperados.

2. **Sin sanitización de `section`/`label` en la key de R2.** `server/routers/admin.ts:212-213,225` construye la key del objeto R2 como `` `site-assets/${input.section}/...` `` con `section: z.string().min(1).max(128)` — sin regex restrictivo (a diferencia de `categories.create`, que sí valida `slug` con `/^[a-z0-9-]+$/` en la línea 85). Un valor de `section` con `../` no está bloqueado a nivel de aplicación (impacto limitado porque R2 no tiene traversal de filesystem real, pero es la misma clase de descuido que si se reutilizara ese patrón en otro backend de storage).

3. **Bootstrap de admin totalmente implícito y automático.** `server/db.ts:58`: cualquier usuario cuyo `openId` de Manus coincida con `OWNER_OPEN_ID` se convierte en admin automáticamente en su primer login, sin ningún paso de verificación adicional. Hoy es inalcanzable (bug #3), pero es un punto a revisar con cuidado en el momento en que se restaure o reemplace el login: si `OWNER_OPEN_ID` llegara a configurarse mal, o si el proveedor de auth cambia, este mecanismo debe revisarse antes de reactivarlo.

4. **Cookie de sesión depende de `x-forwarded-proto`.** `server/_core/cookies.ts:11-22,42-48`: la cookie de sesión se marca `sameSite: "none"` siempre, y `secure` se calcula a partir de `req.protocol === "https"` o el header `x-forwarded-proto`. Railway normalmente sí setea ese header correctamente vía su proxy, pero si alguna vez no lo hiciera (cambio de infraestructura, healthcheck interno, etc.), la cookie se emitiría sin `Secure` + `SameSite=None`, combinación que los navegadores modernos rechazan silenciosamente — fallos de login difíciles de diagnosticar. No es una vulnerabilidad activa, es un punto frágil a vigilar.

5. **Ningún procedure público está limitado por rate limit.** `shopify.products`, `shopify.collections`, `admin.categories.list`, `admin.labReports.list` son públicos y no tienen ningún throttling propio — hoy `shopify.*` fallaría rápido por falta de credenciales, pero una vez configurado Shopify, cada carga de home dispara una llamada a la Admin API de Shopify sin caché de aplicación (solo `staleTime` de 5 min en el cliente, `MeetTheLineup.tsx:199`, que no protege contra tráfico multiusuario). No es explotable como tal, pero no hay ninguna capa de caché/backoff server-side ante un pico de tráfico.

No se encontraron: secretos de Shopify/R2/JWT expuestos al bundle del cliente, endpoints admin marcados como públicos por error, ni inyección SQL (Drizzle parametriza todas las queries).

---

## 7. Qué rompe específicamente por la falta de Shopify

| Componente / página / procedure | Archivo | Cómo falla hoy |
|---|---|---|
| `shopify.products` (tRPC) | `server/routers/shopify.ts:22-32` → `server/shopify.ts:15-21` | Lanza `Error("Shopify credentials not configured...")` → tRPC `INTERNAL_SERVER_ERROR`. |
| `MeetTheLineup` (home, sección "Meet the Lineup") | `client/src/components/MeetTheLineup.tsx:197-218` | **Degrada con gracia**: `useQuery` con `retry: 1` cae en error, `products` usa el array `FALLBACK` (3 productos hardcodeados). No hay spinner infinito ni pantalla en blanco — pero las imágenes de fallback son las mismas `/manus-storage/...` rotas por el bug #6, así que las tarjetas se ven con ícono de imagen rota. |
| `AdminProducts` (admin → Products) | `client/src/pages/admin/AdminProducts.tsx:12,53-67` | **Degrada con gracia**: muestra el estado vacío "No products found — Connect your Shopify store to see products here." Sin crash. (Inalcanzable de todas formas por bug #3.) |
| `shopify.collections` (tRPC) | `server/routers/shopify.ts:43-48` | Mismo error que `products`. Consumida solo por `AdminProducts.tsx:13`, que simplemente no renderiza la sección de collections si `collections` es `undefined`. |
| `shopify.createCheckout` (tRPC) | `server/routers/shopify.ts:62-75` | **No lanza error** — arma una URL malformada (`https:///cart/...`) y la retorna como éxito. Ver bug #2: el usuario es redirigido a una URL rota sin ningún mensaje dentro de la app. |
| `ShopPage` (`/collections/all`, `/collections/:handle`) | `client/src/pages/ShopPage.tsx:59-65` | `isShopifyConfigured()` (de `lib/shopify.ts`, variables `VITE_SHOPIFY_*` — **ni siquiera son las mismas que faltan del lado servidor**) retorna `false` → muestra 6 productos placeholder marca "Ferris Wheel" + banner visible "⚡ Connect your Shopify store to display real products." Página funcional, pero con datos y marca incorrectos. |
| `ProductDetailPage` (`/products/:handle`) | `client/src/pages/ProductDetailPage.tsx:44-61` | Mismo mecanismo: siempre muestra el producto placeholder fijo "Party Tablets - Blue Razz", sin importar qué `handle` reales existan (`silly-dots-hero-dose`, etc.). No hay loading infinito — resuelve inmediato al placeholder — pero el contenido es engañoso. |
| `shopify.ping` (tRPC) | `server/routers/shopify.ts:12-19` | Diseñada para no lanzar (`try/catch` interno, retorna `{ok:false, error}`), pero no la consume ningún componente — es un endpoint de diagnóstico sin UI. |
| `shopify.product` (tRPC, por handle) | `server/routers/shopify.ts:35-40` | Lanzaría el mismo error que `products`, pero no tiene consumidores en `client/` — código muerto, no visible para el usuario. |

**Patrón general:** el home (`MeetTheLineup`) y el panel admin (`AdminProducts`) degradan correctamente sin Shopify (aunque con las imágenes rotas del bug #6 encima). Las páginas de catálogo/producto (`ShopPage`, `ProductDetailPage`) también degradan sin crashear, pero usan una integración distinta y muestran productos de marca incorrecta. El único punto que falla de forma **silenciosa y confusa para el usuario** es el checkout (bug #2) — ahí no hay spinner ni pantalla en blanco, hay una redirección a una URL que no resuelve.

---

## 8. Plan de 5 fases

Ordenado por impacto real en el usuario final, no por facilidad. Todo lo dependiente de Shopify queda para el final. Cada fase es desplegable de forma independiente.

### Fase 1 — Reparar el flujo de compra y las imágenes rotas (no depende de Shopify ni de Manus)
No requiere ninguna variable de entorno nueva. Es el paquete de mayor impacto por esfuerzo.
- Construir el `CartDrawer` (o página `/cart`) que lea `cart.isOpen`/`cart.lines` de `CartContext` y agregar la ruta faltante — resuelve bug #1.
- Corregir `Navbar`/`Footer` para que sus enlaces apunten a rutas reales existentes (`/collections/all` en vez de `/shop`, `/pages/faq` en vez de `/faq`, quitar o crear `/blogs/news`, corregir los 3 links de `/pages/...` que caen en "Page not found") — bug #9.
- Reemplazar las URLs `/manus-storage/...` hardcodeadas en `Navbar.tsx`, `Footer.tsx` y `MeetTheLineup.tsx` por imágenes servidas desde R2 (ya configurado) o assets estáticos del build — bug #6, y de paso conecta el trabajo de la Fase siguiente.
- Corregir el copy legal/contacto para que diga "Purple Organics" en vez de "Ferris Wheel" — bug #10.

### Fase 2 — Conectar el Assets Manager (R2) al storefront real
R2 ya está configurado; solo falta cablear lo que ya existe.
- Hacer que Hero, Navbar, Footer, ChooseYourRide, etc. consuman `admin.assets.listPublic` en vez de placeholders/URLs fijas — resuelve bug #7 y hace útil el trabajo ya hecho en `admin.assets.upload`.
- Migrar el upload de lab reports (`admin.labReports.create`) de `storagePut()` (Manus Forge) a `uploadToR2()` — resuelve bug #5, usando infraestructura que ya existe y ya está pagada/configurada.
- Eliminar o aislar `server/storage.ts` y `server/_core/storageProxy.ts` (dependientes de Forge) una vez que nada los use, para no dejar una ruta pública (`/manus-storage/*`) que siempre responde 500.

### Fase 3 — Reemplazar el login de Manus por un mecanismo de auth que sí funcione en Railway
Esta es la fase de mayor impacto estructural: sin ella, `/admin` sigue siendo inalcanzable pase lo que pase en las fases 1 y 2.
- Decidir el reemplazo (email+password propio, magic link, u OAuth de un proveedor real tipo Google/GitHub) y reescribir `server/_core/sdk.ts` y `server/_core/oauth.ts` en torno a ese proveedor.
- Definir cómo se otorga el primer rol `admin` sin depender de `OWNER_OPEN_ID`/Manus (por ejemplo, semilla manual en la base de datos o comando one-off).
- Una vez migrado, todo el admin panel (Products [vista Shopify], Categories, Lab Reports, Assets, Users) queda operable con el trabajo ya construido en Fases 1-2.
- Correr `pnpm db:push` contra el `DATABASE_URL` de Railway (o automatizarlo en el arranque del contenedor) para que el esquema exista desde el primer deploy — cierra el hallazgo de la sección 1 sobre MySQL.

### Fase 4 — Limpieza de deuda de plantilla y hardening de seguridad menor
No bloquea nada de lo anterior, se puede intercalar.
- Borrar código muerto de Manus sin consumidores: `server/_core/llm.ts`, `imageGeneration.ts`, `map.ts`, `voiceTranscription.ts`, `dataApi.ts`, `heartbeat.ts`, `client/src/components/AIChatBox.tsx`, `Map.tsx`, `ManusDialog.tsx`, `DashboardLayout.tsx`/`DashboardLayoutSkeleton.tsx`, `client/src/pages/ComponentShowcase.tsx` — reduce superficie y confusión (sección 4).
- Agregar allowlist de `contentType` en `admin.assets.upload` y `admin.labReports.create`, y restringir el charset de `section` en `assets.upload` (hallazgos 1 y 2 de seguridad).
- Conectar de verdad el formulario de contacto y el newsletter (email real vía algún proveedor, o al menos guardarlos en la base) — bug de UI decorativa, sección 5.
- Agregar confirmación al botón "Revoke/Make Admin" en `AdminUsers.tsx` (hallazgo #12).

### Fase 5 — Shopify: unificar en una sola integración y configurar credenciales
Deliberadamente al final, como pidió el usuario.
- Decidir una sola vía (recomendado: la server-side vía tRPC, que ya no expone secretos al frontend) y eliminar la vía duplicada (`client/src/lib/shopify.ts` + su uso en `ShopPage.tsx`/`ProductDetailPage.tsx`), migrando esas dos páginas a `trpc.shopify.*`.
- Corregir `createCheckout` (`server/routers/shopify.ts:62-75`) para que valide que `SHOPIFY_SHOP` existe y falle explícitamente en vez de devolver una URL malformada como si fuera éxito — resuelve bug #2 de raíz.
- Implementar el filtrado real por colección en `/collections/:handle` (bug #8).
- Configurar `SHOPIFY_SHOP`, `SHOPIFY_CLIENT_ID`, `SHOPIFY_CLIENT_SECRET` en Railway y validar el flujo completo: catálogo → producto → carrito → checkout, de punta a punta, en producción.
