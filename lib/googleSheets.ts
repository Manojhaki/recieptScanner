import { google } from "googleapis";
import type { ExtractedReceipt } from "./types";

const SHEET_TAB = process.env.GOOGLE_SHEET_TAB || "Sheet1";
const HEADER = ["Date", "Vendor", "Item", "Quantity", "Unit Price", "Total Price"];

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!email || !privateKey) {
    throw new Error(
      "Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY"
    );
  }
  return new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

export async function exportReceiptToSheet(receipt: ExtractedReceipt): Promise<string> {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!spreadsheetId) {
    throw new Error("Missing GOOGLE_SHEET_ID");
  }

  const sheets = google.sheets({ version: "v4", auth: getAuth() });

  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${SHEET_TAB}!A1:A1`,
  });
  const needsHeader = !existing.data.values?.length;

  const rows: (string | number)[][] = receipt.items.map((item) => [
    receipt.date,
    receipt.vendor,
    item.name,
    item.quantity,
    item.unitPrice,
    item.totalPrice,
  ]);

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${SHEET_TAB}!A1`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: needsHeader ? [HEADER, ...rows] : rows },
  });

  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
}
