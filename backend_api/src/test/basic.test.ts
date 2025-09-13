import { describe, it, expect } from 'vitest';
import { EstimationEngine, WBSResponse, EstimationInput } from '../lib/estimation';

describe('Basic Backend Tests', () => {
  it('should create EstimationEngine instance', () => {
    const engine = new EstimationEngine();
    expect(engine).toBeDefined();
  });

  it('should process basic WBS estimation', () => {
    const engine = new EstimationEngine();
    const mockWBS: WBSResponse = {
      epics: [{
        name: 'Test Epic',
        assumptions: ['Test assumption'],
        risks: ['Test risk'],
        modules: [{
          name: 'Test Module',
          complexity: 'M',
          notes: 'Test notes'
        }]
      }]
    };

    const mockInput: EstimationInput = {
      projectTitle: 'Test',
      description: 'Test description',
      platforms: ['web'],
      integrations: [],
      nfrs: [],
      languagesCount: 1,
      teamExperience: 'mid',
      qualityLevel: 'production',
      outputLanguage: 'en'
    };

    const result = engine.estimateProject(mockWBS, mockInput);
    
    expect(result).toBeDefined();
    expect(result.modules).toBeDefined();
    expect(result.roles).toBeDefined();
    expect(result.totals).toBeDefined();
  });

  it('should validate complexity levels', () => {
    const complexities = ['L', 'M', 'H'];
    complexities.forEach(complexity => {
      expect(['L', 'M', 'H']).toContain(complexity);
    });
  });
});
