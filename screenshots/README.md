# Screenshots Guide

## Web Screenshots Needed

Please take the following screenshots and save them in the `screenshots/web/` directory with these exact names:

### 1. Main Input Screen
**Filename:** `01-input-screen.png`
- Show the main project description form
- Include all input fields filled with sample data
- Show the provider selection and language options

### 2. Loading Screen
**Filename:** `02-loading-screen.png`
- Capture the loading animation with provider information
- Show the progress indicator and status messages

### 3. Results Overview
**Filename:** `03-results-overview.png`
- Show the main results screen with summary cards
- Include the optimistic/most likely/pessimistic timeline
- Show the effort breakdown and team velocity metrics

### 4. Modules Tab
**Filename:** `04-modules-tab.png`
- Display the modules breakdown view
- Show module cards with complexity indicators
- Include the effort distribution and role assignments

### 5. Roles Tab
**Filename:** `05-roles-tab.png`
- Show the roles breakdown with effort percentages
- Display the team composition chart
- Include role-specific effort calculations

### 6. WBS Tab
**Filename:** `06-wbs-tab.png`
- Capture the Work Breakdown Structure view
- Show the hierarchical task organization
- Include effort estimates for each component

### 7. Risks Tab
**Filename:** `07-risks-tab.png`
- Display identified project risks
- Show risk severity indicators (High/Medium/Low)
- Include risk descriptions and categorization

### 8. Export Options
**Filename:** `08-export-options.png`
- Show the export dropdown menu
- Display CSV, XLSX, and PDF options
- Capture the export button in action

## Mobile Screenshots

### Android Screenshots
Save in `screenshots/mobile/android/` with these exact names:

#### Portrait Mode (Primary)
1. **`01-input-screen.png`** - Main input form in portrait orientation
2. **`02-loading-screen.png`** - Loading screen with provider info
3. **`03-results-overview.png`** - Results overview with summary cards
4. **`04-modules-tab.png`** - Modules tab with scrollable list
5. **`05-roles-tab.png`** - Roles breakdown view
6. **`06-wbs-tab.png`** - WBS hierarchical view
7. **`07-risks-tab.png`** - Risks assessment screen
8. **`08-export-options.png`** - Export options menu

#### Landscape Mode (Optional)
9. **`09-results-landscape.png`** - Results in landscape for tablet view
10. **`10-modules-landscape.png`** - Modules in landscape orientation

### iOS Screenshots
Save in `screenshots/mobile/ios/` with these exact names:

#### Portrait Mode (Primary)
1. **`01-input-screen.png`** - Main input form in portrait orientation
2. **`02-loading-screen.png`** - Loading screen with provider info
3. **`03-results-overview.png`** - Results overview with summary cards
4. **`04-modules-tab.png`** - Modules tab with scrollable list
5. **`05-roles-tab.png`** - Roles breakdown view
6. **`06-wbs-tab.png`** - WBS hierarchical view
7. **`07-risks-tab.png`** - Risks assessment screen
8. **`08-export-options.png`** - Export options menu

#### Landscape Mode (Optional)
9. **`09-results-landscape.png`** - Results in landscape for iPad view
10. **`10-modules-landscape.png`** - Modules in landscape orientation

### Mobile Testing Commands

#### Android Testing
```bash
# Start Android emulator or connect device
flutter run -d android

# For specific device
flutter devices
flutter run -d <device_id>
```

#### iOS Testing (macOS only)
```bash
# Start iOS simulator
flutter run -d ios

# For specific simulator
flutter run -d "iPhone 15 Pro"
flutter run -d "iPad Pro"
```

## Screenshot Guidelines

- Use full browser window captures for web screenshots
- Ensure good lighting and clear visibility
- Capture actual data, not empty states
- Use consistent browser zoom level (100%)
- Take screenshots in landscape orientation for web
- Include browser UI for context in web screenshots
