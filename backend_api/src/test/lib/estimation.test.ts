import { describe, it, expect, beforeEach } from 'vitest';
import { EstimationEngine, WBSResponse, EstimationInput } from '../../lib/estimation';

describe('Estimation Engine', () => {
  const mockWBS: WBSResponse = {
    epics: [{
      name: 'Development',
      assumptions: ['Test assumption'],
      risks: ['Test risk'],
      modules: [
        {
          name: 'Frontend Module',
          complexity: 'M',
          notes: 'React frontend',
          primary_role: 'Frontend/React'
        },
        {
          name: 'Backend Module',
          complexity: 'H',
          notes: 'Node.js backend',
          primary_role: 'Backend/Node.js'
        },
        {
          name: 'Testing Module',
          complexity: 'L',
          notes: 'Unit tests',
          primary_role: 'QA'
        }
      ]
    }]
  };

  const mockInput: EstimationInput = {
    projectTitle: 'Test Project',
    description: 'Test description',
    platforms: ['web'],
    integrations: [],
    nfrs: [],
    languagesCount: 1,
    teamExperience: 'mid',
    qualityLevel: 'production',
    outputLanguage: 'en'
  };

  let engine: EstimationEngine;

  beforeEach(() => {
    engine = new EstimationEngine();
  });

  it('should calculate estimation correctly', () => {
    const result = engine.estimateProject(mockWBS, mockInput);

    expect(result.modules).toHaveLength(3);
    expect(result.roles.length).toBeGreaterThan(0);
    expect(result.totals).toBeDefined();
    expect(result.optimistic).toBeGreaterThan(0);
    expect(result.mostLikely).toBeGreaterThan(result.optimistic);
    expect(result.pessimistic).toBeGreaterThan(result.mostLikely);
  });

  it('should apply complexity multipliers correctly', () => {
    const result = engine.estimateProject(mockWBS, mockInput);
    
    const lowComplexity = result.modules.find(m => m.complexity === 'L');
    const mediumComplexity = result.modules.find(m => m.complexity === 'M');
    const highComplexity = result.modules.find(m => m.complexity === 'H');

    expect(lowComplexity?.basePoints).toBe(3);
    expect(mediumComplexity?.basePoints).toBe(5);
    expect(highComplexity?.basePoints).toBe(8);
  });

  it('should apply team experience multipliers', () => {
    const juniorResult = engine.estimateProject(mockWBS, { ...mockInput, teamExperience: 'junior' });
    const seniorResult = engine.estimateProject(mockWBS, { ...mockInput, teamExperience: 'senior' });

    // Junior teams should have higher effort
    expect(juniorResult.totals.totalMDs).toBeGreaterThan(seniorResult.totals.totalMDs);
  });

  it('should apply quality level multipliers', () => {
    const mvpResult = engine.estimateProject(mockWBS, { ...mockInput, qualityLevel: 'mvp' });
    const enterpriseResult = engine.estimateProject(mockWBS, { ...mockInput, qualityLevel: 'enterprise' });

    // Enterprise quality should require more effort
    expect(enterpriseResult.totals.totalMDs).toBeGreaterThan(mvpResult.totals.totalMDs);
  });
});
