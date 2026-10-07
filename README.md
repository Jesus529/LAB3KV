# TechStore - Seguridad y Autenticación

Proyecto de laboratorio para implementar controles de seguridad en una aplicación de gestión de inventario.

## Tecnologías

- Node.js
- Express
- MongoDB + Mongoose
- JWT
- bcrypt
- MFA por correo
- Passport
- Google OAuth
- GitHub OAuth

## Funcionalidades

- Registro de usuarios.
- Contraseña con mínimo 8 caracteres, mayúscula, número y carácter especial.
- Email único.
- Login con JWT.
- Bloqueo después de 5 intentos fallidos.
- MFA por código de 6 dígitos.
- Código MFA válido durante 5 minutos.
- Máximo 3 intentos de MFA.
- Roles: ADMIN, GERENTE, EMPLEADO, AUDITOR.
- Restricción de gerente por tienda.
- Control de modificación de precios.
- Control de stock.
- Auditoría de operaciones.
- Login con Google y GitHub.

## Instalación

```bash
npm install
```

Copia `.env.example` como `.env` y configura las variables.

Inicia MongoDB y luego:

```bash
npm run dev
```

Servidor:

`http://localhost:3000`

## Flujo de login

1. POST `/api/auth/login`
2. El servidor valida email y contraseña.
3. Si son correctos, genera un código MFA.
4. Envía el código al correo.
5. POST `/api/auth/mfa/verify`
6. Si el código es correcto, devuelve JWT.

## Ejemplos

### Registro

POST `/api/auth/register`

```json
{
  "email": "admin@techstore.com",
  "password": "Admin123!",
  "fullName": "Administrador TechStore",
  "store": "Lima Centro"
}
```

Por seguridad, los nuevos usuarios se registran como EMPLEADO. Un administrador puede cambiar el rol desde `/api/users/:id/role`.

### Login

POST `/api/auth/login`

```json
{
  "email": "admin@techstore.com",
  "password": "Admin123!"
}
```

### Verificar MFA

POST `/api/auth/mfa/verify`

```json
{
  "mfaToken": "TOKEN_RECIBIDO_EN_LOGIN",
  "code": "123456"
}
```

### Productos

GET `/api/products`

POST `/api/products`

Solo ADMIN y GERENTE pueden crear productos.

### Stock

PATCH `/api/products/:id/stock`

ADMIN, GERENTE y EMPLEADO pueden actualizar stock.

### Precio

PATCH `/api/products/:id/price`

Solo ADMIN y GERENTE pueden modificar precios.

## OAuth

Configura las credenciales de Google y GitHub en `.env`.

Google:

`GET /auth/google`

GitHub:

`GET /auth/github`

Las URLs callback son:

- `http://localhost:3000/auth/google/callback`
- `http://localhost:3000/auth/github/callback`
