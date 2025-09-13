import 'dart:convert';
import 'dart:developer' as developer;
import 'dart:typed_data';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:file_saver/file_saver.dart';
import '../models/estimation_response.dart';
import '../models/estimation_request.dart';
import '../data/sample_results.dart';

class ApiService {
  static String get baseUrl {
    // For Android emulator, use 10.0.2.2 to access host machine
    // For iOS simulator and web, use localhost
    if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
      return 'http://10.0.2.2:3000/api';
    } else {
      return 'http://localhost:3000/api';
    }
  }
  
  static Future<EstimationApiResponse> generateEstimation(EstimationRequest request) async {
    developer.log('🚀 Making API request to: $baseUrl/estimate');
    developer.log('📤 Request body: ${jsonEncode(request.toJson())}');
    
    // Check if we should use sample results for testing
    if (SampleResults.enableSampleResults) {
      developer.log('🧪 Using sample results for testing');
      await Future.delayed(const Duration(seconds: 2)); // Simulate API delay
      
      final sampleResponse = SampleResults.getSampleForProject(request.projectTitle);
      final sampleMeta = EstimationMeta(
        provider: 'Sample AI',
        model: 'demo-model-v1',
        sessionId: 'sample-${DateTime.now().millisecondsSinceEpoch}',
        latencyMs: 2000,
        retryCount: 0,
        inputTokens: 150,
        outputTokens: 800,
        totalTokens: 950,
        timestamp: DateTime.now().toIso8601String(),
      );
      
      return EstimationApiResponse(
        success: true,
        data: sampleResponse,
        meta: sampleMeta,
      );
    }
    
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/estimate'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode(request.toJson()),
      );

      developer.log('📥 Response status: ${response.statusCode}');
      developer.log('📥 Response body: ${response.body}');

      if (response.statusCode == 200) {
        final Map<String, dynamic> jsonData = jsonDecode(response.body);
        return EstimationApiResponse.fromJson(jsonData);
      } else {
        throw Exception('Failed to generate estimation: ${response.statusCode}');
      }
    } catch (e) {
      developer.log('❌ API Error: $e');
      rethrow;
    }
  }

  static Future<void> exportEstimation(EstimationResponse estimation, String projectTitle, String format) async {
    developer.log('🚀 Starting export - format: $format, project: $projectTitle');
    
    final response = await http.post(
      Uri.parse('$baseUrl/export'),
      headers: {
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'projectTitle': projectTitle,
        'estimation': estimation.toJson(),
        'format': format,
      }),
    );

    developer.log('📥 Export response status: ${response.statusCode}');
    developer.log('📥 Export response headers: ${response.headers}');

    if (response.statusCode != 200) {
      developer.log('❌ Export failed: ${response.body}');
      throw Exception('Failed to export estimation: ${response.body}');
    }

    // Extract filename from Content-Disposition header or create one
    String filename = '${projectTitle.replaceAll(RegExp(r'[^a-zA-Z0-9]'), '_')}_estimation.$format';
    final contentDisposition = response.headers['content-disposition'];
    if (contentDisposition != null) {
      final match = RegExp(r'filename="([^"]*)"').firstMatch(contentDisposition);
      if (match != null) {
        filename = match.group(1)!;
      }
    }

    // Use FileSaver to save the file
    final bytes = Uint8List.fromList(response.bodyBytes);
    
    // Determine MIME type based on format
    MimeType mimeType;
    switch (format.toLowerCase()) {
      case 'csv':
        mimeType = MimeType.csv;
        break;
      case 'xlsx':
        mimeType = MimeType.microsoftExcel;
        break;
      case 'pdf':
        mimeType = MimeType.pdf;
        break;
      default:
        mimeType = MimeType.other;
    }

    await FileSaver.instance.saveFile(
      name: filename,
      bytes: bytes,
      mimeType: mimeType,
    );

    developer.log('✅ File saved successfully: $filename');
  }

  static Future<EstimationResponse> getSampleEstimation() async {
    developer.log('🚀 Making sample API request to: $baseUrl/estimate/sample');
    
    final response = await http.get(
      Uri.parse('$baseUrl/estimate/sample'),
      headers: {
        'Content-Type': 'application/json',
      },
    );

    developer.log('📥 Sample response status: ${response.statusCode}');
    developer.log('📥 Sample response body: ${response.body}');

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      developer.log('✅ Successfully parsed sample response data');
      return EstimationResponse.fromJson(data['data']);
    } else {
      developer.log('❌ Sample API request failed with status: ${response.statusCode}');
      throw Exception('Failed to get sample estimation: ${response.body}');
    }
  }
}
