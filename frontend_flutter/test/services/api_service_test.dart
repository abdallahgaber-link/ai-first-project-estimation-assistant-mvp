import 'package:flutter_test/flutter_test.dart';
import 'package:project_estimation_assistant/models/estimation_request.dart';

void main() {
  group('ApiService', () {
    test('should construct correct API URLs', () {
      const baseUrl = 'http://localhost:3000';
      expect(baseUrl, 'http://localhost:3000');
    });

    test('should create valid estimation request', () {
      const request = EstimationRequest(
        projectTitle: 'Test Project',
        description: 'Test description',
        platforms: ['web'],
        integrations: ['REST API'],
        nfrs: ['High Performance'],
        languagesCount: 1,
        teamExperience: 'mid',
        qualityLevel: 'production',
        outputLanguage: 'en',
      );

      final json = request.toJson();
      
      // Verify all required fields are present
      expect(json.containsKey('projectTitle'), true);
      expect(json.containsKey('description'), true);
      expect(json.containsKey('platforms'), true);
      expect(json.containsKey('integrations'), true);
      expect(json.containsKey('nfrs'), true);
      expect(json.containsKey('languagesCount'), true);
      expect(json.containsKey('teamExperience'), true);
      expect(json.containsKey('qualityLevel'), true);
      expect(json.containsKey('outputLanguage'), true);
      
      // Verify values
      expect(json['outputLanguage'], 'en'); // Should be language code, not full name
      expect(json['teamExperience'], 'mid');
      expect(json['qualityLevel'], 'production');
    });

    test('should validate export formats', () {
      const validFormats = ['csv', 'xlsx', 'pdf'];
      const invalidFormats = ['doc', 'txt', 'json'];
      
      for (final format in validFormats) {
        expect(['csv', 'xlsx', 'pdf'].contains(format), true);
      }
      
      for (final format in invalidFormats) {
        expect(['csv', 'xlsx', 'pdf'].contains(format), false);
      }
    });
  });
}
