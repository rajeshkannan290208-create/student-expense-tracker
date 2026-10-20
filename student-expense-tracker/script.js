/* SmartSpend — browser-only student expense tracker. Data is stored in localStorage. */

const CATEGORIES = [
  { name: "Food", icon: "utensils", color: "#ff8a8a" },
  { name: "Travel", icon: "bus-front", color: "#22d3ee" },
  { name: "Education", icon: "graduation-cap", color: "#a78bfa" },
  { name: "Shopping", icon: "shopping-bag", color: "#f9a8d4" },
  { name: "Entertainment", icon: "popcorn", color: "#fbbf24" },
  { name: "Hostel", icon: "house", color: "#60a5fa" },
  { name: "Health", icon: "heart-pulse", color: "#4ade80" },
  { name: "Other", icon: "ellipsis", color: "#94a3b8" }
];

const STORAGE = {
  transactions: "smartSpend_transactions_v1",
  plans: "smartSpend_budgetPlans_v1",
  theme: "smartSpend_theme_v1"
};

const state = {
  transactions: [],
  plans: {},
  activeMonth: getCurrentMonth(),
  charts: {},
  confirmCallback: null,
  lastFocusedElement: null
};

const pageInfo = {
  dashboard: { title: "Good to see you, Student!", eyebrow: "YOUR MONEY, SIMPLIFIED" },
  transactions: { title: "Transactions", eyebrow: "MONEY LOG" },
  budget: { title: "Budget planner", eyebrow: "PLAN WITH PURPOSE" },
  insights: { title: "Insights", eyebrow: "KNOW YOUR MONEY" }
};

function getCurrentMonth() {
  return localDateString(new Date()).slice(0, 7);
}

function getToday() {
  return localDateString(new Date());
}

function dateForOffset(monthOffset, day) {
  const date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth() + monthOffset);
  date.setDate(Math.min(day, new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()));
  return localDateString(date);
}

function localDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createSampleTransactions() {
  return [
    { id: "sample-1", type: "income", title: "Monthly pocket money", amount: 9000, category: "Other", date: dateForOffset(0, 2), description: "Pocket money from home" },
    { id: "sample-2", type: "expense", title: "Hostel mess", amount: 2450, category: "Hostel", date: dateForOffset(0, 3), description: "Monthly mess contribution" },
    { id: "sample-3", type: "expense", title: "Canteen lunch", amount: 150, category: "Food", date: dateForOffset(0, 7), description: "Lunch with classmates" },
    { id: "sample-4", type: "expense", title: "Bus pass recharge", amount: 600, category: "Travel", date: dateForOffset(0, 10), description: "College bus pass" },
    { id: "sample-5", type: "expense", title: "Cloud course", amount: 799, category: "Education", date: dateForOffset(0, 12), description: "Online certification course" },
    { id: "sample-6", type: "income", title: "Design freelance", amount: 1800, category: "Other", date: dateForOffset(0, 14), description: "Poster design project" },
    { id: "sample-7", type: "expense", title: "Movie night", amount: 280, category: "Entertainment", date: dateForOffset(0, 16), description: "Weekend movie" },
    { id: "sample-8", type: "expense", title: "Notebook supplies", amount: 340, category: "Education", date: dateForOffset(-1, 9), description: "Stationery shop" },
    { id: "sample-9", type: "expense", title: "Festival shopping", amount: 1200, category: "Shopping", date: dateForOffset(-1, 17), description: "New college clothes" },
    { id: "sample-10", type: "income", title: "Scholarship credit", amount: 3500, category: "Education", date: dateForOffset(-2, 5), description: "Semester scholarship" },
    { id: "sample-11", type: "expense", title: "Pharmacy", amount: 420, category: "Health", date: dateForOffset(-2, 12), description: "Vitamins and medicines" },
    { id: "sample-12", type: "expense", title: "Weekend outing", amount: 520, category: "Entertainment", date: dateForOffset(-3, 21), description: "Coffee and bowling" },
    { id: "sample-13", type: "expense", title: "Auto rides", amount: 330, category: "Travel", date: dateForOffset(-4, 8), description: "Campus commute" },
    { id: "sample-14", type: "expense", title: "Textbook", amount: 650, category: "Education", date: dateForOffset(-5, 15), description: "Semester reference book" }
  ];
}

function createDefaultPlans() {
  const current = getCurrentMonth();
  return {
    [current]: {
      monthlyAmount: 12000,
      categoryLimits: { Food: 2000, Travel: 1200, Education: 2500, Entertainment: 900 }
    }
  };
}

function readStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored === null ? fallback : JSON.parse(stored);
  } catch (error) {
    console.warn("Could not read saved SmartSpend data", error);
    return fallback;
  }
}

function saveData() {
  localStorage.setItem(STORAGE.transactions, JSON.stringify(state.transactions));
  localStorage.setItem(STORAGE.plans, JSON.stringify(state.plans));
}

