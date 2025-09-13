import { z } from 'zod';

export const WBSModuleSchema = z.object({
  name: z.string(),
  complexity: z.enum(['L', 'M', 'H']),
  notes: z.string(),
  primary_role: z.string().optional(),
});

export const WBSEpicSchema = z.object({
  name: z.string(),
  assumptions: z.array(z.string()),
  risks: z.array(z.string()),
  modules: z.array(WBSModuleSchema),
});

export const WBSSchema = z.object({
  epics: z.array(WBSEpicSchema),
});

export type WBSModule = z.infer<typeof WBSModuleSchema>;
export type WBSEpic = z.infer<typeof WBSEpicSchema>;
export type WBSResponse = z.infer<typeof WBSSchema>;
