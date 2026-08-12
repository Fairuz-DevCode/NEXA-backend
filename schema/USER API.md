# USER API SPEC

## REGISTER USER API

ENDOPOIT: `POST api/auth/register `

Request Body :

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

Response Body Success :

```json
{
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "08123456789",
    "role": "customer"
  }
}
```

Response Body Error :

```json
{
  "errors": "Email already registered"
}
```

## LOGIN USER API

Endpoint : `POST /api/auth/login`

Request Body :

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response Body Succes :

```json
{
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "customer",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

Response Body Error :

```json
{
  "errors": "Invalid email or password"
}
```

## GET USER API

ENDPOINT : `GET api/users/me`

Response Body Succes :

```json
{
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "08123456789",
    "role": "customer",
    "created_at": "2026-08-09T12:00:00.000Z"
  }
}
```

Response Body Error :

```json
{
  "errors": "Unauthorized"
}
```

## UPDATE USER API

Endpoint : `PATCH /api/users/me`

Request Body :

```json
{
  "name": "John Doe Updated",
  "phone": "08987654321",
  "password": "newpassword123"
}
```

Response Body Succes :

```json
{
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe Updated",
    "phone": "08987654321",
    "role": "customer"
  }
}
```

Response Body Error :

```json
{
  "errors": "Invalid profile data"
}
```

## LOGOUT USER API

Endpoint : `DELETE /api/auth/logout`

Response Body Succes :

```json
{
  "data": "OK"
}
```

Response Body Error :

```json
{
  "errors": "Unauthorized"
}
```
