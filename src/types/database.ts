export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          company_name: string | null;
          created_at: string | null;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          company_name?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          email?: string | null;
          company_name?: string | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "products_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          transaction_number: string;
          recipient_name: string;
          phone: string | null;
          notes: string | null;
          subtotal: number;
          debt: number;
          grand_total: number;
          payment_status: string;
          transaction_date: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          transaction_number: string;
          recipient_name: string;
          phone?: string | null;
          notes?: string | null;
          subtotal?: number;
          debt?: number;
          grand_total?: number;
          payment_status?: string;
          transaction_date?: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          transaction_number?: string;
          recipient_name?: string;
          phone?: string | null;
          notes?: string | null;
          subtotal?: number;
          debt?: number;
          grand_total?: number;
          payment_status?: string;
          transaction_date?: string;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      transaction_items: {
        Row: {
          id: string;
          transaction_id: string;
          user_id: string;
          product_name: string;
          price: number;
          weight_kg: number;
          total: number;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          transaction_id: string;
          user_id: string;
          product_name: string;
          price?: number;
          weight_kg?: number;
          total?: number;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          transaction_id?: string;
          user_id?: string;
          product_name?: string;
          price?: number;
          weight_kg?: number;
          total?: number;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "transaction_items_transaction_id_fkey";
            columns: ["transaction_id"];
            isOneToOne: false;
            referencedRelation: "transactions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transaction_items_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      handle_new_user: {
        Args: Record<string, never>;
        Returns: unknown;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

// -----------------------------------------------------------------------------
// Helper types (konvensi Supabase generated types).
// -----------------------------------------------------------------------------
type PublicSchema = Database["public"];

export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"];

export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"];

// Alias praktis per-tabel.
export type Profile = Tables<"profiles">;
export type ProfileInsert = TablesInsert<"profiles">;
export type ProfileUpdate = TablesUpdate<"profiles">;

export type Product = Tables<"products">;
export type ProductInsert = TablesInsert<"products">;
export type ProductUpdate = TablesUpdate<"products">;

export type Transaction = Tables<"transactions">;
export type TransactionInsert = TablesInsert<"transactions">;
export type TransactionUpdate = TablesUpdate<"transactions">;

export type TransactionItem = Tables<"transaction_items">;
export type TransactionItemInsert = TablesInsert<"transaction_items">;
export type TransactionItemUpdate = TablesUpdate<"transaction_items">;
