import { google } from "googleapis";
import type { ExtractedReceipt } from "./types";
import { getConfigValue } from "./ssmConfig";

const SHEET_TAB = process.env.GOOGLE_SHEET_TAB || "Sheet1";
const HEADER = ["Date", "Vendor", "Item", "Quantity", "Unit Price", "Total Price"];

async function getAuth() {
  const email = await getConfigValue("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const rawPrivateKey = await getConfigValue("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY");
  const privateKey = rawPrivateKey?.replace(/\\n/g, "\n");
  if (!email || !privateKey) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY is not available from process.env or SSM"
    );
  }
  return new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

export async function exportReceiptToSheet(receipt: ExtractedReceipt): Promise<string> {
  const spreadsheetId = await getConfigValue("GOOGLE_SHEET_ID");
  if (!spreadsheetId) {
    throw new Error("GOOGLE_SHEET_ID is not available from process.env or SSM");
  }

  const sheets = google.sheets({ version: "v4", auth: await getAuth() });

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
