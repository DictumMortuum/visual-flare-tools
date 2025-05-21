
import { createContext, useContext, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { toast } from 'sonner';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { 
    user: auth0User, 
    isAuthenticated, 
    isLoading, 
    logout: auth0Logout,
    loginWithRedirect
  } = useAuth0();

  // Transform Auth0 user to our user format
  const user = isAuthenticated ? {
    email: auth0User.email,
    name: auth0User.name || auth0User.nickname || auth0User.email.split('@')[0],
    picture: auth0User.picture,
    isLoggedIn: true
  } : null;

  // Handle successful authentication
  useEffect(() => {
    if (isAuthenticated && auth0User) {
      toast.success(`Welcome, ${user.name}!`);
    }
  }, [isAuthenticated, auth0User]);

  // Custom logout function
  const logout = () => {
    auth0Logout({ logoutParams: { returnTo: window.location.origin } });
    toast.info('You have been logged out');
  };

  // Login function
  const login = () => {
    loginWithRedirect();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading: isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
