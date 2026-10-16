# Backend contract: courier assignment fields for SS1 / SS2

This document describes the fields the courier mobile app needs from
`GET /api/couriers/orders/` so route cards (SS1) and stop detail (SS2) can
render correctly.

## Endpoint

`GET /api/couriers/orders/`

Auth: courier JWT / token (unchanged).

## Problem today

OpenAPI `CourierAssignment` only documents:

- `id`
- `company_location` (int | null)
- `pickup_location` (int | null)

Live responses already include nested `orders[]`, but the schema does not.
The app also cannot build:

- card title `Bayil Bay - Sabah Hub`
- `Daşınacaq konteyner sayı`
- delivery `instructions`
- `Daşınma ardıcıllığı: №N`

`CompanyAddressRead` only has `address` (no company / location display name).
`LocationRead.name` exists on `GET /api/locations/`, but when
`pickup_location` is null the client falls back to `Маршрут #{id}`.

## Required fields

Add the following on each assignment (and mirror on nested company location
when an assignment has multiple companies).

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `company_name` | string | yes | Brand / office label, e.g. `Sabah Hub`. |
| `location_name` | string | yes | Address / hub label, e.g. `Bayil Bay`. Prefer nested on assignment so the client does not join `/api/locations/`. If `pickup_location` is null, this is the **company location** name. |
| `container_count` | integer >= 0 | yes | Containers to carry. **Not** meal count. Example: many meals, `container_count: 3`. |
| `instructions` | string \| null | no | How to enter / hand over at this address. Shown in SS2 top card. |
| `sequence` | integer >= 1 | yes | Delivery order for the day (1-based). UI: `Daşınma ardıcıllığı: №1`. Do **not** use assignment `id` for this. |
| `orders` | array | yes | Document in OpenAPI (already returned live). |

### Nested `orders[]` item (document in OpenAPI)

Each order should expose at least:

- `id`
- `meal` (`id`, `name`, `image`)
- `is_prepared`
- `is_delivered`
- `company_location` object:
  - `id`
  - `address`
  - `name` (location display name, same semantics as `location_name`)
  - `company_name`
  - `instructions` (nullable)
  - `container_count`
  - `longitude` / `latitude`

Optional (not a UI blocker): `photo` / image URL for SS2 hero.

## Client title formula

```text
"{location_name} - {company_name}"
```

Example: `Bayil Bay - Sabah Hub`.

If an assignment has multiple companies, either:

- keep one stop with multiple company cards (current client shape), or
- split into one assignment per company.

Current QA screenshots use a single company per stop.

## Sample response (target)

```json
[
  {
    "id": 5,
    "company_location": 20,
    "pickup_location": null,
    "company_name": "Sabah Hub",
    "location_name": "Bayil Bay",
    "container_count": 3,
    "instructions": "Go to the building entrance, call the reception, hand over containers at the lobby desk.",
    "sequence": 1,
    "orders": [
      {
        "id": 101,
        "meal": { "id": 1, "name": "Cheezy Bomb Toyuq (çörək)", "image": "" },
        "company_location": {
          "id": 20,
          "name": "Bayil Bay",
          "address": "Bayil Bay, Baku",
          "company_name": "Sabah Hub",
          "instructions": "Go to the building entrance, call the reception, hand over containers at the lobby desk.",
          "container_count": 3,
          "longitude": "49.84",
          "latitude": "40.35"
        },
        "pickup_location": null,
        "date": "2026-09-10",
        "is_prepared": true,
        "is_delivered": false
      }
    ]
  }
]
```

## UI mapping

| UI | Source |
| --- | --- |
| SS1 / SS2 title | `location_name` + `company_name` |
| SS1 `Daşınacaq konteyner sayı` | `container_count` |
| SS1 `Daşınma ardıcıllığı` | `sequence` |
| SS2 top card | `instructions` |
| SS2 food list count | `sum(orders)` / meal quantities |
| SS2 container count above food list | `container_count` |
| Delivered action | existing `PUT /api/couriers/{id}/complete/` |

## OpenAPI follow-ups

1. Extend `CourierAssignment` with the fields above.
2. Document `orders` as an array of meal-order objects (not omit it).
3. Extend `CompanyAddressRead` (or a courier-specific nested schema) with `name`, `company_name`, `instructions`, `container_count`.

## Client fallback until backend ships

- Title: use `Location.name` / known location name when available; avoid inventing container/instruction placeholders.
- `sequence`: list index + 1 from API order.
- Hide container / instruction rows when values are missing.
