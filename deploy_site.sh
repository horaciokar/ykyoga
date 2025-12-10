#!/bin/bash

# --- Script para automatizar el despliegue de sitios estáticos en Nginx ---
#
# Uso: ./deploy_site.sh <nombre_del_sitio> <ruta_a_los_archivos>
# Ejemplo: ./deploy_site.sh misitio.com /home/usuario/proyecto/dist
#-------------------------------------------------------------------------------

# Salir inmediatamente si un comando falla
set -e

# --- 1. Validar Argumentos ---
if [ "$#" -ne 2 ]; then
    echo "Error: Se requieren dos argumentos."
    echo "Uso: $0 <nombre_del_sitio> <ruta_a_los_archivos>"
    exit 1
fi

SITE_NAME=$1
SOURCE_DIR=$2
DEST_DIR="/var/www/$SITE_NAME"
NGINX_CONF_FILE="/etc/nginx/sites-available/$SITE_NAME"
NGINX_ENABLED_FILE="/etc/nginx/sites-enabled/$SITE_NAME"

# Verificar que el directorio de origen exista
if [ ! -d "$SOURCE_DIR" ]; then
    echo "Error: El directorio de origen '$SOURCE_DIR' no existe."
    exit 1
fi

echo "🚀 Iniciando el despliegue del sitio '$SITE_NAME'..."

# --- 2. Copiar los archivos del sitio ---
echo "    > Creando directorio de destino: $DEST_DIR"
sudo mkdir -p "$DEST_DIR"

echo "    > Copiando archivos desde '$SOURCE_DIR'..."
sudo cp -r "$SOURCE_DIR"/* "$DEST_DIR/"

echo "    > Asignando permisos correctos para Nginx..."
sudo chown -R www-data:www-data "$DEST_DIR"

# --- 3. Crear el archivo de configuración de Nginx ---
echo "    > Creando archivo de configuración de Nginx en '$NGINX_CONF_FILE'..."

# Usamos un "Here Document" para crear el contenido de la configuración
CONFIG_CONTENT=$(cat <<EOF
server {
    listen 80;
    listen [::]:80;

    # Directorio raíz donde se encuentran los archivos del sitio
    root $DEST_DIR;
    index index.html index.htm;

    # Nombre del servidor (tu dominio)
    server_name $SITE_NAME www.$SITE_NAME;

    location / {
        # Intenta servir el archivo directamente, luego como un directorio, y si no, muestra un 404.
        try_files \$uri \$uri/ =404;
    }
}
EOF
)

# Escribir el contenido en el archivo de configuración usando sudo
echo "$CONFIG_CONTENT" | sudo tee "$NGINX_CONF_FILE" > /dev/null

echo "    > Configuración de Nginx creada."

# --- 4. Activar el sitio ---
if [ ! -L "$NGINX_ENABLED_FILE" ]; then
    echo "    > Activando el sitio (creando enlace simbólico)..."
    sudo ln -s "$NGINX_CONF_FILE" "$NGINX_ENABLED_FILE"
else
    echo "    > El sitio ya estaba activado. Saltando creación de enlace."
fi


# --- 5. Validar y recargar Nginx ---
echo "    > Verificando la sintaxis de la configuración de Nginx..."
sudo nginx -t

echo "    > Recargando Nginx para aplicar los cambios..."
sudo systemctl reload nginx

echo "✅ ¡Éxito! El despliegue de '$SITE_NAME' se ha completado."
echo "Puedes acceder a tu sitio en http://$SITE_NAME"

exit 0
