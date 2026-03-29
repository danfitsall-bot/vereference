export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          company_name: string | null;
          company_domain: string | null;
          plan: string;
          credits_remaining: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          company_name?: string | null;
          company_domain?: string | null;
          plan?: string;
          credits_remaining?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          company_name?: string | null;
          company_domain?: string | null;
          plan?: string;
          credits_remaining?: number;
          updated_at?: string;
        };
      };
      candidates: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          email: string;
          phone: string | null;
          position_applied: string;
          department: string | null;
          token: string;
          token_expires_at: string;
          status: "pending" | "invited" | "submitted" | "completed" | "expired";
          referee_count_required: number;
          consent_given: boolean;
          consent_given_at: string | null;
          ip_address: string | null;
          user_agent: string | null;
          device_fingerprint: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          email: string;
          phone?: string | null;
          position_applied: string;
          department?: string | null;
          token?: string;
          token_expires_at?: string;
          status?: string;
          referee_count_required?: number;
          consent_given?: boolean;
          consent_given_at?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          device_fingerprint?: string | null;
        };
        Update: {
          full_name?: string;
          email?: string;
          phone?: string | null;
          position_applied?: string;
          department?: string | null;
          status?: string;
          consent_given?: boolean;
          consent_given_at?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          device_fingerprint?: string | null;
          updated_at?: string;
        };
      };
      referees: {
        Row: {
          id: string;
          candidate_id: string;
          user_id: string;
          full_name: string;
          email: string;
          phone: string | null;
          relationship:
            | "manager"
            | "colleague"
            | "direct_report"
            | "other";
          company: string;
          job_title: string | null;
          token: string;
          token_expires_at: string;
          status:
            | "pending"
            | "email_sent"
            | "in_progress"
            | "completed"
            | "declined"
            | "expired";
          contact_method: "email" | "voice" | "both";
          email_sent_at: string | null;
          reminder_sent_at: string | null;
          completed_at: string | null;
          ip_address: string | null;
          user_agent: string | null;
          device_fingerprint: string | null;
          geolocation: Record<string, unknown> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          candidate_id: string;
          user_id: string;
          full_name: string;
          email: string;
          phone?: string | null;
          relationship: string;
          company: string;
          job_title?: string | null;
          token?: string;
          token_expires_at?: string;
          status?: string;
          contact_method?: string;
          email_sent_at?: string | null;
        };
        Update: {
          full_name?: string;
          email?: string;
          phone?: string | null;
          relationship?: string;
          company?: string;
          job_title?: string | null;
          status?: string;
          contact_method?: string;
          email_sent_at?: string | null;
          reminder_sent_at?: string | null;
          completed_at?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          device_fingerprint?: string | null;
          geolocation?: Record<string, unknown> | null;
          updated_at?: string;
        };
      };
      responses: {
        Row: {
          id: string;
          referee_id: string;
          user_id: string;
          question_key: string;
          question_text: string;
          answer_text: string | null;
          answer_rating: number | null;
          source: "form" | "voice_transcript" | "voice_summary";
          created_at: string;
        };
        Insert: {
          id?: string;
          referee_id: string;
          user_id: string;
          question_key: string;
          question_text: string;
          answer_text?: string | null;
          answer_rating?: number | null;
          source?: string;
        };
        Update: {
          answer_text?: string | null;
          answer_rating?: number | null;
          source?: string;
        };
      };
      voice_sessions: {
        Row: {
          id: string;
          referee_id: string;
          user_id: string;
          provider: string;
          session_type: string;
          status:
            | "pending"
            | "active"
            | "completed"
            | "failed"
            | "no_answer";
          started_at: string | null;
          ended_at: string | null;
          duration_seconds: number | null;
          recording_url: string | null;
          transcript_raw: Record<string, unknown> | null;
          transcript_summary: string | null;
          cost_cents: number | null;
          external_call_id: string | null;
          metadata: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          referee_id: string;
          user_id: string;
          provider: string;
          session_type?: string;
          status?: string;
          started_at?: string | null;
          ended_at?: string | null;
          duration_seconds?: number | null;
          recording_url?: string | null;
          transcript_raw?: Record<string, unknown> | null;
          transcript_summary?: string | null;
          cost_cents?: number | null;
          external_call_id?: string | null;
          metadata?: Record<string, unknown> | null;
        };
        Update: {
          status?: string;
          started_at?: string | null;
          ended_at?: string | null;
          duration_seconds?: number | null;
          recording_url?: string | null;
          transcript_raw?: Record<string, unknown> | null;
          transcript_summary?: string | null;
          cost_cents?: number | null;
          external_call_id?: string | null;
          metadata?: Record<string, unknown> | null;
        };
      };
      fraud_signals: {
        Row: {
          id: string;
          candidate_id: string;
          referee_id: string | null;
          user_id: string;
          signal_type: string;
          severity: "low" | "medium" | "high" | "critical";
          description: string;
          metadata: Record<string, unknown> | null;
          dismissed: boolean;
          dismissed_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          candidate_id: string;
          referee_id?: string | null;
          user_id: string;
          signal_type: string;
          severity?: string;
          description: string;
          metadata?: Record<string, unknown> | null;
          dismissed?: boolean;
        };
        Update: {
          dismissed?: boolean;
          dismissed_by?: string | null;
        };
      };
      questions_template: {
        Row: {
          id: string;
          user_id: string | null;
          question_key: string;
          question_text: string;
          question_type: string;
          options: Record<string, unknown> | null;
          sort_order: number;
          is_required: boolean;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          question_key: string;
          question_text: string;
          question_type?: string;
          options?: Record<string, unknown> | null;
          sort_order?: number;
          is_required?: boolean;
          is_active?: boolean;
        };
        Update: {
          question_key?: string;
          question_text?: string;
          question_type?: string;
          options?: Record<string, unknown> | null;
          sort_order?: number;
          is_required?: boolean;
          is_active?: boolean;
        };
      };
      email_log: {
        Row: {
          id: string;
          recipient_email: string;
          template_name: string;
          resend_id: string | null;
          status: string;
          metadata: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipient_email: string;
          template_name: string;
          resend_id?: string | null;
          status?: string;
          metadata?: Record<string, unknown> | null;
        };
        Update: {
          status?: string;
          resend_id?: string | null;
          metadata?: Record<string, unknown> | null;
        };
      };
    };
  };
};

// Convenience types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Candidate = Database["public"]["Tables"]["candidates"]["Row"];
export type CandidateInsert =
  Database["public"]["Tables"]["candidates"]["Insert"];
export type Referee = Database["public"]["Tables"]["referees"]["Row"];
export type RefereeInsert = Database["public"]["Tables"]["referees"]["Insert"];
export type Response = Database["public"]["Tables"]["responses"]["Row"];
export type ResponseInsert =
  Database["public"]["Tables"]["responses"]["Insert"];
export type VoiceSession =
  Database["public"]["Tables"]["voice_sessions"]["Row"];
export type FraudSignal = Database["public"]["Tables"]["fraud_signals"]["Row"];
export type QuestionTemplate =
  Database["public"]["Tables"]["questions_template"]["Row"];
