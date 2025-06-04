
import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Mail,
  // Github,
  // Facebook,
  EyeIcon,
  EyeOffIcon
} from 'lucide-react';
import { UserContext } from '../../context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
// import { Separator } from '@/components/ui/separator';

const Login = () => {
  const { dispatch } = React.useContext(UserContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (email === "") {
      toast.error("Please provide an email")
      setIsLoading(false);
      return
    }

    dispatch({ type: "user::set", user: {
      email: email,
      user_id: email,
    }});

    setIsLoading(false);
    navigate("/");
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <Card className="w-full max-w-md shadow-lg border-0 bg-card">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-3xl font-bold">Welcome back</CardTitle>
          <CardDescription className="text-base">Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <Input
                  id="email"
                  placeholder="email@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium leading-none" htmlFor="password">
                  Password
                </label>
                {/* <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                  onClick={() => loginWithRedirect({
                    authorizationParams: {
                      screen_hint: "forgot_password",
                    },
                  })}
                >
                  Forgot password?
                </button> */}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <button
                  type="button"
                  className="absolute right-3 top-2.5"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <EyeIcon className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {(isLoading) ? 'Signing in...' : 'Sign in with Email'}
            </Button>
          </form>

          {/* <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-2 text-sm text-muted-foreground">
                or continue with
              </span>
            </div>
          </div> */}

          {/* <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => handleSocialLogin('facebook')}
              disabled={isLoading}
              className="transition-all hover:bg-blue-500 hover:text-white"
            >
              <Facebook className="mr-2 h-4 w-4" />
              Facebook
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSocialLogin('github')}
              disabled={isLoading}
              className="transition-all hover:bg-black hover:text-white"
            >
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </Button>
          </div> */}
        </CardContent>
        {/* <CardFooter className="flex justify-center border-t pt-6">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <button
              className="text-primary font-medium hover:underline"
              onClick={() => loginWithRedirect({
                authorizationParams: {
                  screen_hint: "signup",
                },
              })}
            >
              Sign up
            </button>
          </p>
        </CardFooter> */}
      </Card>
    </div>
  );
};

export default Login;
