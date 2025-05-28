# 🏠 Realtor 360 - Transforma propiedades con IA

MVP de una plataforma que permite a inmobiliarias transformar imágenes de propiedades usando IA, sin necesidad de base de datos ni configuraciones complejas.

## ✨ Características

- 🖼️ Transformación de imágenes con IA
- 📝 Generación de descripciones profesionales
- 💾 Almacenamiento local (sin base de datos)
- 🚀 Instalación en 5 minutos
- 🔐 Autenticación simple (demo/demo123)
- 🎨 Interfaz moderna y responsiva

## 🚀 Instalación Rápida

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/realtor360
cd realtor360

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev
```

La aplicación se abrirá automáticamente en `http://localhost:3000`

## 📦 Deployment

### Opción 1: Netlify (Recomendado)

1. Haz fork de este repositorio
2. Conecta tu repositorio en [Netlify](https://netlify.com)
3. Deploy automático (ya incluye netlify.toml configurado)

### Opción 2: Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Opción 3: Build estático

```bash
# Crear build de producción
npm run build

# Los archivos estarán en la carpeta 'dist'
# Puedes subirlos a cualquier hosting estático
```

## 🎮 Uso

1. **Login**: Usa las credenciales demo/demo123
2. **Crear Proyecto**: Dale un nombre a tu propiedad
3. **Transformar Imagen**:
   - Sube una foto
   - Pinta sobre las áreas a modificar
   - Selecciona un estilo
   - Espera el resultado
4. **Generar Descripción**: Completa los datos de la propiedad

## 🔧 Configuración n8n

Para que las transformaciones funcionen, necesitas configurar los webhooks en n8n:

1. Importa el workflow de n8n (incluido en `/n8n-workflow.json`)
2. Actualiza las URLs de webhook en el código si es necesario
3. Asegúrate de que n8n esté accesible desde internet

## 📝 Notas Importantes

- **Sin Base de Datos**: Todo se guarda en localStorage del navegador
- **Límite de Almacenamiento**: Máximo 10 transformaciones guardadas
- **Créditos Demo**: 5 transformaciones gratuitas por usuario
- **Imágenes**: Se procesan como JPEG, máximo 5MB

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea tu rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📹 Video Tutorial

[Ver video tutorial en YouTube](#)

## 💬 Comunidad y Soporte

- [Únete a nuestra comunidad](#)
- [Reporta un problema](https://github.com/tu-usuario/realtor360/issues)

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

Hecho con ❤️ para la comunidad de emprendedores inmobiliarios