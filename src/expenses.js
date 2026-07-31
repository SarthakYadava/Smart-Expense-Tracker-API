const { randomUUID } = require("crypto");

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function categoryMatches(expense, category) {
  return expense.category.trim().toLowerCase() === category.trim().toLowerCase();
}

function validateExpenseInput(input) {
  const errors = [];

  if (!isNonEmptyString(input.title)) {
    errors.push("title is required");
  }

  if (typeof input.amount !== "number" || !Number.isFinite(input.amount) || input.amount <= 0) {
    errors.push("amount must be a number greater than 0");
  }

  if (!isNonEmptyString(input.category)) {
    errors.push("category is required");
  }

  if (!isValidDate(input.date)) {
    errors.push("date must be a valid ISO date in YYYY-MM-DD format");
  }

  return errors;
}

function createExpense(input) {
  return {
    id: randomUUID(),
    title: input.title.trim(),
    amount: roundMoney(input.amount),
    category: input.category.trim(),
    date: input.date,
  };
}

function filterByCategory(expenses, category) {
  if (!category) {
    return expenses;
  }

  return expenses.filter((expense) => categoryMatches(expense, category));
}

function parseBudget(value) {
  if (value === undefined) {
    return { budget: null };
  }

  const budget = Number(value);

  if (!Number.isFinite(budget) || budget < 0) {
    return { error: "budget must be a number greater than or equal to 0" };
  }

  return { budget: roundMoney(budget) };
}

function calculateTotal(expenses, options = {}) {
  const filteredExpenses = filterByCategory(expenses, options.category);
  const total = roundMoney(filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0));
  const response = {
    total,
    count: filteredExpenses.length,
  };

  if (options.category) {
    response.category = options.category;
  }

  if (options.budget !== null && options.budget !== undefined) {
    response.budget = options.budget;
    response.remaining = roundMoney(options.budget - total);
    response.status = total <= options.budget ? "under_budget" : "over_budget";
  }

  return response;
}

function parseMonth(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}$/.test(value)) {
    return { error: "month is required in YYYY-MM format" };
  }

  const month = Number(value.slice(5, 7));

  if (month < 1 || month > 12) {
    return { error: "month must use a valid month between 01 and 12" };
  }

  return { month: value };
}

function addCategoryTotal(totals, expense) {
  const existingCategory = Object.keys(totals).find(
    (category) => category.toLowerCase() === expense.category.toLowerCase(),
  );
  const category = existingCategory || expense.category;
  totals[category] = roundMoney((totals[category] || 0) + expense.amount);
}

function buildMonthlySummary(expenses, options = {}) {
  const matchingExpenses = filterByCategory(
    expenses.filter((expense) => expense.date.startsWith(`${options.month}-`)),
    options.category,
  );

  const byCategory = {};
  matchingExpenses.forEach((expense) => addCategoryTotal(byCategory, expense));

  const response = {
    month: options.month,
    total: roundMoney(matchingExpenses.reduce((sum, expense) => sum + expense.amount, 0)),
    count: matchingExpenses.length,
    byCategory,
  };

  if (options.category) {
    response.category = options.category;
  }

  return response;
}

module.exports = {
  buildMonthlySummary,
  calculateTotal,
  createExpense,
  filterByCategory,
  parseBudget,
  parseMonth,
  validateExpenseInput,
};
