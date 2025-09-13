import { describe, it, expect } from 'vitest';
import { EstimationService } from './estimation.service';
import { WBS } from '@project-estimation-assistant/schemas';

describe('EstimationService', () => {
  const estimationService = new EstimationService();

  const mockWBS: WBS = {
    projectId: 'test-project',
    projectName: 'Test Project',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      {
        id: 'item-1',
        name: 'Frontend Development',
        description: 'Build the user interface',
        level: 1,
        parentId: null,
        effortPoints: 40,
        tags: ['frontend'],
        dependencies: [],
        assumptions: [],
        risks: [],
      },
      {
        id: 'item-2',
        name: 'Backend Development',
        description: 'Build the API',
        level: 1,
        parentId: null,
        effortPoints: 60,
        tags: ['backend'],
        dependencies: [],
        assumptions: [],
        risks: [],
      },
    ],
    metadata: {
      source: 'test',
      version: '1.0.0',
      assumptions: ['Test assumption'],
      constraints: ['Test constraint'],
    },
  };

  it('should calculate total effort points correctly', () => {
    const estimation = estimationService.calculateEstimation({ wbs: mockWBS });
    expect(estimation.totalEffortPoints).toBe(100);
  });

  it('should calculate timeline estimates', () => {
    const estimation = estimationService.calculateEstimation({ wbs: mockWBS });
    expect(estimation.optimisticWeeks).toBeGreaterThan(0);
    expect(estimation.mostLikelyWeeks).toBeGreaterThan(estimation.optimisticWeeks);
    expect(estimation.pessimisticWeeks).toBeGreaterThan(estimation.mostLikelyWeeks);
  });

  it('should distribute effort across roles', () => {
    const estimation = estimationService.calculateEstimation({ wbs: mockWBS });
    expect(estimation.roles).toHaveLength(5);
    
    const totalPercentage = estimation.roles.reduce((sum, role) => sum + role.percentage, 0);
    expect(totalPercentage).toBeCloseTo(100, 1);
  });

  it('should create hierarchical breakdown', () => {
    const estimation = estimationService.calculateEstimation({ wbs: mockWBS });
    expect(estimation.breakdown).toBeDefined();
    expect(estimation.breakdown.name).toBe(mockWBS.projectName);
    expect(estimation.breakdown.effortPoints).toBe(100);
  });

  it('should apply custom team velocity', () => {
    const customVelocity = 30;
    const estimation = estimationService.calculateEstimation({ 
      wbs: mockWBS, 
      teamVelocity: customVelocity 
    });
    expect(estimation.teamVelocity).toBe(customVelocity);
  });

  it('should apply buffer percentage', () => {
    const customBuffer = 30;
    const estimation = estimationService.calculateEstimation({ 
      wbs: mockWBS, 
      bufferPercent: customBuffer 
    });
    expect(estimation.bufferPercent).toBe(customBuffer);
  });
});
