import type { Transaction } from "@/lib/database.types";
import type { SyncTarget } from "./types";

/**
 * Google Sheets sync target.
 * Appends rows to a configured spreadsheet via the Sheets API.
 *
 * Config stored in integrations.config:
 * { spreadsheet_id: string, sheet_name?: string, api_key_or_token: string }
 *
 * TODO: Implement OAuth flow for Google Sheets API access.
 * For now this is a placeholder structure.
 */
export class GoogleSheetsTarget implements SyncTarget {
  name = "google_sheets";
  private spreadsheetId: string;
  private sheetName: string;
  private accessToken: string;

  constructor(config: {
    spreadsheet_id: string;
    sheet_name?: string;
    access_token: string;
  }) {
    this.spreadsheetId = config.spreadsheet_id;
    this.sheetName = config.sheet_name ?? "Transactions";
    this.accessToken = config.access_token;
  }

  async sync(transaction: Transaction): Promise<{ externalId?: string }> {
    const row = [
      transaction.document_date,
      transaction.type,
      transaction.document_type,
      transaction.counterparty,
      transaction.description,
      transaction.amount,
      transaction.currency,
      transaction.status,
      transaction.payment_method,
      transaction.document_ref,
      // TODO: MWST — transaction.vat_amount, transaction.vat_rate
    ];

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${this.sheetName}!A:J:append?valueInputOption=USER_ENTERED`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values: [row] }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Google Sheets API error (${res.status}): ${err}`);
    }

    const json = await res.json();
    return { externalId: json.updates?.updatedRange };
  }

  async testConnection(): Promise<boolean> {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}?fields=spreadsheetId`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    return res.ok;
  }
}
