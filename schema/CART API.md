# CART API

## Add Item to Cart API

ENDPOINT : `POST /api/cart/items`

Request Body :

```json
{
  "product_id": 1,
  "product_variant_id": 11,
  "quantity": 1
}
```

Response Body Succes :

```json
{
  "data": {
    "id": 1,
    "cart_id": 10,
    "product_id": 1,
    "product_variant_id": 11,
    "quantity": 1
  }
}
```

Respon Body Error (400 Bad Request):

```json
{
  "errors": "Requested quantity exceeds available stock"
}
```

Respon Body Error (404 Not Found) :

```json
{
  "errors": "Requested quantity exceeds available stock"
}
```

## Get User Cart API

ENDPOINT : `GET /api/carts`

Request Body : NONE

Response Body Succes :

```json
{
  "data": {
    "id": 10,
    "user_id": 1,
    "items": [
      {
        "id": 1,
        "product_id": 1,
        "product_name": "Streetwear Canvas Low Black",
        "product_variant_id": 11,
        "size": "41",
        "price": 450000,
        "quantity": 2,
        "subtotal": 900000
      }
    ],
    "total_price": 900000
  }
}
```

Respon Body Error (401 Unauthorized):

```json
{
  "errors": "Unauthorized"
}
```

## Update Cart Item Quantity API

ENDPOINT : `PATCH /api/carts/items/:item-id`

Request Body :

```json
{
  "quantity": 3
}
```

Response Body Succes :

```json
{
  "data": {
    "id": 1,
    "cart_id": 10,
    "product_variant_id": 11,
    "quantity": 3
  }
}
```

Respon Body Error (400 Bad Request):

```json
{
  "errors": "Quantity must be greater than 0 and not exceed stock"
}
```

Respin Body Error (404 not found) :

```json
{
  "errors": "Cart item not found"
}
```

## Remove Item from Cart API

ENDPOINT : `DELETE /api/carts/items/:item-id`

Request Body : NONE

Response Body Succes :

```json
{
  "data": "Item removed from cart successfully"
}
```

Respon Body Error :

```json
{
  "errors": "Cart item not found"
}
```
