// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'estimation_request.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

EstimationRequest _$EstimationRequestFromJson(Map<String, dynamic> json) =>
    EstimationRequest(
      projectTitle: json['projectTitle'] as String,
      description: json['description'] as String,
      platforms:
          (json['platforms'] as List<dynamic>).map((e) => e as String).toList(),
      integrations: (json['integrations'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
      nfrs:
          (json['nfrs'] as List<dynamic>?)?.map((e) => e as String).toList() ??
              const [],
      languagesCount: (json['languagesCount'] as num?)?.toInt() ?? 1,
      teamExperience: json['teamExperience'] as String? ?? 'mid',
      qualityLevel: json['qualityLevel'] as String? ?? 'production',
      constraints: json['constraints'] as String?,
      outputLanguage: json['outputLanguage'] as String? ?? 'en',
    );

Map<String, dynamic> _$EstimationRequestToJson(EstimationRequest instance) =>
    <String, dynamic>{
      'projectTitle': instance.projectTitle,
      'description': instance.description,
      'platforms': instance.platforms,
      'integrations': instance.integrations,
      'nfrs': instance.nfrs,
      'languagesCount': instance.languagesCount,
      'teamExperience': instance.teamExperience,
      'qualityLevel': instance.qualityLevel,
      'constraints': instance.constraints,
      'outputLanguage': instance.outputLanguage,
    };

RoleEffort _$RoleEffortFromJson(Map<String, dynamic> json) => RoleEffort(
      role: json['role'] as String,
      effortWeeks: (json['effortWeeks'] as num).toDouble(),
      percentage: (json['percentage'] as num).toDouble(),
      description: json['description'] as String?,
    );

Map<String, dynamic> _$RoleEffortToJson(RoleEffort instance) =>
    <String, dynamic>{
      'role': instance.role,
      'effortWeeks': instance.effortWeeks,
      'percentage': instance.percentage,
      'description': instance.description,
    };

EstimationBreakdown _$EstimationBreakdownFromJson(Map<String, dynamic> json) =>
    EstimationBreakdown(
      id: json['id'] as String,
      name: json['name'] as String,
      effortPoints: (json['effortPoints'] as num).toDouble(),
      effortWeeks: (json['effortWeeks'] as num).toDouble(),
      roles: (json['roles'] as List<dynamic>)
          .map((e) => RoleEffort.fromJson(e as Map<String, dynamic>))
          .toList(),
      children: (json['children'] as List<dynamic>?)
              ?.map((e) =>
                  EstimationBreakdown.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
    );

Map<String, dynamic> _$EstimationBreakdownToJson(
        EstimationBreakdown instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'effortPoints': instance.effortPoints,
      'effortWeeks': instance.effortWeeks,
      'roles': instance.roles,
      'children': instance.children,
    };

Risk _$RiskFromJson(Map<String, dynamic> json) => Risk(
      description: json['description'] as String,
      impact: json['impact'] as String,
      probability: json['probability'] as String?,
      mitigation: json['mitigation'] as String?,
    );

Map<String, dynamic> _$RiskToJson(Risk instance) => <String, dynamic>{
      'description': instance.description,
      'impact': instance.impact,
      'probability': instance.probability,
      'mitigation': instance.mitigation,
    };

Estimation _$EstimationFromJson(Map<String, dynamic> json) => Estimation(
      projectId: json['projectId'] as String,
      projectName: json['projectName'] as String,
      createdAt: json['createdAt'] as String,
      updatedAt: json['updatedAt'] as String,
      totalEffortPoints: (json['totalEffortPoints'] as num).toDouble(),
      teamVelocity: (json['teamVelocity'] as num).toDouble(),
      sprintLengthWeeks: (json['sprintLengthWeeks'] as num).toDouble(),
      bufferPercent: (json['bufferPercent'] as num).toDouble(),
      optimisticWeeks: (json['optimisticWeeks'] as num).toDouble(),
      mostLikelyWeeks: (json['mostLikelyWeeks'] as num).toDouble(),
      pessimisticWeeks: (json['pessimisticWeeks'] as num).toDouble(),
      roles: (json['roles'] as List<dynamic>)
          .map((e) => RoleEffort.fromJson(e as Map<String, dynamic>))
          .toList(),
      breakdown: EstimationBreakdown.fromJson(
          json['breakdown'] as Map<String, dynamic>),
      assumptions: (json['assumptions'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
      risks: (json['risks'] as List<dynamic>?)
              ?.map((e) => Risk.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      configuration: json['configuration'] as Map<String, dynamic>? ?? const {},
    );

Map<String, dynamic> _$EstimationToJson(Estimation instance) =>
    <String, dynamic>{
      'projectId': instance.projectId,
      'projectName': instance.projectName,
      'createdAt': instance.createdAt,
      'updatedAt': instance.updatedAt,
      'totalEffortPoints': instance.totalEffortPoints,
      'teamVelocity': instance.teamVelocity,
      'sprintLengthWeeks': instance.sprintLengthWeeks,
      'bufferPercent': instance.bufferPercent,
      'optimisticWeeks': instance.optimisticWeeks,
      'mostLikelyWeeks': instance.mostLikelyWeeks,
      'pessimisticWeeks': instance.pessimisticWeeks,
      'roles': instance.roles,
      'breakdown': instance.breakdown,
      'assumptions': instance.assumptions,
      'risks': instance.risks,
      'configuration': instance.configuration,
    };
