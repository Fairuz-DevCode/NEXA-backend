# ORDER API

## Create Order / Checkout API

ENDPOINT : `POST api/orders`

```json
{
  "address_id": 1,
  "shipping_cost": 20000
}
```

Request Body (201 Created):

```json
{
  "data": {
    "id": 101,
    "order_number": "ORD-20260809-001",
    "user_id": 1,
    "address_id": 1,
    "total_amount": 920000,
    "shipping_cost": 20000,
    "status": "pending",
    "created_at": "2026-08-09T15:00:00.000Z",
    "items": [
      {
        "id": 1,
        "product_id": 1,
        "product_name": "Streetwear Canvas Low Black",
        "size": "41",
        "price": 450000,
        "quantity": 2
      }
    ]
  }
}
```

Response Body Error (400 Bad Request) :

```json
{
  "errors": "Cart is empty or stock is insufficient"
}
```

## Get User Order History API

ENDPOINT : `GET api/orders`

Request Body : None

Response Body Success (201 Created) :

```json
{
  "data": [
    {
      "id": 101,
      "order_number": "ORD-20260809-001",
      "total_amount": 920000,
      "status": "pending",
      "created_at": "2026-08-09T15:00:00.000Z"
    }
  ]
}
```

## Get Order Detail API

ENDPOINT : `GET api/order/:id`

Request Body : NONE

Request Body Succes :

```json
{
  "data": {
    "id": 101,
    "order_number": "ORD-20260809-001",
    "total_amount": 920000,
    "shipping_cost": 20000,
    "status": "pending",
    "created_at": "2026-08-09T15:00:00.000Z",
    "address": {
      "label": "Rumah",
      "phone": "08123456789",
      "street_address": "Jl. Mawar No. 123",
      "city": "Surabaya",
      "postal_code": "60293",
      "country": "Indonesia"
    },
    "items": [
      {
        "id": 1,
        "product_id": 1,
        "product_name": "Streetwear Canvas Low Black",
        "size": "41",
        "price": 450000,
        "quantity": 2
      }
    ]
  }
}
```

Request Body Error (404 Not Found):

```json
{
  "errors": "Order not found"
}
```

## Cancel Order API

ENDPOINT : `PATCH /api/orders/:id/cancel`

Request Body : NONE

Request Body Succes :

```json
{
  "data": {
    "id": 101,
    "order_number": "ORD-20260809-001",
    "status": "cancel"
  }
}
```

Request Body Error (400 Bad Request):

```json
{
  "errors": "Cannot cancel order that has already been shipped or completed"
}
```
