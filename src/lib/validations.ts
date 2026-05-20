import { z } from "zod";
import { leadSources, leadStatuses, messageTypes } from "@/lib/constants";

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
