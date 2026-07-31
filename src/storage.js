const fs = require("fs/promises");
const path = require("path");

const DEFAULT_DATA_FILE = path.join(__dirname, "..", "data", "expenses.json");

class ExpenseStore {
  constructor(filePath = DEFAULT_DATA_FILE) {
    this.filePath = filePath;
  }

  async ensureFile() {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });

    try {
      await fs.access(this.filePath);
    } catch {
      await fs.writeFile(this.filePath, "[]", "utf8");
    }
  }

  async readAll() {
    await this.ensureFile();
    const contents = await fs.readFile(this.filePath, "utf8");

    try {
      const expenses = JSON.parse(contents);
      return Array.isArray(expenses) ? expenses : [];
    } catch {
      return [];
    }
  }

  async writeAll(expenses) {
    await this.ensureFile();
    await fs.writeFile(this.filePath, JSON.stringify(expenses, null, 2), "utf8");
  }

  async add(expense) {
    const expenses = await this.readAll();
    expenses.push(expense);
    await this.writeAll(expenses);
    return expense;
  }

  async deleteById(id) {
    const expenses = await this.readAll();
    const nextExpenses = expenses.filter((expense) => expense.id !== id);

    if (nextExpenses.length === expenses.length) {
      return false;
    }

    await this.writeAll(nextExpenses);
    return true;
  }
}

module.exports = {
  DEFAULT_DATA_FILE,
  ExpenseStore,
};
