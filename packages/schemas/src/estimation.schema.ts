import { z } from 'zod';

export const RoleEffortSchema = z.object({
  role: z.string().describe('Role name, e.g., "Frontend Developer", "Backend Developer"'),
  effortWeeks: z.number().min(0).describe('Estimated effort in weeks'),
  percentage: z.number().min(0).max(100).describe('Percentage of total effort for this role'),
  description: z.string().optional().describe('Description of the role\'s responsibilities'),
});

export type RoleEffort = z.infer<typeof RoleEffortSchema>;

export const EstimationBreakdownSchema: z.ZodType<any> = z.object({
  id: z.string(),
  name: z.string(),
  effortPoints: z.number().min(0),
  effortWeeks: z.number().min(0),
  roles: z.array(RoleEffortSchema),
  children: z.lazy(() => z.array(EstimationBreakdownSchema)).default([]),
});

export type EstimationBreakdown = z.infer<typeof EstimationBreakdownSchema>;

export const EstimationSchema = z.object({
  projectId: z.string().describe('Unique identifier for the project'),
  projectName: z.string().describe('Name of the project'),
  createdAt: z.string().datetime().describe('ISO 8601 timestamp of when the estimation was created'),
  updatedAt: z.string().datetime().describe('ISO 8601 timestamp of when the estimation was last updated'),
  
  // Core estimation values
  totalEffortPoints: z.number().min(0).describe('Total effort points for the project'),
  teamVelocity: z.number().positive().describe('Team velocity in points per sprint'),
  sprintLengthWeeks: z.number().positive().default(2).describe('Length of a sprint in weeks'),
  bufferPercent: z.number().min(0).max(100).describe('Buffer percentage added to the estimation'),
  
  // Timeline estimates
  optimisticWeeks: z.number().min(0).describe('Optimistic timeline estimate in weeks'),
  mostLikelyWeeks: z.number().min(0).describe('Most likely timeline estimate in weeks'),
  pessimisticWeeks: z.number().min(0).describe('Pessimistic timeline estimate in weeks'),
  
  // Team composition
  roles: z.array(RoleEffortSchema).min(1, 'At least one role is required'),
  
  // Breakdown
  breakdown: EstimationBreakdownSchema.describe('Hierarchical breakdown of the estimation'),
  
  // Metadata
  assumptions: z.array(z.string()).default([]).describe('Key assumptions made during estimation'),
  risks: z.array(
    z.object({
      description: z.string(),
      impact: z.enum(['low', 'medium', 'high']).default('medium'),
      probability: z.enum(['low', 'medium', 'high']).default('medium'),
      mitigation: z.string().optional(),
    })
  ).default([]).describe('Key risks identified during estimation'),
  
  // Configuration
  configuration: z.object({
    pointsPerWeek: z.number().positive().describe('Conversion rate from effort points to weeks'),
    roleSplit: z.record(z.number().min(0).max(1)).describe('Percentage split between roles (values should sum to 1)'),
    multipliers: z.record(z.number().min(0)).describe('Multipliers for different types of work'),
  }),
  
  // Versioning
  version: z.string().default('1.0.0').describe('Schema version'),
});

export type Estimation = z.infer<typeof EstimationSchema>;

// Validation function moved to validation.ts

// Helper functions
export function calculateTotalEffortWeeks(estimation: Estimation): number {
  return estimation.roles.reduce((sum, role) => sum + role.effortWeeks, 0);
}

export function getRoleEffort(estimation: Estimation, roleName: string): RoleEffort | undefined {
  return estimation.roles.find(role => role.role === roleName);
}

export function calculateEffortVariance(estimation: Estimation): number {
  return estimation.pessimisticWeeks - estimation.optimisticWeeks;
}
