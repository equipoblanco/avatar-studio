# Avatar Studio 2D 🎨

Plataforma de personalización de avatares 2D (estilo Toonix) y catálogo administrativo de cosméticos.

## 🚀 Despliegue en Vercel

Este proyecto cuenta con un `MockDataStore` reactivo de alta fidelidad en el frontend que permite probar **el 100% de las funcionalidades del editor y del panel de administración en Vercel** sin necesidad de desplegar el backend.

### Pasos para desplegar en Vercel:

1. Ve a [Vercel](https://vercel.com/) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **Add New...** -> **Project**.
3. Importa el repositorio: `equipoblanco/avatar-studio`.
4. En la configuración del proyecto:
   - **Framework Preset**: Vite
   - **Root Directory**: Puedes dejar `./` (gracias al `vercel.json` de la raíz) o seleccionar la carpeta `frontend`.
   - **Build Command**: `cd frontend && npm install && npm run build` (o automático si elegiste `frontend`).
   - **Output Directory**: `frontend/dist` (o `dist` si elegiste `frontend`).
5. Haz clic en **Deploy**. ¡Listo en menos de 1 minuto!

---

## 💻 Ejecución Local

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Abre en tu navegador `http://localhost:5173`.

### Backend (Java 25 + Spring Boot)
```bash
cd backend
mvn clean spring-boot:run
```
*(Requiere JDK 25 instalado y MySQL configurado si se utiliza el backend).*

---

## ✨ Características Principales
- **Estudio Toonix**: 7 categorías cosméticas (Cuerpo, Rostro, Cabello, Ropa superior, Ropa inferior, Zapatos, Accesorios).
- **Selector Facial Independiente**: 8 estilos de ojos y 12 expresiones de boca.
- **Superposición de Capas Z-Index**: El cabello cubre la cabeza y los sombreros cubren el cabello.
- **Reglas de Incompatibilidad**: Detección bidireccional y aviso de solapamiento.
- **Panel Administrativo**: Catálogo maestro con filtros reactivos, drawer de edición y gestión de fallbacks.
