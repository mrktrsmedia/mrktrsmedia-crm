export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      users: { Row: { id: string; email: string; full_name: string; role: string; avatar_url: string|null; is_active: boolean; created_at: string; updated_at: string } }
      med_spas: { Row: { id: string; name: string; website: string|null; instagram_handle: string|null; facebook_url: string|null; city: string|null; state: string|null; niche_focus: string|null; estimated_offer_level: string|null; estimated_retainer_value: number|null; lead_quality_score: number|null; lead_quality: string; ad_status: string; source_of_lead: string|null; website_quality_notes: string|null; instagram_quality_notes: string|null; is_hot_lead: boolean; status: string; pipeline_stage: string; last_contacted_at: string|null; next_follow_up_date: string|null; assigned_to: string|null; created_by: string|null; is_archived: boolean; created_at: string; updated_at: string } }
      contacts: { Row: { id: string; med_spa_id: string; name: string; role: string|null; email: string|null; phone: string|null; instagram: string|null; is_primary_contact: boolean; is_decision_maker: boolean; notes: string|null; created_at: string } }
      clients: { Row: { id: string; med_spa_id: string; primary_contact_id: string|null; account_manager_id: string|null; service_package: string|null; retainer_amount: number|null; setup_fee: number|null; currency: string; start_date: string|null; status: string; onboarding_status: string; onboarding_email_sent: boolean; primary_goal: string|null; created_at: string; updated_at: string } }
      onboarding_forms: { Row: { id: string; client_id: string; business_info_completed: boolean; primary_contact_confirmed: boolean; meta_business_manager_received: boolean; facebook_page_received: boolean; instagram_received: boolean; ad_account_received: boolean; pixel_dataset_received: boolean; website_cms_received: boolean; brand_assets_received: boolean; logo_received: boolean; service_menu_received: boolean; offer_details_received: boolean; before_after_policy_confirmed: boolean; compliance_rules_received: boolean; approval_workflow_confirmed: boolean; reporting_cadence_confirmed: boolean; first_strategy_call_booked: boolean; first_campaign_planned: boolean; updated_at: string } }
      outreach_logs: { Row: { id: string; med_spa_id: string; contact_id: string|null; channel: string; outreach_stage: string; message_type: string; message_summary: string|null; response_summary: string|null; media_seen: boolean; replied: boolean; calendly_sent: boolean; call_booked: boolean; outreach_date: string; next_follow_up_date: string|null; created_by: string|null; created_at: string } }
      tasks: { Row: { id: string; med_spa_id: string|null; client_id: string|null; title: string; description: string|null; task_type: string; priority: string; status: string; due_date: string|null; completed_at: string|null; assigned_to: string|null; created_by: string|null; created_at: string; updated_at: string } }
      notes: { Row: { id: string; med_spa_id: string|null; client_id: string|null; body: string; note_type: string; is_pinned: boolean; created_by: string|null; created_at: string } }
      payments: { Row: { id: string; client_id: string; med_spa_id: string|null; payment_type: string; amount: number|null; status: string; due_date: string|null; paid_date: string|null; invoice_url: string|null; notes: string|null; created_by: string|null; created_at: string; updated_at: string } }
      activity_timeline: { Row: { id: string; med_spa_id: string|null; client_id: string|null; activity_type: string; title: string; description: string|null; created_by: string|null; created_at: string } }
      email_logs: { Row: { id: string; client_id: string|null; recipient_email: string; email_type: string; status: string; sent_at: string; created_at: string } }
    }
    Views: {
      cold_dm_metrics_monthly: { Row: { year: number; month: number; total_initiated: number; total_media_seen: number; total_engaged: number; total_calendly_sent: number; total_booked: number; media_seen_rate: number; reply_rate: number; calendly_rate: number; booking_rate: number } }
      mrr_snapshot: { Row: { total_mrr: number; active_clients: number; avg_retainer: number } }
      overdue_follow_ups: { Row: { id: string; name: string; days_overdue: number; next_follow_up_date: string; last_contacted_at: string|null } }
    }
  }
}
