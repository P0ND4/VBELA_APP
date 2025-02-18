<p align="center">
  <img src="./src/presentation/assets/icon.png" alt="VBELA Logo" width="200">
</p>

# VBELA

## Descripción

VBELA es una aplicación móvil desarrollada con React Native y Expo. Este proyecto está diseñado para proporcionar una experiencia de usuario fluida y eficiente en dispositivos Android.

## Requisitos

- Node.js (versión 14 o superior)
- npm (versión 6 o superior)
- Expo CLI

## Instalación

1. Clona el repositorio:

   ```sh
   git clone https://github.com/tu-usuario/vbela.git
   ```

2. Accede al directorio del proyecto:

   ```sh
   cd VBELA_APP
   ```

3. Instala las dependencias:

   ```sh
   npm install
   ```

4. Descarga el archivo `google-services.json` y colócalo en el directorio raíz del proyecto.

5. Configura las variables de entorno. Crea un archivo `.env` en el directorio raíz del proyecto con el siguiente contenido:

   ```env
   EXPO_PUBLIC_VERSION=4.0.0-beta.4
   GOOGLE_SERVICES_JSON=./google-services.json
   GOOGLE_WEB_CLIENT_ID=tu-google-web-client-id
   GOOGLE_IOS_CLIENT_ID=tu-google-ios-client-id
   ```

   Puedes obtener los valores de `GOOGLE_WEB_CLIENT_ID` y `GOOGLE_IOS_CLIENT_ID` desde la consola de Google Cloud.

6. Descarga el backend desde el siguiente repositorio y sigue las instrucciones de instalación:

   [VBELA_API](https://github.com/P0ND4/VBELA_API)

## Ejecución

Para iniciar el proyecto en modo de desarrollo, ejecuta:

```sh
npm start
```

Para compilar y ejecutar el proyecto en un dispositivo Android, ejecuta:

```sh
npm run android
```

## Notas

- Este proyecto no está optimizado para dispositivos iOS.
- Asegúrate de tener configuradas correctamente las variables de entorno antes de ejecutar el proyecto.