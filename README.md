# Address Book API

SE4458 – Assignment 2 (Group 1: Address Book). REST API to create, edit, delete, search, sort and favorite addresses.

- Code: https://github.com/<KULLANICI_ADI>/address-book-api
- Live (Swagger): https://<PROJE>.vercel.app/api-docs
- Author: Sirac Ketenoğlu

## Stack
Node.js, Express, swagger-jsdoc + Swagger UI, in-memory storage, deployed on Vercel.

## Run locally
```bash
npm install
npm start    # http://localhost:3000/api-docs
```

## Endpoints
| Method | Path | Description |
|---|---|---|
| GET | `/addresses` | List. Optional query: `search`, `favorite`, `sortBy`, `order` |
| GET | `/addresses/{id}` | Get one |
| POST | `/addresses` | Create (`firstName`, `lastName` required) |
| PUT | `/addresses/{id}` | Edit (only the fields sent are changed) |
| DELETE | `/addresses/{id}` | Delete |
| PATCH | `/addresses/{id}/favorite` | Toggle favorite |

## Design
- `src/app.js` holds the whole app: an array as the in-memory database, the routes, and the Swagger comments above each route.
- `server.js` starts it locally; `api/index.js` exports the same app for Vercel.
- Search looks at first name, last name, email, phone and city. `favorite=true` lists favorites only.

## Assumptions
- "Edit" and "update" from the assignment are one `PUT` endpoint.
- No authentication and no pagination, since the assignment doesn't ask for them.
- Data lives in memory, so it resets when the server restarts.

## Issues encountered
<!-- Deploy sırasında gerçekten yaşadığın sorunları buraya yaz -->
