// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'estimation_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

WBSModule _$WBSModuleFromJson(Map<String, dynamic> json) => WBSModule(
      name: json['name'] as String,
      complexity: json['complexity'] as String,
      notes: json['notes'] as String,
      primaryRole: json['primary_role'] as String?,
    );

Map<String, dynamic> _$WBSModuleToJson(WBSModule instance) => <String, dynamic>{
      'name': instance.name,
      'complexity': instance.complexity,
      'notes': instance.notes,
      'primary_role': instance.primaryRole,
    };

WBSEpic _$WBSEpicFromJson(Map<String, dynamic> json) => WBSEpic(
      name: json['name'] as String,
      assumptions: (json['assumptions'] as List<dynamic>)
          .map((e) => e as String)
          .toList(),
      risks: (json['risks'] as List<dynamic>).map((e) => e as String).toList(),
      modules: (json['modules'] as List<dynamic>)
          .map((e) => WBSModule.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$WBSEpicToJson(WBSEpic instance) => <String, dynamic>{
      'name': instance.name,
      'assumptions': instance.assumptions,
      'risks': instance.risks,
      'modules': instance.modules,
    };

WBS _$WBSFromJson(Map<String, dynamic> json) => WBS(
      epics: (json['epics'] as List<dynamic>)
          .map((e) => WBSEpic.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$WBSToJson(WBS instance) => <String, dynamic>{
      'epics': instance.epics,
    };

ModuleEstimate _$ModuleEstimateFromJson(Map<String, dynamic> json) =>
    ModuleEstimate(
      name: json['name'] as String,
      complexity: json['complexity'] as String,
      basePoints: (json['basePoints'] as num).toInt(),
      multipliers: (json['multipliers'] as Map<String, dynamic>).map(
        (k, e) => MapEntry(k, (e as num).toDouble()),
      ),
      totalPoints: (json['totalPoints'] as num).toInt(),
      weeks: (json['weeks'] as num).toDouble(),
      role: json['role'] as String,
      notes: json['notes'] as String,
      complexityRationale: json['complexityRationale'] as String?,
      assumptions: (json['assumptions'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      whyMatters: json['whyMatters'] as String?,
    );

Map<String, dynamic> _$ModuleEstimateToJson(ModuleEstimate instance) =>
    <String, dynamic>{
      'name': instance.name,
      'complexity': instance.complexity,
      'basePoints': instance.basePoints,
      'multipliers': instance.multipliers,
      'totalPoints': instance.totalPoints,
      'weeks': instance.weeks,
      'role': instance.role,
      'notes': instance.notes,
      'complexityRationale': instance.complexityRationale,
      'assumptions': instance.assumptions,
      'whyMatters': instance.whyMatters,
    };

RoleEffortNew _$RoleEffortNewFromJson(Map<String, dynamic> json) =>
    RoleEffortNew(
      role: json['role'] as String,
      effortWeeks: (json['effortWeeks'] as num).toDouble(),
      percentage: (json['percentage'] as num).toDouble(),
    );

Map<String, dynamic> _$RoleEffortNewToJson(RoleEffortNew instance) =>
    <String, dynamic>{
      'role': instance.role,
      'effortWeeks': instance.effortWeeks,
      'percentage': instance.percentage,
    };

ProjectTotals _$ProjectTotalsFromJson(Map<String, dynamic> json) =>
    ProjectTotals(
      developmentMDs: (json['developmentMDs'] as num).toDouble(),
      accessibilityMDs: (json['accessibilityMDs'] as num).toDouble(),
      externalApisMDs: (json['externalApisMDs'] as num).toDouble(),
      appStorePublishingMDs: (json['appStorePublishingMDs'] as num).toDouble(),
      bugFixingMDs: (json['bugFixingMDs'] as num).toDouble(),
      totalMDs: (json['totalMDs'] as num).toDouble(),
    );

Map<String, dynamic> _$ProjectTotalsToJson(ProjectTotals instance) =>
    <String, dynamic>{
      'developmentMDs': instance.developmentMDs,
      'accessibilityMDs': instance.accessibilityMDs,
      'externalApisMDs': instance.externalApisMDs,
      'appStorePublishingMDs': instance.appStorePublishingMDs,
      'bugFixingMDs': instance.bugFixingMDs,
      'totalMDs': instance.totalMDs,
    };

EstimationMeta _$EstimationMetaFromJson(Map<String, dynamic> json) =>
    EstimationMeta(
      provider: json['provider'] as String,
      model: json['model'] as String,
      sessionId: json['sessionId'] as String,
      latencyMs: (json['latencyMs'] as num).toInt(),
      retryCount: (json['retryCount'] as num).toInt(),
      inputTokens: (json['inputTokens'] as num).toInt(),
      outputTokens: (json['outputTokens'] as num).toInt(),
      totalTokens: (json['totalTokens'] as num).toInt(),
      timestamp: json['timestamp'] as String,
    );

Map<String, dynamic> _$EstimationMetaToJson(EstimationMeta instance) =>
    <String, dynamic>{
      'provider': instance.provider,
      'model': instance.model,
      'sessionId': instance.sessionId,
      'latencyMs': instance.latencyMs,
      'retryCount': instance.retryCount,
      'inputTokens': instance.inputTokens,
      'outputTokens': instance.outputTokens,
      'totalTokens': instance.totalTokens,
      'timestamp': instance.timestamp,
    };

EstimationResponse _$EstimationResponseFromJson(Map<String, dynamic> json) =>
    EstimationResponse(
      wbs: WBS.fromJson(json['wbs'] as Map<String, dynamic>),
      modules: (json['modules'] as List<dynamic>)
          .map((e) => ModuleEstimate.fromJson(e as Map<String, dynamic>))
          .toList(),
      roles: (json['roles'] as List<dynamic>)
          .map((e) => RoleEffortNew.fromJson(e as Map<String, dynamic>))
          .toList(),
      totals: ProjectTotals.fromJson(json['totals'] as Map<String, dynamic>),
      optimistic: (json['optimistic'] as num).toDouble(),
      mostLikely: (json['mostLikely'] as num).toDouble(),
      pessimistic: (json['pessimistic'] as num).toDouble(),
      velocity: (json['velocity'] as num).toInt(),
      bufferUsed: (json['bufferUsed'] as num).toDouble(),
      assumptions: (json['assumptions'] as List<dynamic>)
          .map((e) => e as String)
          .toList(),
      risks: (json['risks'] as List<dynamic>).map((e) => e as String).toList(),
    );

Map<String, dynamic> _$EstimationResponseToJson(EstimationResponse instance) =>
    <String, dynamic>{
      'wbs': instance.wbs,
      'modules': instance.modules,
      'roles': instance.roles,
      'totals': instance.totals,
      'optimistic': instance.optimistic,
      'mostLikely': instance.mostLikely,
      'pessimistic': instance.pessimistic,
      'velocity': instance.velocity,
      'bufferUsed': instance.bufferUsed,
      'assumptions': instance.assumptions,
      'risks': instance.risks,
    };

EstimationApiResponse _$EstimationApiResponseFromJson(
        Map<String, dynamic> json) =>
    EstimationApiResponse(
      success: json['success'] as bool,
      data: EstimationResponse.fromJson(json['data'] as Map<String, dynamic>),
      meta: EstimationMeta.fromJson(json['meta'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$EstimationApiResponseToJson(
        EstimationApiResponse instance) =>
    <String, dynamic>{
      'success': instance.success,
      'data': instance.data,
      'meta': instance.meta,
    };
