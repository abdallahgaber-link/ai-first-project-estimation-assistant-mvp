import '../models/estimation_response.dart';

class SampleResults {
  static const bool enableSampleResults = false; // Feature flag for testing
  
  static EstimationResponse getSampleForProject(String projectTitle) {
    // Create a simple sample response that matches the actual model structure
    return const EstimationResponse(
      optimistic: 10.2,
      mostLikely: 12.6,
      pessimistic: 16.8,
      velocity: 8,
      bufferUsed: 0.25,
      assumptions: [
        'Team has experience with Flutter development',
        'APIs are well documented',
        'Basic UI/UX designs are provided'
      ],
      risks: [
        'Integration complexity may increase timeline',
        'Third-party service dependencies',
        'Performance optimization requirements'
      ],
      wbs: WBS(
        epics: [
          WBSEpic(
            name: 'Core Features',
            assumptions: ['Standard development flow'],
            risks: ['Integration complexity'],
            modules: [
              WBSModule(
                name: 'Authentication',
                complexity: 'Medium',
                notes: 'User login and registration',
                primaryRole: 'Frontend Developer',
              ),
              WBSModule(
                name: 'Main Features',
                complexity: 'High',
                notes: 'Core application functionality',
                primaryRole: 'Full-Stack Developer',
              ),
            ],
          ),
        ],
      ),
      modules: [
        ModuleEstimate(
          name: 'User Authentication',
          complexity: 'Medium',
          basePoints: 8,
          multipliers: {'experience': 1.0, 'complexity': 1.2},
          totalPoints: 10,
          weeks: 2.5,
          role: 'Frontend Developer',
          notes: 'Login, registration, password reset',
          assumptions: ['Standard OAuth flow'],
        ),
        ModuleEstimate(
          name: 'Core Features',
          complexity: 'High',
          basePoints: 15,
          multipliers: {'experience': 1.0, 'complexity': 1.5},
          totalPoints: 23,
          weeks: 5.8,
          role: 'Full-Stack Developer',
          notes: 'Main application functionality',
          assumptions: ['Well-defined requirements'],
        ),
        ModuleEstimate(
          name: 'Integration & Testing',
          complexity: 'Medium',
          basePoints: 6,
          multipliers: {'experience': 1.0, 'complexity': 1.1},
          totalPoints: 7,
          weeks: 1.8,
          role: 'QA Engineer',
          notes: 'System integration and testing',
          assumptions: ['Standard testing practices'],
        ),
      ],
      roles: [
        RoleEffortNew(
          role: 'Frontend Developer',
          effortWeeks: 4.7,
          percentage: 37.0,
        ),
        RoleEffortNew(
          role: 'Full-Stack Developer',
          effortWeeks: 6.0,
          percentage: 48.0,
        ),
        RoleEffortNew(
          role: 'QA Engineer',
          effortWeeks: 1.9,
          percentage: 15.0,
        ),
      ],
      totals: ProjectTotals(
        developmentMDs: 9.5,
        accessibilityMDs: 1.0,
        externalApisMDs: 1.4,
        appStorePublishingMDs: 0.5,
        bugFixingMDs: 0.2,
        totalMDs: 12.6,
      ),
    );
  }
}
