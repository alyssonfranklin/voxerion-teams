import { Card, Text, Button, Spinner } from '@fluentui/react-components';
import { useAuth } from '../hooks/useAuth';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper = ({ children }: AuthWrapperProps) => {
  const { isAuthenticated, isLoading, error, login, user } = useAuth();
  
  if (isLoading) {
    return (
      <div className="auth-loading-container">
        <Spinner label="Authenticating..." />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <Card className="auth-card">
        <div className="auth-card-content">
          <img 
            src="/assets/logo.png" 
            alt="Voxerion Logo" 
            className="auth-logo" 
          />
          
          <Text size={700} weight="semibold" align="center">
            Welcome to Voxerion
          </Text>
          
          <Text align="center">
            A personal assistant that helps you communicate better with your team.
          </Text>
          
          {error && (
            <Text className="auth-error" align="center">
              {error}
            </Text>
          )}
          
          <Button appearance="primary" onClick={login}>
            Sign In
          </Button>
          
          <Text size={200} align="center">
            Contact support@voxerion.com if you need access.
          </Text>
        </div>
      </Card>
    );
  }
  
  return (
    <div className="auth-container">
      <div className="auth-header">
        <Text>Logged in as: {user?.name || user?.email}</Text>
      </div>
      
      {children}
    </div>
  );
};

export default AuthWrapper;