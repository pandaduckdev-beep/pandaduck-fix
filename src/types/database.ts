export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type RepairStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'

export interface Database {
  public: {
    Tables: {
      controller_services: {
        Row: {
          id: string
          controller_model_id: string
          service_id: string
          icon_name: string | null
          name: string
          description: string
          subtitle: string | null
          detailed_description: string | null
          duration: string
          warranty: string
          features: Json
          process_steps: Json
          image_url: string | null
          base_price: number
          is_active: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          controller_model_id: string
          service_id: string
          icon_name?: string | null
          name: string
          description: string
          subtitle?: string | null
          detailed_description?: string | null
          duration?: string
          warranty?: string
          features?: Json
          process_steps?: Json
          image_url?: string | null
          base_price: number
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          controller_model_id?: string
          service_id?: string
          icon_name?: string | null
          name?: string
          description?: string
          subtitle?: string | null
          detailed_description?: string | null
          duration?: string
          warranty?: string
          features?: Json
          process_steps?: Json
          image_url?: string | null
          base_price?: number
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      controller_service_options: {
        Row: {
          id: string
          controller_service_id: string
          option_name: string
          option_description: string
          additional_price: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          controller_service_id: string
          option_name: string
          option_description: string
          additional_price?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          controller_service_id?: string
          option_name?: string
          option_description?: string
          additional_price?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      repair_requests: {
        Row: {
          id: string
          customer_name: string
          customer_phone: string
          customer_email: string | null
          controller_model: string
          issue_description: string | null
          status: RepairStatus
          total_amount: number
          estimated_completion_date: string | null
          actual_completion_date: string | null
          review_token: string | null
          review_sent_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_name: string
          customer_phone: string
          customer_email?: string | null
          controller_model: string
          issue_description?: string | null
          status?: RepairStatus
          total_amount: number
          estimated_completion_date?: string | null
          actual_completion_date?: string | null
          review_token?: string | null
          review_sent_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_name?: string
          customer_phone?: string
          customer_email?: string | null
          controller_model?: string
          issue_description?: string | null
          status?: RepairStatus
          total_amount?: number
          estimated_completion_date?: string | null
          actual_completion_date?: string | null
          review_token?: string | null
          review_sent_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      repair_request_services: {
        Row: {
          id: string
          repair_request_id: string
          service_id: string
          selected_option_id: string | null
          service_price: number
          option_price: number
          created_at: string
        }
        Insert: {
          id?: string
          repair_request_id: string
          service_id: string
          selected_option_id?: string | null
          service_price: number
          option_price?: number
          created_at?: string
        }
        Update: {
          id?: string
          repair_request_id?: string
          service_id?: string
          selected_option_id?: string | null
          service_price?: number
          option_price?: number
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          repair_request_id: string | null
          customer_name: string
          rating: number
          content: string
          service_name: string
          image_url: string | null
          is_approved: boolean
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          repair_request_id?: string | null
          customer_name: string
          rating: number
          content: string
          service_name: string
          image_url?: string | null
          is_approved?: boolean
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          repair_request_id?: string | null
          customer_name?: string
          rating?: number
          content?: string
          service_name?: string
          image_url?: string | null
          is_approved?: boolean
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      status_history: {
        Row: {
          id: string
          repair_request_id: string
          previous_status: RepairStatus | null
          new_status: RepairStatus
          changed_by: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          repair_request_id: string
          previous_status?: RepairStatus | null
          new_status: RepairStatus
          changed_by: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          repair_request_id?: string
          previous_status?: RepairStatus | null
          new_status?: RepairStatus
          changed_by?: string
          notes?: string | null
          created_at?: string
        }
      }
      service_combos: {
        Row: {
          id: string
          combo_name: string
          description: string | null
          discount_type: 'percentage' | 'fixed'
          discount_value: number
          required_service_ids: string[]
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          combo_name: string
          description?: string | null
          discount_type: 'percentage' | 'fixed'
          discount_value: number
          required_service_ids: string[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          combo_name?: string
          description?: string | null
          discount_type?: 'percentage' | 'fixed'
          discount_value?: number
          required_service_ids?: string[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      controller_models: {
        Row: {
          id: string
          model_id: string
          model_name: string
          description: string | null
          is_active: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          model_id: string
          model_name: string
          description?: string | null
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          model_id?: string
          model_name?: string
          description?: string | null
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      controller_service_pricing: {
        Row: {
          id: string
          controller_model_id: string
          service_id: string
          price: number
          is_available: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          controller_model_id: string
          service_id: string
          price: number
          is_available?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          controller_model_id?: string
          service_id?: string
          price?: number
          is_available?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      controller_option_pricing: {
        Row: {
          id: string
          controller_model_id: string
          service_option_id: string
          additional_price: number
          is_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          controller_model_id: string
          service_option_id: string
          additional_price: number
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          controller_model_id?: string
          service_option_id?: string
          additional_price?: number
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      admin_users: {
        Row: {
          id: string
          email: string
          password_hash: string
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
      }
      admin_login_logs: {
        Row: {
          id: string
          email: string
          success: boolean
          user_id: string | null
          ip_address: string | null
          user_agent: string | null
          error_message: string | null
          timestamp: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          success: boolean
          user_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          error_message?: string | null
          timestamp?: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          success?: boolean
          user_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          error_message?: string | null
          timestamp?: string
          created_at?: string
        }
      }
      service_combos: {
        Row: {
          id: string
          combo_name: string
          description: string | null
          discount_type: 'percentage' | 'fixed'
          discount_value: number
          controller_model_id: string | null
          required_service_ids: string[]
          min_service_count: number
          is_active: boolean
          priority: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          combo_name: string
          description?: string | null
          discount_type: 'percentage' | 'fixed'
          discount_value: number
          controller_model_id?: string | null
          required_service_ids: string[]
          min_service_count?: number
          is_active?: boolean
          priority?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          combo_name?: string
          description?: string | null
          discount_type?: 'percentage' | 'fixed'
          discount_value?: number
          controller_model_id?: string | null
          required_service_ids?: string[]
          min_service_count?: number
          is_active?: boolean
          priority?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Convenience types for application use
export type ControllerService = Database['public']['Tables']['controller_services']['Row']
export type ControllerServiceOption =
  Database['public']['Tables']['controller_service_options']['Row']
export type RepairRequest = Database['public']['Tables']['repair_requests']['Row']
export type RepairRequestService = Database['public']['Tables']['repair_request_services']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']
export type ServiceCombo = Database['public']['Tables']['service_combos']['Row']
export type ControllerModel = Database['public']['Tables']['controller_models']['Row']
export type ControllerServicePricing =
  Database['public']['Tables']['controller_service_pricing']['Row']
export type ControllerOptionPricing =
  Database['public']['Tables']['controller_option_pricing']['Row']
export type AdminUser = Database['public']['Tables']['admin_users']['Row']
export type AdminLoginLog = Database['public']['Tables']['admin_login_logs']['Row']

export interface ControllerServiceWithOptions extends ControllerService {
  options?: ControllerServiceOption[]
  controller_service_options?: ControllerServiceOption[]
}

export interface RepairRequestWithServices extends RepairRequest {
  services?: Array<
    RepairRequestService & {
      service?: ControllerService
      option?: ControllerServiceOption
    }
  >
}

export interface ControllerServiceWithPricing extends ControllerService {
  pricing?: ControllerServicePricing
  options?: Array<
    ControllerServiceOption & {
      pricing?: ControllerOptionPricing
    }
  >
}
