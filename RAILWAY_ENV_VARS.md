# Purple Silly — Variables de Entorno para Railway

Agrega estas variables en el tab **Variables** de tu servicio en Railway.

## Obligatorias

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | MySQL/PlanetScale connection string | `mysql://user:pass@host:3306/db?ssl={"rejectUnauthorized":true}` |
| `JWT_SECRET` | Secreto para firmar cookies de sesión (64 chars random) | `openssl rand -hex 32` |

## Shopify

| Variable | Descripción | Dónde obtenerla |
|---|---|---|
| `SHOPIFY_SHOP` | Dominio de tu tienda | `your-store.myshopify.com` |
| `SHOPIFY_CLIENT_ID` | Storefront API Client ID | Shopify Admin → Apps → Develop apps |
| `SHOPIFY_CLIENT_SECRET` | Storefront API Access Token | Shopify Admin → Apps → Develop apps |

## Cloudflare R2 (Assets Manager)

| Variable | Descripción | Dónde obtenerla |
|---|---|---|
| `R2_ACCOUNT_ID` | Tu Cloudflare Account ID | Cloudflare Dashboard → lado derecho |
| `R2_ACCESS_KEY_ID` | R2 API Token Access Key | R2 → Manage R2 API Tokens |
| `R2_SECRET_ACCESS_KEY` | R2 API Token Secret Key | R2 → Manage R2 API Tokens |
| `R2_BUCKET_NAME` | Nombre del bucket R2 | `purple-silly-assets` |
| `R2_PUBLIC_URL` | URL pública del bucket | `https://pub-xxxx.r2.dev` (activa Public Access en R2) |

## Manus OAuth (opcional — solo si usas login con Manus)

| Variable | Valor |
|---|---|
| `VITE_APP_ID` | Tu App ID de Manus |
| `OAUTH_SERVER_URL` | `https://api.manus.im` |
| `VITE_OAUTH_PORTAL_URL` | `https://manus.im` |
| `OWNER_OPEN_ID` | Tu OpenID de Manus |
| `OWNER_NAME` | Tu nombre |

## App

| Variable | Valor |
|---|---|
| `VITE_APP_TITLE` | `Purple Silly` |
| `NODE_ENV` | `production` (Railway lo pone automáticamente) |

---

## Pasos para desplegar en Railway

1. Crea un nuevo proyecto en [railway.app](https://railway.app)
2. Conecta el repositorio `purple-silly` desde GitHub
3. Agrega un servicio **MySQL** (o conecta PlanetScale/TiDB externamente)
4. Copia `DATABASE_URL` del servicio MySQL al servicio Node
5. Agrega todas las variables de la tabla de arriba
6. Railway detecta el `Dockerfile` automáticamente y despliega
7. El esquema de la base de datos se aplica en el primer arranque (Drizzle migrations)

## Notas importantes

- El `Dockerfile` ya está en la raíz del proyecto — Railway lo detecta automáticamente
- El servidor escucha en `process.env.PORT` (Railway lo inyecta automáticamente)
- Para R2: crea el bucket, activa **Public Access**, y crea un API Token con permisos `Object Read & Write`
