export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          created_at?: string;
        };
      };
      businesses: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          currency: string;
          vat_number: string | null;
          vat_liable: boolean;
          archived: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          currency?: string;
          vat_number?: string | null;
          vat_liable?: boolean;
          archived?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          currency?: string;
          vat_number?: string | null;
          vat_liable?: boolean;
          archived?: boolean;
          created_at?: string;
        };
      };
      integrations: {
        Row: {
          id: string;
          business_id: string | null;
          type: string;
          config: Record<string, unknown> | null;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id?: string | null;
          type: string;
          config?: Record<string, unknown> | null;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string | null;
          type?: string;
          config?: Record<string, unknown> | null;
          active?: boolean;
          created_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          business_id: string | null;
          type: "income" | "expense";
          document_type: "invoice" | "bill";
          status: "pending" | "paid" | "unpaid";
          counterparty: string | null;
          description: string | null;
          amount: number;
          currency: string;
          vat_amount: number | null; // TODO: MWST — nullable, hidden in UI for now
          vat_rate: number | null; // TODO: MWST — nullable, hidden in UI for now
          payment_method: "cash" | "bank" | "twint" | "card" | "other" | null;
          document_ref: string | null;
          document_date: string | null;
          due_date: string | null;
          duplicate_hash: string | null;
          verified: boolean;
          raw_extraction: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id?: string | null;
          type: "income" | "expense";
          document_type: "invoice" | "bill";
          status?: "pending" | "paid" | "unpaid";
          counterparty?: string | null;
          description?: string | null;
          amount: number;
          currency?: string;
          vat_amount?: number | null;
          vat_rate?: number | null;
          payment_method?: "cash" | "bank" | "twint" | "card" | "other" | null;
          document_ref?: string | null;
          document_date?: string | null;
          due_date?: string | null;
          duplicate_hash?: string | null;
          verified?: boolean;
          raw_extraction?: Record<string, unknown> | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string | null;
          type?: "income" | "expense";
          document_type?: "invoice" | "bill";
          status?: "pending" | "paid" | "unpaid";
          counterparty?: string | null;
          description?: string | null;
          amount?: number;
          currency?: string;
          vat_amount?: number | null;
          vat_rate?: number | null;
          payment_method?: "cash" | "bank" | "twint" | "card" | "other" | null;
          document_ref?: string | null;
          document_date?: string | null;
          due_date?: string | null;
          duplicate_hash?: string | null;
          verified?: boolean;
          raw_extraction?: Record<string, unknown> | null;
          created_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          transaction_id: string | null;
          storage_path: string | null;
          file_type: "image" | "pdf" | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          transaction_id?: string | null;
          storage_path?: string | null;
          file_type?: "image" | "pdf" | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          transaction_id?: string | null;
          storage_path?: string | null;
          file_type?: "image" | "pdf" | null;
          created_at?: string;
        };
      };
      sync_log: {
        Row: {
          id: string;
          transaction_id: string | null;
          integration_id: string | null;
          synced_at: string;
          status: "success" | "failed" | null;
          error: string | null;
        };
        Insert: {
          id?: string;
          transaction_id?: string | null;
          integration_id?: string | null;
          synced_at?: string;
          status?: "success" | "failed" | null;
          error?: string | null;
        };
        Update: {
          id?: string;
          transaction_id?: string | null;
          integration_id?: string | null;
          synced_at?: string;
          status?: "success" | "failed" | null;
          error?: string | null;
        };
      };
    };
  };
};

// Convenience aliases
export type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
export type TransactionInsert = Database["public"]["Tables"]["transactions"]["Insert"];
export type Business = Database["public"]["Tables"]["businesses"]["Row"];
export type Integration = Database["public"]["Tables"]["integrations"]["Row"];
export type Document = Database["public"]["Tables"]["documents"]["Row"];
export type SyncLog = Database["public"]["Tables"]["sync_log"]["Row"];
