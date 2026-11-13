/**
 * DASHBOARD BUILDER v2 — fixes the #REF! collision bug.
 *
 * ROOT CAUSE (for reference): the old version hardcoded row offsets
 * (H20, A40) assuming QUERY() array formulas above them would never
 * spill past a fixed number of rows. As Categories and Months grew,
 * the spill range grew too and collided with the next section's
 * header, which Sheets kills with #REF! instead of overwriting.
 *
 * FIX: each section now lives on its own sheet. QUERY() can spill as
 * far down as it needs, forever, with nothing below it to collide
 * with. No more hardcoded row math, no more manual row-inserting.
 *
 * Run buildDashboard() to (re)create all dashboard sheets. Safe to
 * re-run any time — it clears and rewrites each dashboard sheet only,
 * never touches Master Data, Categories, or Raw Data.
 */
function buildDashboard() {
  const ss = getSS();

  buildSection_(ss, 'Dashboard - Overview', sheet => {
    sheet.getRange('A1').setValue('GHOSHAL LEDGER — OVERVIEW').setFontSize(16).setFontWeight('bold');
    sheet.getRange('A2').setValue('Updates automatically as Master Data changes').setFontColor('#888888');

    sheet.getRange('A4').setValue('TOTAL INCOME (CAD)').setFontWeight('bold');
    sheet.getRange('B4').setFormula("=SUM('Master Data'!L2:L)");
    sheet.getRange('A5').setValue('TOTAL EXPENSE (CAD)').setFontWeight('bold');
    sheet.getRange('B5').setFormula("=SUM('Master Data'!K2:K)");
    sheet.getRange('A6').setValue('NET SAVINGS (CAD)').setFontWeight('bold');
    sheet.getRange('B6').setFormula('=B4-B5');
    sheet.getRange('A7').setValue('SAVINGS RATE').setFontWeight('bold');
    sheet.getRange('B7').setFormula('=IFERROR(B6/B4, 0)').setNumberFormat('0.0%');
    sheet.getRange('A8').setValue('TOTAL TRANSACTIONS').setFontWeight('bold');
    sheet.getRange('B8').setFormula("=COUNTA('Master Data'!A2:A)");
  });

  buildSection_(ss, 'Dashboard - By Account', sheet => {
    sheet.getRange('A1').setValue('BY ACCOUNT (CAD equivalent)').setFontWeight('bold').setFontSize(14);
    sheet.getRange('A3').setFormula(
      "=QUERY('Master Data'!A2:N, " +
      "\"select B, sum(K), sum(L) where B is not null group by B label sum(K) 'Total Debit (CAD)', sum(L) 'Total Credit (CAD)'\", 0)"
    );
  });

  buildSection_(ss, 'Dashboard - By Category', sheet => {
    sheet.getRange('A1').setValue('BY CATEGORY (CAD equivalent)').setFontWeight('bold').setFontSize(14);
    sheet.getRange('A3').setFormula(
      "=QUERY('Master Data'!A2:N, " +
      "\"select E, sum(K), sum(L) where E is not null group by E order by sum(K) desc label sum(K) 'Total Debit (CAD)', sum(L) 'Total Credit (CAD)'\", 0)"
    );
  });

  buildSection_(ss, 'Dashboard - Monthly Cash Flow', sheet => {
    sheet.getRange('A1').setValue('MONTHLY CASH FLOW (CAD equivalent)').setFontWeight('bold').setFontSize(14);
    sheet.getRange('A3').setFormula(
      "=QUERY('Master Data'!A2:N, " +
      "\"select M, sum(K), sum(L) where M is not null group by M order by M label sum(K) 'Total Debit (CAD)', sum(L) 'Total Credit (CAD)'\", 0)"
    );
  });

  buildSection_(ss, 'Dashboard - By Family Member', sheet => {
    sheet.getRange('A1').setValue('BY FAMILY MEMBER (CAD equivalent)').setFontWeight('bold').setFontSize(14);
    sheet.getRange('A3').setFormula(
      "=QUERY('Master Data'!A2:N, " +
      "\"select C, sum(K), sum(L) where C is not null group by C label sum(K) 'Total Debit (CAD)', sum(L) 'Total Credit (CAD)'\", 0)"
    );
  });

  // Remove the old single-sheet Dashboard if it still exists, now that
  // everything lives on dedicated sheets
  const oldSheet = ss.getSheetByName('Dashboard');
  if (oldSheet) ss.deleteSheet(oldSheet);

  SpreadsheetApp.getUi().alert(
    'Dashboard rebuilt across 5 sheets (Overview, By Account, By Category, ' +
    'Monthly Cash Flow, By Family Member). Each section now has unlimited ' +
    'room to grow — no more #REF! collisions as your data grows.'
  );
}

/** Helper: clears/creates a sheet and runs the given builder function on it */
function buildSection_(ss, name, builderFn) {
  let sheet = ss.getSheetByName(name);
  if (sheet) {
    sheet.clear();
  } else {
    sheet = ss.insertSheet(name);
  }
  builderFn(sheet);
  sheet.autoResizeColumns(1, 6);
}
