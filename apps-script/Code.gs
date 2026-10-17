/**
 * Sahyadri Billing: Google Apps Script backend.
 *
 * Script Properties (Project Settings > Script properties):
 *   SHEET_ID          ID of the Google Sheet (from its URL)
 *   FIREBASE_API_KEY  Firebase web API key (used only to verify ID tokens)
 *   STAFF_EMAILS      Comma-separated allowlist, e.g. "asha@x.com,ravi@x.com"
 *
 * Deploy as Web app: Execute as "Me", Who has access "Anyone".
 * "Anyone" only means the URL is reachable; every request is rejected unless it
 * carries a valid Firebase ID token whose email is in STAFF_EMAILS.
 */

// Trusted catalogue: keep in sync with src/data/products.ts.
var CATALOGUE = {
  'sky-nsv-4-triple-treat': { name: 'Sky Shot NSV-4 inch Triple Treat', packaging: '1 box (3 pieces)', price: 1500, available: true },
  'sky-nsv-3-5-vertex': { name: 'Sky Shot NSV 3.5 inch vertex', packaging: '1 box (3 pieces)', price: 1300, available: true },
  'sky-nsv-3-5-taisho': { name: 'Sky Shot NSV 3.5 inch Taisho', packaging: '1 box (2 pieces)', price: 800, available: true },
  'mukila-1k-mal': { name: 'Mukila 1K mal', packaging: '1 box (1K mal)', price: 200, available: true },
  'mukila-2k-mal': { name: 'Mukila 2K mal', packaging: '1 box (1K mal)', price: 400, available: true },
  'mukila-5k-mal': { name: 'Mukila 5K mal', packaging: '1 box (1K mal)', price: 800, available: true },
  'mukila-10k-mal': { name: 'Mukila 10K mal', packaging: '1 box (1K mal)', price: 1600, available: true },
  'anil-man-pasand-25-shot': { name: 'Anil Man Pasand 25 shot', packaging: '1 box (25 shots)', price: 400, available: true },
  'peacock': { name: 'Peacock', packaging: '1 box', price: 250, available: true },
  'velvallis-2000-mal': { name: "2000 Velvalli's Mal", packaging: '1 box (2K)', price: 380, available: true }
};

var BILLS_HEADERS = ['Bill ID', 'Timestamp', 'Customer name', 'Customer phone', 'Subtotal', 'Discount', 'Final total', 'Staff', 'Save status'];
var ITEMS_HEADERS = ['Bill ID', 'Product ID', 'Product name', 'Packaging', 'Quantity', 'Unit price', 'Line total'];
var BILL_ID_RE = /^SYD-\d{8}-\d{6}-[A-Z0-9]{4,8}$/;
var PHONE_RE = /^91[6-9]\d{9}$/;

function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var staff = verifyStaff_(body.idToken);
    var bill = validateBill_(body);
    return json_(saveBill_(bill, staff));
  } catch (err) {
    if (!err.publicCode) console.error(err && err.stack ? err.stack : err);
    return json_({
      ok: false,
      code: err.publicCode || 'SERVER_ERROR',
      message: err.publicCode ? err.message : 'The server could not save the bill. Try again.'
    });
  }
}

function doGet() {
  return json_({ ok: true, service: 'sahyadri-billing' }); // health check only; no data
}

