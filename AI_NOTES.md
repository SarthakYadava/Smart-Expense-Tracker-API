# AI Notes

## 1. Which Parts Were AI-Generated vs. Written or Edited by Me

I used AI assistance to generate the initial Express project structure, route handler drafts, JSON storage helper, validation logic, and Jest/Supertest test drafts.

The parts I specifically directed, reviewed, or refined were:

- **Choosing JavaScript and Express**
  - I chose JavaScript because it is a language I am comfortable working with and can explain clearly.
  - I chose Express because it is lightweight, widely used, and well-suited for a small REST API assignment.
  - This kept the project focused on API behavior instead of adding unnecessary framework complexity.

- **Deciding the final endpoint names**
  - I mapped the assignment requirements to simple REST endpoints such as `POST /expenses`, `GET /expenses`, and `DELETE /expenses/:id`.
  - I used query parameters for related filtering behavior, such as `GET /expenses?category=Food`, instead of creating too many separate routes.
  - I kept total calculations under `GET /expenses/total` because totals are a derived view of the expense collection.

- **Selecting case-insensitive category filtering**
  - I chose case-insensitive filtering because users may enter categories in different formats, such as `Food`, `food`, or `FOOD`.
  - This makes the API more forgiving and avoids missing expenses only because of capitalization differences.
  - This behavior is implemented in `src/expenses.js` through the category comparison helper and verified in `tests/expenses.test.js`.

- **Adding budget comparison to the total endpoint**
  - I noticed the assignment said "smart expense tracker," so I added a lightweight budget comparison to the total endpoint. It does not complicate storage, but it makes the API more useful.
  - The budget comparison is available through `GET /expenses/total?budget=500` and `GET /expenses/total?category=Food&budget=150`.
  - This differentiates my submission because many solutions would only implement basic CRUD. Mine adds a small product-thinking improvement: expenses are not just stored, they are interpreted.

- **Choosing the monthly summary endpoint as the optional bonus**
  - I chose monthly summaries because they fit naturally with expense tracking and are useful without requiring a frontend, database, or authentication.
  - This is implemented as `GET /expenses/monthly-summary?month=YYYY-MM` with optional category filtering.
  - I chose this over Swagger or Docker because it improves the API behavior directly while keeping the setup simple for reviewers.

- **Reviewing the documentation and examples**
  - I kept `README.md` focused on setup commands, endpoint examples, validation rules, and storage behavior.
  - I made sure the required commands are written exactly and can be copied by a reviewer: `npm install`, `npm start`, and `npm test`.

## 2. What I Validated, Tested, or Changed in the AI Output, and Why

I did not accept the AI output as-is. I reviewed it against the assignment requirements and refined the project so it stayed focused, testable, and easy to run.

I validated the following behavior:

- Creating an expense requires a title, amount, category, and valid date.
- Expense amounts must be greater than zero.
- All expenses can be listed successfully.
- Expenses can be filtered by category.
- Category filtering works regardless of capitalization.
- Total expenses can be calculated overall.
- Total expenses can be calculated by category.
- An expense can be deleted by its id.
- Deleting a missing expense returns a `404` response.
- The optional budget comparison correctly returns `budget`, `remaining`, and `status` values.
- The monthly summary endpoint returns totals for the requested month and groups spending by category.
- The monthly summary endpoint supports optional category filtering.
- Invalid JSON request bodies return a clear `400` response instead of a generic server error.

Specific changes and review points:

- In `src/app.js`, I reviewed the route structure and kept the API surface close to the assignment requirements.
- In `src/app.js`, I added specific handling for invalid JSON request bodies so malformed requests return a clear `400` response.
- In `src/expenses.js`, I refined category filtering to be case-insensitive instead of exact-match only.
- In `src/expenses.js`, I kept validation rules explicit and readable so the API returns clear `400` errors for bad input.
- In the total calculation logic, I added optional budget comparison so totals can show whether spending is under or over a provided budget.
- In the monthly summary logic, I grouped category totals while still treating category names case-insensitively.
- In `src/storage.js`, I kept storage local and simple by using a JSON file that is created automatically when needed.
- In `tests/expenses.test.js`, I checked coverage for required features, validation errors, deletion behavior, category filtering, totals, budget comparison, and monthly summaries.
- In `README.md`, I adjusted the setup and API examples so the reviewer can quickly install, run, and test the project.

I manually reviewed the generated code, tested the main API flows, adjusted the README examples, and chose not to add authentication, a database, or a frontend because those were outside the assignment scope.

## 3. AI Suggestions I Decided Not to Use, and Why

I decided not to use several possible additions because they would have made the project more complicated than necessary for this assignment.

- **Database storage**
  - I did not use MongoDB, PostgreSQL, or another database because the assignment clearly allows in-memory or local JSON file storage.
  - A database would add setup steps for reviewers and could make automated evaluation harder.

- **Authentication or user accounts**
  - I did not add login, registration, JWT tokens, or user-specific expenses because authentication was not part of the assignment requirements.
  - Adding authentication would distract from the core expense API functionality.

- **Frontend application**
  - I did not build a frontend because the assignment specifically asks for a REST API.
  - Keeping the project API-only makes it easier to test and evaluate with automated checks.

- **Swagger/OpenAPI setup**
  - I did not add Swagger because it would require extra packages and configuration.
  - Instead, I added a simple root route and clear README examples so the endpoints are still easy to inspect and test.

- **Docker support**
  - I did not add Docker because the API only needs Node.js and `npm install` to run.
  - Avoiding Docker keeps the setup simple for a short take-home assignment.

- **Too many optional features**
  - I avoided adding multiple unrelated bonus features because that could make the project feel unfocused.
  - I chose the monthly summary endpoint as the single official optional bonus and kept the budget comparison as a small addition to the existing total endpoint.

- **Overcomplicated folder structure**
  - I kept the folder structure simple with `src/`, `tests/`, `README.md`, and `AI_NOTES.md`.
  - This matches the required submission format and makes the project easier to review.
