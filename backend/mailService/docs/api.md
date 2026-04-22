# API Documentation

## Base URL

```
http://localhost:8080
```

---

## Emails

### POST `/emails/notify`

Sends an email notification. The type of notification is determined by the `type` field.

#### Common fields

| Field | Type | Required | Description |
|---|---|---|---|
| `type` | string | ✅ | Notification type (see below) |
| `to` | string | ✅ | Recipient email address |
| `name` | string | ✅ | Recipient username |
| `trackId` | string | depends on type | Track ID |

#### Response

```json
{
  "id": "49a3999c-0ce1-4ea6-ab68-..."
}
```

---

## Notification Types

### `track-submitted`

Sent when a track is submitted for review.

**Request:**
```json
{
  "type": "track-submitted",
  "to": "user@example.com",
  "name": "Dimas",
  "trackId": "123"
}
```

**curl:**
```bash
curl -X POST http://localhost:8080/emails/notify \
  -H "Content-Type: application/json" \
  -d '{"type": "track-submitted", "to": "user@example.com", "name": "Dimas", "trackId": "123"}'
```

---

### `track-approved`

Sent when a track is approved and goes live.

**Request:**
```json
{
  "type": "track-approved",
  "to": "user@example.com",
  "name": "Dimas",
  "trackId": "123"
}
```

**curl:**
```bash
curl -X POST http://localhost:8080/emails/notify \
  -H "Content-Type: application/json" \
  -d '{"type": "track-approved", "to": "user@example.com", "name": "Dimas", "trackId": "123"}'
```

---

### `track-rejected`

Sent when a track is rejected.

**Request:**
```json
{
  "type": "track-rejected",
  "to": "user@example.com",
  "name": "Dimas",
  "trackId": "123",
  "reason": "Low quality"
}
```

**Additional fields:**

| Field | Type | Required | Description |
|---|---|---|---|
| `reason` | string | ✅ | Rejection reason |

**curl:**
```bash
curl -X POST http://localhost:8080/emails/notify \
  -H "Content-Type: application/json" \
  -d '{"type": "track-rejected", "to": "user@example.com", "name": "Dimas", "trackId": "123", "reason": "Low quality"}'
```

---

### `track-purchased`

Sent when a track is purchased.

**Request:**
```json
{
  "type": "track-purchased",
  "to": "user@example.com",
  "name": "Dimas",
  "trackId": "123",
  "amount": "9.99"
}
```

**Additional fields:**

| Field | Type | Required | Description |
|---|---|---|---|
| `amount` | string | ✅ | Purchase amount in USD |

**curl:**
```bash
curl -X POST http://localhost:8080/emails/notify \
  -H "Content-Type: application/json" \
  -d '{"type": "track-purchased", "to": "user@example.com", "name": "Dimas", "trackId": "123", "amount": "9.99"}'
```

---

### `track-deleted`

Sent when a track is deleted.

**Request:**
```json
{
  "type": "track-deleted",
  "to": "user@example.com",
  "name": "Dimas",
  "trackId": "123",
  "reason": "Violated terms"
}
```

**Additional fields:**

| Field | Type | Required | Description |
|---|---|---|---|
| `reason` | string | ✅ | Deletion reason |

**curl:**
```bash
curl -X POST http://localhost:8080/emails/notify \
  -H "Content-Type: application/json" \
  -d '{"type": "track-deleted", "to": "user@example.com", "name": "Dimas", "trackId": "123", "reason": "Violated terms"}'
```

---

### `payment`

Sent for payment events.

**Request:**
```json
{
  "type": "payment",
  "to": "user@example.com",
  "name": "Dimas",
  "transactionId": "txn_456",
  "amount": "9.99",
  "status": "confirmed"
}
```

**Additional fields:**

| Field | Type | Required | Description |
|---|---|---|---|
| `transactionId` | string | ✅ | Transaction ID |
| `amount` | string | ✅ | Payment amount in USD |
| `status` | string | ✅ | Payment status: `confirmed`, `failed`, `refunded` |

**curl:**
```bash
curl -X POST http://localhost:8080/emails/notify \
  -H "Content-Type: application/json" \
  -d '{"type": "payment", "to": "user@example.com", "name": "Dimas", "transactionId": "txn_456", "amount": "9.99", "status": "confirmed"}'
```

---

## Error Responses

| HTTP Code | Description |
|---|---|
| `400` | Bad request — unknown type or missing fields |
| `500` | Internal server error — failed to send email |

**Example error:**
```json
{
  "message": "Unknown type: track-unknown"
}
```