function initializeData() {
  const savedTransactions = readStorage(STORAGE.transactions, null);
  const savedPlans = readStorage(STORAGE.plans, null);
  state.transactions = Array.isArray(savedTransactions) ? savedTransactions : createSampleTransactions();
  state.plans = savedPlans && typeof savedPlans === "object" ? savedPlans : createDefaultPlans();
  if (!savedTransactions || !savedPlans) saveData();
}

function currency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0
  }).format(Number(value) || 0);
}

function number(value) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) return "—";
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(year, month - 1, day));
}

function formatMonth(value) {
  if (!value) return "this month";
  const [year, month] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(new Date(year, month - 1, 1));
}

function getCategory(name) {
  return CATEGORIES.find(category => category.name === name) || CATEGORIES[CATEGORIES.length - 1];
}

function getPlan(month = state.activeMonth) {
  const plan = state.plans[month] || { monthlyAmount: 0, categoryLimits: {} };
  return { monthlyAmount: Number(plan.monthlyAmount) || 0, categoryLimits: plan.categoryLimits || {} };
}

function inMonth(transaction, month) {
  return transaction.date && transaction.date.slice(0, 7) === month;
}

function totalByType(type, transactions = state.transactions) {
  return transactions.filter(transaction => transaction.type === type).reduce((sum, transaction) => sum + Number(transaction.amount), 0);
}

function expensesForMonth(month) {
  return state.transactions.filter(transaction => transaction.type === "expense" && inMonth(transaction, month));
}

function getMonthSummary(month = state.activeMonth) {
  const monthlyTransactions = state.transactions.filter(transaction => inMonth(transaction, month));
  const income = totalByType("income", monthlyTransactions);
  const expense = totalByType("expense", monthlyTransactions);
  const plan = getPlan(month);
  return { income, expense, balance: income - expense, plan, remaining: plan.monthlyAmount - expense };
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;" })[char]);
}

function refreshIcons() {
  if (window.lucide) window.lucide.createIcons();
}

function renderAll() {
  renderDashboard();
  renderTransactions();
  renderBudget();
  renderInsights();
  refreshIcons();
}

function renderDashboard() {
  const income = totalByType("income");
  const expense = totalByType("expense");
  const balance = income - expense;
  const monthly = getMonthSummary();
  const percent = monthly.plan.monthlyAmount > 0 ? (monthly.expense / monthly.plan.monthlyAmount) * 100 : 0;
  const statusClass = percent > 100 ? "negative" : percent >= 80 ? "warning" : "positive";
  const monthName = formatMonth(state.activeMonth).replace(/\s\d{4}/, "");

  document.getElementById("dashboardMonth").value = state.activeMonth;
  document.getElementById("totalBalance").textContent = currency(balance);
  document.getElementById("totalIncome").textContent = currency(income);
  document.getElementById("totalExpenses").textContent = currency(expense);
  document.getElementById("budgetRemaining").textContent = monthly.plan.monthlyAmount ? currency(Math.max(monthly.remaining, 0)) : "—";
  document.getElementById("balanceSubtext").textContent = balance >= 0 ? "All-time balance" : "Your expenses exceed income";
  document.getElementById("balanceSubtext").className = `card-foot ${balance >= 0 ? "positive" : "negative"}`;
  document.getElementById("incomeSubtext").textContent = `${currency(monthly.income)} received in ${monthName}`;
  document.getElementById("expenseSubtext").textContent = `${currency(monthly.expense)} spent in ${monthName}`;
  document.getElementById("budgetSubtext").textContent = monthly.plan.monthlyAmount ? `${Math.round(percent)}% of ${monthName} plan used` : "Set a monthly budget";
  document.getElementById("budgetSubtext").className = `card-foot ${statusClass}`;
  document.getElementById("budgetSpentAmount").textContent = `${currency(monthly.expense)} spent of ${currency(monthly.plan.monthlyAmount)}`;
  document.getElementById("budgetPercent").textContent = monthly.plan.monthlyAmount ? `${Math.round(percent)}%` : "—";
  updateProgress(document.getElementById("budgetProgress"), percent);
  document.getElementById("budgetMessage").textContent = budgetMessage(monthly.plan.monthlyAmount, monthly.remaining, percent);
  renderDashboardLimits(monthly.plan, state.activeMonth);
  renderTrendChart();
  renderCategoryChart();
  renderRecentTransactions();
}

function updateProgress(element, percent) {
  const track = element.parentElement;
  element.style.width = `${Math.min(Math.max(percent, 0), 100)}%`;
  track.classList.toggle("warning", percent >= 80 && percent <= 100);
  track.classList.toggle("danger", percent > 100);
}

function budgetMessage(budget, remaining, percent) {
  if (!budget) return "Set a budget to see your progress.";
  if (percent > 100) return `You are ${currency(Math.abs(remaining))} over this month's budget. Time to pause non-essential spending.`;
  if (percent >= 80) return `Heads up — only ${currency(remaining)} remains in this month's budget.`;
  return `Great job. You still have ${currency(remaining)} available to spend this month.`;
}

