# Shipping API Spec

## Create Payment Transaction API

ENDPOINT : `POST /api/payments`

Request Body :

```json
{
  "order_id": 101,
  "payment_type": "gopay"
}
```

Request Body Succes (201 created):

```json
{
  "data": {
    "id": 501,
    "order_id": 101,
    "payment_type": "gopay",
    "transaction_status": "pending",
    "payment_url": "https://app.sandbox.midtrans.com/snap/v2/vtweb/12345678-abcd-1234",
    "created_at": "2026-08-09T15:05:00.000Z"
  }
}
```

Request Body Error (400 Bad Request):

```json
{
  "errors": "Payment transaction already exists for this order or order is invalid"
}
```

Request Body Errir (404 Not Found) :

```json
{
  "errors": "Order not found"
}
```

## Midtrans Webhook Notification API (Public / Webhook)

ENDPOINT : `POST /api/payments/notification`

Request Body :

```json
{
  "order_id": "ORD-20260809-4821",
  "transaction_status": "settlement",
  "payment_type": "gopay",
  "signature_key": "a1b2c3d4..."
}
```

Request Body Succes (200 OK):

```json
{
  "status": "OK",
  "message": "Payment notification processed successfully"
}
```

Request Body Error (400 Bad Request):

```json
{
  "errors": "Invalid signature or payload"
}
```

## Get Payment Detail API

ENDPOINT : `GET /api/payments/order/:orderId`

Request Body Succes (200 OK):

```json
{
  "data": {
    "id": 501,
    "order_id": 101,
    "payment_type": "gopay",
    "transaction_status": "settlement",
    "payment_url": "https://app.sandbox.midtrans.com/snap/v2/vtweb/12345678-abcd-1234",
    "created_at": "2026-08-09T15:05:00.000Z"
  }
}
```

Request Body Errir (404 Not Found) :

```json
{
  "errors": "Payment details not found"
}
```
