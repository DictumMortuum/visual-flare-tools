
import { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  Divider, 
  IconButton, 
  InputAdornment,
  Alert,
  Stack
} from '@mui/material';
import { Google, Facebook, Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Simulate login - in a real app, this would authenticate with a backend
    setTimeout(() => {
      if (email && password) {
        // Store user info in localStorage (in a real app, you'd use proper auth tokens)
        localStorage.setItem('user', JSON.stringify({
          email,
          name: email.split('@')[0],
          isLoggedIn: true
        }));
        navigate('/');
      } else {
        setError('Please enter both email and password');
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleSocialLogin = (provider) => {
    setIsLoading(true);
    setError('');
    
    // Simulate social login - in a real app, this would redirect to OAuth provider
    setTimeout(() => {
      localStorage.setItem('user', JSON.stringify({
        email: `user@${provider}.com`,
        name: `${provider}User`,
        provider,
        isLoggedIn: true
      }));
      setIsLoading(false);
      navigate('/');
    }, 1000);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh'
      }}
    >
      <Paper 
        elevation={3}
        sx={{ 
          p: 4, 
          width: '100%', 
          maxWidth: 400,
          mx: 2
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Log in
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <form onSubmit={handleEmailLogin}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          
          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            margin="normal"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 3 }}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Log in'}
          </Button>
        </form>
        
        <Divider sx={{ my: 3 }}>or</Divider>
        
        <Stack spacing={2}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Google />}
            onClick={() => handleSocialLogin('google')}
            disabled={isLoading}
          >
            Continue with Google
          </Button>
          
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Facebook />}
            onClick={() => handleSocialLogin('facebook')}
            disabled={isLoading}
            sx={{ 
              borderColor: '#3b5998', 
              color: '#3b5998',
              '&:hover': {
                borderColor: '#3b5998',
                backgroundColor: 'rgba(59, 89, 152, 0.04)'
              }
            }}
          >
            Continue with Facebook
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default Login;
