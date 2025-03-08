import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import { FluentProvider, teamsLightTheme } from '@fluentui/react-components';
import { AuthProvider } from './shared/hooks/useAuth';
import AuthWrapper from './shared/components/AuthWrapper';
import CalendarView from './calendar/components/CalendarView';
import ChatInsights from './chat/components/ChatInsights';
import ConfigPage from './shared/components/ConfigPage';

// MSAL configuration
const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_MICROSOFT_TENANT_ID}`,
    redirectUri: window.location.origin
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: true
  }
};

const msalInstance = new PublicClientApplication(msalConfig);

const App = () => {
  return (
    <MsalProvider instance={msalInstance}>
      <FluentProvider theme={teamsLightTheme}>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/config" element={<ConfigPage />} />
              <Route path="/calendar" element={
                <AuthWrapper>
                  <CalendarView />
                </AuthWrapper>
              } />
              <Route path="/chat" element={
                <AuthWrapper>
                  <ChatInsights />
                </AuthWrapper>
              } />
              <Route path="/" element={
                <AuthWrapper>
                  <CalendarView />
                </AuthWrapper>
              } />
            </Routes>
          </Router>
        </AuthProvider>
      </FluentProvider>
    </MsalProvider>
  );
};

export default App;