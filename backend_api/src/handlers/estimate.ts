import { Hono } from 'hono';
import { z } from 'zod';
import { getLLMService } from '../lib/llm';
import logger from '../services/logger.service';

// Input validation schema
const EstimateRequestSchema = z.object({
  projectTitle: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  platforms: z.array(z.string()).min(1, 'At least one platform is required'),
  integrations: z.array(z.string()).default([]),
  nfrs: z.array(z.string()).default([]),
  languagesCount: z.number().int().min(1).default(1),
  teamExperience: z.enum(['junior', 'mid', 'senior']).default('mid'),
  qualityLevel: z.enum(['mvp', 'production', 'enterprise']).default('production'),
  constraints: z.string().optional(),
  outputLanguage: z.enum(['ar', 'en']).default('en'),
});


// Create a new router for estimate endpoints
export const estimateHandler = new Hono();

// POST /api/estimate
estimateHandler.post('/', async (c) => {
  const startTime = Date.now();
  
  try {
    // Validate request body
    const input = await c.req.json();
    const data = EstimateRequestSchema.parse(input);

    // Log estimation request
    logger.logEstimationRequest(
      data.projectTitle,
      data.platforms.length,
      data.qualityLevel,
      0, // Will be updated after completion
      {
        platforms: data.platforms,
        teamExperience: data.teamExperience,
        languagesCount: data.languagesCount
      }
    );

    // Generate estimation using LLM
    logger.debug('Getting LLM Service');
    const llmService = getLLMService();
    logger.debug('Calling generateEstimation');
    const { result: estimation, meta } = await llmService.generateEstimation(data);

    // Log LLM call details
    logger.logLLMCall(
      meta.provider,
      meta.model,
      meta.totalTokens,
      meta.latencyMs,
      true,
      meta.retryCount,
      {
        sessionId: meta.sessionId,
        inputTokens: meta.inputTokens,
        outputTokens: meta.outputTokens
      }
    );

    // Log successful completion
    const totalDuration = Date.now() - startTime;
    logger.logEstimationRequest(
      data.projectTitle,
      data.platforms.length,
      data.qualityLevel,
      totalDuration,
      { success: true, modulesGenerated: estimation.modules.length }
    );

    // Return the estimation with meta information
    return c.json({
      success: true,
      data: estimation,
      meta: {
        provider: meta.provider,
        model: meta.model,
        sessionId: meta.sessionId,
        latencyMs: meta.latencyMs,
        retryCount: meta.retryCount,
        inputTokens: meta.inputTokens,
        outputTokens: meta.outputTokens,
        totalTokens: meta.totalTokens,
        timestamp: meta.timestamp
      }
    });
  } catch (error: any) {
    const totalDuration = Date.now() - startTime;
    logger.error('Estimation failed', error, {
      duration: totalDuration,
      endpoint: '/api/estimate'
    });
    
    if (error.name === 'ValidationError') {
      return c.json(
        { 
          success: false, 
          error: 'Validation Error',
          details: error.errors || error.message 
        },
        400
      );
    }
    
    return c.json(
      { 
        success: false, 
        error: 'Failed to generate estimation',
        message: error.message || 'Unknown error' 
      },
      500
    );
  }
});

// GET /api/estimate/sample - For testing without LLM calls
estimateHandler.get('/sample', async (c) => {
  const sampleEstimation = {
    projectId: 'sample-123',
    projectName: 'Sample Project',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    totalEffortPoints: 100,
    teamVelocity: 20,
    sprintLengthWeeks: 2,
    bufferPercent: 20,
    optimisticWeeks: 8,
    mostLikelyWeeks: 10,
    pessimisticWeeks: 15,
    roles: [
      { role: 'Frontend Developer', effortWeeks: 20, percentage: 30 },
      { role: 'Backend Developer', effortWeeks: 25, percentage: 37.5 },
      { role: 'DevOps Engineer', effortWeeks: 10, percentage: 15 },
      { role: 'QA Engineer', effortWeeks: 8, percentage: 12 },
      { role: 'UI/UX Designer', effortWeeks: 4, percentage: 6 },
    ],
    breakdown: {
      id: 'root',
      name: 'Sample Project',
      effortPoints: 100,
      effortWeeks: 10,
      roles: [
        { role: 'Frontend Developer', effortWeeks: 20, percentage: 30 },
        { role: 'Backend Developer', effortWeeks: 25, percentage: 37.5 },
      ],
      children: [
        {
          id: 'fe-1',
          name: 'Frontend Development',
          effortPoints: 40,
          effortWeeks: 8,
          roles: [
            { role: 'Frontend Developer', effortWeeks: 20, percentage: 50 },
          ],
          children: [],
        },
        {
          id: 'be-1',
          name: 'Backend Development',
          effortPoints: 50,
          effortWeeks: 10,
          roles: [
            { role: 'Backend Developer', effortWeeks: 25, percentage: 50 },
          ],
          children: [],
        },
      ],
    },
    assumptions: [
      'All third-party services will be available as expected',
      'No major scope changes during development',
    ],
    risks: [
      {
        description: 'Third-party API may have rate limiting',
        impact: 'medium',
        probability: 'medium',
        mitigation: 'Implement caching and request batching',
      },
    ],
    configuration: {
      pointsPerWeek: 10,
      roleSplit: {
        'Frontend Developer': 0.3,
        'Backend Developer': 0.3,
        'DevOps Engineer': 0.15,
        'QA Engineer': 0.15,
        'UI/UX Designer': 0.1,
      },
      multipliers: {
        web: 1.0,
        mobile: 1.2,
        desktop: 1.1,
        simpleIntegration: 1.0,
        mediumIntegration: 1.3,
        complexIntegration: 1.7,
        juniorTeam: 1.5,
        midLevelTeam: 1.0,
        seniorTeam: 0.8,
        mvp: 0.8,
        production: 1.0,
        enterprise: 1.5,
      },
    },
  };

  return c.json({ success: true, data: sampleEstimation });
});
