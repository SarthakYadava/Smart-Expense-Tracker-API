const express = require("express");
const {
  buildMonthlySummary,
  calculateTotal,
  createExpense,
  filterByCategory,
  parseBudget,
  parseMonth,
  validateExpenseInput,
} = require("./expenses");
const { ExpenseStore } = require("./storage");

function createApp(store = new ExpenseStore()) {
  const app = express();

  app.use(express.json());

  app.get("/", (req, res) => {
    res.json({
      name: "Smart Expense Tracker API",
      endpoints: {
        createExpense: "POST /expenses",
        listExpenses: "GET /expenses",
        filterByCategory: "GET /expenses?category=Food",
        total: "GET /expenses/total",
        totalWithBudget: "GET /expenses/total?budget=500",
        monthlySummary: "GET /expenses/monthly-summary?month=2026-07",
        deleteExpense: "DELETE /expenses/:id",
      },
    });
  });

  app.post("/expenses", async (req, res, next) => {
    try {
      const errors = validateExpenseInput(req.body);

      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      const expense = await store.add(createExpense(req.body));
      return res.status(201).json(expense);
    } catch (error) {
      return next(error);
    }
  });

  app.get("/expenses", async (req, res, next) => {
    try {
      const expenses = await store.readAll();
      return res.json(filterByCategory(expenses, req.query.category));
    } catch (error) {
      return next(error);
    }
  });

  app.get("/expenses/total", async (req, res, next) => {
    try {
      const { budget, error } = parseBudget(req.query.budget);

      if (error) {
        return res.status(400).json({ error });
      }

      const expenses = await store.readAll();
      return res.json(calculateTotal(expenses, {
        category: req.query.category,
        budget,
      }));
    } catch (error) {
      return next(error);
    }
  });

  app.get("/expenses/monthly-summary", async (req, res, next) => {
    try {
      const { month, error } = parseMonth(req.query.month);

      if (error) {
        return res.status(400).json({ error });
      }

      const expenses = await store.readAll();
      return res.json(buildMonthlySummary(expenses, {
        month,
        category: req.query.category,
      }));
    } catch (error) {
      return next(error);
    }
  });

  app.delete("/expenses/:id", async (req, res, next) => {
    try {
      const deleted = await store.deleteById(req.params.id);

      if (!deleted) {
        return res.status(404).json({ error: "expense not found" });
      }

      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  });

  app.use((req, res) => {
    res.status(404).json({ error: "route not found" });
  });

  app.use((error, req, res, next) => {
    res.status(500).json({ error: "internal server error" });
  });

  return app;
}

module.exports = createApp;
