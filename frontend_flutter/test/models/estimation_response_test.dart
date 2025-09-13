import 'package:flutter_test/flutter_test.dart';
import 'package:project_estimation_assistant/models/estimation_response.dart';

void main() {
  group('EstimationResponse Models', () {
    test('should create WBSModule correctly', () {
      const module = WBSModule(
        name: 'Test Module',
        complexity: 'M',
        notes: 'Test notes',
        primaryRole: 'Frontend/React',
      );

      expect(module.name, 'Test Module');
      expect(module.complexity, 'M');
      expect(module.notes, 'Test notes');
      expect(module.primaryRole, 'Frontend/React');
    });

    test('should create ModuleEstimate correctly', () {
      const module = ModuleEstimate(
        name: 'Test Module',
        complexity: 'H',
        basePoints: 8,
        multipliers: {'auth': 0.5},
        totalPoints: 12,
        weeks: 1.2,
        role: 'Backend/Node.js',
        notes: 'Complex module',
      );

      expect(module.name, 'Test Module');
      expect(module.complexity, 'H');
      expect(module.basePoints, 8);
      expect(module.multipliers['auth'], 0.5);
      expect(module.totalPoints, 12);
      expect(module.weeks, 1.2);
      expect(module.role, 'Backend/Node.js');
      expect(module.notes, 'Complex module');
    });

    test('should create RoleEffortNew correctly', () {
      const role = RoleEffortNew(
        role: 'QA',
        effortWeeks: 2.5,
        percentage: 25.0,
      );

      expect(role.role, 'QA');
      expect(role.effortWeeks, 2.5);
      expect(role.percentage, 25.0);
    });

    test('should create ProjectTotals correctly', () {
      const totals = ProjectTotals(
        developmentMDs: 50.0,
        accessibilityMDs: 5.0,
        externalApisMDs: 5.0,
        appStorePublishingMDs: 60.0,
        bugFixingMDs: 15.0,
        totalMDs: 135.0,
      );

      expect(totals.developmentMDs, 50.0);
      expect(totals.accessibilityMDs, 5.0);
      expect(totals.externalApisMDs, 5.0);
      expect(totals.appStorePublishingMDs, 60.0);
      expect(totals.bugFixingMDs, 15.0);
      expect(totals.totalMDs, 135.0);
    });

    test('should serialize and deserialize EstimationResponse correctly', () {
      final json = {
        'wbs': {
          'epics': [
            {
              'name': 'Development',
              'assumptions': ['Test assumption'],
              'risks': ['Test risk'],
              'modules': [
                {
                  'name': 'Test Module',
                  'complexity': 'M',
                  'notes': 'Test notes',
                  'primary_role': 'Frontend/React'
                }
              ]
            }
          ]
        },
        'modules': [
          {
            'name': 'Test Module',
            'complexity': 'M',
            'basePoints': 5,
            'multipliers': {},
            'totalPoints': 5,
            'weeks': 0.5,
            'role': 'Frontend/React',
            'notes': 'Test notes'
          }
        ],
        'roles': [
          {
            'role': 'Frontend/React',
            'effortWeeks': 0.6,
            'percentage': 100.0
          }
        ],
        'totals': {
          'developmentMDs': 3.0,
          'accessibilityMDs': 0.3,
          'externalApisMDs': 0.3,
          'appStorePublishingMDs': 3.6,
          'bugFixingMDs': 0.9,
          'totalMDs': 8.1
        },
        'optimistic': 0.48,
        'mostLikely': 0.6,
        'pessimistic': 0.78,
        'velocity': 20,
        'bufferUsed': 0.2,
        'assumptions': ['Test assumption'],
        'risks': ['Test risk']
      };

      final response = EstimationResponse.fromJson(json);

      expect(response.wbs.epics, hasLength(1));
      expect(response.modules, hasLength(1));
      expect(response.roles, hasLength(1));
      expect(response.totals.totalMDs, 8.1);
      expect(response.optimistic, 0.48);
      expect(response.mostLikely, 0.6);
      expect(response.pessimistic, 0.78);
      expect(response.velocity, 20);
      expect(response.bufferUsed, 0.2);
      expect(response.assumptions, ['Test assumption']);
      expect(response.risks, ['Test risk']);

      // Test serialization back to JSON
      final serializedJson = response.toJson();
      expect(serializedJson['optimistic'], 0.48);
      expect(serializedJson['velocity'], 20);
    });
  });
}
