import { ESTIMATION_CONSTANTS, ROLE_KEYWORDS, DEFAULT_ROLE } from '../config/constants';

export interface WBSModule {
  name: string;
  complexity: 'L' | 'M' | 'H';
  notes: string;
  primary_role?: string;
}

export interface WBSEpic {
  name: string;
  assumptions: string[];
  risks: string[];
  modules: WBSModule[];
}

export interface WBSResponse {
  epics: WBSEpic[];
}

export interface EstimationInput {
  projectTitle: string;
  description: string;
  platforms: string[];
  integrations: string[];
  nfrs: string[];
  languagesCount: number;
  teamExperience: string;
  qualityLevel: string;
  constraints?: string;
  outputLanguage?: 'ar' | 'en';
}

export interface ModuleEstimate {
  name: string;
  complexity: 'L' | 'M' | 'H';
  basePoints: number;
  multipliers: Record<string, number>;
  totalPoints: number;
  weeks: number;
  role: string;
  notes: string;
  complexityRationale?: string;
  assumptions?: string[];
  whyMatters?: string;
}

export interface RoleEffort {
  role: string;
  effortWeeks: number;
  percentage: number;
}

export interface ProjectTotals {
  developmentMDs: number;
  accessibilityMDs: number;
  externalApisMDs: number;
  appStorePublishingMDs: number;
  bugFixingMDs: number;
  totalMDs: number;
}

export interface EstimationResult {
  wbs: WBSResponse;
  modules: ModuleEstimate[];
  roles: RoleEffort[];
  totals: ProjectTotals;
  optimistic: number; // weeks
  mostLikely: number; // weeks
  pessimistic: number; // weeks
  velocity: number;
  bufferUsed: number;
  assumptions: string[];
  risks: string[];
}

export class EstimationEngine {
  private velocity: number;
  private bufferPercent: number;

  constructor(velocity?: number, bufferPercent?: number) {
    this.velocity = velocity || ESTIMATION_CONSTANTS.VELOCITY_DEFAULT;
    this.bufferPercent = bufferPercent || ESTIMATION_CONSTANTS.BUFFER_DEFAULT;
  }

  estimateProject(wbs: WBSResponse, input: EstimationInput): EstimationResult {
    // Extract all modules from epics
    const allModules = wbs.epics.flatMap(epic => epic.modules);
    
    // Calculate module estimates
    const moduleEstimates = allModules.map(module => this.estimateModule(module, input));
    
    // Calculate total weeks from module estimates
    const baseWeeks = moduleEstimates.reduce((sum, mod) => sum + mod.weeks, 0);
    
    // Apply buffer once
    const bufferedWeeks = baseWeeks * (1 + this.bufferPercent);
    
    // Calculate role distribution
    const roles = this.calculateRoleDistribution(moduleEstimates, bufferedWeeks);
    
    // Calculate project totals
    const totals = this.calculateProjectTotals(bufferedWeeks);
    
    // Calculate O/M/P estimates
    const optimistic = bufferedWeeks * 0.8;
    const mostLikely = bufferedWeeks;
    const pessimistic = bufferedWeeks * 1.3;
    
    // Collect assumptions and risks
    const assumptions = [...new Set(wbs.epics.flatMap(epic => epic.assumptions))];
    const risks = [...new Set(wbs.epics.flatMap(epic => epic.risks))];

    return {
      wbs,
      modules: moduleEstimates,
      roles,
      totals,
      optimistic,
      mostLikely,
      pessimistic,
      velocity: this.velocity,
      bufferUsed: this.bufferPercent,
      assumptions,
      risks
    };
  }

