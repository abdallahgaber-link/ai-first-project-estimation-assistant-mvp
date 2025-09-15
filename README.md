# Project Estimation Assistant

A comprehensive tool for generating project estimations using AI-powered Work Breakdown Structure (WBS) analysis with **Azure OpenAI integration**.

## 🚀 Quick Start

**One-command startup:**
```bash
./start-app.sh
```

**Stop all services:**
```bash
./stop-app.sh
```

## ✨ Features

### 🤖 **Azure OpenAI Integration**
- **Enterprise-grade AI**: Azure OpenAI with shared token authentication
- **Query parameter authentication** for enhanced security compliance
- **Fail-fast behavior** with comprehensive error handling
- **Provider transparency** with usage metrics and session tracking

### 📊 **Advanced Estimation Engine**
- **Work Breakdown Structure** - AI-generated detailed project breakdown
- **Smart Role Mapping** - Intelligent keyword-based role assignment
- **Complexity Analysis** - L/M/H complexity with multipliers
- **Buffer Calculations** - Optimistic/Most Likely/Pessimistic estimates
- **Multi-language Support** - English and Arabic output

### 🎯 **Project Configuration**
- **Multi-platform Support** - Web, Mobile, Desktop considerations
- **Integration Factors** - REST API, GraphQL, Database, Auth, Payments
- **Non-Functional Requirements** - Performance, Security, Accessibility
- **Team Experience Factors** - Junior, Mid-level, Senior adjustments
- **Quality Levels** - MVP, Production, Enterprise requirements
- **Project Constraints** - Custom limitations and requirements

### 🌐 **Modern Interface**
- **Flutter Web Application** - Responsive, modern UI
- **Tabbed Results View** - Modules, Roles, WBS, Risks breakdown
- **Real-time Provider Info** - Loading screen with LLM provider details
- **Interactive Forms** - Dynamic platform and integration selection

### 📤 **Export & Reporting**
- **Multiple Formats** - JSON, CSV, Excel (XLSX), PDF
- **Comprehensive Reports** - Summary, detailed breakdowns, assumptions, risks
- **Professional Layout** - Ready for client presentation
- **Multi-sheet Excel** - Separate sheets for Summary, Roles, Modules, Assumptions, Risks

### 🔍 **Explainability & Insights**
- **Module Explanations** - Detailed complexity rationale and assumptions
- **Risk Prioritization** - Color-coded severity badges (High/Medium/Low)
- **Provider Transparency** - Real-time LLM provider info with performance metrics
- **Effort Breakdown** - Visual cards showing development, accessibility, APIs, publishing, bug fixing

### ⚙️ **Calibration & Fine-tuning**
- **Dynamic Calibration Panel** - Real-time estimation adjustments
- **Team Velocity Sliders** - Adjust based on actual team performance
- **Buffer Multipliers** - Fine-tune risk buffers
- **Complexity Adjustments** - Project-specific complexity scaling
- **Team Efficiency Factors** - Account for team experience and collaboration

### 📊 **Logging & Monitoring**
- **Winston Daily Rotation** - Comprehensive API call logging
- **Performance Tracking** - Latency, token usage, retry counts
- **Error Monitoring** - Detailed error tracking and debugging
- **Audit Trail** - Complete request/response logging with metadata

### 🔧 **Developer Features**
- **Comprehensive Logging** - Winston with daily rotation
- **API Validation** - Zod schemas with detailed error messages
- **CORS Support** - Configurable cross-origin requests
- **Health Monitoring** - Service status endpoints
- **Testing Suite** - Backend (Vitest) and Frontend (Flutter) tests

## 🛠 Tech Stack

### Backend
- **Framework**: TypeScript, Hono
- **LLM Provider**: Azure OpenAI with query parameter authentication
- **Validation**: Zod schemas
- **Logging**: Winston with daily-rotate-file
- **Export**: xlsx, pdf-lib for document generation
- **Testing**: Vitest

### Frontend
- **Framework**: Flutter Web
- **State Management**: Riverpod + Flutter Hooks
- **HTTP Client**: Dart HTTP package
- **JSON Serialization**: json_annotation + build_runner
- **Testing**: Flutter test framework

