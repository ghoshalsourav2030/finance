# Family finance

Household spending and income tracking across Canadian and Indian accounts.

## Ledger dashboard (`ledger/ghoshal-ledger.html`)

A single-page dashboard published as a private claude.ai artifact. Transactions are not stored in this repo; they live in the artifact's own database and persist between visits.

### Monthly routine

1. Download last month's statements:
   - **CIBC credit card / CIBC chequing**: online banking → account → Download transactions → CSV.
   - **Rogers Bank Mastercard**: the monthly PDF statement, or the CSV download.
   - **Simplii, Wealthsimple, ICICI, IDFC**: any CSV with a header row. Match its columns the first time; the layout is remembered.
2. Open the dashboard → **Upload** → drop the files → **Add**. Rows already in the ledger are skipped.
3. Open **Review** and give the new merchants a category. Ticking "save rule" sorts that merchant automatically next time.

### How amounts are counted

Each category counts as **Spending**, **Income** or **Transfer** (set in Setup). Transfers are left out of both totals.

- Purchases on a card are spending.
- A card bill paid from chequing (category *Credit Cards*) is a transfer **when** an uploaded card statement shows a payment of the same amount within 7 days. Otherwise it is counted as spending, so a card with no uploaded statement still shows up.
- Indian accounts are converted to CAD at upload, using the INR rate in Setup.

### Duplicates and saving

- A transaction is a duplicate when the account, date and amount match one already saved (identical same-day charges are counted, not merged).
- Each save re-reads the month from the database and merges into it, so back-to-back uploads or two open tabs do not overwrite each other.
- The **Saved uploads** list on the Upload tab shows every file that was stored.

### Supported files

| Source | Format | Detected by |
| --- | --- | --- |
| CIBC credit card | CSV, no header: date, description, debit, credit, masked card | masked card number in column 5 |
| CIBC chequing | CSV, no header: date, description, debit, credit | ISO date in column 1, 4 columns |
| Rogers Bank | PDF statement | "Statement Period" line; totals are checked against the statement summary |
| ICICI Bank | Detailed statement (.xls) | `Transaction Remarks` + `Withdrawal Amount(INR)` columns; INR converted at the Setup rate |
| Rogers Bank | CSV with header | `Merchant Name`, or `Posted Date` + `Activity…` columns, or "rogers" in the file name |
| Old Google Sheet | Master Data CSV export | `Debit (CAD)` + `Account` columns |
| Old Google Sheet | Categories CSV export | `Keyword` + `Category` columns (imported as sorting rules) |
| Anything else | CSV or Excel (.xls/.xlsx) with a header row | column mapping, saved per layout |

### Updating the page

Edit `ledger/ghoshal-ledger.html`, then republish it to the same artifact URL from a Claude session. Saved transactions are kept across republishes.

## Legacy: Google Sheets (`apps-script/Dashboard.gs`)

The earlier Apps Script dashboard builder for the "Ghoshal_Ledger_Slim" Google Sheet, kept for reference. It depends on a `getSS()` helper defined in another script file. Its totals count credit card bill payments as expenses, which double-counts card spending; the ledger dashboard above replaces it.