function fail_(code, message) {
  var err = new Error(message);
  err.publicCode = code;
  throw err;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function prop_(name) {
  var v = PropertiesService.getScriptProperties().getProperty(name);
  if (!v) fail_('SERVER_MISCONFIGURED', 'Server setting "' + name + '" is missing.');
  return v;
}

/** Verifies the Firebase ID token with Google and checks the staff allowlist. */
function verifyStaff_(idToken) {
  if (!idToken || typeof idToken !== 'string') fail_('UNAUTHENTICATED', 'Sign in again.');
  var res = UrlFetchApp.fetch(
    'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + encodeURIComponent(prop_('FIREBASE_API_KEY')),
    { method: 'post', contentType: 'application/json', payload: JSON.stringify({ idToken: idToken }), muteHttpExceptions: true }
  );
  if (res.getResponseCode() !== 200) fail_('UNAUTHENTICATED', 'Your session is invalid or expired. Sign in again.');
  var users = JSON.parse(res.getContentText()).users;
  var email = users && users[0] && users[0].email ? String(users[0].email).toLowerCase() : '';
  if (users && users[0] && users[0].disabled) fail_('FORBIDDEN', 'This account is disabled.');
  var allowed = prop_('STAFF_EMAILS').toLowerCase().split(',').map(function (s) { return s.trim(); });
  if (!email || allowed.indexOf(email) === -1) fail_('FORBIDDEN', 'This account is not authorised to create bills.');
  return email;
}

function validateBill_(body) {
  if (!BILL_ID_RE.test(String(body.billId || ''))) fail_('INVALID_INPUT', 'Invalid bill ID.');
  var customer = body.customer || {};
  var name = String(customer.name || '').trim();
  var phone = String(customer.phone || '');
  if (name.length < 2 || name.length > 80) fail_('INVALID_INPUT', 'Customer name must be 2-80 characters.');
  if (!PHONE_RE.test(phone)) fail_('INVALID_INPUT', 'Invalid customer phone number.');
  if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 50) {
    fail_('INVALID_INPUT', 'A bill needs between 1 and 50 items.');
  }
  var seen = {};
  var lines = body.items.map(function (raw) {
    var id = String(raw.productId || '');
    var product = CATALOGUE[id];
    if (!product) fail_('INVALID_PRODUCT', 'Unknown product: ' + id.slice(0, 40));
    if (!product.available) fail_('PRODUCT_UNAVAILABLE', product.name + ' is unavailable.');
    if (seen[id]) fail_('INVALID_INPUT', 'Duplicate product line: ' + product.name);
    seen[id] = true;
    var qty = raw.quantity;
    if (typeof qty !== 'number' || qty % 1 !== 0 || qty < 1 || qty > 999) fail_('INVALID_INPUT', 'Invalid quantity for ' + product.name + '.');
    return { productId: id, name: product.name, packaging: product.packaging, quantity: qty, unitPrice: product.price, lineTotal: product.price * qty };
  });
  var subtotal = lines.reduce(function (s, l) { return s + l.lineTotal; }, 0);
  // Totals come only from the trusted catalogue; any client total is ignored.
  return { billId: body.billId, name: name, phone: phone, lines: lines, subtotal: subtotal, discount: 0, total: subtotal };
}

/** Guards against spreadsheet formula injection. */
function safeText_(s) {
  return /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
}

function getSheet_(ss, title, headers) {
  var sheet = ss.getSheetByName(title) || ss.insertSheet(title);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
  return sheet;
}

function saveBill_(bill, staff) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) fail_('BUSY', 'Server is busy. Retry in a moment.');
  try {
    var ss = SpreadsheetApp.openById(prop_('SHEET_ID'));
    var billsSheet = getSheet_(ss, 'Bills', BILLS_HEADERS);
    var itemsSheet = getSheet_(ss, 'Bill Items', ITEMS_HEADERS);

    // Idempotency: a retry with the same bill ID returns the stored result.
    var lastRow = billsSheet.getLastRow();
    if (lastRow > 1) {
      var rows = billsSheet.getRange(2, 1, lastRow - 1, BILLS_HEADERS.length).getValues();
      for (var i = 0; i < rows.length; i++) {
        if (rows[i][0] === bill.billId) {
          return { ok: true, billId: bill.billId, subtotal: Number(rows[i][4]), total: Number(rows[i][6]), duplicate: true };
        }
      }
    }

    // Items first, then the Bills row, which acts as the commit marker.
    var itemRows = bill.lines.map(function (l) {
      return [bill.billId, l.productId, l.name, l.packaging, l.quantity, l.unitPrice, l.lineTotal];
    });
    itemsSheet.getRange(itemsSheet.getLastRow() + 1, 1, itemRows.length, ITEMS_HEADERS.length).setValues(itemRows);
    billsSheet.appendRow([bill.billId, new Date(), safeText_(bill.name), "'" + bill.phone, bill.subtotal, bill.discount, bill.total, staff, 'SAVED']);
    SpreadsheetApp.flush();
    return { ok: true, billId: bill.billId, subtotal: bill.subtotal, total: bill.total, duplicate: false };
  } finally {
    lock.releaseLock();
  }
}
