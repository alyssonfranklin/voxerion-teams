import { useState, useEffect, createContext, useContext } from 'react';
import { usePublicClientApplication } from '@azure/msal-react';
import * as microsoftTeams from '@microsoft/teams-js';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: {
    email: string;
    name: string;
  } | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  error: null,
  user: null,
  login: async () => {},
  logout: async () => {},
  getToken: async () => null
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  
  const { instance } = usePublicClientApplication();
  
  useEffect(() => {
    // Initialize Teams SDK
    microsoftTeams.initialize();
    
    // Check for existing token in localStorage
    const storedToken = localStorage.getItem('voxerion_auth_token');
    if (storedToken) {
      validateToken(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);
  
  const validateToken = async (authToken: string) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/auth/validate', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setToken(authToken);
        setUser({
          email: data.data.email,
          name: data.data.name || data.data.email
        });
        setIsAuthenticated(true);
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('voxerion_auth_token');
        setIsAuthenticated(false);
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error('Error validating token:', err);
      setError('Failed to validate authentication.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const login = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get Microsoft Graph token from MSAL
      const result = await instance.acquireTokenSilent({
        scopes: ['https://graph.microsoft.com/User.Read', 'https://graph.microsoft.com/Calendars.Read']
      });
      
      if (!result || !result.accessToken) {
        throw new Error('Failed to acquire Microsoft Graph token');
      }
      
      // Authenticate with our backend
      const response = await fetch('/api/auth/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          msGraphToken: result.accessToken
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }
      
      // Store the token and user info
      localStorage.setItem('voxerion_auth_token', data.data.token);
      setToken(data.data.token);
      setUser(data.data.user);
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Login error:', err);
      setError('Authentication failed. Please try again.');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Clear local storage
      localStorage.removeItem('voxerion_auth_token');
      
      // Reset state
      setIsAuthenticated(false);
      setToken(null);
      setUser(null);
      
      // Sign out from MSAL
      await instance.logoutRedirect();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getToken = async (): Promise<string | null> => {
    // If we already have a token, return it
    if (token) {
      return token;
    }
    
    // Try to get token from localStorage
    const storedToken = localStorage.getItem('voxerion_auth_token');
    if (storedToken) {
      // Validate the token before returning it
      try {
        const response = await fetch('/api/auth/validate', {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        });
        
        if (response.ok) {
          setToken(storedToken);
          return storedToken;
        }
      } catch (err) {
        console.error('Error validating token:', err);
      }
    }
    
    // If we get here, we need to login
    await login();
    
    // Return the new token
    return token;
  };
  
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        error,
        user,
        login,
        logout,
        getToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);