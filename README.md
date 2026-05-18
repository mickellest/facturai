# FacturAI - Sistema de Lectura e Interpretación de Facturas

Este es el aplicativo web desarrollado en React (TypeScript) para cumplir con el entregable técnico. Forma parte de un sistema que automatiza la recepción, extracción y gestión de facturas recibidas por correo electrónico.

## 🚀 Tecnologías Utilizadas

- **Frontend:** React, TypeScript, Vite
- **Estilos:** Tailwind CSS v4, Lucide React (Iconos)
- **Base de Datos:** Supabase (PostgreSQL)
- **Automatización:** n8n (Manejado en un servidor externo)
- **Despliegue:** Vercel

## ⚙️ Arquitectura del Sistema

El flujo completo del proyecto es el siguiente:

1. **Recepción (n8n):** Un flujo automatizado monitorea el correo electrónico. Al detectar un archivo PDF adjunto, lo descarga.
2. **Extracción y Análisis (n8n + IA):** La IA extrae los datos clave (proveedor, montos, líneas de detalle) de la factura en formato estructurado.
3. **Almacenamiento (Supabase):** Los datos extraídos se insertan directamente en la base de datos relacional.
4. **Visualización y Gestión (FacturAI App):** El usuario finaliza la validación a través de esta interfaz web, donde puede visualizar, editar y validar cada factura.
5. **Asistente Inteligente:** Permite hacer consultas en lenguaje natural (texto o voz) sobre las facturas procesadas.

## 📦 Estructura de la Base de Datos

La base de datos en Supabase cuenta con dos tablas principales:

- `invoices`: Guarda la cabecera de la factura (proveedor, fechas, subtotales, impuestos, total, estado).
- `invoice_lines`: Guarda el detalle de los productos/servicios cobrados (concepto, cantidad, precio, descuento, total de línea), vinculados por `invoice_id`.

## 🎤 Funcionalidades Clave Cumplidas

- **Dashboard:** Panel estadístico en tiempo real de los montos y facturas procesadas.
- **Manejo Multi-moneda:** Selección global de moneda (Bs, USD, EUR) que actualiza la interfaz sin modificar los datos base.
- **Revisión y Edición:** Modal interactivo para corregir cualquier dato leído por la IA antes de validarlo.
- **Asistente por Voz y Texto:** Integración con la API Web de Reconocimiento de Voz para dictado nativo, conectado al webhook de n8n.
- **Diseño Premium:** Interfaz responsive, moderna, con micro-animaciones y efectos de cristal (Glassmorphism).

## 🛠️ Instalación y Ejecución Local

1. Clona este repositorio.
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Crea un archivo `.env.local` en la raíz del proyecto y añade tus credenciales de Supabase:
   ```env
   VITE_SUPABASE_URL=tu_url_aqui
   VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
   ```
4. Ejecuta el entorno de desarrollo:
   ```bash
   npm run dev
   ```

---
*Desarrollado para la prueba técnica de lectura e interpretación documental.*
