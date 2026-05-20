import { z } from "zod";
import { leadSources, leadStatuses, messageTypes } from "@/lib/constants";
import { callResultOptions } from "@/lib/call-guide-content";

const booleanFromForm = z
  .union([z.boolean(), z.string(), z.number()])
  .transform((value) => value === true || value === "true" || value === "on" || value === 1);

export const authSchema = z.object({
  email: z.email("Informe um e-mail válido."),
  password: z.string().min(6, "A senha deve ter ao menos 6 caracteres."),
  name: z.string().min(2, "Informe seu nome.").optional(),
  phone: z.string().optional(),
  companyName: z.string().optional(),
});

export const leadSchema = z.object({
  name: z.string().min(2, "Informe o nome do lead."),
  phone: z.string().optional(),
  email: z.email("Informe um e-mail válido.").optional().or(z.literal("")),
  source: z.enum(leadSources).default("Manual"),
  neighborhood: z.string().optional(),
  property_type: z.string().optional(),
  price_range: z.string().optional(),
  down_payment: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.coerce.number().min(0).optional().nullable(),
  ),
  income_range: z.string().optional(),
  financing_interest: booleanFromForm.default(false),
  credit_approved: booleanFromForm.default(false),
  fgts: booleanFromForm.default(false),
  purchase_timeline: z.string().optional(),
  requested_visit: booleanFromForm.default(false),
  researching_only: booleanFromForm.default(false),
  notes: z.string().optional(),
  status: z.enum(leadStatuses).default("Novo lead"),
});

export const updateLeadStatusSchema = z.object({
  leadId: z.uuid(),
  status: z.enum(leadStatuses),
});

export const completeTaskSchema = z.object({
  taskId: z.uuid(),
});

export const generateMessageSchema = z.object({
  leadId: z.uuid(),
  messageType: z.enum(messageTypes),
});

export const callSuggestionSchema = z.object({
  leadId: z.uuid(),
  currentStep: z.string().min(1),
  callNotes: z.string().optional().default(""),
  objectionSelected: z.string().optional().default(""),
  goal: z.string().optional().default(""),
});

export const saveCallSchema = z.object({
  currentStep: z.string().min(1),
  callStartedAt: z.string().optional().default(""),
  callNotes: z.string().optional().default(""),
  selectedScripts: z.record(z.string(), z.string()).default({}),
  answeredQuestions: z.array(z.string()).default([]),
  selectedObjections: z.array(z.string()).default([]),
  nextAction: z.string().optional().default(""),
  nextFollowupAt: z.string().optional().default(""),
  callResult: z.enum(callResultOptions),
  summary: z.string().optional().default(""),
  internalNotes: z.string().optional().default(""),
  suggestedPhrase: z.string().optional().default(""),
  updatedLeadFields: z.object({
    property_type: z.string().optional().default(""),
    neighborhood: z.string().optional().default(""),
    bedrooms: z.string().optional().default(""),
    price_range: z.string().optional().default(""),
    down_payment: z.string().optional().default(""),
    income_range: z.string().optional().default(""),
    financing_interest: z.boolean().default(false),
    fgts: z.boolean().default(false),
    purchase_timeline: z.string().optional().default(""),
    use_case: z.string().optional().default(""),
    simulation_done: z.boolean().default(false),
    credit_approved: z.boolean().default(false),
    can_visit: z.boolean().default(false),
    visit_best_slot: z.string().optional().default(""),
    motivation: z.string().optional().default(""),
    temperature: z.enum(["Quente", "Morno", "Frio"]).optional().or(z.literal("")),
    status: z.enum(leadStatuses).optional().or(z.literal("")),
  }),
});
