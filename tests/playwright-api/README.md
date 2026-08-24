# Krayin REST API — Playwright Automation Test Suite

API automation test suite for the **Krayin CRM REST API**, built with [Playwright](https://playwright.dev/docs/api-testing) (TypeScript). It covers authentication, leads, contacts, products, quotes, activities, mails, dashboard and all major settings endpoints.

## 1. Test Coverage

| Suite | File | Description |
|---|---|---|
| Authentication | `tests/api/auth.spec.ts` | Login, logout, invalid credentials |
| Leads | `tests/api/leads.spec.ts` | CRUD, stages, tags, products, quotes, kanban lookups |
| Contacts (Persons) | `tests/api/contacts-persons.spec.ts` | Person CRUD, tags, activities |
| Contacts (Organizations) | `tests/api/contacts-organizations.spec.ts` | Organization CRUD |
| Products | `tests/api/products.spec.ts` | Product CRUD, inventories, warehouses, tags |
| Quotes | `tests/api/quotes.spec.ts` | Quote CRUD, items, lead products, quote mail |
| Activities | `tests/api/activities.spec.ts` | Activity CRUD, file download |
| Mails | `tests/api/mails.spec.ts` | Mail CRUD, mass update, attachments, tags |
| Dashboard | `tests/api/dashboard.spec.ts` | Dashboard data endpoint |
| Settings | `tests/api/settings-*.spec.ts` | Attributes, groups, pipelines, sources, types, roles, users, tags, warehouses, email templates, web forms, webhooks, workflows, marketing events & campaigns |

**Total: 466 tests in 24 spec files.**

## 2. Project Structure

```text
tests/playwright-api/
├── api/
│   └── ApiClient.ts          # Generic HTTP client wrapper (GET/POST/PUT/PATCH/DELETE + auth)
├── fixtures/
│   └── api.fixture.ts        # Custom Playwright fixtures: authed API client + service factories
├── services/                 # Endpoint-specific service classes (LeadService, AuthService, ...)
├── utils/
│   └── config.ts             # Central config (base URL + credentials from environment)
├── tests/
│   └── api/                  # Spec files (24 files)
├── playwright.config.ts      # Playwright configuration
├── .env.example              # Environment variable template
└── package.json              # Scripts and dependencies
```

## 3. Prerequisites

- **Node.js** >= 18
- A running **Krayin CRM** (v2.x) instance with the **Krayin REST API** module installed
- An **admin user** whose credentials will be used by the tests

## 4. Environment Variables

| Variable | Default | Description |
|---|---|---|
| `APP_URL` | `http://127.0.0.1:8000` | Base URL of the Krayin CRM application |
| `TEST_USER_EMAIL` | `admin@example.com` | Admin email used for API login |
| `TEST_USER_PASSWORD` | `admin123` | Admin password used for API login |

Copy `.env.example` to `.env` or export the variables in your shell.

> The suite authenticates via `POST /api/v1/login` and sends a Bearer token on every subsequent request.

## 5. Local Setup

### 5.1 Install Krayin CRM with the REST API module

```shell
# Create the Krayin CRM project
# (pinned to 2.1.* — the REST API module currently targets Krayin v2.1 / Laravel 10)
composer create-project krayin/laravel-crm "2.1.*"

cd krayin-app   # or your project folder name

# Configure your database in .env (DB_DATABASE, DB_USERNAME, DB_PASSWORD), then:
php artisan krayin-crm:install

# Install the REST API module
composer require krayin/rest-api
php artisan krayin-rest-api:install
```

Add the following to the Krayin `.env` file:

```env
SANCTUM_STATEFUL_DOMAINS="${APP_URL}"
L5_SWAGGER_UI_PERSIST_AUTHORIZATION=true
```

### 5.2 Run the test suite

```shell
cd tests/playwright-api

npm install
npx playwright install chromium

cp .env.example .env    # adjust APP_URL / credentials if needed

npx playwright test
```

The application must be reachable at `APP_URL`. If you serve Krayin locally:

```shell
php artisan serve --host=127.0.0.1 --port=8000
```

## 6. Running Tests

```shell
# All tests
npx playwright test

# By area (npm scripts)
npm run test:auth         # Authentication
npm run test:leads        # Leads
npm run test:contacts     # Persons + Organizations
npm run test:products     # Products
npm run test:quotes       # Quotes
npm run test:activities   # Activities
npm run test:mails        # Mails
npm run test:dashboard    # Dashboard
npm run test:settings     # All settings suites

# Single file / single test by title
npx playwright test tests/api/auth.spec.ts
npx playwright test -g "login with valid credentials"

# Debug helpers
npx playwright test --headed      # not useful for pure API tests, kept for convenience
npx playwright test --ui          # interactive UI mode
npx playwright show-report        # open latest HTML report
```

Reports are written per run to `reports/<timestamp>/` (`html/index.html` and `results.json`). On failure, failed requests (URL, status, response body) are logged to the console for quick triage.

CI retries failing tests twice (`retries: 2`) while local runs do not retry.

## 7. Continuous Integration

The GitHub Actions workflow [`.github/workflows/playwright-api-tests.yml`](../../.github/workflows/playwright-api-tests.yml) runs the full suite automatically:

1. Starts a MySQL 8 service container.
2. Installs **Krayin CRM 2.1.\*** via `composer create-project krayin/laravel-crm` (the REST API module targets Krayin v2.1 / Laravel 10).
3. Registers **this repository** as a composer path repository and installs it as the REST API module (`krayin/rest-api:@dev`), so every PR is tested against its own code.
4. Runs `krayin-crm:install`, creates the admin user non-interactively and runs `krayin-rest-api:install`.
5. Serves the app (`php artisan serve`) and smoke-checks the login endpoint.
6. Runs all Playwright tests against `http://127.0.0.1:8000`.
7. Uploads the HTML report as a workflow artifact (`playwright-api-report`) on every run — including failures.

To trigger manually, use the **Run workflow** button under *Actions → Playwright API Tests*.

## 8. Writing New Tests

Follow the existing pattern — use fixtures instead of calling raw fetch:

```typescript
import { test, expect } from '../../fixtures/api.fixture';

test.describe('My Feature API', () => {
  test('creates a resource', async ({ authedApi }) => {
    const response = await authedApi.post('api/v1/my-feature', {
      data: { name: 'test' },
    });

    expect(response.status()).toBe(200);
  });
});
```

- Add reusable endpoint calls to a service class under `services/` and expose it through `fixtures/api.fixture.ts`.
- Always clean up created resources (`DELETE`) so runs stay idempotent.
- Use the `unique()` helper from `api/ApiClient.ts` for unique names/values.
