# Receipt Scanner

Scan a Restaurant Depot receipt photo, review the extracted line items, and export them as an itemized Google Sheet in your own Google Drive.

**How it works:** upload a receipt photo → Claude (Anthropic) extracts the vendor, date, and line items → you review/edit the items → export appends the rows to one shared Google Sheet via the Sheets API.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Get an Anthropic API key

1. Go to [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
2. Create an API key
3. You'll paste it into `.env.local` below

### 3. Set up a Google service account (for Sheets access)

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Go to **APIs & Services → Library** and enable the **Google Sheets API**
4. Go to **APIs & Services → Credentials → Create Credentials → Service account**
   - Give it any name (e.g. `receipt-scanner`)
   - No roles/access needed at the project level — skip those steps
5. Open the new service account → **Keys** tab → **Add Key → Create new key → JSON**, and download it
6. From that JSON file, note the `client_email` and `private_key` values

### 4. Create (or pick) the shared spreadsheet

1. Create a new Google Sheet (or use an existing one) — this is the single sheet every receipt gets appended to
2. Share it with the service account's `client_email` (from step 3) as an **Editor**
3. Copy the spreadsheet ID from its URL: `https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit`

### 5. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.local.example .env.local
```

```
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_SERVICE_ACCOUNT_EMAIL=receipt-scanner@your-project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your-spreadsheet-id
GOOGLE_SHEET_TAB=Sheet1
```

Keep the private key's `\n` escape sequences literal (don't turn them into real newlines) — the app unescapes them at runtime.

### 6. Run it

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), upload a receipt photo, review the extracted items, and export. There's no sign-in — every export appends rows to the one shared spreadsheet configured above.

## Notes

- Receipt images are sent to Claude for extraction and are not stored anywhere — the app has no database.
- Every export appends its line items as new rows to the single spreadsheet in `GOOGLE_SHEET_ID` (a header row is added automatically the first time).
- Anyone who can run this app can write to that spreadsheet — there's no per-user authentication, so only point it at a sheet you're fine having shared write access to.
