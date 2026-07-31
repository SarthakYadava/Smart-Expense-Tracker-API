# Smart Expense Tracker API

A JavaScript/Express REST API for managing personal expenses, with JSON file storage, category filtering, total calculations, monthly summaries, and lightweight budget comparison.

## Features

- Add an expense with id, title, amount, category, and date
- View all expenses
- Filter expenses by category
- Calculate total expenses overall or by category
- Delete an expense by id
- Compare spending against an optional budget
- Get a monthly summary with totals grouped by category

## Tech Stack

- Node.js
- Express
- Jest
- Supertest
- Local JSON file storage

## Project Structure

```text
.
|-- README.md
|-- AI_NOTES.md
|-- package.json
|-- src/
|   |-- app.js
|   |-- expenses.js
|   |-- server.js
|   `-- storage.js
`-- tests/
    `-- expenses.test.js
```

## Install Dependencies

```bash
npm install
```

## Run Tests

```bash
npm test
```

## Start the Server

```bash
npm start
```

The server runs on:

```text
http://localhost:3000
```

You can open the root route to see the available endpoints:

```text
http://localhost:3000/
```

## Expense Format

```json
{
  "id": "generated-id",
  "title": "Lunch",
  "amount": 12.5,
  "category": "Food",
  "date": "2026-07-31"
}
```

## API Endpoints

### Create an Expense

```http
POST /expenses
```

Example:

```bash
curl -X POST http://localhost:3000/expenses -H "Content-Type: application/json" -d "{\"title\":\"Lunch\",\"amount\":12.5,\"category\":\"Food\",\"date\":\"2026-07-31\"}"
```

Example response:

```json
{
  "id": "generated-id",
  "title": "Lunch",
  "amount": 12.5,
  "category": "Food",
  "date": "2026-07-31"
}
```

### View All Expenses

```http
GET /expenses
```

Example:

```bash
curl http://localhost:3000/expenses
```

### Filter Expenses by Category

```http
GET /expenses?category=Food
```

Example:

```bash
curl "http://localhost:3000/expenses?category=food"
```

Category filtering is case-insensitive, so `Food`, `food`, and `FOOD` match the same category. Surrounding spaces in the category query are ignored.

### Calculate Total Expenses

```http
GET /expenses/total
```

Example:

```bash
curl http://localhost:3000/expenses/total
```

Example response:

```json
{
  "total": 12.5,
  "count": 1
}
```

### Calculate Total Expenses by Category

```http
GET /expenses/total?category=Food
```

Example:

```bash
curl "http://localhost:3000/expenses/total?category=Food"
```

### Compare Total Against a Budget

```http
GET /expenses/total?budget=100
GET /expenses/total?category=Food&budget=50
```

Example:

```bash
curl "http://localhost:3000/expenses/total?category=Food&budget=50"
```

Example response:

```json
{
  "total": 12.5,
  "count": 1,
  "category": "Food",
  "budget": 50,
  "remaining": 37.5,
  "status": "under_budget"
}
```

### Monthly Summary

```http
GET /expenses/monthly-summary?month=2026-07
GET /expenses/monthly-summary?month=2026-07&category=Food
```

Example:

```bash
curl "http://localhost:3000/expenses/monthly-summary?month=2026-07"
```

Example response:

```json
{
  "month": "2026-07",
  "total": 38.5,
  "count": 3,
  "byCategory": {
    "Food": 16.5,
    "Travel": 22
  }
}
```

### Delete an Expense

```http
DELETE /expenses/:id
```

Example:

```bash
curl -X DELETE http://localhost:3000/expenses/generated-id
```

A successful delete returns status `204 No Content`.

## Validation Rules

- Request bodies must be valid JSON.
- `title` is required and cannot be empty.
- `amount` is required and must be a number greater than `0`.
- `category` is required and cannot be empty.
- `date` is required and must be a valid ISO date in `YYYY-MM-DD` format.
- `budget`, when provided, must be a number greater than or equal to `0`.
- `month`, when provided for monthly summary, must be in `YYYY-MM` format.

## Data Storage

Expenses are stored in a local JSON file at:

```text
data/expenses.json
```

The file is created automatically when the API first needs it. No database setup is required.
