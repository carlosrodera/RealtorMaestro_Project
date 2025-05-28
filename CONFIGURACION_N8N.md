# Configuración de n8n para Realtor 360

## Requisitos previos

1. **n8n instalado** (self-hosted o cloud)
2. **Google Drive API** configurado
3. **API Key de Stability AI** o similar servicio de IA

## Pasos de configuración

### 1. Importar el workflow

1. Abre n8n
2. Crea un nuevo workflow
3. Importa el archivo `n8n-workflow.json`
4. Actualiza las credenciales necesarias

### 2. Configurar Google Drive

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un nuevo proyecto o usa uno existente
3. Habilita Google Drive API
4. Crea credenciales OAuth 2.0
5. En n8n, añade las credenciales de Google Drive

### 3. Configurar Stability AI (o alternativa)

#### Opción A: Stability AI
1. Regístrate en [stability.ai](https://stability.ai)
2. Obtén tu API key
3. Añádela al nodo "AI Transformation"

#### Opción B: Replicate
1. Usa [replicate.com](https://replicate.com)
2. Busca modelos de image-to-image
3. Actualiza el nodo HTTP Request con la API de Replicate

#### Opción C: ComfyUI local
1. Instala ComfyUI localmente
2. Configura el API endpoint
3. Modifica el workflow para usar tu endpoint local

### 4. Configurar el webhook

1. En n8n, activa el workflow
2. Copia la URL del webhook (ej: `https://tu-n8n.com/webhook/abc123`)
3. Actualiza la URL en el código:

```javascript
// En client/src/hooks/use-transformations.ts
const response = await fetch('TU_URL_WEBHOOK_AQUI', {
  // ...
});
```

### 5. Configurar callbacks

Para recibir las respuestas en desarrollo local:

#### Opción 1: ngrok (recomendado)
```bash
# Instalar ngrok
npm install -g ngrok

# Exponer tu app local
ngrok http 3000

# Usar la URL de ngrok como callback
```

#### Opción 2: Webhook.site
1. Ve a [webhook.site](https://webhook.site)
2. Copia tu URL única
3. Úsala temporalmente para testing

### 6. Estructura del webhook

**Request (App → n8n):**
```json
{
  "transformationId": "trans_123456",
  "image": "base64_image_data",
  "mimeType": "image/jpeg",
  "style": "modern",
  "prompt": "Transform this living room",
  "annotations": {},
  "callbackUrl": "https://tu-app.com/webhook-callback"
}
```

**Response (n8n → App):**
```json
{
  "transformationId": "trans_123456",
  "imageUrl": "https://drive.google.com/...",
  "status": "completed"
}
```

## Workflow alternativo simple

Si no tienes acceso a APIs de IA, puedes crear un workflow simple que:

1. Recibe la imagen
2. Aplica filtros básicos con ImageMagick
3. Sube a Google Drive
4. Devuelve la URL

```javascript
// Nodo Function para simular transformación
const styles = {
  modern: '-modulate 110,120 -contrast',
  luxury: '-modulate 90,110 -gamma 1.2',
  minimalist: '-colorspace Gray -modulate 105,20'
};

const command = styles[$json.style] || '';
return { command };
```

## Troubleshooting

### Error: "Webhook timeout"
- Aumenta el timeout en n8n
- Usa respuesta asíncrona con callbacks

### Error: "Image too large"
- Comprime imágenes antes de enviar
- Aumenta límites en n8n settings

### Error: "Google Drive quota exceeded"
- Usa una carpeta diferente
- Limpia archivos antiguos regularmente

## Testing

1. Usa el modo test de n8n
2. Envía una imagen pequeña primero
3. Verifica logs en todos los nodos
4. Comprueba que el callback llegue correctamente

## Producción

1. Usa n8n en modo producción
2. Configura backups automáticos
3. Monitoriza errores con n8n logs
4. Considera usar una cola para alto volumen