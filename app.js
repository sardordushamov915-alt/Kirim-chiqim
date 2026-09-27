/* =========================================
   KIRIM-CHIQIM V6
   Core Application Engine
========================================= */

const APP_KEY = "kirimChiqimV6";

let transactions = [];
let currentType = "expense";

/* ===============================
   STORAGE
================================ */

function loadData() {
  try {
    transactions =
      JSON.parse(localStorage.getItem(APP_KEY)) || [];
  } catch {
    transactions = [];
  }
}

function saveData() {
  localStorage.setItem(
    APP_KEY,
    JSON.stringify(transactions)
  );
}

/* ===============================
   FORMAT
================================ */

function money(value) {
  return Number(value || 0).toLocaleString("uz-UZ") + " so'm";
}

function totalIncome() {
  return transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);
}

function totalExpense() {
  return transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);
}

function balance() {
  return totalIncome() - totalExpense();
}

/* ===============================
   TRANSACTION
================================ */

function addTransaction(data) {

  const transaction = {
    id: Date.now(),

    type: data.type,

    amount: Number(data.amount),

    note: data.note || "Noma'lum",

    category: data.category || "Boshqa",

    payment: data.payment || "Naqd",

    date: new Date().toISOString()
  };

  transactions.unshift(transaction);

  saveData();

  renderApp();
}

/* ===============================
   DELETE
================================ */

function deleteTransaction(id) {

  const confirmDelete =
    confirm("Bu operatsiyani o'chirishni xohlaysizmi?");

  if (!confirmDelete) return;

  transactions =
    transactions.filter(t => t.id !== id);

  saveData();

  renderApp();
}

/* ===============================
   EDIT
================================ */

function editTransaction(id, newData) {

  const index =
    transactions.findIndex(t => t.id === id);

  if (index === -1) return;

  transactions[index] = {
    ...transactions[index],
    ...newData,
    amount: Number(newData.amount)
  };

  saveData();

  renderApp();
}

/* ===============================
   REPORT DATA
================================ */

function getReportData() {

  const income = totalIncome();

  const expense = totalExpense();

  const currentBalance = income - expense;

  const categories = {};

  transactions
    .filter(t => t.type === "expense")
    .forEach(t => {

      if (!categories[t.category]) {
        categories[t.category] = 0;
      }

      categories[t.category] += Number(t.amount);
    });

  return {
    income,
    expense,
    balance: currentBalance,
    categories
  };
}

/* ===============================
   PAYMENT DATA
================================ */

function getPaymentData() {

  const payments = {};

  transactions.forEach(t => {

    if (!payments[t.payment]) {
      payments[t.payment] = {
        income: 0,
        expense: 0
      };
    }

    if (t.type === "income") {
      payments[t.payment].income +=
        Number(t.amount);
    } else {
      payments[t.payment].expense +=
        Number(t.amount);
    }

  });

  return payments;
}

/* ===============================
   MONTHLY DATA
================================ */

function getMonthlyData() {

  const months = {};

  transactions.forEach(t => {

    const date = new Date(t.date);

    const key =
      date.getFullYear() +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0");

    if (!months[key]) {
      months[key] = {
        income: 0,
        expense: 0
      };
    }

    if (t.type === "income") {
      months[key].income +=
        Number(t.amount);
    } else {
      months[key].expense +=
        Number(t.amount);
    }

  });

  return months;
}

/* ===============================
   SEARCH
================================ */

function searchTransactions(query) {

  query =
    String(query || "")
      .toLowerCase()
      .trim();

  if (!query) {
    return transactions;
  }

  return transactions.filter(t =>

    String(t.note)
      .toLowerCase()
      .includes(query)

    ||

    String(t.category)
      .toLowerCase()
      .includes(query)

    ||

    String(t.payment)
      .toLowerCase()
      .includes(query)

  );
}

/* ===============================
   FILTER
================================ */

function filterTransactions(type = "all") {

  if (type === "all") {
    return transactions;
  }

  return transactions.filter(
    t => t.type === type
  );
}

/* ===============================
   EXPORT
================================ */

function exportData() {

  const data =
    JSON.stringify(
      transactions,
      null,
      2
    );

  const blob =
    new Blob(
      [data],
      { type: "application/json" }
    );

  const url =
    URL.createObjectURL(blob);

  const a =
    document.createElement("a");

  a.href = url;

  a.download =
    "kirim-chiqim-backup.json";

  a.click();

  URL.revokeObjectURL(url);
}

/* ===============================
   IMPORT
================================ */

function importData(file) {

  if (!file) return;

  const reader =
    new FileReader();

  reader.onload = function(e) {

    try {

      const data =
        JSON.parse(e.target.result);

      if (!Array.isArray(data)) {
        throw new Error();
      }

      transactions = data;

      saveData();

      renderApp();

      alert("Ma'lumotlar tiklandi!");

    } catch {

      alert(
        "Backup fayl noto'g'ri."
      );

    }

  };

  reader.readAsText(file);
}

/* ===============================
   CLEAR DATA
================================ */

function clearAllData() {

  const confirmClear =
    confirm(
      "Barcha ma'lumotlar o'chiriladi. Davom etamizmi?"
    );

  if (!confirmClear) return;

  transactions = [];

  saveData();

  renderApp();
}

/* ===============================
   APP RENDER
================================ */

function renderApp() {

  if (
    typeof window.renderUI ===
    "function"
  ) {
    window.renderUI();
  }

}

/* ===============================
   START
================================ */

loadData();

window.KirimChiqimV6 = {

  transactions,

  addTransaction,

  deleteTransaction,

  editTransaction,

  getReportData,

  getPaymentData,

  getMonthlyData,

  searchTransactions,

  filterTransactions,

  exportData,

  importData,

  clearAllData,

  money
};