function renderDashboardLimits(plan, month) {
  const target = document.getElementById("dashboardLimitList");
  const limits = Object.entries(plan.categoryLimits).filter(([, limit]) => Number(limit) > 0);
  if (!limits.length) { target.innerHTML = ""; return; }
  target.innerHTML = limits.slice(0, 3).map(([category, limit]) => {
    const spent = expensesForMonth(month).filter(transaction => transaction.category === category).reduce((sum, transaction) => sum + Number(transaction.amount), 0);
    const percent = (spent / Number(limit)) * 100;
    const status = percent > 100 ? "danger" : percent >= 80 ? "warning" : "";
    return `<div class="limit-mini ${status}"><span>${escapeHtml(category)} limit</span><strong>${currency(spent)} / ${currency(limit)}</strong></div>`;
  }).join("");
}

function getLastMonths(count) {
  const dates = [];
  const current = new Date();
  current.setDate(1);
  for (let index = count - 1; index >= 0; index--) {
    const date = new Date(current.getFullYear(), current.getMonth() - index, 1);
    dates.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`);
  }
  return dates;
}

function renderTrendChart() {
  const months = getLastMonths(6);
  const data = months.map(month => totalByType("expense", state.transactions.filter(transaction => inMonth(transaction, month))));
  buildChart("trend", "trendChart", {
    type: "line",
    data: {
      labels: months.map(month => formatMonth(month).slice(0, 3)),
      datasets: [{ data, fill: true, borderColor: "#a78bfa", backgroundColor: "rgba(139, 92, 246, .14)", borderWidth: 2.5, tension: .38, pointRadius: 3, pointHoverRadius: 5, pointBackgroundColor: "#22d3ee" }]
    },
    options: chartOptions({ y: true, tooltip: true })
  });
}

function renderCategoryChart() {
  const categoryData = CATEGORIES.map(category => ({
    ...category,
    total: expensesForMonth(state.activeMonth).filter(transaction => transaction.category === category.name).reduce((sum, transaction) => sum + Number(transaction.amount), 0)
  })).filter(item => item.total > 0);
  const canvas = document.getElementById("categoryChart");
  const legend = document.getElementById("categoryLegend");
  const hasData = categoryData.length > 0;
  buildChart("category", "categoryChart", {
    type: "doughnut",
    data: {
      labels: hasData ? categoryData.map(item => item.name) : ["No expenses"],
      datasets: [{ data: hasData ? categoryData.map(item => item.total) : [1], backgroundColor: hasData ? categoryData.map(item => item.color) : ["#34364d"], borderColor: "#151727", borderWidth: 4, hoverOffset: 5 }]
    },
    options: { responsive: true, maintainAspectRatio: false, cutout: "69%", plugins: { legend: { display: false }, tooltip: { enabled: hasData, callbacks: { label: context => `${context.label}: ${currency(context.raw)}` } } } }
  });
  legend.innerHTML = hasData ? categoryData.map(item => `<div class="legend-item"><span class="legend-label"><i class="legend-dot" style="background:${item.color}"></i><span>${escapeHtml(item.name)}</span></span><strong>${currency(item.total)}</strong></div>`).join("") : "<p class='muted'>No expense entries this month.</p>";
  canvas.setAttribute("aria-label", hasData ? "Expense breakdown by category" : "No expenses this month");
}

function chartOptions({ y = false, tooltip = false } = {}) {
  const style = getComputedStyle(document.body);
  const muted = style.getPropertyValue("--muted").trim() || "#989bb5";
  const grid = style.getPropertyValue("--border").trim() || "rgba(181,186,255,.12)";
  return {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: tooltip, backgroundColor: "#23263b", padding: 10, displayColors: false, callbacks: { label: context => currency(context.raw) } } },
    scales: {
      x: { grid: { display: false }, ticks: { color: muted, font: { size: 10 } }, border: { display: false } },
      y: { display: y, beginAtZero: true, grid: { color: grid }, border: { display: false }, ticks: { color: muted, font: { size: 10 }, callback: value => `₹${number(value)}` } }
    }
  };
}

function buildChart(key, canvasId, config) {
  if (!window.Chart) return;
  if (state.charts[key]) state.charts[key].destroy();
  const context = document.getElementById(canvasId)?.getContext("2d");
  if (context) state.charts[key] = new Chart(context, config);
}

function renderRecentTransactions() {
  const target = document.getElementById("recentTransactions");
  const recent = [...state.transactions].sort(sortNewest).slice(0, 5);
  if (!recent.length) {
    target.innerHTML = "<div class='empty-state'><div class='empty-illustration'><i data-lucide='wallet-minimal'></i></div><h3>Your activity will appear here</h3><p>Add an income or expense to begin.</p></div>";
    return;
  }
  target.innerHTML = recent.map(transaction => {
    const category = getCategory(transaction.category);
    const sign = transaction.type === "income" ? "+" : "−";
    return `<div class="recent-item"><div class="transaction-icon ${transaction.type}"><i data-lucide="${category.icon}"></i></div><div class="recent-details"><strong>${escapeHtml(transaction.title)}</strong><span>${escapeHtml(transaction.category)} &middot; ${formatDate(transaction.date)}</span></div><div class="recent-amount ${transaction.type}">${sign}${currency(transaction.amount)}<small>${transaction.type === "income" ? "Income" : "Expense"}</small></div></div>`;
  }).join("");
}

function getFilteredTransactions() {
  const search = document.getElementById("searchInput").value.trim().toLowerCase();
  const type = document.getElementById("typeFilter").value;
  const category = document.getElementById("categoryFilter").value;
  const month = document.getElementById("monthFilter").value;
  const exactDate = document.getElementById("dateFilter").value;
  const sort = document.getElementById("sortFilter").value;
  let filtered = state.transactions.filter(transaction => {
    const haystack = `${transaction.title} ${transaction.category} ${transaction.description || ""}`.toLowerCase();
    return (!search || haystack.includes(search)) &&
      (type === "all" || transaction.type === type) &&
      (category === "all" || transaction.category === category) &&
      (!month || inMonth(transaction, month)) &&
      (!exactDate || transaction.date === exactDate);
  });
  return filtered.sort((a, b) => {
    if (sort === "oldest") return new Date(a.date) - new Date(b.date);
    if (sort === "highest") return Number(b.amount) - Number(a.amount);
    if (sort === "lowest") return Number(a.amount) - Number(b.amount);
    return sortNewest(a, b);
  });
}

function sortNewest(a, b) {
  const dateDifference = new Date(b.date) - new Date(a.date);
  return dateDifference || String(b.id).localeCompare(String(a.id));
}

function renderTransactions() {
  const body = document.getElementById("transactionTableBody");
  const empty = document.getElementById("transactionEmptyState");
  const filtered = getFilteredTransactions();
  const visibleTotal = filtered.reduce((sum, transaction) => sum + (transaction.type === "income" ? Number(transaction.amount) : -Number(transaction.amount)), 0);
  document.getElementById("transactionCount").textContent = `${filtered.length} transaction${filtered.length === 1 ? "" : "s"}`;
  document.getElementById("transactionTotal").textContent = filtered.length ? `Net: ${visibleTotal < 0 ? "−" : "+"}${currency(Math.abs(visibleTotal))}` : "";
  empty.hidden = filtered.length > 0;
  document.querySelector(".table-wrap").hidden = filtered.length === 0;
  if (!filtered.length) { body.innerHTML = ""; return; }
  body.innerHTML = filtered.map(transaction => {
    const category = getCategory(transaction.category);
    const sign = transaction.type === "income" ? "+" : "−";
    return `<tr><td><div class="transaction-cell"><div class="transaction-icon ${transaction.type}"><i data-lucide="${category.icon}"></i></div><div><strong>${escapeHtml(transaction.title)}</strong>${transaction.description ? `<small>${escapeHtml(transaction.description)}</small>` : ""}</div></div></td><td><span class="category-chip">${escapeHtml(transaction.category)}</span></td><td>${formatDate(transaction.date)}</td><td><span class="type-chip ${transaction.type}">${transaction.type === "income" ? "Income" : "Expense"}</span></td><td class="table-amount ${transaction.type}">${sign}${currency(transaction.amount)}</td><td><div class="row-actions"><button class="table-action edit-transaction" data-id="${escapeHtml(transaction.id)}" aria-label="Edit ${escapeHtml(transaction.title)}" title="Edit"><i data-lucide="pencil"></i></button><button class="table-action delete delete-transaction" data-id="${escapeHtml(transaction.id)}" aria-label="Delete ${escapeHtml(transaction.title)}" title="Delete"><i data-lucide="trash-2"></i></button></div></td></tr>`;
  }).join("");
}

function renderBudget() {
  const plan = getPlan();
  const summary = getMonthSummary();
  const percent = plan.monthlyAmount ? (summary.expense / plan.monthlyAmount) * 100 : 0;
  document.getElementById("budgetMonth").value = state.activeMonth;
  document.getElementById("monthlyBudget").value = plan.monthlyAmount || "";
  document.getElementById("currentPlanMonth").textContent = formatMonth(state.activeMonth);
  document.getElementById("planSpent").textContent = currency(summary.expense);
  document.getElementById("planRemaining").textContent = currency(Math.max(summary.remaining, 0));
  document.getElementById("planRingPercent").textContent = plan.monthlyAmount ? `${Math.round(percent)}%` : "—";
  const planRing = document.getElementById("planRing");
  planRing.style.setProperty("--progress", `${Math.min(Math.max(percent, 0), 100) * 3.6}deg`);
  planRing.style.background = percent > 100 ? `conic-gradient(#fb7185 ${Math.min(percent, 100) * 3.6}deg, #292b42 0)` : percent >= 80 ? `conic-gradient(#fbbf24 ${percent * 3.6}deg, #292b42 0)` : `conic-gradient(#8b5cf6 ${percent * 3.6}deg, #292b42 0)`;
  document.getElementById("planMessage").textContent = budgetMessage(plan.monthlyAmount, summary.remaining, percent);
  renderLimitInputs(plan);
  renderCategoryBudgetStatus(plan);
}

function renderLimitInputs(plan) {
  document.getElementById("categoryLimitInputs").innerHTML = CATEGORIES.map(category => `<div class="category-limit-item"><label for="limit-${category.name}"><span class="category-limit-icon"><i data-lucide="${category.icon}"></i></span><span>${category.name} (₹)</span><input id="limit-${category.name}" data-category-limit="${category.name}" type="number" min="1" step="1" value="${Number(plan.categoryLimits[category.name]) || ""}" placeholder="No limit"></label></div>`).join("");
}

function renderCategoryBudgetStatus(plan) {
  const target = document.getElementById("categoryBudgetStatus");
  const limits = Object.entries(plan.categoryLimits).filter(([, limit]) => Number(limit) > 0);
  if (!limits.length) {
    target.innerHTML = "<p class='no-limits-message'>No category limits set for this month. Add optional limits above to track individual categories.</p>";
    return;
  }
  target.innerHTML = limits.map(([categoryName, limit]) => {
    const category = getCategory(categoryName);
    const spent = expensesForMonth(state.activeMonth).filter(transaction => transaction.category === categoryName).reduce((sum, transaction) => sum + Number(transaction.amount), 0);
    const percent = (spent / Number(limit)) * 100;
    return `<div class="category-status"><div class="category-status-head"><strong>${escapeHtml(categoryName)}</strong><i data-lucide="${category.icon}" style="color:${category.color}"></i></div><span>${currency(spent)} of ${currency(limit)}</span><div class="progress-track ${percent > 100 ? "danger" : percent >= 80 ? "warning" : ""}"><span style="width:${Math.min(percent, 100)}%"></span></div></div>`;
  }).join("");
}

function renderInsights() {
  const month = document.getElementById("insightMonth").value || state.activeMonth;
  document.getElementById("insightMonth").value = month;
  const monthlyExpenses = expensesForMonth(month);
  const monthlySpend = totalByType("expense", monthlyExpenses);
  const top = [...CATEGORIES].map(category => ({ ...category, total: monthlyExpenses.filter(transaction => transaction.category === category.name).reduce((sum, transaction) => sum + Number(transaction.amount), 0) })).sort((a, b) => b.total - a.total)[0];
  const year = month.slice(0, 4);
  const yearTransactions = state.transactions.filter(transaction => transaction.type === "expense" && transaction.date.slice(0, 4) === year);
  const yearSpend = totalByType("expense", yearTransactions);
  document.getElementById("insightMonthlySpent").textContent = currency(monthlySpend);
  document.getElementById("insightMonthlyCount").textContent = `${monthlyExpenses.length} expense entr${monthlyExpenses.length === 1 ? "y" : "ies"}`;
  document.getElementById("insightTopCategory").textContent = top?.total ? top.name : "—";
  document.getElementById("insightTopAmount").textContent = top?.total ? `${currency(top.total)} this month` : "No spending yet";
  document.getElementById("insightAverageExpense").textContent = monthlyExpenses.length ? currency(monthlySpend / monthlyExpenses.length) : currency(0);
  document.getElementById("insightYearlySpent").textContent = currency(yearSpend);
  document.getElementById("insightYearlyCount").textContent = `${yearTransactions.length} expense entr${yearTransactions.length === 1 ? "y" : "ies"}`;
  renderCashFlowChart();
  renderTips(monthlySpend, top, getPlan(month));
}

function renderCashFlowChart() {
  const months = getLastMonths(6);
  const incomes = months.map(month => totalByType("income", state.transactions.filter(transaction => inMonth(transaction, month))));
  const expenses = months.map(month => totalByType("expense", state.transactions.filter(transaction => inMonth(transaction, month))));
  buildChart("cashFlow", "cashFlowChart", {
    type: "bar",
    data: { labels: months.map(month => formatMonth(month).slice(0, 3)), datasets: [
      { label: "Income", data: incomes, backgroundColor: "rgba(74, 222, 128, .75)", borderRadius: 5, maxBarThickness: 24 },
      { label: "Expenses", data: expenses, backgroundColor: "rgba(139, 92, 246, .78)", borderRadius: 5, maxBarThickness: 24 }
    ] },
    options: { ...chartOptions({ y: true, tooltip: true }), plugins: { legend: { display: true, labels: { color: getComputedStyle(document.body).getPropertyValue("--muted").trim(), boxWidth: 9, usePointStyle: true, pointStyle: "circle", font: { size: 10 } } }, tooltip: { backgroundColor: "#23263b", padding: 10, callbacks: { label: context => `${context.dataset.label}: ${currency(context.raw)}` } } } }
  });
}

function renderTips(monthlySpend, top, plan) {
  const target = document.getElementById("tipsList");
  const tips = [];
  if (!state.transactions.length) {
    tips.push({ title: "Start your money story", text: "Add an income or expense to receive useful spending insights.", icon: "sparkles" });
  } else {
    if (plan.monthlyAmount && monthlySpend / plan.monthlyAmount >= .8) tips.push({ title: "Watch your monthly budget", text: `You have used ${Math.round((monthlySpend / plan.monthlyAmount) * 100)}% of the plan. Keep the next few purchases intentional.`, icon: "shield-alert" });
    if (top?.total) tips.push({ title: `${top.name} is your biggest spend`, text: `${currency(top.total)} went to ${top.name.toLowerCase()} this month. A small cap here can make a real difference.`, icon: top.icon });
    const income = totalByType("income", state.transactions.filter(transaction => inMonth(transaction, state.activeMonth)));
    if (income > monthlySpend) tips.push({ title: "You are in the green", text: `This month's income is ${currency(income - monthlySpend)} ahead of spending. Consider saving part of the difference.`, icon: "piggy-bank" });
    if (!tips.length) tips.push({ title: "Your spending is on track", text: "Keep recording small purchases too — the complete picture leads to better choices.", icon: "badge-check" });
  }
  target.innerHTML = tips.slice(0, 3).map(tip => `<div class="tip"><span class="tip-icon"><i data-lucide="${tip.icon}"></i></span><div><strong>${escapeHtml(tip.title)}</strong><span>${escapeHtml(tip.text)}</span></div></div>`).join("");
}

function openTransactionModal(id = null) {
  const form = document.getElementById("transactionForm");
  const title = document.getElementById("transactionModalTitle");
  const submitText = document.getElementById("transactionSubmitText");
  state.lastFocusedElement = document.activeElement;
  document.getElementById("transactionFormError").textContent = "";
  document.getElementById("transactionCategory").innerHTML = CATEGORIES.map(category => `<option value="${category.name}">${category.name}</option>`).join("");
  if (id) {
    const transaction = state.transactions.find(item => item.id === id);
    if (!transaction) return;
    document.getElementById("transactionId").value = transaction.id;
    document.querySelector(`input[name="transactionType"][value="${transaction.type}"]`).checked = true;
    document.getElementById("transactionTitle").value = transaction.title;
    document.getElementById("transactionAmount").value = transaction.amount;
    document.getElementById("transactionCategory").value = transaction.category;
    document.getElementById("transactionDate").value = transaction.date;
    document.getElementById("transactionDescription").value = transaction.description || "";
    title.textContent = "Edit transaction";
    submitText.textContent = "Save changes";
  } else {
    form.reset();
    document.getElementById("transactionId").value = "";
    document.querySelector('input[name="transactionType"][value="expense"]').checked = true;
    document.getElementById("transactionDate").value = getToday();
    title.textContent = "Add transaction";
    submitText.textContent = "Save transaction";
  }
  openModal("transactionModal");
  setTimeout(() => document.getElementById("transactionTitle").focus(), 50);
  refreshIcons();
}

function openModal(id) {
  const modal = document.getElementById(id);
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal(id) {
  const modal = document.getElementById(id);
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  if (state.lastFocusedElement && typeof state.lastFocusedElement.focus === "function") state.lastFocusedElement.focus();
}

function handleTransactionSubmit(event) {
  event.preventDefault();
  const error = document.getElementById("transactionFormError");
  const id = document.getElementById("transactionId").value;
  const type = document.querySelector('input[name="transactionType"]:checked')?.value;
  const title = document.getElementById("transactionTitle").value.trim();
  const amount = Number(document.getElementById("transactionAmount").value);
  const category = document.getElementById("transactionCategory").value;
  const date = document.getElementById("transactionDate").value;
  const description = document.getElementById("transactionDescription").value.trim();
  if (!title) { error.textContent = "Please enter a clear transaction title."; return; }
  if (!Number.isFinite(amount) || amount <= 0) { error.textContent = "Enter an amount greater than zero."; return; }
  if (!CATEGORIES.some(item => item.name === category)) { error.textContent = "Choose a valid category."; return; }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(new Date(`${date}T00:00:00`).getTime())) { error.textContent = "Choose a valid transaction date."; return; }
  const transaction = { id: id || `tx-${Date.now()}-${Math.random().toString(16).slice(2)}`, type, title, amount: Math.round(amount * 100) / 100, category, date, description };
  if (id) {
    const index = state.transactions.findIndex(item => item.id === id);
    if (index >= 0) state.transactions[index] = transaction;
  } else state.transactions.push(transaction);
  saveData();
  state.activeMonth = date.slice(0, 7);
  closeModal("transactionModal");
  renderAll();
  showToast(id ? "Transaction updated successfully." : "Transaction added successfully.");
}

function askToDelete(id) {
  const transaction = state.transactions.find(item => item.id === id);
  if (!transaction) return;
  showConfirmation("Delete transaction?", `“${transaction.title}” will be removed permanently. This cannot be undone.`, "Delete", () => {
    state.transactions = state.transactions.filter(item => item.id !== id);
    saveData(); renderAll(); showToast("Transaction deleted.");
  });
}

function showConfirmation(title, message, actionLabel, callback) {
  state.lastFocusedElement = document.activeElement;
  document.getElementById("confirmTitle").textContent = title;
  document.getElementById("confirmMessage").textContent = message;
  document.getElementById("confirmActionButton").textContent = actionLabel;
  state.confirmCallback = callback;
  openModal("confirmModal");
  setTimeout(() => document.getElementById("confirmActionButton").focus(), 30);
}

function closeConfirmation() {
  state.confirmCallback = null;
  closeModal("confirmModal");
}

function handleBudgetSubmit(event) {
  event.preventDefault();
  const month = document.getElementById("budgetMonth").value;
  const amount = Number(document.getElementById("monthlyBudget").value);
  const error = document.getElementById("budgetFormError");
  if (!/^\d{4}-\d{2}$/.test(month)) { error.textContent = "Choose a valid budget month."; return; }
  if (!Number.isFinite(amount) || amount <= 0) { error.textContent = "Enter a budget greater than zero."; return; }
  state.plans[month] = { ...getPlan(month), monthlyAmount: Math.round(amount * 100) / 100 };
  state.activeMonth = month;
  saveData(); renderAll(); showToast(`Budget saved for ${formatMonth(month)}.`);
}

function handleCategoryLimitsSubmit(event) {
  event.preventDefault();
  const limits = {};
  for (const input of document.querySelectorAll("[data-category-limit]")) {
    const raw = input.value.trim();
    if (!raw) continue;
    const value = Number(raw);
    if (!Number.isFinite(value) || value <= 0) { showToast("Category limits must be positive amounts.", "error"); input.focus(); return; }
    limits[input.dataset.categoryLimit] = Math.round(value * 100) / 100;
  }
  state.plans[state.activeMonth] = { ...getPlan(), categoryLimits: limits };
  saveData(); renderAll(); showToast("Category limits saved.");
}

function startNextMonth() {
  const current = new Date(`${state.activeMonth}-01T12:00:00`);
  const next = new Date(current.getFullYear(), current.getMonth() + 1, 1);
  const nextMonth = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`;
  showConfirmation("Start a new monthly plan?", `A blank plan for ${formatMonth(nextMonth)} will be opened. Your transaction history will not be affected.`, "Start plan", () => {
    const currentPlan = getPlan();
    state.plans[nextMonth] = { monthlyAmount: currentPlan.monthlyAmount, categoryLimits: {} };
    state.activeMonth = nextMonth;
    saveData(); renderAll(); showToast(`New plan ready for ${formatMonth(nextMonth)}.`);
  });
}

function exportTransactions() {
  const transactions = getFilteredTransactions();
  if (!transactions.length) { showToast("There are no visible transactions to export.", "error"); return; }
  const headings = ["Title", "Type", "Category", "Amount (INR)", "Date", "Description"];
  const escapeCsv = value => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const rows = transactions.map(transaction => [transaction.title, transaction.type, transaction.category, transaction.amount, transaction.date, transaction.description].map(escapeCsv).join(","));
  const blob = new Blob([[headings.map(escapeCsv).join(","), ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = `smartspend-transactions-${getToday()}.csv`; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
  showToast(`${transactions.length} transaction${transactions.length === 1 ? "" : "s"} exported as CSV.`);
}

function restoreSampleData() {
  showConfirmation("Restore sample data?", "This replaces your current transactions and budgets with the SmartSpend demo data.", "Restore data", () => {
    state.transactions = createSampleTransactions(); state.plans = createDefaultPlans(); state.activeMonth = getCurrentMonth(); saveData(); renderAll(); showToast("Sample data restored.");
  });
}

function clearAllData() {
  showConfirmation("Clear all SmartSpend data?", "All saved transactions and budgets will be deleted from this browser. This cannot be undone.", "Clear data", () => {
    state.transactions = []; state.plans = {}; state.activeMonth = getCurrentMonth(); saveData(); renderAll(); showToast("All SmartSpend data was cleared.");
  });
}

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type === "error" ? "error" : ""}`;
  toast.innerHTML = `<i data-lucide="${type === "error" ? "circle-alert" : "circle-check"}"></i><span>${escapeHtml(message)}</span>`;
  document.getElementById("toastRegion").appendChild(toast);
  refreshIcons();
  setTimeout(() => { toast.style.opacity = "0"; toast.style.transform = "translateX(15px)"; toast.style.transition = ".22s ease"; setTimeout(() => toast.remove(), 230); }, 3500);
}

function changeActiveMonth(month) {
  if (!/^\d{4}-\d{2}$/.test(month)) return;
  state.activeMonth = month;
  document.getElementById("dashboardMonth").value = month;
  document.getElementById("budgetMonth").value = month;
  document.getElementById("insightMonth").value = month;
  renderAll();
}

function switchPage(page) {
  if (!pageInfo[page]) return;
  document.querySelectorAll(".page-view").forEach(view => view.classList.toggle("active", view.dataset.page === page));
  document.querySelectorAll("[data-page-link]").forEach(link => link.classList.toggle("active", link.dataset.pageLink === page));
  document.getElementById("pageTitle").textContent = pageInfo[page].title;
  document.getElementById("pageEyebrow").textContent = pageInfo[page].eyebrow;
  window.location.hash = page;
  closeSidebar();
  if (page === "transactions") renderTransactions();
  if (page === "insights") renderInsights();
}

function openSidebar() { document.getElementById("sidebar").classList.add("open"); document.getElementById("sidebarOverlay").classList.add("open"); }
function closeSidebar() { document.getElementById("sidebar").classList.remove("open"); document.getElementById("sidebarOverlay").classList.remove("open"); }

function toggleTheme() {
  const isLight = document.body.classList.toggle("light-theme");
  localStorage.setItem(STORAGE.theme, isLight ? "light" : "dark");
  document.getElementById("themeToggle").setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");
  document.getElementById("themeToggle").innerHTML = `<i data-lucide="${isLight ? "moon" : "sun"}"></i>`;
  renderAll(); showToast(`${isLight ? "Light" : "Dark"} theme enabled.`);
}

function populateCategoryControls() {
  const filter = document.getElementById("categoryFilter");
  filter.innerHTML = `<option value="all">All categories</option>${CATEGORIES.map(category => `<option value="${category.name}">${category.name}</option>`).join("")}`;
}

function resetFilters() {
  document.getElementById("searchInput").value = "";
  document.getElementById("typeFilter").value = "all";
  document.getElementById("categoryFilter").value = "all";
  document.getElementById("monthFilter").value = "";
  document.getElementById("dateFilter").value = "";
  document.getElementById("sortFilter").value = "newest";
  renderTransactions(); refreshIcons();
}

function bindEvents() {
  document.querySelectorAll("[data-page-link]").forEach(link => link.addEventListener("click", event => { event.preventDefault(); switchPage(link.dataset.pageLink); }));
  document.querySelectorAll("[data-go-page]").forEach(button => button.addEventListener("click", () => switchPage(button.dataset.goPage)));
  document.getElementById("topAddButton").addEventListener("click", () => openTransactionModal());
  document.getElementById("transactionAddButton").addEventListener("click", () => openTransactionModal());
  document.getElementById("floatingAddButton").addEventListener("click", () => openTransactionModal());
  document.getElementById("emptyAddButton").addEventListener("click", () => openTransactionModal());
  document.getElementById("transactionForm").addEventListener("submit", handleTransactionSubmit);
  document.querySelectorAll("[data-close-modal]").forEach(button => button.addEventListener("click", () => closeModal(button.dataset.closeModal)));
  document.getElementById("transactionModal").addEventListener("click", event => { if (event.target.id === "transactionModal") closeModal("transactionModal"); });
  document.getElementById("confirmModal").addEventListener("click", event => { if (event.target.id === "confirmModal") closeConfirmation(); });
  document.getElementById("confirmCancelButton").addEventListener("click", closeConfirmation);
  document.getElementById("confirmActionButton").addEventListener("click", () => { const action = state.confirmCallback; closeConfirmation(); if (action) action(); });
  document.getElementById("transactionTableBody").addEventListener("click", event => { const edit = event.target.closest(".edit-transaction"); const remove = event.target.closest(".delete-transaction"); if (edit) openTransactionModal(edit.dataset.id); if (remove) askToDelete(remove.dataset.id); });
  ["searchInput", "typeFilter", "categoryFilter", "monthFilter", "dateFilter", "sortFilter"].forEach(id => document.getElementById(id).addEventListener(id === "searchInput" ? "input" : "change", () => { renderTransactions(); refreshIcons(); }));
  document.getElementById("resetFiltersButton").addEventListener("click", resetFilters);
  document.getElementById("exportButton").addEventListener("click", exportTransactions);
  document.getElementById("budgetForm").addEventListener("submit", handleBudgetSubmit);
  document.getElementById("categoryLimitsForm").addEventListener("submit", handleCategoryLimitsSubmit);
  document.getElementById("resetMonthButton").addEventListener("click", startNextMonth);
  document.getElementById("dashboardMonth").addEventListener("change", event => changeActiveMonth(event.target.value));
  document.getElementById("budgetMonth").addEventListener("change", event => changeActiveMonth(event.target.value));
  document.getElementById("insightMonth").addEventListener("change", event => { state.activeMonth = event.target.value || state.activeMonth; renderAll(); });
  document.getElementById("sampleDataButton").addEventListener("click", restoreSampleData);
  document.getElementById("clearDataButton").addEventListener("click", clearAllData);
  document.getElementById("themeToggle").addEventListener("click", toggleTheme);
  document.getElementById("menuButton").addEventListener("click", openSidebar);
  document.getElementById("sidebarClose").addEventListener("click", closeSidebar);
  document.getElementById("sidebarOverlay").addEventListener("click", closeSidebar);
  window.addEventListener("keydown", event => { if (event.key === "Escape") { if (document.getElementById("confirmModal").classList.contains("open")) closeConfirmation(); else if (document.getElementById("transactionModal").classList.contains("open")) closeModal("transactionModal"); else closeSidebar(); } });
}

function applySavedTheme() {
  const isLight = localStorage.getItem(STORAGE.theme) === "light";
  document.body.classList.toggle("light-theme", isLight);
  const toggle = document.getElementById("themeToggle");
  toggle.setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");
  toggle.innerHTML = `<i data-lucide="${isLight ? "moon" : "sun"}"></i>`;
}

function initializeApp() {
  initializeData();
  applySavedTheme();
  populateCategoryControls();
  const requestedPage = window.location.hash.replace("#", "");
  if (pageInfo[requestedPage]) switchPage(requestedPage);
  bindEvents();
  renderAll();
}

document.addEventListener("DOMContentLoaded", initializeApp);
