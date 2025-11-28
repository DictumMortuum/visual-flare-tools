
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, LogIn } from "lucide-react";
import ThemeToggle from "@/components/ui/theme-toggle";

const Header = ({ email, dispatch }) => {
  const logout = () => {
    dispatch({ type: "user::unset" });
  }

  return (
    <header className="border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-2xl font-bold">
            Tools
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link
              to="/"
              className="transition-colors hover:text-foreground/80"
            >
              Home
            </Link>
            <Link
              to="/about"
              className="transition-colors hover:text-foreground/80"
            >
              About
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {email ? (
            <div className="flex items-center gap-4">
              <span className="text-sm">Welcome, {email}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="flex items-center gap-1"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="flex items-center gap-1"
            >
              <Link to="/login">
                <LogIn className="h-4 w-4" />
                Login
              </Link>
            </Button>)}
        </div>
      </div>
    </header>
  );
};

export default Header;
