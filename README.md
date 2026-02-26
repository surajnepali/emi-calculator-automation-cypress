# 🏠 Cypress EMI Calculator Automation Framework

> A production-ready, Page Object Model–based Cypress test automation framework for the EMI Calculator web application with multi-environment support, CI/CD integration via GitHub Actions, and custom EMI formula commands.

---

## 📁 Project Structure

```
cypress-emi-framework/
│
├── .github/
│   └── workflows/
│       └── cypress-emi-tests.yml       # GitHub Actions CI/CD pipeline
│
├── cypress/
│   ├── e2e/
│   │   └── homeLoan.cy.js              # Home Loan test suite (21 test cases)
│   │
│   ├── fixtures/
│   │   └── emiTestData.json            # Test data — valid & boundary scenarios
│   │
│   ├── support/
│   │   ├── pages/
│   │   │   └── EmiCalculatorPage.js    # Page Object Model
│   │   ├── commands.js                 # Custom Cypress commands
│   │   └── e2e.js                      # Global hooks & config
│   │
│   ├── reports/                        # Mochawesome reports (auto-generated)
│   ├── screenshots/                    # Test failure screenshots
│   ├── downloads/                      # Downloaded files during tests
│   └── videos/                         # Test run videos
│
├── .env.test                            # Test environment variables
├── .gitignore
├── cypress.config.js                    # Cypress configuration
├── package.json
└── README.md
```

---

## 🧮 EMI Formula

```
        P × r × (1 + r)^n
EMI = ─────────────────────
          (1 + r)^n − 1

Where:
  P = Principal (loan amount in INR)
  r = Monthly interest rate = Annual Rate / 12 / 100
  n = Total months = Tenure in years × 12
```

Edge case: If interest rate is 0%, EMI = P / n (simple division).

---

## ⚙️ Setup & Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/cypress-emi-framework.git
cd cypress-emi-framework

# 2. Install dependencies
npm install

# 3. Create environment file (copy from example)
cp .env.test
# Edit .env.staging with your values

# 4. Open Cypress Test Runner
npm run cy:open

# 5. Run tests headlessly
npm run cy:run:test
```

---

## 🌍 Environment Management

The framework uses `dotenv` with dynamic `.env.*` file loading.

| Environment | Command | Env File |
|-------------|---------|----------|
| Test | `CYPRESS_ENV=test npm run cy:run` | `.env.test` |

### Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `BASE_URL` | EMI Calculator site URL | `https://emicalculator.net` |

---

## 🛠️ Custom Commands

| Command | Description |
|---------|-------------|
| `cy.calculateEmi(principal, rate, years)` | Computes EMI using the amortisation formula |
| `cy.calculateTotalPayment(emi, years)` | Computes total amount paid |
| `cy.calculateTotalInterest(total, principal)` | Computes total interest paid |

---

## 📋 Test Cases

| TC ID | Description | Block |
|-------|-------------|-------|
| TC-001 | Page loads successfully | Page Load |
| TC-002 | Home Loan tab is active | Page Load |
| TC-003 | All three loan tabs visible | Page Load |
| TC-004 | All input fields present | Page Load |
| TC-005 | EMI calc using env variables | Env Driven |
| TC-006 | Total Interest & Payment display | Env Driven |
| TC-007 | ₹50L @ 8.5% for 20Y | Valid Scenarios |
| TC-008 | ₹10L @ 7% for 10Y | Valid Scenarios |
| TC-009 | ₹1Cr @ 9% for 30Y | Valid Scenarios |
| TC-010 | ₹20L @ 8% for 5Y | Valid Scenarios |
| TC-011 | ₹30L @ 6.5% for 15Y | Valid Scenarios |
| TC-012 | Min amount ₹1L | Boundary |
| TC-013 | Max tenure 30Y | Boundary |
| TC-014 | High interest 15% | Boundary |
| TC-015 | Amortisation table renders | Table & Chart |
| TC-016 | Pie chart renders | Table & Chart |
| TC-017 | All result sections visible | Table & Chart |
| TC-018 | cy.calculateEmi() accuracy | Custom Commands |
| TC-019 | 0% interest edge case | Custom Commands |
| TC-020 | cy.getEmiFromUI() returns positive | Custom Commands |
| TC-021 | UI EMI matches formula EMI | Custom Commands |

---

# Regression Strategy

## Objective

Ensure that:
- EMI calculation logic remains correct after changes
- UI interaction continues to work
- Table & download functionality remain intact

---

## Regression Suite Design

The regression suite is divided into 3 layers:

### 1. Smoke Regression (Critical Path)

Runs on every CI push.

Includes:
- EMI formula validation
- Basic slider interaction
- Table presence validation
- Download file existence check

Purpose:
Detect critical failures early.

---

### 2. Core Business Regression

Runs before release.

Includes:
- Multiple EMI scenarios
- Boundary values (min/max loan, rate, tenure)
- Total interest validation
- Table year-wise consistency

Purpose:
Ensure financial accuracy remains intact.

---

### 3. Full Regression Suite

Runs before production deployment.

Includes:
- Negative scenarios
- Large value scenarios
- UI responsiveness checks
- Full table data verification
- Excel content comparison

Purpose:
Ensure overall application stability.

---

## 🚀 GitHub Actions CI/CD

### Pipeline Triggers
- **Push** to `main`, `develop`
- **Pull Requests** targeting `main` or `develop`
- **Manual dispatch** with environment & browser selection
- **Scheduled** — nightly Mon–Fri at 00:00 UTC

### 🔑 Required GitHub Secrets

Navigate to: `GitHub Repo → Settings → Secrets and variables → Actions → New repository secret`

| Secret Key | Description | Example Value |
|------------|-------------|---------------|
| `BASE_URL` | Application base URL | `https://emicalculator.net` |

---

## 📊 Reports

Reports are generated using Mochawesome and saved to `cypress/reports/`.

```bash
# Generate report after test run
npm run cy:report:full
```

Reports include: embedded screenshots, pass/fail charts, test durations.

---

## 📦 NPM Scripts Reference

```bash
npm run cy:open                  # Open Cypress GUI
npm run cy:run:staging           # Run all tests (staging)
npm run cy:run:qa                # Run all tests (QA)
npm run cy:run:emi:homeloan      # Run Home Loan spec only
npm run cy:run:chrome            # Run on Chrome
npm run cy:run:firefox           # Run on Firefox
npm run cy:clean:all             # Clean all artifacts
npm run cy:report:full           # Merge & generate HTML report
npm run test:ci                  # CI pipeline command
```

# Author

Suraj Nepali  
QA Engineer 