### AI & Models
- **Azure OpenAI**: GPT-4 with enterprise-grade security
- **Authentication**: Shared token via query parameters
- **Error Handling**: Fail-fast behavior with detailed error reporting

## 📸 Screenshots

### Web Application Interface

<div align="center">

#### Project Input & Configuration
<img src="screenshots/web/01-input-screen.png" alt="Project Input Screen" width="800"/>
<p><em>Comprehensive project description form with platform selection, integrations, and team configuration</em></p>

#### AI Processing & Loading
<img src="screenshots/web/02-loading-screen.png" alt="Loading Screen" width="800"/>
<p><em>Real-time LLM provider information with processing status and performance metrics</em></p>

#### Results Overview & Summary
<img src="screenshots/web/03-results-overview.png" alt="Results Overview" width="800"/>
<p><em>Executive summary with timeline estimates, effort breakdown, and key project metrics</em></p>

#### Detailed Modules Breakdown
<img src="screenshots/web/04-modules-tab.png" alt="Modules Tab" width="800"/>
<p><em>Comprehensive module analysis with complexity indicators and effort distribution</em></p>

#### Team Roles & Effort Distribution
<img src="screenshots/web/05-roles-tab.png" alt="Roles Tab" width="800"/>
<p><em>Team composition breakdown with role-specific effort percentages and assignments</em></p>

#### Work Breakdown Structure (WBS)
<img src="screenshots/web/06-wbs-tab.png" alt="WBS Tab" width="800"/>
<p><em>Hierarchical project structure with detailed task organization and effort estimates</em></p>

#### Risk Assessment & Analysis
<img src="screenshots/web/07-risks-tab.png" alt="Risks Tab" width="800"/>
<p><em>Comprehensive risk identification with severity categorization and impact analysis</em></p>

#### Export & Reporting Options
<img src="screenshots/web/08-export-options.png" alt="Export Options" width="800"/>
<p><em>Multiple export formats (CSV, XLSX, PDF) with professional report generation</em></p>

</div>

### Mobile Application Interface

<div align="center">

#### Android Screenshots
<table>
<tr>
<td align="center">
<img src="screenshots/mobile/android/01-input-screen.png" alt="Android Input Screen" width="300"/>
<br><em>Project Input Form</em>
</td>
<td align="center">
<img src="screenshots/mobile/android/02-loading-screen.png" alt="Android Loading Screen" width="300"/>
<br><em>AI Processing Status</em>
</td>
<td align="center">
<img src="screenshots/mobile/android/03-results-overview.png" alt="Android Results Overview" width="300"/>
<br><em>Results Overview</em>
</td>
</tr>
<tr>
<td align="center">
<img src="screenshots/mobile/android/04-modules-tab.png" alt="Android Modules Tab" width="300"/>
<br><em>Modules Breakdown</em>
</td>
<td align="center">
<img src="screenshots/mobile/android/05-roles-tab.png" alt="Android Roles Tab" width="300"/>
<br><em>Team Roles Distribution</em>
</td>
<td align="center">
<img src="screenshots/mobile/android/06-wbs-tab.png" alt="Android WBS Tab" width="300"/>
<br><em>Work Breakdown Structure</em>
</td>
</tr>
<tr>
<td align="center">
<img src="screenshots/mobile/android/07-risks-tab.png" alt="Android Risks Tab" width="300"/>
<br><em>Risk Assessment</em>
</td>
<td align="center">
<img src="screenshots/mobile/android/08-export-options.png" alt="Android Export Options" width="300"/>
<br><em>Export Options</em>
</td>
<td align="center">
<!-- Third column intentionally left empty for balanced layout -->
</td>
</tr>
</table>

