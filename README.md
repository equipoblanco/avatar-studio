# Avatar Studio 2D 🎨
**Plataforma Modular de Fidelización e Identidad Digital**

---

## 🚀 Despliegue en Vercel

Este proyecto cuenta con un `MockDataStore` reactivo de alta fidelidad en el frontend que permite probar **el 100% de las funcionalidades del editor y del panel de administración en Vercel** sin necesidad de desplegar el backend.

### Pasos para desplegar en Vercel:
1. Ve a [Vercel](https://vercel.com/) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **Add New...** -> **Project**.
3. Importa el repositorio: `equipoblanco/avatar-studio`.
4. En la configuración del proyecto:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (o selecciona la carpeta `frontend`)
   - **Build Command**: `cd frontend && npm install && npm run build` (o automático si elegiste `frontend`)
   - **Output Directory**: `frontend/dist` (o `dist` si elegiste `frontend`)
5. Haz clic en **Deploy**.

---

## 💻 Ejecución Local Integral (Fullstack: Frontend + Backend + MySQL)

Siga el flujo secuencial para desplegar y sincronizar todos los componentes del sistema:

### Paso 1: Base de Datos MySQL 8.4 (Docker)
En la raíz del proyecto, inicialice el contenedor de MySQL con el healthcheck preconfigurado:
```bash
docker compose up -d
```
Verifique que el servicio esté saludable con `docker ps`.
* **Host:** `localhost:3306`
* **Base de datos:** `avatar_platform`
* **Usuario:** `root`
* **Contraseña:** `password`

### Paso 2: Backend (Java 25 + Spring Boot 3.5.6)
En la carpeta `backend/`:
```bash
cd backend
mvn clean compile
mvn spring-boot:run
```
> **Nota de Flyway:** Al iniciar el backend, **Flyway ejecutará automáticamente las 4 migraciones SQL (`V1` a `V4`)**, creando las tablas (`categories`, `cosmetic_assets`, `incompatibility_rules`, `user_inventory`, `outfits`) e insertando las 48 piezas cosméticas y reglas maestras.

El backend quedará operativo en `http://localhost:8080`.

### Paso 3: Frontend (React 18 + Vite + TypeScript)
En una nueva terminal, en la carpeta `frontend/`:
```bash
cd frontend
npm install
npm run dev
```
Abre en tu navegador `http://localhost:5173`.
Vite cuenta con un proxy configurado hacia `/api` (`http://localhost:8080`), por lo que cualquier acción en el editor o en el panel de administración se sincroniza de forma inmediata y persistente con la base de datos MySQL.

---

## ✨ Características Principales
- **Estudio Toonix**: 7 categorías cosméticas (Cuerpo, Rostro, Cabello, Ropa superior, Ropa inferior, Zapatos, Accesorios).
- **Selector Facial Granular**: 8 estilos de ojos y 12 expresiones de boca independientes.
- **Superposición Estricta de Capas (Z-Index)**: El cabello cubre la cabeza y los accesorios/sombreros cubren el cabello.
- **Reglas de Incompatibilidad**: Detección bidireccional y aviso de solapamiento asistido.
- **Panel Administrativo**: Catálogo maestro de 48 piezas, filtros por categoría y estado, drawer para mover cosméticos entre categorías y administración de fallbacks protegidos.
- **Arquitectura de Resiliencia**: Funciona tanto conectado al backend Spring Boot/MySQL como de forma desacoplada con su MockDataStore integrado.