  private estimateModule(module: WBSModule, input: EstimationInput): ModuleEstimate {
    // Get base points for complexity
    const basePoints = ESTIMATION_CONSTANTS.POINTS[module.complexity];
    
    // Calculate multipliers based on project features
    const multipliers: Record<string, number> = {};
    
    // Check for feature multipliers
    const moduleNameLower = module.name.toLowerCase();
    const descriptionLower = input.description.toLowerCase();
    const allText = `${moduleNameLower} ${descriptionLower} ${input.integrations.join(' ')} ${input.nfrs.join(' ')}`.toLowerCase();
    
    if (allText.includes('payment') || allText.includes('billing')) {
      multipliers.payments = ESTIMATION_CONSTANTS.MULTIPLIERS.payments;
    }
    
    if (allText.includes('auth') || allText.includes('login') || allText.includes('security')) {
      multipliers.auth = ESTIMATION_CONSTANTS.MULTIPLIERS.auth;
    }
    
    if (allText.includes('offline') || allText.includes('sync')) {
      multipliers.offline = ESTIMATION_CONSTANTS.MULTIPLIERS.offline;
    }
    
    if (allText.includes('map') || allText.includes('location') || allText.includes('gps')) {
      multipliers.maps = ESTIMATION_CONSTANTS.MULTIPLIERS.maps;
    }
    
    if (allText.includes('notification') || allText.includes('push')) {
      multipliers.push = ESTIMATION_CONSTANTS.MULTIPLIERS.push;
    }
    
    if (allText.includes('accessibility') || allText.includes('a11y')) {
      multipliers.accessibility = ESTIMATION_CONSTANTS.MULTIPLIERS.accessibility;
    }
    
    // Add i18n multiplier based on languages count
    if (input.languagesCount > 1) {
      multipliers.i18n = ESTIMATION_CONSTANTS.MULTIPLIERS.i18n_per_lang * (input.languagesCount - 1);
    }
    
    // Calculate total multiplier (multiply all multipliers together)
    const totalMultiplier = Object.values(multipliers).reduce((product, mult) => product * (1 + mult), 1);
    const totalPoints = Math.round(basePoints * totalMultiplier);
    
    // Convert to weeks (points / velocity per 2-week sprint)
    const weeks = (totalPoints / this.velocity) * 2;
    
    // Determine role
    const role = this.determineModuleRole(module);
    
    // Generate explanations
    const complexityRationale = this.generateComplexityRationale(module);
    const assumptions = this.generateModuleAssumptions(module, input);
    const whyMatters = this.generateWhyMatters(module, role);
    
    return {
      name: module.name,
      complexity: module.complexity,
      basePoints,
      multipliers,
      totalPoints,
      weeks,
      role,
      notes: module.notes,
      complexityRationale,
      assumptions,
      whyMatters
    };
  }

  private generateComplexityRationale(module: WBSModule): string {
    const complexityMap = {
      'L': 'Low complexity - straightforward implementation with minimal dependencies',
      'M': 'Medium complexity - requires moderate planning and integration work',
      'H': 'High complexity - involves complex logic, multiple integrations, or significant technical challenges'
    };
    
    return complexityMap[module.complexity];
  }

  private generateModuleAssumptions(module: WBSModule, input: EstimationInput): string[] {
    const assumptions: string[] = [];
    
    // Base assumptions
    assumptions.push('Development environment is properly configured');
    assumptions.push('Required dependencies and libraries are available');
    
    // Complexity-based assumptions
    if (module.complexity === 'H') {
      assumptions.push('Senior developer involvement required');
      assumptions.push('Additional testing and code review time allocated');
    }
    
    // Feature-specific assumptions
    const moduleText = `${module.name} ${module.notes}`.toLowerCase();
    if (moduleText.includes('api') || input.integrations.some(i => i.toLowerCase().includes('api'))) {
      assumptions.push('External API documentation is complete and accurate');
    }
    
    if (moduleText.includes('auth') || moduleText.includes('security')) {
      assumptions.push('Security requirements are clearly defined');
    }
    
    return assumptions;
  }

