# CATEGORY & PRODUCT API

## Get List Categories API

ENDPOINT : `GET /api/categories`

Request Body : NONE

Response Body Succes :

```json
{
  "data": [
    {
      "id": 1,
      "name": "Sneakers",
      "slug": "sneakers"
    },
    {
      "id": 2,
      "name": "Running Shoes",
      "slug": "running-shoes"
    }
  ]
}
```

## Get List Products API

ENDPOINT : `GET /api/products`

Request Body : NONE

Response Body Succes :

```json
{
  "data": [
    {
      "id": 1,
      "category_id": 1,
      "sku": "SNK-BLK-4042",
      "name": "Streetwear Canvas Low Black",
      "description": "Sepatu low-top canvas premium dengan insole empuk untuk penggunaan sehari-hari",
      "price": 450000,
      "variants": [
        {
          "id": 10,
          "size": "40",
          "stock": 15
        },
        {
          "id": 11,
          "size": "41",
          "stock": 20
        },
        {
          "id": 12,
          "size": "42",
          "stock": 8
        }
      ]
    }
  ],
  "paging": {
    "page": 1,
    "total_page": 1,
    "total_item": 1
  }
}
```

## Get Product Detail API

ENDPOINT : `GET /api/products/:id`

Request Body : NONE

Response Body Succes :

```json
{
  "data": {
    "id": 1,
    "category_id": 1,
    "sku": "SNK-BLK-4042",
    "name": "Streetwear Canvas Low Black",
    "description": "Sepatu low-top canvas premium dengan insole empuk untuk penggunaan sehari-hari",
    "price": 450000,
    "variants": [
      {
        "id": 10,
        "size": "40",
        "stock": 15
      },
      {
        "id": 11,
        "size": "41",
        "stock": 20
      },
      {
        "id": 12,
        "size": "42",
        "stock": 8
      }
    ]
  }
}
```

Respon Body Error :

```json
{
  "errors": "Product not found"
}
```

## Create Product API (Admin Only)

ENDPOINT : `POST /api/products`

Header :
Authorization: Bearer <token_admin>

Request Body :

```json
{
  "category_id": 1,
  "sku": "SNK-BLK-4042",
  "name": "Streetwear Canvas Low Black",
  "description": "Sepatu low-top canvas premium dengan insole empuk untuk penggunaan sehari-hari",
  "price": 450000,
  "variants": [
    { "size": "40", "stock": 15 },
    { "size": "41", "stock": 20 },
    { "size": "42", "stock": 8 }
  ]
}
```

Response Body Succes :

```json
{
  "data": {
    "id": 1,
    "sku": "SNK-BLK-4042",
    "name": "Streetwear Canvas Low Black",
    "price": 450000,
    "variants": [
      { "id": 10, "size": "40", "stock": 15 },
      { "id": 11, "size": "41", "stock": 20 },
      { "id": 12, "size": "42", "stock": 8 }
    ]
  }
}
```

Respon Body Error :

```json
{
  "errors": "SKU already exists or invalid data"
}
```

## Update Product API (Admin Only)

ENDPOINT : `PATCH /api/products/:id`

Request Body :

```json
{
  "name": "Streetwear Canvas Low Black Edition",
  "price": 499000
}
```

Response Body Succes :

```json
{
  "data": {
    "id": 1,
    "sku": "SNK-BLK-4042",
    "name": "Streetwear Canvas Low Black Edition",
    "price": 499000
  }
}
```

Respon Body Error :

```json
{
  "errors": "Product not found"
}
```

## Update Product Variant & Stock API (Admin Only)

ENDPOINT : `PATCH /api/products/:id/variants/:variant-id`

Request Body :

```json
{
  "size": "41",
  "stock": 25
}
```

Response Body Succes :

```json
{
  "data": {
    "id": 11,
    "product_id": 1,
    "size": "41",
    "stock": 25
  }
}
```

Respon Body Error (400 Bad Request) :

```json
{
  "errors": "Stock must be a non-negative integer"
}
```

Respon Body Error (404 Not Found) :

```json
{
  "errors": "Product or variant not found"
}
```

## Delete Product API (Admin Only)

ENDPOINT : `DELETE /api/products/:id`

Request Body : NONE

Response Body Succes :

```json
{
  "data": "Product deleted successfully"
}
```

Respon Body Error :

```json
{
  "errors": "Product not found"
}
```


