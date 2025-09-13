import 'package:flutter_test/flutter_test.dart';
import 'package:project_estimation_assistant/models/estimation_request.dart';

void main() {
  group('EstimationRequest', () {
    test('should create EstimationRequest with default values', () {
      const request = EstimationRequest(
        projectTitle: 'Test Project',
        description: 'Test description',
        platforms: ['web'],
      );

      expect(request.projectTitle, 'Test Project');
      expect(request.description, 'Test description');
      expect(request.platforms, ['web']);
      expect(request.integrations, isEmpty);
      expect(request.nfrs, isEmpty);
      expect(request.languagesCount, 1);
      expect(request.teamExperience, 'mid');
      expect(request.qualityLevel, 'production');
      expect(request.outputLanguage, 'en');
    });

    test('should serialize to JSON correctly', () {
      const request = EstimationRequest(
        projectTitle: 'Test Project',
        description: 'Test description',
        platforms: ['web', 'mobile'],
        integrations: ['REST API'],
        nfrs: ['High Performance'],
        languagesCount: 2,
        teamExperience: 'senior',
        qualityLevel: 'enterprise',
        outputLanguage: 'ar',
      );

      final json = request.toJson();

      expect(json['projectTitle'], 'Test Project');
      expect(json['description'], 'Test description');
      expect(json['platforms'], ['web', 'mobile']);
      expect(json['integrations'], ['REST API']);
      expect(json['nfrs'], ['High Performance']);
      expect(json['languagesCount'], 2);
      expect(json['teamExperience'], 'senior');
      expect(json['qualityLevel'], 'enterprise');
      expect(json['outputLanguage'], 'ar');
    });

    test('should deserialize from JSON correctly', () {
      final json = {
        'projectTitle': 'Test Project',
        'description': 'Test description',
        'platforms': ['web'],
        'integrations': ['Database'],
        'nfrs': ['Security'],
        'languagesCount': 1,
        'teamExperience': 'junior',
        'qualityLevel': 'mvp',
        'outputLanguage': 'en',
      };

      final request = EstimationRequest.fromJson(json);

      expect(request.projectTitle, 'Test Project');
      expect(request.description, 'Test description');
      expect(request.platforms, ['web']);
      expect(request.integrations, ['Database']);
      expect(request.nfrs, ['Security']);
      expect(request.languagesCount, 1);
      expect(request.teamExperience, 'junior');
      expect(request.qualityLevel, 'mvp');
      expect(request.outputLanguage, 'en');
    });
  });
}