  private generateWhyMatters(_module: WBSModule, role: string): string {
    const roleImpact = {
      'Frontend/React': 'directly impacts user experience and interface responsiveness',
      'Frontend/Flutter': 'affects mobile user experience and app performance',
      'Backend/Node.js': 'influences system scalability and data processing capabilities',
      'DevOps': 'ensures reliable deployment and system maintenance',
      'QA': 'validates functionality and prevents production issues',
      'UI/UX': 'shapes user satisfaction and product usability'
    };
    
    const impact = roleImpact[role as keyof typeof roleImpact] || 'contributes to overall system functionality';
    return `This module ${impact}. Proper implementation ensures project success and maintainability.`;
  }

  private determineModuleRole(module: WBSModule): string {
    // Use primary_role if specified
    if (module.primary_role) {
      return module.primary_role;
    }
    
    // Enhanced keyword mapping with scoring
    const moduleText = `${module.name} ${module.notes}`.toLowerCase();
    const roleScores: Record<string, number> = {};
    
    // Score each role based on keyword matches
    for (const [role, keywords] of Object.entries(ROLE_KEYWORDS)) {
      let score = 0;
      keywords.forEach(keyword => {
        const keywordLower = keyword.toLowerCase();
        // Exact word match gets higher score
        const exactMatches = (moduleText.match(new RegExp(`\\b${keywordLower}\\b`, 'g')) || []).length;
        // Partial match gets lower score
        const partialMatches = (moduleText.match(new RegExp(keywordLower, 'g')) || []).length - exactMatches;
        
        score += exactMatches * 3 + partialMatches * 1;
      });
      
      if (score > 0) {
        roleScores[role] = score;
      }
    }
    
    // Return role with highest score
    if (Object.keys(roleScores).length > 0) {
      return Object.entries(roleScores).reduce((a, b) => roleScores[a[0]] > roleScores[b[0]] ? a : b)[0];
    }
    
    return DEFAULT_ROLE;
  }

  private calculateRoleDistribution(modules: ModuleEstimate[], totalWeeks: number): RoleEffort[] {
    const roleWeeks: Record<string, number> = {};
    
    // Calculate weeks per role based on modules
    modules.forEach(module => {
      const role = module.role;
      
      if (role === 'UI/UX') {
        // UI/UX gets 0.1 of module weeks
        roleWeeks[role] = (roleWeeks[role] || 0) + (module.weeks * 0.1);
      } else {
        roleWeeks[role] = (roleWeeks[role] || 0) + module.weeks;
      }
    });
    
    // Normalize to total weeks
    const totalCalculatedWeeks = Object.values(roleWeeks).reduce((sum, weeks) => sum + weeks, 0);
    const scaleFactor = totalWeeks / totalCalculatedWeeks;
    
    // Apply scale factor and calculate percentages
    const roles: RoleEffort[] = Object.entries(roleWeeks).map(([role, weeks]) => {
      const scaledWeeks = weeks * scaleFactor;
      return {
        role,
        effortWeeks: scaledWeeks,
        percentage: (scaledWeeks / totalWeeks) * 100
      };
    });
    
    return roles.sort((a, b) => b.effortWeeks - a.effortWeeks);
  }

  private calculateProjectTotals(developmentWeeks: number): ProjectTotals {
    const developmentMDs = developmentWeeks * ESTIMATION_CONSTANTS.WORKDAYS_PER_WEEK;
    
    const accessibilityMDs = developmentMDs * ESTIMATION_CONSTANTS.ACCESSIBILITY_PCT;
    const externalApisMDs = developmentMDs * ESTIMATION_CONSTANTS.EXTERNAL_APIS_PCT;
    const appStorePublishingMDs = ESTIMATION_CONSTANTS.STORE_MDS_FIXED;
    const bugFixingMDs = developmentMDs * ESTIMATION_CONSTANTS.BUGFIX_PCT;
    
    const totalMDs = developmentMDs + accessibilityMDs + externalApisMDs + appStorePublishingMDs + bugFixingMDs;
    
    return {
      developmentMDs,
      accessibilityMDs,
      externalApisMDs,
      appStorePublishingMDs,
      bugFixingMDs,
      totalMDs
    };
  }
}
