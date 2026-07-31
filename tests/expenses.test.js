const fs = require("fs/promises");
const os = require("os");
const path = require("path");
const request = require("supertest");
const createApp = require("../src/app");
const { ExpenseStore } = require("../src/storage");

async function buildTestApp() {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "expense-api-"));
  const store = new ExpenseStore(path.join(tempDir, "expenses.json"));
  const app = createApp(store);

  return { app, tempDir };
}

describe("Smart Expense Tracker API", () => {
  let app;
  let tempDir;

  beforeEach(async () => {
    const testContext = await buildTestApp();
    app = testContext.app;
    tempDir = testContext.tempDir;
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  async function createExpense(overrides = {}) {
    const expense = {
      title: "Lunch",
      amount: 12.5,
      category: "Food",
      date: "2026-07-31",
      ...overrides,
    };

    const response = await request(app).post("/expenses").send(expense);
    return response.body;
  }

  test("returns a helpful root response", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Smart Expense Tracker API");
    expect(response.body.endpoints.createExpense).toBe("POST /expenses");
  });

  test("creates an expense", async () => {
    const response = await request(app).post("/expenses").send({
      title: "Lunch",
      amount: 12.5,
      category: "Food",
      date: "2026-07-31",
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      title: "Lunch",
      amount: 12.5,
      category: "Food",
      date: "2026-07-31",
    });
    expect(response.body.id).toEqual(expect.any(String));
  });

  test("rejects invalid JSON request bodies", async () => {
    const response = await request(app)
      .post("/expenses")
      .set("Content-Type", "application/json")
      .send("{bad json");

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("request body must be valid JSON");
  });
  test("rejects missing fields and invalid values", async () => {
    const response = await request(app).post("/expenses").send({
      title: " ",
      amount: -4,
      category: "",
      date: "2026-13-01",
    });

    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(expect.arrayContaining([
      "title is required",
      "amount must be a number greater than 0",
      "category is required",
      "date must be a valid ISO date in YYYY-MM-DD format",
    ]));
  });

  test("lists all expenses", async () => {
    await createExpense({ title: "Lunch", amount: 12.5, category: "Food" });
    await createExpense({ title: "Bus", amount: 3, category: "Travel" });

    const response = await request(app).get("/expenses");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body.map((expense) => expense.title)).toEqual(["Lunch", "Bus"]);
  });

  test("filters expenses by category without matching case exactly", async () => {
    await createExpense({ title: "Lunch", amount: 12.5, category: "Food" });
    await createExpense({ title: "Coffee", amount: 4, category: "food" });
    await createExpense({ title: "Bus", amount: 3, category: "Travel" });

    const response = await request(app).get("/expenses?category=FOOD");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body.map((expense) => expense.title)).toEqual(["Lunch", "Coffee"]);
  });

  test("calculates overall and category totals", async () => {
    await createExpense({ title: "Lunch", amount: 12.5, category: "Food" });
    await createExpense({ title: "Coffee", amount: 4.25, category: "Food" });
    await createExpense({ title: "Bus", amount: 3, category: "Travel" });

    const overall = await request(app).get("/expenses/total");
    const food = await request(app).get("/expenses/total?category=food");

    expect(overall.status).toBe(200);
    expect(overall.body).toEqual({ total: 19.75, count: 3 });
    expect(food.status).toBe(200);
    expect(food.body).toEqual({ total: 16.75, count: 2, category: "food" });
  });

  test("adds budget comparison to totals", async () => {
    await createExpense({ title: "Groceries", amount: 80, category: "Food" });
    await createExpense({ title: "Dinner", amount: 30, category: "Food" });

    const underBudget = await request(app).get("/expenses/total?category=Food&budget=150");
    const overBudget = await request(app).get("/expenses/total?category=Food&budget=100");

    expect(underBudget.status).toBe(200);
    expect(underBudget.body).toMatchObject({
      total: 110,
      budget: 150,
      remaining: 40,
      status: "under_budget",
    });
    expect(overBudget.status).toBe(200);
    expect(overBudget.body).toMatchObject({
      total: 110,
      budget: 100,
      remaining: -10,
      status: "over_budget",
    });
  });

  test("rejects invalid budget values", async () => {
    const response = await request(app).get("/expenses/total?budget=-20");

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("budget must be a number greater than or equal to 0");
  });

  test("deletes an expense by id", async () => {
    const expense = await createExpense({ title: "Lunch" });

    const deleteResponse = await request(app).delete(`/expenses/${expense.id}`);
    const listResponse = await request(app).get("/expenses");

    expect(deleteResponse.status).toBe(204);
    expect(listResponse.body).toEqual([]);
  });

  test("returns 404 when deleting a missing expense", async () => {
    const response = await request(app).delete("/expenses/missing-id");

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("expense not found");
  });

  test("builds a monthly summary with category totals", async () => {
    await createExpense({ title: "Lunch", amount: 12.5, category: "Food", date: "2026-07-02" });
    await createExpense({ title: "Coffee", amount: 4, category: "food", date: "2026-07-03" });
    await createExpense({ title: "Train", amount: 22, category: "Travel", date: "2026-07-10" });
    await createExpense({ title: "Book", amount: 15, category: "Shopping", date: "2026-08-01" });

    const response = await request(app).get("/expenses/monthly-summary?month=2026-07");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      month: "2026-07",
      total: 38.5,
      count: 3,
      byCategory: {
        Food: 16.5,
        Travel: 22,
      },
    });
  });

  test("filters monthly summary by category", async () => {
    await createExpense({ title: "Lunch", amount: 12.5, category: "Food", date: "2026-07-02" });
    await createExpense({ title: "Train", amount: 22, category: "Travel", date: "2026-07-10" });

    const response = await request(app).get("/expenses/monthly-summary?month=2026-07&category=travel");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      month: "2026-07",
      category: "travel",
      total: 22,
      count: 1,
      byCategory: {
        Travel: 22,
      },
    });
  });

  test("rejects invalid monthly summary month", async () => {
    const response = await request(app).get("/expenses/monthly-summary?month=2026-15");

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("month must use a valid month between 01 and 12");
  });
});

