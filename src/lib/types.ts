import type {
  leadSources,
  leadStatuses,
  leadTemperatures,
  messageTypes,
} from "@/lib/constants";

export type LeadSource = (typeof leadSources)[number];
export type LeadStatus = (typeof leadStatuses)[number];
export type LeadTemperature = (typeof leadTemperatures)[number];
export type MessageType = (typeof messageTypes)[number];

export interface MessageOption {
  id: string;
  tone: string;
  message: string;
}

export interface Profile {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  company_name: string | null;
  created_at: string;
}

export interface Lead {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  source: LeadSource | string;
  neighborhood: string | null;
  property_type: string | null;
  price_range: string | null;
  down_payment: number | null;
  income_range: string | null;
  financing_interest: boolean;
  credit_approved: boolean;
  fgts: boolean;
  purchase_timeline: string | null;
  requested_visit: boolean;
  researching_only: boolean;
  contact_attempts: number;
  notes: string | null;
  score: number;
  temperature: LeadTemperature | string;
  status: LeadStatus | string;
  incomplete_data: boolean;
  last_contact_at: string | null;
  last_inbound_at: string | null;
  next_followup_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Interaction {
  id: string;
  lead_id: string;
  user_id: string;
  type: string;
  channel: string;
  message: string;
  status: string;
  created_at: string;
}

export interface Task {
  id: string;
  lead_id: string;
  user_id: string;
  title: string;
  description: string | null;
  task_type: string;
  due_date: string;
  status: string;
  suggested_message: string | null;
  created_at: string;
  completed_at: string | null;
  lead?: Lead;
}

export interface CallNote {
  id: string;
  user_id: string;
  lead_id: string;
  call_started_at: string | null;
  call_ended_at: string | null;
  call_result: string;
  summary: string | null;
  objections: string[];
  next_action: string | null;
  next_followup_at: string | null;
  lead_temperature_after_call: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  lead_id: string;
  channel: string;
  provider: string;
  provider_chat_id: string | null;
  last_message_at: string | null;
  last_inbound_at: string | null;
  last_outbound_at: string | null;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  lead_id: string;
  user_id: string;
  direction: "inbound" | "outbound";
  channel: string;
  provider_message_id: string | null;
  provider_status: string;
  message_type: string;
  text_content: string | null;
  media_url: string | null;
  metadata_json: Record<string, unknown>;
  sent_at: string | null;
  delivered_at: string | null;
  read_at: string | null;
  created_at: string;
}

export interface ConversationSuggestion {
  id: string;
  conversation_id: string;
  lead_id: string;
  user_id: string;
  goal: string | null;
  input_context: string | null;
  suggested_message: string;
  edited_message: string | null;
  was_sent: boolean;
  created_at: string;
}
