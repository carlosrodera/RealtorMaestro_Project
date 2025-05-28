# Configuración del Webhook N8N - Actualizada

## Problema Identificado

El workflow actual tiene un nodo "HTTP Request" que intenta hacer callback a `localhost:3000/api/webhooks/transformation-callback`, pero la aplicación está desplegada en Netlify en `https://silly-pothos-e6feaa.netlify.app`.

## Solución

Necesitas actualizar el último nodo "HTTP Request" en tu workflow de n8n:

### Nodo a Modificar: "HTTP Request"

**Configuración actual (incorrecta):**
```json
{
  "url": "http://localhost:3000/api/webhooks/transformation-callback"
}
```

**Configuración correcta:**
```json
{
  "method": "GET",
  "url": "https://silly-pothos-e6feaa.netlify.app/webhook-callback",
  "sendQuery": true,
  "queryParameters": {
    "parameters": [
      {
        "name": "transformationId",
        "value": "={{ $('Recibir Imagen y Parámetros1').item.json.body.transformationId }}"
      },
      {
        "name": "imageUrl",
        "value": "={{ $json.resultImageUrl[0] }}"
      },
      {
        "name": "type",
        "value": "transformation"
      }
    ]
  },
  "options": {
    "timeout": 10000,
    "ignoreResponseCode": true
  }
}
```

## Pasos para Actualizar en N8N

1. Abre tu workflow en n8n
2. Encuentra el nodo "HTTP Request" (está cerca del final, conectado a "Aggregate")
3. Haz doble clic para editarlo
4. Cambia el método de POST a GET
5. Cambia la URL a: `https://silly-pothos-e6feaa.netlify.app/webhook-callback`
6. En lugar de enviar un body JSON, configura Query Parameters:
   - `transformationId`: `{{ $('Recibir Imagen y Parámetros1').item.json.body.transformationId }}`
   - `imageUrl`: `{{ $json.resultImageUrl[0] }}`
   - `type`: `transformation`
7. Guarda los cambios y activa el workflow

## Flujo Completo de la Transformación

1. **Cliente envía a n8n**: 
   - URL: `https://agenteia.top/webhook-test/transform-image`
   - Datos: transformationId, image (base64), style, prompt, callbackUrl

2. **N8N procesa**:
   - Recibe la imagen
   - La guarda en Google Drive
   - Usa OpenAI para analizarla según el estilo
   - Genera la imagen transformada
   - La guarda nuevamente en Google Drive

3. **N8N hace callback**:
   - URL: `https://silly-pothos-e6feaa.netlify.app/webhook-callback?transformationId=XXX&imageUrl=YYY&type=transformation`
   - La app recibe los parámetros y actualiza el estado de la transformación

## Verificación

Para verificar que funciona:
1. Abre las herramientas de desarrollo del navegador (F12)
2. Ve a la pestaña Network
3. Intenta una transformación
4. Deberías ver:
   - Una petición POST a `https://agenteia.top/webhook-test/transform-image`
   - Después de unos segundos, una petición GET a `/webhook-callback` con los parámetros

## Notas Importantes

- El workflow usa OpenAI para generar prompts y transformar imágenes
- Las imágenes se almacenan en Google Drive (carpeta ID: `1XNvGp6cBNqmheeX-XXeWP6JQUqHuth8h`)
- Hay un delay de 15 segundos (`Wait` node) para dar tiempo al procesamiento
- El `transformationId` es crucial para que la app sepa qué transformación actualizar