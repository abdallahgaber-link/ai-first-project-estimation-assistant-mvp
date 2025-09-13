// Estimation Configuration Constants

export const ESTIMATION_CONSTANTS = {
  // Story Points
  POINTS: {
    L: 3,
    M: 5,
    H: 8
  },

  // Role Distribution (by module primary role)
  ROLE_SPLIT: {
    'Frontend/Flutter': 0.6,
    'Backend': 0.2,
    'QA': 0.15,
    'DevOps': 0.05,
    'UI/UX': 0.1 // Allocate 0.1 of module weeks
  },

  // Velocity and Buffer
  VELOCITY_DEFAULT: 20, // points per 2-week sprint
  BUFFER_DEFAULT: 0.20, // 20%

  // Feature Multipliers
  MULTIPLIERS: {
    payments: 0.25,
    auth: 0.10,
    offline: 0.15,
    maps: 0.10,
    i18n_per_lang: 0.10,
    accessibility: 0.10,
    push: 0.05
  },

  // Time Conversion
  HOURS_PER_MD: 8,
  WORKDAYS_PER_WEEK: 5,

  // Project Totals Percentages
  ACCESSIBILITY_PCT: 0.10,
  EXTERNAL_APIS_PCT: 0.10,
  BUGFIX_PCT: 0.30,
  STORE_MDS_FIXED: 12
};

// Role Mapping Keywords
export const ROLE_KEYWORDS: Record<string, string[]> = {
  'Frontend/Flutter': [
    'ui', 'view', 'screen', 'flutter', 'cart', 'map', 'notifications', 'offline',
    'interface', 'component', 'widget', 'navigation', 'form', 'button', 'modal',
    'responsive', 'mobile', 'web', 'client', 'frontend', 'display', 'layout',
    'dashboard', 'profile', 'listing', 'gallery', 'menu', 'sidebar', 'header',
    'footer', 'search', 'filter', 'pagination', 'animation', 'transition'
  ],
  'Backend': [
    'api', 'auth service', 'webhook', 'db', 'payment', 'server', 'backend',
    'database', 'authentication', 'authorization', 'middleware', 'endpoint',
    'service', 'controller', 'model', 'repository', 'validation', 'security',
    'encryption', 'session', 'token', 'jwt', 'oauth', 'integration', 'sync',
    'queue', 'job', 'worker', 'cache', 'redis', 'mongodb', 'postgresql',
    'mysql', 'sql', 'nosql', 'migration', 'seed', 'backup', 'restore'
  ],
  'DevOps': [
    'ci/cd', 'pipeline', 'monitoring', 'release', 'store', 'deployment',
    'infrastructure', 'docker', 'kubernetes', 'aws', 'azure', 'gcp',
    'terraform', 'ansible', 'jenkins', 'github actions', 'gitlab ci',
    'nginx', 'apache', 'load balancer', 'cdn', 'ssl', 'certificate',
    'domain', 'dns', 'firewall', 'vpc', 'scaling', 'auto-scaling',
    'logging', 'metrics', 'alerting', 'backup', 'disaster recovery'
  ],
  'QA': [
    'test', 'qa', 'automation', 'testing', 'unit test', 'integration test',
    'e2e test', 'acceptance test', 'regression test', 'performance test',
    'load test', 'stress test', 'security test', 'usability test',
    'bug', 'defect', 'issue', 'verification', 'validation', 'coverage',
    'selenium', 'cypress', 'jest', 'mocha', 'jasmine', 'pytest'
  ],
  'UI/UX': [
    'design', 'wireframe', 'prototype', 'mockup', 'figma', 'sketch',
    'adobe xd', 'user experience', 'user interface', 'usability',
    'accessibility', 'a11y', 'color scheme', 'typography', 'branding',
    'style guide', 'design system', 'persona', 'user journey',
    'information architecture', 'interaction design', 'visual design'
  ]
};

export const DEFAULT_ROLE = 'Frontend/Flutter';
