import type { Transaction } from "@/lib/database.types";

/** Common interface for all sync targets (Google Sheets, Xero, Bexio, etc.) */
export interface SyncTarget {
  name: string;
  /** Push a transaction to the sync target. Returns external row/ID reference. */
  sync(transaction: Transaction): Promise<{ externalId?: string }>;
  /** Test connectivity / credentials */
  testConnection(): Promise<boolean>;
}
