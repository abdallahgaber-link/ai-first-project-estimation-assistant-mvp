/**
 * Default estimation constants
 */

export const DEFAULT_ROLE_SPLIT = {
  'Frontend Developer': 0.3,
  'Backend Developer': 0.3,
  'DevOps Engineer': 0.15,
  'QA Engineer': 0.15,
  'UI/UX Designer': 0.1,
} as const;

export const DEFAULT_MULTIPLIERS = {
  // Platform multipliers
  web: 1.0,
  mobile: 1.2,
  desktop: 1.1,
  
  // Integration complexity
  simpleIntegration: 1.0,
  mediumIntegration: 1.3,
  complexIntegration: 1.7,
  
  // Team experience
  juniorTeam: 1.5,
  midLevelTeam: 1.0,
  seniorTeam: 0.8,
  
  // Quality level
  mvp: 0.8,
  production: 1.0,
  enterprise: 1.5,
} as const;

export const DEFAULT_TEAM_VELOCITY = 20; // story points per sprint
export const DEFAULT_SPRINT_LENGTH_WEEKS = 2;
export const DEFAULT_BUFFER_PERCENT = 20; // percentage

export const POINTS = {
  // Base points for different types of work
  SIMPLE_FEATURE: 1,
  MEDIUM_FEATURE: 3,
  COMPLEX_FEATURE: 8,
  
  // Integration points
  SIMPLE_INTEGRATION: 2,
  MEDIUM_INTEGRATION: 5,
  COMPLEX_INTEGRATION: 13,
  
  // Testing
  UNIT_TEST: 1,
  INTEGRATION_TEST: 2,
  E2E_TEST: 3,
  
  // Documentation
  SIMPLE_DOC: 1,
  MEDIUM_DOC: 2,
  COMPLEX_DOC: 5,
} as const;

export const ROLE_EFFORT_MULTIPLIERS = {
  'Frontend Developer': 1.0,
  'Backend Developer': 1.0,
  'DevOps Engineer': 0.8,
  'QA Engineer': 0.7,
  'UI/UX Designer': 0.6,
} as const;
