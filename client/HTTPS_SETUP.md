# HTTPS Local Setup

Los certificados SSL (`cert.pem` y `key.pem`) **NO están versionados** en Git por razones de seguridad. Cada desarrollador debe generar los suyos localmente.

## Instalación (una sola vez)

### 1. Instalar mkcert

**Windows (Descarga manual):**
```powershell
# Descargar mkcert
Invoke-WebRequest -Uri "https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-windows-amd64.exe" -OutFile "mkcert.exe"

# Instalar la autoridad certificadora local
.\mkcert.exe -install

# Ya puedes borrar mkcert.exe después
Remove-Item mkcert.exe
```

**macOS (Homebrew):**
```bash
brew install mkcert
mkcert -install
```

**Linux:**
```bash
sudo apt install libnss3-tools  # o equivalent para tu distro
wget https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-linux-amd64
chmod +x mkcert-v1.4.4-linux-amd64
./mkcert-v1.4.4-linux-amd64 -install
```

### 2. Generar certificados locales

En la carpeta `client/`:

```bash
mkcert -key-file key.pem -cert-file cert.pem localhost 127.0.0.1
```

Esto creará:
- `cert.pem` - Certificado SSL
- `key.pem` - Clave privada

## Uso

```bash
npm start
```

Accede a: **https://localhost:4200**

Los certificados son válidos y confiables (sin advertencias) porque mkcert instaló una CA local en tu sistema.

## Seguridad

⚠️ **IMPORTANTE:**
- `*.pem` están en `.gitignore` y **nunca** deben commiterse
- Cada máquina de desarrollo genera sus propios certificados
- Las claves privadas no se comparten públicamente
