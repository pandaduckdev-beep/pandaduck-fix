export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type RepairStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface Database {
  public: {
    Tables: {
      services: {
        Row: {
          id: string;
          service_id: string;
          name: string;
          description: string;
          base_price: number;
          duration: string;
          warranty: string;
          features: Json;
          process: Json;
          icon: string | null;
          image_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          service_id: string;
          name: string;
          description: string;
          base_price: number;
          duration: string;
          warranty: string;
          features: Json;
          process: Json;
          icon?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          service_id?: string;
          name?: string;
          description?: string;
          base_price?: number;
          duration?: string;
          warranty?: string;
          features?: Json;
          process?: Json;
          icon?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      service_options: {
        Row: {
          id: string;
          service_id: string;
          option_name: string;
          option_description: string;
          additional_price: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          service_id: string;
          option_name: string;
          option_description: string;
          additional_price?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          service_id?: string;
          option_name?: string;
          option_description?: string;
          additional_price?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      repair_requests: {
        Row: {
          id: string;
          customer_name: string;
          customer_phone: string;
          customer_email: string | null;
          controller_model: string;
          issue_description: string | null;
          status: RepairStatus;
          total_amount: number;
          estimated_completion_date: string | null;
          actual_completion_date: string | null;
          review_token: string | null;
          review_sent_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_name: string;
          customer_phone: string;
          customer_email?: string | null;
          controller_model: string;
          issue_description?: string | null;
          status?: RepairStatus;
          total_amount: number;
          estimated_completion_date?: string | null;
          actual_completion_date?: string | null;
          review_token?: string | null;
          review_sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_name?: string;
          customer_phone?: string;
          customer_email?: string | null;
          controller_model?: string;
          issue_description?: string | null;
          status?: RepairStatus;
          total_amount?: number;
          estimated_completion_date?: string | null;
          actual_completion_date?: string | null;
          review_token?: string | null;
          review_sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      repair_request_services: {
        Row: {
          id: string;
          repair_request_id: string;
          service_id: string;
          selected_option_id: string | null;
          service_price: number;
          option_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          repair_request_id: string;
          service_id: string;
          selected_option_id?: string | null;
          service_price: number;
          option_price?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          repair_request_id?: string;
          service_id?: string;
          selected_option_id?: string | null;
          service_price?: number;
          option_price?: number;
          created_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          repair_request_id: string | null;
          customer_name: string;
          rating: number;
          content: string;
          service_name: string;
          image_url: string | null;
          is_approved: boolean;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          repair_request_id?: string | null;
          customer_name: string;
          rating: number;
          content: string;
          service_name: string;
          image_url?: string | null;
          is_approved?: boolean;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          repair_request_id?: string | null;
          customer_name?: string;
          rating?: number;
          content?: string;
          service_name?: string;
          image_url?: string | null;
          is_approved?: boolean;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      status_history: {
        Row: {
          id: string;
          repair_request_id: string;
          previous_status: RepairStatus | null;
          new_status: RepairStatus;
          changed_by: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          repair_request_id: string;
          previous_status?: RepairStatus | null;
          new_status: RepairStatus;
          changed_by: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          repair_request_id?: string;
          previous_status?: RepairStatus | null;
          new_status?: RepairStatus;
          changed_by?: string;
          notes?: string | null;
          created_at?: string;
        };
      };
      service_combos: {
        Row: {
          id: string;
          combo_name: string;
          description: string | null;
          discount_type: 'percentage' | 'fixed';
          discount_value: number;
          required_service_ids: string[];
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          combo_name: string;
          description?: string | null;
          discount_type: 'percentage' | 'fixed';
          discount_value: number;
          required_service_ids: string[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          combo_name?: string;
          description?: string | null;
          discount_type?: 'percentage' | 'fixed';
          discount_value?: number;
          required_service_ids?: string[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// Convenience types for application use
export type Service = Database['public']['Tables']['services']['Row'];
export type ServiceOption = Database['public']['Tables']['service_options']['Row'];
export type RepairRequest = Database['public']['Tables']['repair_requests']['Row'];
export type RepairRequestService = Database['public']['Tables']['repair_request_services']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];
export type ServiceCombo = Database['public']['Tables']['service_combos']['Row'];

export interface ServiceWithOptions extends Service {
  options?: ServiceOption[];
}

export interface RepairRequestWithServices extends RepairRequest {
  services?: Array<RepairRequestService & {
    service?: Service;
    option?: ServiceOption;
  }>;
}