#### iOS Screenshots
<table>
<tr>
<td align="center">
<img src="screenshots/mobile/ios/01-input-screen.png" alt="iOS Input Screen" width="300"/>
<br><em>Project Input Form</em>
</td>
<td align="center">
<img src="screenshots/mobile/ios/02-loading-screen.png" alt="iOS Loading Screen" width="300"/>
<br><em>AI Processing Status</em>
</td>
<td align="center">
<img src="screenshots/mobile/ios/03-results-overview.png" alt="iOS Results Overview" width="300"/>
<br><em>Results Overview</em>
</td>
</tr>
<tr>
<td align="center">
<img src="screenshots/mobile/ios/04-modules-tab.png" alt="iOS Modules Tab" width="300"/>
<br><em>Modules Breakdown</em>
</td>
<td align="center">
<img src="screenshots/mobile/ios/05-roles-tab.png" alt="iOS Roles Tab" width="300"/>
<br><em>Team Roles Distribution</em>
</td>
<td align="center">
<img src="screenshots/mobile/ios/06-wbs-tab.png" alt="iOS WBS Tab" width="300"/>
<br><em>Work Breakdown Structure</em>
</td>
</tr>
<tr>
<td align="center">
<img src="screenshots/mobile/ios/07-risks-tab.png" alt="iOS Risks Tab" width="300"/>
<br><em>Risk Assessment</em>
</td>
<td align="center">
<img src="screenshots/mobile/ios/08-export-options.png" alt="iOS Export Options" width="300"/>
<br><em>Export Options</em>
</td>
<td align="center">
<!-- Third column intentionally left empty for balanced layout -->
</td>
</tr>
</table>

</div>


## 🔧 Installation & Setup

