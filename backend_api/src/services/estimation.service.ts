import { WBS, WBSItem } from '@project-estimation-assistant/schemas';
import { 
  Estimation, 
  RoleEffort, 
  EstimationBreakdown,
  DEFAULT_ROLE_SPLIT,
  DEFAULT_MULTIPLIERS,
} from '@project-estimation-assistant/schemas';
// import { ROLE_KEYWORDS } from '../config/constants';
import { randomUUID } from 'crypto';
import { config } from '../config';

type EstimationInput = {
  wbs: WBS;
  teamVelocity?: number;
  bufferPercent?: number;
  roleSplit?: Record<string, number>;
  multipliers?: Record<string, number>;
};

export class EstimationService {
  private teamVelocity: number;
  private bufferPercent: number;
  private roleSplit: Record<string, number>;
  private multipliers: Record<string, number>;
  private sprintLength: number;

  constructor() {
    this.teamVelocity = config.estimation.defaultTeamVelocity;
    this.bufferPercent = config.estimation.defaultBufferPercent;
    this.roleSplit = { ...DEFAULT_ROLE_SPLIT };
    this.multipliers = { ...DEFAULT_MULTIPLIERS };
    this.sprintLength = 2; // Default sprint length
  }

  public calculateEstimation(input: EstimationInput): Estimation {
    const { wbs } = input;
    
    // Apply overrides if provided
    if (input.teamVelocity !== undefined) this.teamVelocity = input.teamVelocity;
    if (input.bufferPercent !== undefined) this.bufferPercent = input.bufferPercent;
    if (input.roleSplit) this.roleSplit = { ...this.roleSplit, ...input.roleSplit };
    if (input.multipliers) this.multipliers = { ...this.multipliers, ...input.multipliers };

    // Calculate total effort points
    const totalEffortPoints = this.calculateTotalEffortPoints(wbs);
    
    // Calculate base weeks (without buffer)
    const baseWeeks = this.calculateBaseWeeks(totalEffortPoints);
    
    // Apply buffer
    // const bufferWeeks = (baseWeeks * this.bufferPercent) / 100;
    
    // Calculate optimistic, most likely, and pessimistic estimates
    const optimisticWeeks = Math.ceil(baseWeeks * 0.8); // 20% less than base
    const mostLikelyWeeks = Math.ceil(baseWeeks);
    const pessimisticWeeks = Math.ceil(baseWeeks * 1.5); // 50% more than base
    
    // Calculate role efforts
    const roleEfforts = this.calculateRoleEfforts(wbs, baseWeeks);
    
    // Create breakdown
    const moduleEstimates = this.createBreakdown(wbs);
    
    // Create estimation
    const estimation: Estimation = {
      projectId: randomUUID(),
      projectName: wbs.projectName,
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      
      totalEffortPoints,
      teamVelocity: this.teamVelocity,
      sprintLengthWeeks: this.sprintLength,
      bufferPercent: this.bufferPercent,
      
      optimisticWeeks,
      mostLikelyWeeks,
      pessimisticWeeks,
      
      roles: roleEfforts,
      breakdown: moduleEstimates,
      
      assumptions: wbs.metadata?.assumptions || [],
      risks: [], // Empty for now
      configuration: {
        pointsPerWeek: this.teamVelocity,
        roleSplit: this.roleSplit,
        multipliers: this.multipliers,
      },
    };
    
    return estimation;
  }

  private calculateTotalEffortPoints(wbs: WBS): number {
    return wbs.items.reduce((sum, item) => sum + item.effortPoints, 0);
  }

  private calculateBaseWeeks(totalEffortPoints: number): number {
    const pointsPerWeek = this.teamVelocity / 2; // Assuming 2-week sprints
    return totalEffortPoints / pointsPerWeek;
  }

