import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../models/estimation_request.dart';
import '../services/api_service.dart';
import '../widgets/loading_overlay.dart';
import '../utils/responsive_utils.dart';
import '../data/sample_projects.dart';
import 'results_screen_mobile.dart';

class DescribeScreenMobile extends HookConsumerWidget {
  const DescribeScreenMobile({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Always log for debugging
    print('🚀 DescribeScreenMobile build called');
    print('🎯 SampleProjects.enableAutoLoad: ${SampleProjects.enableAutoLoad}');

    // Initialize with sample data if feature flag is enabled
    final sample =
        SampleProjects.enableAutoLoad ? SampleProjects.getRandomSample() : null;

    if (sample != null) {
      print('✅ Sample generated: ${sample.projectTitle}');
    } else {
      print('❌ No sample data generated');
    }

    final titleController = useTextEditingController(
      text: sample?.projectTitle ?? '',
    );
    final descriptionController = useTextEditingController(
      text: sample?.description ?? '',
    );
    final constraintsController = useTextEditingController(
      text: sample?.constraints ?? '',
    );
    final isLoading = useState(false);
    final selectedPlatforms =
        useState<Set<String>>(sample?.platforms.toSet() ?? {'web'});
    final selectedIntegrations =
        useState<Set<String>>(sample?.integrations.toSet() ?? {});
    final selectedNfrs = useState<Set<String>>(sample?.nfrs.toSet() ?? {});
    final languagesCount = useState(sample?.languagesCount ?? 1);
    final teamExperience = useState(sample?.teamExperience ?? 'mid');
    final qualityLevel = useState(sample?.qualityLevel ?? 'production');
    final outputLanguage = useState(sample?.outputLanguage ?? 'en');

    // Debug logging
    if (SampleProjects.enableAutoLoad && sample != null) {
      print('🔥 Sample data initialized: ${sample.projectTitle}');
      print('📱 Platform: ${defaultTargetPlatform.toString()}');
      print('🌐 Is Web: ${kIsWeb}');
      print('📝 Title controller text: "${titleController.text}"');
      print(
          '📄 Description controller text length: ${descriptionController.text.length}');
      print('🏗️ Constraints controller text: "${constraintsController.text}"');
    }

    final platforms = ['web', 'mobile', 'desktop'];
    final integrations = [
      'REST API',
      'GraphQL',
      'Database',
      'Authentication',
      'Payment Gateway',
      'File Storage',
      'Email Service',
      'Push Notifications'
    ];
    final nfrs = [
      'High Performance',
      'Scalability',
      'Security',
      'Accessibility',
      'SEO Optimization',
      'Offline Support',
      'Real-time Updates',
      'Multi-language Support'
    ];

    Future<void> generateEstimation() async {
      if (titleController.text.isEmpty || descriptionController.text.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please fill in the required fields')),
        );
        return;
      }

      isLoading.value = true;
      try {
        final request = EstimationRequest(
          projectTitle: titleController.text,
          description: descriptionController.text,
          constraints: constraintsController.text,
          platforms: selectedPlatforms.value.toList(),
          integrations: selectedIntegrations.value.toList(),
          nfrs: selectedNfrs.value.toList(),
          languagesCount: languagesCount.value,
          teamExperience: teamExperience.value,
          qualityLevel: qualityLevel.value,
          outputLanguage: outputLanguage.value,
        );

        final apiResponse = await ApiService.generateEstimation(request);

        if (apiResponse.success && context.mounted) {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => ResultsScreenMobile(
                estimation: apiResponse.data,
                meta: apiResponse.meta,
                projectTitle: titleController.text,
              ),
            ),
          );
        }
      } catch (e) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Error: ${e.toString()}')),
          );
        }
      } finally {
        isLoading.value = false;
      }
    }

    // Function to load sample data manually
    void loadSampleData() {
      final sample = SampleProjects.getRandomSample();
      titleController.text = sample.projectTitle;
      descriptionController.text = sample.description;
      constraintsController.text = sample.constraints ?? '';
      selectedPlatforms.value = sample.platforms.toSet();
      selectedIntegrations.value = sample.integrations.toSet();
      selectedNfrs.value = sample.nfrs.toSet();
      languagesCount.value = sample.languagesCount;
      teamExperience.value = sample.teamExperience;
      qualityLevel.value = sample.qualityLevel;
      outputLanguage.value = sample.outputLanguage;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Loaded sample: ${sample.projectTitle}')),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Project Estimation Assistant',
          style: TextStyle(
            fontSize: ResponsiveUtils.isMobile(context) ? 18.sp : 20.sp,
          ),
        ),
        centerTitle: true,
        actions: [
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [Colors.orange.shade400, Colors.orange.shade600],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: Colors.orange.withOpacity(0.3),
                  blurRadius: 4,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                borderRadius: BorderRadius.circular(12),
                onTap: loadSampleData,
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.science, color: Colors.white, size: 18),
                      const SizedBox(width: 4),
                      Text(
                        'Sample',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
      body: LoadingOverlay(
        isLoading: isLoading.value,
        message: 'Analyzing your project requirements...',
        provider: 'AI Assistant',
        model: 'Multi-Provider LLM',
        child: SingleChildScrollView(
          padding: ResponsiveUtils.getResponsivePadding(context),
          child: Center(
            child: ConstrainedBox(
              constraints: BoxConstraints(
                maxWidth: ResponsiveUtils.getMaxContentWidth(context),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Project Description Card
                  Card(
                    child: Padding(
                      padding: ResponsiveUtils.getResponsivePadding(context),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Project Description',
                            style: Theme.of(context)
                                .textTheme
                                .headlineSmall
                                ?.copyWith(
                                  fontSize:
                                      ResponsiveUtils.getResponsiveFontSize(
                                          context, 20),
                                ),
                          ),
                          SizedBox(
                              height: ResponsiveUtils.getResponsiveSpacing(
                                  context)),
                          TextField(
                            controller: titleController,
                            textCapitalization: TextCapitalization.words,
                            textInputAction: TextInputAction.next,
                            decoration: const InputDecoration(
                              labelText: 'Project Title *',
                              hintText: 'Enter your project title',
                              border: OutlineInputBorder(),
                              prefixIcon: Icon(Icons.title),
                            ),
                          ),
                          SizedBox(
                              height: ResponsiveUtils.getResponsiveSpacing(
                                  context)),
                          TextField(
                            controller: descriptionController,
                            maxLines: ResponsiveUtils.isMobile(context) ? 3 : 4,
                            textCapitalization: TextCapitalization.sentences,
                            textInputAction: TextInputAction.newline,
                            decoration: const InputDecoration(
                              labelText: 'Project Description *',
                              hintText:
                                  'Describe your project requirements, features, and goals...',
                              border: OutlineInputBorder(),
                              prefixIcon: Icon(Icons.description),
                              alignLabelWithHint: true,
                            ),
                          ),
                          SizedBox(
                              height: ResponsiveUtils.getResponsiveSpacing(
                                  context)),
                          TextField(
                            controller: constraintsController,
                            maxLines: ResponsiveUtils.isMobile(context) ? 2 : 3,
                            textCapitalization: TextCapitalization.sentences,
                            textInputAction: TextInputAction.done,
                            decoration: const InputDecoration(
                              labelText: 'Constraints & Requirements',
                              hintText:
                                  'Any specific constraints, deadlines, or technical requirements...',
                              border: OutlineInputBorder(),
                              prefixIcon: Icon(Icons.rule),
                              alignLabelWithHint: true,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  SizedBox(
                      height: ResponsiveUtils.getResponsiveSpacing(context)),

                  // Technical Requirements Card
                  Card(
                    child: Padding(
                      padding: ResponsiveUtils.getResponsivePadding(context),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Technical Requirements',
                            style: Theme.of(context)
                                .textTheme
                                .headlineSmall
                                ?.copyWith(
                                  fontSize:
                                      ResponsiveUtils.getResponsiveFontSize(
                                          context, 20),
                                ),
                          ),
                          SizedBox(
                              height: ResponsiveUtils.getResponsiveSpacing(
                                  context)),

                          // Platforms
                          Text(
                            'Target Platforms',
                            style: Theme.of(context)
                                .textTheme
                                .titleMedium
                                ?.copyWith(
                                  fontSize:
                                      ResponsiveUtils.getResponsiveFontSize(
                                          context, 16),
                                ),
                          ),
                          SizedBox(
                              height: ResponsiveUtils.getResponsiveSpacing(
                                      context) /
                                  2),
                          Wrap(
                            spacing:
                                ResponsiveUtils.isMobile(context) ? 6.0 : 8.0,
                            runSpacing:
                                ResponsiveUtils.isMobile(context) ? 6.0 : 8.0,
                            children: platforms.map((platform) {
                              return FilterChip(
                                label: Text(
                                  platform.toUpperCase(),
                                  style: TextStyle(
                                    fontSize: ResponsiveUtils.isMobile(context)
                                        ? 12.sp
                                        : 14.sp,
                                  ),
                                ),
                                selected:
                                    selectedPlatforms.value.contains(platform),
                                onSelected: (selected) {
                                  final newSet =
                                      Set<String>.from(selectedPlatforms.value);
                                  if (selected) {
                                    newSet.add(platform);
                                  } else {
                                    newSet.remove(platform);
                                  }
                                  selectedPlatforms.value = newSet;
                                },
                              );
                            }).toList(),
                          ),
                          SizedBox(
                              height: ResponsiveUtils.getResponsiveSpacing(
                                  context)),

                          // Integrations
                          Text(
                            'Integrations',
                            style: Theme.of(context)
                                .textTheme
                                .titleMedium
                                ?.copyWith(
                                  fontSize:
                                      ResponsiveUtils.getResponsiveFontSize(
                                          context, 16),
                                ),
                          ),
                          SizedBox(
                              height: ResponsiveUtils.getResponsiveSpacing(
                                      context) /
                                  2),
                          Wrap(
                            spacing:
                                ResponsiveUtils.isMobile(context) ? 6.0 : 8.0,
                            runSpacing:
                                ResponsiveUtils.isMobile(context) ? 6.0 : 8.0,
                            children: integrations.map((integration) {
                              return FilterChip(
                                label: Text(
                                  integration,
                                  style: TextStyle(
                                    fontSize: ResponsiveUtils.isMobile(context)
                                        ? 11.sp
                                        : 13.sp,
                                  ),
                                ),
                                selected: selectedIntegrations.value
                                    .contains(integration),
                                onSelected: (selected) {
                                  final newSet = Set<String>.from(
                                      selectedIntegrations.value);
                                  if (selected) {
                                    newSet.add(integration);
                                  } else {
                                    newSet.remove(integration);
                                  }
                                  selectedIntegrations.value = newSet;
                                },
                              );
                            }).toList(),
                          ),
                          SizedBox(
                              height: ResponsiveUtils.getResponsiveSpacing(
                                  context)),

                          // Non-Functional Requirements
                          Text(
                            'Non-Functional Requirements',
                            style: Theme.of(context)
                                .textTheme
                                .titleMedium
                                ?.copyWith(
                                  fontSize:
                                      ResponsiveUtils.getResponsiveFontSize(
                                          context, 16),
                                ),
                          ),
                          SizedBox(
                              height: ResponsiveUtils.getResponsiveSpacing(
                                      context) /
                                  2),
                          Wrap(
                            spacing:
                                ResponsiveUtils.isMobile(context) ? 6.0 : 8.0,
                            runSpacing:
                                ResponsiveUtils.isMobile(context) ? 6.0 : 8.0,
                            children: nfrs.map((nfr) {
                              return FilterChip(
                                label: Text(
                                  nfr,
                                  style: TextStyle(
                                    fontSize: ResponsiveUtils.isMobile(context)
                                        ? 11.sp
                                        : 13.sp,
                                  ),
                                ),
                                selected: selectedNfrs.value.contains(nfr),
                                onSelected: (selected) {
                                  final newSet =
                                      Set<String>.from(selectedNfrs.value);
                                  if (selected) {
                                    newSet.add(nfr);
                                  } else {
                                    newSet.remove(nfr);
                                  }
                                  selectedNfrs.value = newSet;
                                },
                              );
                            }).toList(),
                          ),
                        ],
                      ),
                    ),
                  ),
                  SizedBox(
                      height: ResponsiveUtils.getResponsiveSpacing(context)),

                  // Project Settings Card
                  Card(
                    child: Padding(
                      padding: ResponsiveUtils.getResponsivePadding(context),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Project Settings',
                            style: Theme.of(context)
                                .textTheme
                                .headlineSmall
                                ?.copyWith(
                                  fontSize:
                                      ResponsiveUtils.getResponsiveFontSize(
                                          context, 20),
                                ),
                          ),
                          SizedBox(
                              height: ResponsiveUtils.getResponsiveSpacing(
                                  context)),

                          // Languages Count
                          Row(
                            children: [
                              Expanded(
                                flex: 3,
                                child: Text(
                                  'Number of Languages',
                                  style: TextStyle(
                                    fontSize:
                                        ResponsiveUtils.getResponsiveFontSize(
                                            context, 14),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                flex: 2,
                                child: Container(
                                  constraints:
                                      const BoxConstraints(minWidth: 0),
                                  child: DropdownButtonFormField<int>(
                                    value: languagesCount.value,
                                    isExpanded: true,
                                    decoration: const InputDecoration(
                                      border: OutlineInputBorder(),
                                      contentPadding: EdgeInsets.symmetric(
                                          horizontal: 4, vertical: 6),
                                      isDense: true,
                                    ),
                                    items:
                                        List.generate(10, (index) => index + 1)
                                            .map((count) => DropdownMenuItem(
                                                  value: count,
                                                  child: FittedBox(
                                                    fit: BoxFit.scaleDown,
                                                    child: Text('$count'),
                                                  ),
                                                ))
                                            .toList(),
                                    onChanged: (value) {
                                      if (value != null)
                                        languagesCount.value = value;
                                    },
                                  ),
                                ),
                              ),
                            ],
                          ),
                          SizedBox(
                              height: ResponsiveUtils.getResponsiveSpacing(
                                  context)),

                          // Team Experience
                          Row(
                            children: [
                              Expanded(
                                flex: 3,
                                child: Text(
                                  'Team Experience',
                                  style: TextStyle(
                                    fontSize:
                                        ResponsiveUtils.getResponsiveFontSize(
                                            context, 14),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                flex: 4,
                                child: Container(
                                  constraints:
                                      const BoxConstraints(minWidth: 0),
                                  child: DropdownButtonFormField<String>(
                                    value: teamExperience.value,
                                    isExpanded: true,
                                    decoration: const InputDecoration(
                                      border: OutlineInputBorder(),
                                      contentPadding: EdgeInsets.symmetric(
                                          horizontal: 4, vertical: 6),
                                      isDense: true,
                                    ),
                                    items: const [
                                      DropdownMenuItem(
                                        value: 'junior',
                                        child: FittedBox(
                                          fit: BoxFit.scaleDown,
                                          child: Text('Junior'),
                                        ),
                                      ),
                                      DropdownMenuItem(
                                        value: 'mid',
                                        child: FittedBox(
                                          fit: BoxFit.scaleDown,
                                          child: Text('Mid-level'),
                                        ),
                                      ),
                                      DropdownMenuItem(
                                        value: 'senior',
                                        child: FittedBox(
                                          fit: BoxFit.scaleDown,
                                          child: Text('Senior'),
                                        ),
                                      ),
                                    ],
                                    onChanged: (value) {
                                      if (value != null)
                                        teamExperience.value = value;
                                    },
                                  ),
                                ),
                              ),
                            ],
                          ),
                          SizedBox(
                              height: ResponsiveUtils.getResponsiveSpacing(
                                  context)),

                          // Quality Level
                          Row(
                            children: [
                              Expanded(
                                flex: 3,
                                child: Text(
                                  'Quality Level',
                                  style: TextStyle(
                                    fontSize:
                                        ResponsiveUtils.getResponsiveFontSize(
                                            context, 14),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                flex: 4,
                                child: Container(
                                  constraints:
                                      const BoxConstraints(minWidth: 0),
                                  child: DropdownButtonFormField<String>(
                                    value: qualityLevel.value,
                                    isExpanded: true,
                                    decoration: const InputDecoration(
                                      border: OutlineInputBorder(),
                                      contentPadding: EdgeInsets.symmetric(
                                          horizontal: 4, vertical: 6),
                                      isDense: true,
                                    ),
                                    items: const [
                                      DropdownMenuItem(
                                        value: 'mvp',
                                        child: FittedBox(
                                          fit: BoxFit.scaleDown,
                                          child: Text('MVP'),
                                        ),
                                      ),
                                      DropdownMenuItem(
                                        value: 'production',
                                        child: FittedBox(
                                          fit: BoxFit.scaleDown,
                                          child: Text('Production'),
                                        ),
                                      ),
                                      DropdownMenuItem(
                                        value: 'enterprise',
                                        child: FittedBox(
                                          fit: BoxFit.scaleDown,
                                          child: Text('Enterprise'),
                                        ),
                                      ),
                                    ],
                                    onChanged: (value) {
                                      if (value != null)
                                        qualityLevel.value = value;
                                    },
                                  ),
                                ),
                              ),
                            ],
                          ),
                          SizedBox(
                              height: ResponsiveUtils.getResponsiveSpacing(
                                  context)),

                          // Output Language
                          Row(
                            children: [
                              Expanded(
                                flex: 3,
                                child: Text(
                                  'Output Language',
                                  style: TextStyle(
                                    fontSize:
                                        ResponsiveUtils.getResponsiveFontSize(
                                            context, 14),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                flex: 4,
                                child: Container(
                                  constraints:
                                      const BoxConstraints(minWidth: 0),
                                  child: DropdownButtonFormField<String>(
                                    value: outputLanguage.value,
                                    isExpanded: true,
                                    decoration: const InputDecoration(
                                      border: OutlineInputBorder(),
                                      contentPadding: EdgeInsets.symmetric(
                                          horizontal: 4, vertical: 6),
                                      isDense: true,
                                    ),
                                    items: const [
                                      DropdownMenuItem(
                                        value: 'en',
                                        child: FittedBox(
                                          fit: BoxFit.scaleDown,
                                          child: Text('English'),
                                        ),
                                      ),
                                      DropdownMenuItem(
                                        value: 'ar',
                                        child: FittedBox(
                                          fit: BoxFit.scaleDown,
                                          child: Text('العربية'),
                                        ),
                                      ),
                                    ],
                                    onChanged: (value) {
                                      if (value != null)
                                        outputLanguage.value = value;
                                    },
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                  SizedBox(
                      height: ResponsiveUtils.getResponsiveSpacing(context)),

                  // Generate Button
                  SizedBox(
                    width: double.infinity,
                    height: ResponsiveUtils.isMobile(context) ? 48.h : 56.h,
                    child: ElevatedButton(
                      onPressed: isLoading.value ? null : generateEstimation,
                      style: ElevatedButton.styleFrom(
                        textStyle: TextStyle(
                          fontSize: ResponsiveUtils.getResponsiveFontSize(
                              context, 16),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      child: const Text('Generate Estimation'),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