### Prerequisites
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Flutter 3.0+** - [Install Guide](https://docs.flutter.dev/get-started/install)
- **Ollama** (for local AI) - `brew install ollama` or [Download](https://ollama.ai/)

### Quick Start (Automated)
```bash
# Clone the repository
git clone https://github.com/abdallahgaber-link/ai-first-project-estimation-assistant-mvp.git
cd ai-first-project-estimation-assistant-mvp

# Make scripts executable
chmod +x *.sh

# Start everything (installs dependencies automatically)
./start-app.sh
```

### Manual Setup

#### 1. Environment Configuration
```bash
# Copy environment template
cp backend_api/.env.example backend_api/.env

# Edit the .env file with your API keys
nano backend_api/.env
```

#### 2. Configure Azure OpenAI

**Azure OpenAI Setup (Required)**
```bash
# Get credentials from Azure OpenAI Studio
# Configure .env
PROVIDER=azure
AZURE_RESOURCE_NAME=your_azure_resource_name
AZURE_DEPLOYMENT_NAME=your_azure_deployment_name
AZURE_OPENAI_API_VERSION=2025-01-01-preview
AZURE_OPENAI_SHARED_TOKEN=your_azure_shared_token_here
```

**Note**: This application uses Azure OpenAI exclusively with shared token authentication passed as query parameters for enhanced security compliance.

#### 3. Install Dependencies
```bash
# Backend dependencies
cd backend_api
npm install

# Frontend dependencies
cd ../frontend_flutter
flutter pub get
```

#### 4. Start Services
```bash
# Start backend (from backend_api directory)
npm run dev

# Start frontend (from frontend_flutter directory)
flutter run -d chrome --web-port=8080
```

### Environment Variables Reference

The `.env` file in `backend_api/` should contain:

```env
# Azure OpenAI Configuration (Required)
PROVIDER=azure
AZURE_RESOURCE_NAME=your_azure_resource_name
AZURE_DEPLOYMENT_NAME=your_azure_deployment_name
AZURE_OPENAI_API_VERSION=2025-01-01-preview
AZURE_OPENAI_SHARED_TOKEN=your_azure_shared_token_here

# Server Configuration (optional)
PORT=3000
CORS_ORIGIN=http://localhost:8080

# Logging Configuration
LOG_LEVEL=info
LOG_TO_FILE=true
LOG_DIR=./logs
```

### Azure OpenAI Setup Instructions

**Azure OpenAI Configuration:**
1. Access Azure Portal → OpenAI Studio
2. Get your resource name (e.g., `myresource`)
3. Get your deployment name (e.g., `mydeployment`) 
4. Obtain the shared Bearer token from your company
5. Configure the `.env` file with these values

**Example curl test:**
```bash
curl -X POST "https://<resource>.openai.azure.com/openai/deployments/<deployment>/chat/completions?api-version=2025-01-01-preview&Authorization=Bearer%20<TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'
```

**Note**: The Azure token is passed as a query parameter (not header) due to company configuration requirements.

### Troubleshooting

**Common Issues:**
- **Port 3000 already in use**: Change `PORT` in `.env` file
- **Azure token invalid**: Verify your shared token is correct and active
- **Azure resource not found**: Check `AZURE_RESOURCE_NAME` and `AZURE_DEPLOYMENT_NAME`
- **CORS errors**: Ensure `CORS_ORIGIN` matches your frontend URL
- **502 errors**: Check Azure OpenAI service status and token permissions

## 🎮 Usage

### Using the Startup Scripts

**Full startup with health checks:**
```bash
./start-app.sh
```
- Checks all prerequisites
- Starts Ollama service
- Downloads AI model if needed
- Starts backend server
- Launches Flutter web app
- Provides service status and logs

**Quick startup for testing:**
```bash
./quick-start.sh
```
- Streamlined startup process
- Good for development/testing

**Stop all services:**
```bash
./stop-app.sh
```
- Gracefully stops all services
- Cleans up processes and log files

### Manual Usage

1. **Start Ollama:**
   ```bash
   ollama serve
   ollama pull llama3.1:8b  # Download model if needed
   ```

2. **Start Backend:**
   ```bash
   cd backend_api
   npm run dev
   ```

3. **Start Frontend:**
   ```bash
   cd frontend_flutter
   flutter run -d chrome --web-port=8080
   ```

### Using the Application

1. 🌐 Open http://localhost:8080
2. 📝 Fill in project details
3. ⚙️ Select platforms and integrations
4. 👥 Set team experience level
5. 🎯 Choose quality requirements
6. 🚀 Generate estimation
7. 📊 Review detailed breakdown
8. 📤 Export results if needed

## 🔌 API Endpoints

### Estimation
- `POST /api/estimate` - Generate project estimation
  - **Input**: Project details, platforms, team experience, quality level
  - **Output**: Complete estimation with WBS, modules, roles, totals, and meta info

### Export
- `POST /api/export` - Export estimation in multiple formats
  - **Formats**: CSV, XLSX, PDF
  - **Input**: Estimation data and desired format
  - **Output**: Downloadable file

### Health
- `GET /health` - Service health check
  - **Output**: Service status and configuration
- `GET /api/health/azure` - Azure OpenAI health check
  - **Output**: Azure provider status, model info, and latency

## 📊 Service URLs

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3000
- **Azure Health Check**: http://localhost:3000/api/health/azure

## ⚙️ Configuration

### Environment Variables

Create `.env` file in `backend_api/`:

```env
# Azure OpenAI Configuration (Required)
PROVIDER=azure
AZURE_RESOURCE_NAME=your_azure_resource_name
AZURE_DEPLOYMENT_NAME=your_azure_deployment_name
AZURE_OPENAI_API_VERSION=2025-01-01-preview
AZURE_OPENAI_SHARED_TOKEN=your_azure_shared_token_here

# Server Configuration
PORT=3000
CORS_ORIGIN=http://localhost:8080

# Logging Configuration
LOG_LEVEL=info
LOG_TO_FILE=true
LOG_DIR=./logs
```

### Estimation Parameters

The system uses these configurable parameters:

- **Velocity**: 20 story points per 2-week sprint (default)
- **Buffer**: 20% additional time for uncertainties
- **Complexity Points**: L=3, M=5, H=8 story points
- **Team Experience Multipliers**: Junior=1.3x, Mid=1.0x, Senior=0.8x
- **Quality Multipliers**: MVP=0.8x, Production=1.0x, Enterprise=1.2x

## 🧪 Testing

### Backend Tests
```bash
cd backend_api
npm test
```

### Frontend Tests
```bash
cd frontend_flutter
flutter test
```

## 📝 Usage Examples

### Basic Estimation Request
```json
{
  "projectTitle": "E-commerce Platform",
  "description": "A modern e-commerce platform with payment processing",
  "platforms": ["web", "mobile"],
  "integrations": ["Payment Gateway", "Database", "Authentication"],
  "nfrs": ["High Performance", "Security"],
  "languagesCount": 1,
  "teamExperience": "mid",
  "qualityLevel": "production",
  "outputLanguage": "en"
}
```

### Export Request
```json
{
  "format": "pdf",
  "data": {
    // Complete estimation response data
  }
}
```

## 🚀 Deployment

### Local Development
```bash
# Start all services
./start-app.sh

# Stop all services  
./stop-app.sh
```

### Production Deployment

1. **Backend**: Deploy to any Node.js hosting (Vercel, Railway, etc.)
2. **Frontend**: Build and deploy Flutter web app
   ```bash
   cd frontend_flutter
   flutter build web
   # Deploy contents of build/web/
   ```

## 📊 Monitoring & Logs

- **Backend Logs**: `tail -f /tmp/backend.log`
- **Flutter Logs**: `tail -f /tmp/flutter.log`
- **Ollama Logs**: `tail -f /tmp/ollama.log`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new features
4. Ensure all tests pass
5. Submit a pull request

## 🔮 Future Updates & Roadmap

### 🎯 **Immediate Improvements (Next Release)**
- **Enhanced Mobile Experience**: Improved touch interactions and responsive design
- **Advanced Sample Data**: More realistic sample projects with industry-specific templates
- **Performance Optimization**: Faster loading times and smoother animations
- **Export Enhancements**: Additional export formats and customizable report templates

### 🚀 **Short-term Goals (3-6 months)**
- **Local AI Enhancement**: 
  - Integration with more local models (Mistral, CodeLlama)
  - Model fine-tuning for better estimation accuracy
  - Offline-first architecture with sync capabilities
- **Advanced Analytics**:
  - Historical estimation tracking and accuracy analysis
  - Team velocity learning and auto-adjustment
  - Project similarity detection and recommendations
- **Collaboration Features**:
  - Multi-user estimation sessions
  - Real-time collaborative editing
  - Estimation review and approval workflows

### 🌟 **Medium-term Vision (6-12 months)**
- **Machine Learning Pipeline**:
  - Custom estimation models trained on historical data
  - Automatic complexity detection from requirements
  - Risk prediction based on project patterns
- **Integration Ecosystem**:
  - JIRA/Azure DevOps integration for automatic WBS creation
  - GitHub integration for code complexity analysis
  - Slack/Teams notifications and bot interactions
- **Advanced Reporting**:
  - Interactive dashboards with drill-down capabilities
  - Gantt chart generation with dependency mapping
  - Resource allocation and capacity planning tools

### 🎨 **UI/UX Enhancements**
- **Design System**: Consistent component library across all platforms
- **Accessibility**: Full WCAG 2.1 AA compliance
- **Internationalization**: Support for 10+ languages with RTL support
- **Dark Mode**: Complete dark theme implementation
- **Mobile Apps**: Native iOS and Android applications

### 🔧 **Technical Improvements**
- **Architecture**: Microservices architecture for better scalability
- **Database**: PostgreSQL integration for data persistence
- **Caching**: Redis implementation for improved performance
- **Security**: OAuth 2.0, RBAC, and audit logging
- **Testing**: Comprehensive E2E testing with Playwright/Cypress

### 📊 **Estimation Algorithm Enhancements**
- **Context-Aware Estimation**: 
  - Industry-specific multipliers and templates
  - Technology stack complexity analysis
  - Team composition and skill matrix integration
- **Risk Assessment**: 
  - Monte Carlo simulation for uncertainty modeling
  - Historical risk pattern analysis
  - Automated risk mitigation suggestions
- **Calibration Tools**:
  - Post-project accuracy feedback loops
  - Continuous model improvement based on actual outcomes
  - Benchmarking against industry standards

### 🌐 **Enterprise Features**
- **Multi-tenant Architecture**: Support for multiple organizations
- **Advanced Security**: SSO, SAML, enterprise-grade authentication
- **Compliance**: SOC 2, GDPR, HIPAA compliance frameworks
- **API Management**: Rate limiting, API keys, webhook support
- **Custom Branding**: White-label solutions for consulting firms

### 🤖 **AI & Automation**
- **Intelligent Requirements Analysis**: 
  - Automatic requirement extraction from documents
  - Ambiguity detection and clarification suggestions
  - Dependency analysis and conflict resolution
- **Smart Recommendations**:
  - Technology stack suggestions based on requirements
  - Team composition recommendations
  - Timeline optimization suggestions
- **Predictive Analytics**:
  - Budget forecasting with confidence intervals
  - Resource demand prediction
  - Project success probability scoring

### 📈 **Success Metrics & KPIs**
- **Estimation Accuracy**: Target 85% accuracy within ±20% variance
- **User Adoption**: 1000+ active users within 12 months
- **Performance**: Sub-3 second estimation generation
- **Reliability**: 99.9% uptime for cloud services
- **User Satisfaction**: 4.5+ star rating with comprehensive feedback

### 🔄 **Continuous Improvement Process**
- **Monthly Feature Releases**: Regular updates with new capabilities
- **Quarterly Major Updates**: Significant feature additions and improvements
- **User Feedback Integration**: Direct feedback channels and feature voting
- **A/B Testing**: Data-driven UI/UX improvements
- **Performance Monitoring**: Continuous optimization based on usage analytics

### 💡 **Innovation Areas**
- **Natural Language Processing**: Voice-to-estimation capabilities
- **Computer Vision**: Wireframe/mockup analysis for automatic feature detection
- **Blockchain Integration**: Immutable estimation records and smart contracts
- **AR/VR Visualization**: 3D project timeline and resource visualization
- **IoT Integration**: Real-time project progress tracking from development tools

---

## 🤖 AI-First Development

**This entire project was developed without writing a single line of code by humans!** 

### Development Timeline
- **Total Development Time**: Less than 12 hours
- **Human Code Contribution**: 0 lines
- **AI Assistance**: 100% AI-generated codebase

### AI Development Team
This project showcases the power of AI-first development, created entirely through collaboration between:

- **🤖 ChatGPT**: Initial project architecture, backend API development, and complex algorithm implementation
- **🧠 Windsurf Claude Sonnet 3.5**: Frontend Flutter development, UI/UX design, testing, and final integration

### What Was AI-Generated
- ✅ **Complete Backend API** (TypeScript + Hono framework)
- ✅ **Full Flutter Frontend** (Dart + Riverpod state management)
- ✅ **Multi-Provider LLM Integration** (OpenAI, Gemini, Azure, Ollama)
- ✅ **Advanced Estimation Algorithms** (WBS generation, role mapping, complexity analysis)
- ✅ **Export Functionality** (CSV, XLSX, PDF generation)
- ✅ **Comprehensive Testing Suites** (Backend Vitest + Frontend Flutter tests)
- ✅ **Production Scripts** (Automated startup, deployment, monitoring)
- ✅ **Complete Documentation** (README, API docs, contributing guidelines)
- ✅ **Security Implementation** (Environment configuration, CORS, validation)
- ✅ **UI/UX Design** (Responsive layouts, modern interface, accessibility)

### AI Development Achievements
- **🏗️ Architecture Design**: Modular, scalable system architecture
- **🔧 Technical Implementation**: Production-ready code with best practices
- **🎨 User Experience**: Intuitive, responsive interface design
- **📊 Complex Algorithms**: Sophisticated estimation and risk analysis
- **🧪 Quality Assurance**: Comprehensive testing and error handling
- **📚 Documentation**: Professional-grade documentation and guides
- **🚀 DevOps**: Automated deployment and monitoring solutions

### Proof of AI-First Development
This project demonstrates that modern AI can:
- Design and implement complex software architectures
- Write production-quality code across multiple technologies
- Create comprehensive testing and documentation
- Handle security, performance, and scalability considerations
- Deliver a fully functional, enterprise-ready application

**Repository**: [ai-first-project-estimation-assistant-mvp](https://github.com/abdallahgaber-link/ai-first-project-estimation-assistant-mvp)

---

## 📄 License

MIT License - see LICENSE file for details