  private calculateRoleEfforts(wbs: WBS, totalWeeks: number): RoleEffort[] {
    // Calculate total points by role based on item tags
    const rolePoints: Record<string, number> = {};
    
    wbs.items.forEach(item => {
      // If item has role tags, distribute points accordingly
      const itemRoles = item.tags.filter(tag => tag in this.roleSplit);
      
      if (itemRoles.length > 0) {
        // Distribute points among the tagged roles
        const pointsPerRole = item.effortPoints / itemRoles.length;
        itemRoles.forEach(role => {
          rolePoints[role] = (rolePoints[role] || 0) + pointsPerRole;
        });
      } else {
        // If no role tags, distribute according to default split
        Object.entries(this.roleSplit).forEach(([role, ratio]) => {
          rolePoints[role] = (rolePoints[role] || 0) + (item.effortPoints * ratio);
        });
      }
    });
    
    // Calculate total points for normalization
    const totalPoints = Object.values(rolePoints).reduce((sum, points) => sum + points, 0);
    
    // Convert points to weeks for each role
    return Object.entries(rolePoints).map(([role, points]) => {
      const roleMultiplier = 1.0; // Default multiplier
      const roleWeeks = (points / totalPoints) * totalWeeks * roleMultiplier;
      
      return {
        role,
        effortWeeks: Math.ceil(roleWeeks * 2) / 2, // Round to nearest 0.5 weeks
        percentage: Math.round((points / totalPoints) * 1000) / 10, // 1 decimal place
      };
    });
  }

  private createBreakdown(wbs: WBS): EstimationBreakdown {
    // Group items by parent to build the hierarchy
    const itemsByParent = new Map<string, WBSItem[]>();
    
    // Initialize with root items (no parent)
    itemsByParent.set('root', []);
    
    // Group items by parent
    wbs.items.forEach(item => {
      const parentId = item.parentId || 'root';
      if (!itemsByParent.has(parentId)) {
        itemsByParent.set(parentId, []);
      }
      itemsByParent.get(parentId)!.push(item);
    });
    
    // Recursively build the breakdown
    const buildBreakdown = (parentId: string): EstimationBreakdown[] => {
      const items = itemsByParent.get(parentId) || [];
      
      return items.map(item => {
        const children = buildBreakdown(item.id);
        const childEffort = children.reduce((sum, child) => sum + child.effortPoints, 0);
        
        return {
          id: item.id,
          name: item.name,
          effortPoints: item.effortPoints + childEffort,
          effortWeeks: this.calculateBaseWeeks(item.effortPoints + childEffort),
          roles: this.calculateRoleEfforts(
            { ...wbs, items: [item, ...children.flatMap(c => this.flattenBreakdown(c))] },
            this.calculateBaseWeeks(item.effortPoints + childEffort)
          ),
          children,
        };
      });
    };
    
    // Start with root items
    const rootItems = buildBreakdown('root');
    
    // If we have exactly one root item, return it directly
    if (rootItems.length === 1) {
      return rootItems[0];
    }
    
    // Otherwise, create a synthetic root
    const totalEffort = rootItems.reduce((sum, item) => sum + item.effortPoints, 0);
    
    return {
      id: 'root',
      name: wbs.projectName,
      effortPoints: totalEffort,
      effortWeeks: this.calculateBaseWeeks(totalEffort),
      roles: this.calculateRoleEfforts(wbs, this.calculateBaseWeeks(totalEffort)),
      children: rootItems,
    };
  }
  
  private flattenBreakdown(breakdown: EstimationBreakdown): WBSItem[] {
    const items: WBSItem[] = [];
    
    const process = (item: EstimationBreakdown) => {
      items.push({
        id: item.id,
        name: item.name,
        description: '',
        level: 1, // This is simplified; in a real implementation, you'd track the level
        parentId: null,
        effortPoints: item.effortPoints,
        tags: [],
        dependencies: [],
        assumptions: [],
        risks: [],
      });
      
      item.children.forEach(process);
    };
    
    process(breakdown);
    return items;
  }
}

// Create a singleton instance
export const estimationService = new EstimationService();
