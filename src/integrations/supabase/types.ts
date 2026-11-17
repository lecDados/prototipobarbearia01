export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      barbearias: {
        Row: {
          criado_em: string
          fila_aberta: boolean
          id: string
          minutos_por_cliente: number
          nome: string
          owner_id: string
          slug: string
        }
        Insert: {
          criado_em?: string
          fila_aberta?: boolean
          id?: string
          minutos_por_cliente?: number
          nome?: string
          owner_id: string
          slug: string
        }
        Update: {
          criado_em?: string
          fila_aberta?: boolean
          id?: string
          minutos_por_cliente?: number
          nome?: string
          owner_id?: string
          slug?: string
        }
        Relationships: []
      }
      fila: {
        Row: {
          agendado_em: string | null
          barbearia_id: string
          criado_em: string
          id: string
          nome: string
          servico: string | null
          status: string
          token: string
          whatsapp: string
        }
        Insert: {
          agendado_em?: string | null
          barbearia_id: string
          criado_em?: string
          id?: string
          nome: string
          servico?: string | null
          status?: string
          token?: string
          whatsapp: string
        }
        Update: {
          agendado_em?: string | null
          barbearia_id?: string
          criado_em?: string
          id?: string
          nome?: string
          servico?: string | null
          status?: string
          token?: string
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "fila_barbearia_id_fkey"
            columns: ["barbearia_id"]
            isOneToOne: false
            referencedRelation: "barbearias"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      entrar_fila:
        | {
            Args: { _nome: string; _slug: string; _whatsapp: string }
            Returns: Json
          }
        | {
            Args: {
              _nome: string
              _servico: string
              _slug: string
              _whatsapp: string
            }
            Returns: Json
          }
      fila_agendamento_cliente: {
        Args: { _id: string; _slug: string; _token: string }
        Returns: Json
      }
      fila_cliente: {
        Args: { _id: string; _slug: string; _token: string }
        Returns: boolean
      }
      fila_publica: { Args: { _slug: string }; Returns: Json }
      horarios_fila: { Args: { _dia: string; _slug: string }; Returns: Json }
      minha_barbearia: {
        Args: never
        Returns: {
          criado_em: string
          fila_aberta: boolean
          id: string
          minutos_por_cliente: number
          nome: string
          owner_id: string
          slug: string
        }
        SetofOptions: {
          from: "*"
          to: "barbearias"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      reservar_fila:
        | {
            Args: {
              _inicio: string
              _nome: string
              _slug: string
              _whatsapp: string
            }
            Returns: Json
          }
        | {
            Args: {
              _inicio: string
              _nome: string
              _servico: string
              _slug: string
              _whatsapp: string
            }
            Returns: Json
          }
      sair_fila: { Args: { _id: string; _token: string }; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
