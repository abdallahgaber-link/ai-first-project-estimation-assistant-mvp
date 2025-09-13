import { z } from 'zod';

export const WBSItemSchema = z.object({
  id: z.string().describe('Unique identifier for the work item'),
  name: z.string().describe('Name of the work item'),
  description: z.string().optional().describe('Detailed description of the work item'),
  level: z.number().int().min(1).describe('Level in the WBS hierarchy (1=epic, 2=feature, 3=task)'),
  parentId: z.string().nullable().describe('ID of the parent work item, null for top-level items'),
  effortPoints: z.number().min(0).default(0).describe('Estimated effort in story points'),
  tags: z.array(z.string()).default([]).describe('Tags for categorization and filtering'),
  dependencies: z.array(z.string()).default([]).describe('IDs of work items this item depends on'),
  assumptions: z.array(z.string()).default([]).describe('Any assumptions made during estimation'),
  risks: z.array(
    z.object({
      description: z.string(),
      impact: z.enum(['low', 'medium', 'high']).default('medium'),
      mitigation: z.string().optional(),
    })
  ).default([]).describe('Potential risks associated with this work item'),
});

export type WBSItem = z.infer<typeof WBSItemSchema>;

export const WBSSchema = z.object({
  projectId: z.string().describe('Unique identifier for the project'),
  projectName: z.string().describe('Name of the project'),
  createdAt: z.string().datetime().describe('ISO 8601 timestamp of when the WBS was created'),
  updatedAt: z.string().datetime().describe('ISO 8601 timestamp of when the WBS was last updated'),
  items: z.array(WBSItemSchema).min(1).describe('Collection of work items in the WBS'),
  metadata: z.object({
    source: z.string().describe('Source of the WBS data'),
    version: z.string().default('1.0.0').describe('Schema version'),
    assumptions: z.array(z.string()).default([]).describe('Global assumptions for the WBS'),
    constraints: z.array(z.string()).default([]).describe('Project constraints'),
  }).default({ source: 'manual', version: '1.0.0', assumptions: [], constraints: [] }),
});

export type WBS = z.infer<typeof WBSSchema>;

// Validation function moved to validation.ts

// Helper functions
export function getTopLevelItems(wbs: WBS): WBSItem[] {
  return wbs.items.filter(item => item.level === 1);
}

export function getChildren(wbs: WBS, parentId: string): WBSItem[] {
  return wbs.items.filter(item => item.parentId === parentId);
}

export function calculateTotalEffort(wbs: WBS): number {
  return wbs.items.reduce((sum, item) => sum + item.effortPoints, 0);
}
