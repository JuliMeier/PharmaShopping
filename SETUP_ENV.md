# 🔒 Guía de Configuración de Variables de Entorno

## Antes de ejecutar la aplicación

Debes configurar la connection string a tu base de datos. 

⚠️ **IMPORTANTE:** Elige **SOLO UNA** de estas opciones. No hagas las tres simultáneamente.

### ✅ Opción 1: User Secrets (Recomendado para desarrollo local)

🏆 **MEJOR OPCIÓN PARA DESARROLLO**

```bash
cd API
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost,1433;Database=pharmashopping;User Id=SA;Password=Password@123;TrustServerCertificate=True;"
```

Los secretos se almacenan localmente (no en Git) en `%APPDATA%\Microsoft\UserSecrets`.

---

---

### Opción 3: Archivo .env (C

**Permanentemente (Windows):** Agregar a Variables de Entorno del Sistema

### Opción 2: User Secrets (Recomendado para desarrollo local)

```bash
cd API
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost,1433;Database=pharmashopping;User Id=SA;Password=Password@123;TrustServerCertificate=True;"
```

Los secretos se almacenan localmente (no en Git) en `%APPDATA%\Microsoft\UserSecrets`.

### Opción 3: Archivo .env (Recomendado con docker-compose)

1. Copia el archivo de ejemplo:
```bash
cp .env.example .env
```

2. Edita `.env` con tus valores:
```
MSSQL_SA_PASSWORD=Password@123
DB_CONNECTION_STRING=Server=localhost,1433;Database=pharmashopping;User Id=SA;Password=Password@123;TrustServerCertificate=True;
```

3. Levanta los servicios con docker-compose:
```bash
docker-compose up -d
```

**⚠️ IMPORTANTE:** `.env` está en `.gitignore` - nunca se subirá a GitHub

## Verificar que esté funcionando

Ejecuta la aplicación:
```bash
dotnet run --project API
```

Si la conexión funciona, verás que la base de datos se crea/actualiza correctamente.

## Seguridad

✅ Nunca commits credenciales reales
✅ Usa variables de entorno o User Secrets en desarrollo
✅ Usa secretos del sistema en producción (Azure Key Vault, AWS Secrets Manager, etc.)
