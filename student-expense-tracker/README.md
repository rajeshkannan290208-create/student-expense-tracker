# SmartSpend — Student Expense Tracker

SmartSpend is a complete browser-based expense tracker created for college students. It helps students record pocket money, monitor daily expenses, set monthly budgets, and understand where their money goes — without needing an account, server, or paid API.

## Features

- Premium responsive dashboard with dark and light themes
- Summary cards for balance, income, expenses, and monthly budget remaining
- Six-month spending trend and category doughnut charts powered by Chart.js
- Add, edit, search, filter, sort, and safely delete transactions
- Income and expense support with eight student-focused categories
- Monthly budget plans and optional category spending limits
- Budget warnings at 80% usage and when a limit is exceeded
- Monthly and yearly insights, cash-flow chart, and smart spending tips
- CSV export of the currently filtered transaction list
- Sample-data restore and clear-data actions with confirmations
- Browser LocalStorage persistence — data remains after refresh/reopen
- Keyboard-friendly controls, visible focus states, success/error toasts, and responsive layouts

## Technology

- HTML5
- CSS3
- Vanilla JavaScript
- [Chart.js](https://www.chartjs.org/) for charts
- [Lucide](https://lucide.dev/) for icons
- Browser LocalStorage for persistence

The small Chart.js, Lucide, and Google Fonts CDN links are the only external resources. No backend, database, installation, or API key is needed.

## Project structure

```text
student-expense-tracker/
├── index.html    # Page structure, dashboard, forms, and dialogs
├── style.css     # Theme, responsive layout, components, and animations
├── script.js     # LocalStorage, calculations, charts, filters, and interactions
└── README.md     # Project documentation
```

## Run in VS Code

1. Open the `student-expense-tracker` folder in VS Code.
2. Install the **Live Server** extension if it is not already installed.
3. Right-click `index.html` and choose **Open with Live Server**.
4. The app will open in your default browser. Add or modify transactions; the changes are saved automatically in that browser.

You can also double-click `index.html` to open it directly. Live Server is recommended because it refreshes the page automatically while you edit.

## How the data works

On first launch, SmartSpend loads realistic sample transactions and a sample monthly budget. All subsequent changes are stored under SmartSpend-specific keys in the browser's LocalStorage. Use **Restore sample data** to return to the demo state or **Clear all data** to start from a blank tracker.

The balance is always calculated as:

```text
Total Balance = Total Income − Total Expenses
```

Budget usage is calculated from expense transactions in the selected budget month only. Starting a new month creates a fresh budget plan and never removes historical transactions.

## College demonstration / viva explanation

“SmartSpend is a client-side personal finance application designed for students. It uses HTML for structure, CSS for a modern responsive interface, and vanilla JavaScript for all business logic. Transactions and budget settings are saved in LocalStorage, so the application works without a backend. The dashboard calculates income, expenses, balance, and monthly budget utilization in real time. Chart.js visualizes spending patterns, while transaction filters, CSV export, category limits, and smart warnings make the application practical for daily student use.”

## Quick test checklist

- Add an income and an expense; confirm all dashboard totals update.
- Edit a transaction, then delete it through the confirmation dialog.
- Search and use type/category/month/date/sort filters on Transactions.
- Set a budget and category cap, then add expenses to see progress and warnings.
- Export the visible transaction list as CSV.
- Refresh the browser to confirm LocalStorage persistence.
- Use Restore sample data or Clear all data to verify their confirmation flows.
