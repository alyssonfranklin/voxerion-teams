# Voxerion Teams App - Implementation Plan

This document outlines the implementation plan for creating a Microsoft Teams App version of Voxerion with the same functionality as the Google Calendar version plus chat insights.

## Project Structure

Create a new project directory `voxerion-teams` with the following structure:

```
voxerion-teams/
├── .vscode/                    # VS Code configuration
├── src/
│   ├── client/                 # Frontend code
│   │   ├── calendar/           # Calendar tab functionality
│   │   │   ├── components/     # React components
│   │   │   ├── services/       # Calendar services
│   │   │   └── hooks/          # Custom React hooks
│   │   ├── chat/               # Chat functionality
│   │   │   ├── components/     # React components 
│   │   │   ├── services/       # Chat services
│   │   │   └── hooks/          # Custom React hooks
│   │   ├── shared/             # Shared components & utilities
│   │   └── styles/             # CSS/SCSS styles
│   ├── server/                 # Backend code
│   │   ├── api/                # API routes
│   │   ├── database/           # Database functionality (similar to current DB manager)
│   │   ├── services/           # Services (OpenAI, MS Graph)
│   │   └── utils/              # Utility functions
│   └── types/                  # TypeScript type definitions
├── public/                     # Static assets
├── manifest/                   # Teams app manifest
├── .env                        # Environment variables (not in git)
├── .env.sample                 # Sample environment variables
├── package.json                # Project dependencies
└── tsconfig.json               # TypeScript configuration
```

## Technology Stack

- **Framework**: Microsoft Teams Toolkit with React
- **Language**: TypeScript
- **Backend**: Node.js with Express
- **API Integration**:
  - Microsoft Graph API (for calendar & user information)
  - OpenAI API (for AI insights)
- **UI Framework**: Fluent UI React (Microsoft's design system)
- **State Management**: React Context API or Redux
- **Authentication**: Microsoft Identity Platform

## Core Features

### 1. Calendar Integration

- Integrate with Microsoft 365 Calendar
- Display calendar events
- Provide meeting insights similar to Google Calendar version
- UI components for viewing and interacting with calendar events

### 2. Chat Integration (New Feature)

- Monitor chat conversations in Teams
- Analyze conversation context
- Provide real-time or on-demand insights based on the chat
- Suggest communication improvements or talking points

### 3. Database Integration

- Port the existing database structure to support Teams users
- Ensure user authentication and access control
- Maintain company, department, and employee relationships

### 4. OpenAI Integration

- Reuse existing OpenAI Assistant integration patterns
- Support both calendar-based and chat-based prompts
- Implement caching for performance

## Implementation Steps

1. **Setup Project**
   - Initialize TypeScript Teams project using Teams Toolkit
   - Configure dependencies and development environment

2. **Authentication & Authorization**
   - Implement Microsoft identity integration
   - Port access control from Google Apps Script version

3. **Calendar Integration**
   - Connect to Microsoft Graph API for calendar data
   - Build UI components for calendar view
   - Implement "Get Insights" functionality

4. **Chat Integration**
   - Implement chat extension capabilities
   - Create message handlers for analyzing conversations
   - Build UI for displaying chat insights

5. **Database Layer**
   - Create database manager similar to current implementation
   - Implement data models and access patterns
   - Ensure efficient caching

6. **OpenAI Integration**
   - Adapt existing OpenAI API implementation
   - Create separate prompt strategies for calendar and chat

7. **UI/UX Development**
   - Implement Fluent UI components
   - Ensure responsive design
   - Port existing UI patterns from Google version

8. **Testing & Deployment**
   - Unit and integration testing
   - Teams app packaging
   - Deployment to Teams app store or organization

## External Dependencies

- Microsoft Teams SDK (@microsoft/teams-js)
- Microsoft Graph JavaScript Client Library
- OpenAI Node.js Library
- Fluent UI React Components
- Microsoft Authentication Library (MSAL)

## Code Migration Strategy

The existing Google Apps Script code should be refactored for Teams in these ways:

1. **Calendar Integration**: 
   - Replace Google Calendar API calls with Microsoft Graph API
   - Maintain similar event processing logic

2. **Database Layer**:
   - Convert the spreadsheet-based database to a more scalable solution
   - Keep the same data models and relationships

3. **OpenAI Integration**:
   - Keep the same Assistant-based API approach
   - Update prompts as needed for Teams context

4. **UI Components**:
   - Recreate UI cards as React components using Fluent UI
   - Maintain similar UX flow and insights presentation

5. **Authentication**:
   - Replace Google authentication with Microsoft Identity
   - Keep the same access control patterns

## Resources and Documentation

- [Teams Toolkit Documentation](https://docs.microsoft.com/en-us/microsoftteams/platform/toolkit/teams-toolkit-fundamentals)
- [Microsoft Graph API for Calendar](https://docs.microsoft.com/en-us/graph/api/resources/calendar?view=graph-rest-1.0)
- [Teams App Development](https://docs.microsoft.com/en-us/microsoftteams/platform/overview)
- [Fluent UI React](https://developer.microsoft.com/en-us/fluentui#/controls/web)
- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)