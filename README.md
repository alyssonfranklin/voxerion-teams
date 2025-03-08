# Voxerion Teams App

A Microsoft Teams application that provides communication insights for meetings and chats, helping users to become better communicators and leaders.

## Features

- **Calendar Integration**: Connect with Microsoft 365 Calendar to view and analyze meetings
- **Meeting Insights**: Get AI-powered insights about how to communicate effectively in meetings
- **Chat Analysis**: Analyze chat conversations to improve communication
- **Real-time Suggestions**: Receive suggestions for better communication during meetings and chats

## Technology Stack

- **Frontend**: React, TypeScript, Fluent UI (Microsoft's design system)
- **Backend**: Node.js, Express
- **Authentication**: Microsoft Identity Platform
- **API Integration**:
  - Microsoft Graph API (for calendar & user information)
  - OpenAI API (for AI insights)

## Project Structure

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
│   │   ├── database/           # Database functionality
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

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm 9 or later
- Microsoft 365 Developer account
- OpenAI API key

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/voxerion-teams.git
cd voxerion-teams
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file based on `.env.sample` and fill in your configuration values:

```bash
cp .env.sample .env
```

4. Configure your Microsoft App Registration:
   - Register a new app in the Azure portal
   - Add the necessary API permissions (Microsoft Graph)
   - Configure authentication with the redirect URI

5. Start the development server:

```bash
npm run dev
```

## Deployment

### Building for Production

```bash
npm run build
```

### Teams App Package

Generate a Teams app package that can be uploaded to Teams:

```bash
npm run package
```

### Deployment to Teams

1. Go to Microsoft Teams
2. Navigate to the Apps section
3. Click "Upload a custom app" and select the generated package
4. Follow the instructions to install the app

## Authentication

The app uses Microsoft Identity Platform for authentication:

1. Users sign in with their Microsoft account
2. The app receives a Microsoft Graph token
3. The token is exchanged for a Voxerion app token
4. This token is used for all API requests

## API Documentation

The backend provides the following API endpoints:

### Authentication

- `POST /api/auth/authenticate`: Authenticate with Microsoft Graph token
- `GET /api/auth/validate`: Validate an existing token

### Calendar

- `GET /api/calendar/events`: Get calendar events
- `GET /api/calendar/events/:eventId`: Get a specific calendar event
- `POST /api/calendar/events/:eventId/insights`: Generate insights for a calendar event

### Chat

- `GET /api/chat/:chatId/messages`: Get chat messages
- `POST /api/chat/:chatId/insights`: Generate insights for a chat conversation

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgements

- Microsoft Teams Platform
- OpenAI
- Fluent UI React
- Microsoft Graph API