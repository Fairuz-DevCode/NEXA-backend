# Shipping API Spec

## PATCH /api/shippings/order/:orderId

ENDPOINT ; `PATCH /api/shippings/order/:orderId`

Request Body :

```json
{
  "courier": "JNE",
  "tracking_number": "JNE123456789ID",
  "shipping_status": "shipped"
}
```

Request Body Succes :

```json
{
  "data": {
    "order_id": 101,
    "courier": "JNE",
    "tracking_number": "JNE123456789ID",
    "shipping_status": "shipped",
    "shipped_at": "2026-08-09T17:00:00.000Z"
  }
}
```

Request Body Error 400 :

```json
{
  "errors": "Order must be paid before updating shipping status"
}
```

Request Body Error 404 :

```json
{
  "errors": "Order not found"
}
```

## Get Shipping Detail & Tracking API

Endpoint : `GET /api/shippings/order/:orderId`

Response Body Success (200 OK) :

```json
{
  "data": {
    "order_id": 101,
    "courier": "JNE",
    "tracking_number": "JNE123456789ID",
    "shipping_status": "shipped",
    "shipped_at": "2026-08-09T17:00:00.000Z",
    "delivered_at": null
  }
}
```

Response Body Error (404 Not Found) :

```json
{
  "errors": "Shipping information not found"
}
```

## Confirm Order Received API (Customer)

Endpoint : `PATCH /api/shippings/order/:orderId/complete`

Response Body Success (200 OK) :

```json
{
  "data": {
    "order_id": 101,
    "shipping_status": "delivered",
    "order_status": "completed",
    "delivered_at": "2026-08-11T10:00:00.000Z"
  }
}
```

Response Body Error (404 Not Found) :

```json
{
  "errors": "Cannot complete order before it is shipped"
}
```
