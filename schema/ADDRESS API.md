# ADDRESS API SPEC

## ADD ADDRESS API 

ENDPOINT : `POST /api/addresses`

Request Body : 

```json 
{
  "label": "Rumah",
  "phone": "08123456789",
  "street_address": "Jl. Mawar No. 123",
  "city": "Surabaya",
  "country": "Indonesia",
  "postal_code": "60293"
}
```

Response Body Succes : 

```json
{
  "data": {
    "id": 1,
    "user_id": 1,
    "label": "Rumah",
    "phone": "08123456789",
    "street_address": "Jl. Mawar No. 123",
    "city": "Surabaya",
    "postal_code": "60293",
    "country": "Indonesia"
  }
}
```

Respon Body Error : 

```json
{
  "errors": "Address validation failed"
}
```

## GET USER ADDRESSES API 

ENDPOINT : `GET /api/addresses`

Request Body : NONE

Response Body Succes : 

```json
{
  "data": {
    "id": 1,
    "user_id": 1,
    "label": "Rumah Utama",
    "phone": "08123456789",
    "street_address": "Jl. Mawar No. 123A",
    "city": "Surabaya",
    "postal_code": "60293",
    "country": "Indonesia"
  }
}
```

Respon Body Error : 

```json
{
  "errors": "Unauthorized"
}
```

## UPDATE ADDRESS API 

ENDPOINT : `PATCH /api/addresses/:id`

Request Body : 

```json
{
  "label": "Rumah Utama",
  "phone": "08123456789",
  "street_address": "Jl. Mawar No. 123A",
  "city": "Surabaya",
  "postal_code": "60293",
  "country": "Indonesia"
}
```

Response Body Succes : 

```json
{
  "data": {
    "id": 1,
    "user_id": 1,
    "label": "Rumah Utama",
    "phone": "08123456789",
    "street_address": "Jl. Mawar No. 123A",
    "city": "Surabaya",
    "postal_code": "60293",
    "country": "Indonesia"
  }
}
```

Respon Body Error : 

```json
{
  "errors": "Address not found"
}
```

## DELETE ADDRESS API 

ENDPOINT : `DELETE /api/addresses/:id`

Request Body : NONE

Response Body Succes : 

```json
{
  "data": "Address deleted successfully"
}
```

Respon Body Error : 

```json
{
  "errors": "Address not found"
}
```
