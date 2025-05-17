
import { MoonIcon, SunIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check for system preference
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
    
    // Listen for changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
      const newColorScheme = event.matches ? "dark" : "light";
      setIsDarkMode(newColorScheme === "dark");
      toggleDarkMode(newColorScheme === "dark");
    });
  }, []);

  const toggleDarkMode = (darkMode) => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    setIsDarkMode(darkMode);
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center space-x-2 transition-colors hover:opacity-80">
            <div className="rounded-full bg-primary p-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-primary-foreground"
              >
                <path d="M1.5 6.5a3 3 0 0 1 3-3h15a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3h-15a3 3 0 0 1-3-3v-11Z" />
                <path d="M4.5 19.5v-15h15v15" />
                <path d="M4.5 9.5h15" />
                <path d="M8.5 6.5v-3" />
                <path d="M15.5 6.5v-3" />
              </svg>
            </div>
            <span className="font-bold text-xl">Boardgame Tools</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle dark mode"
            onClick={() => toggleDarkMode(!isDarkMode)}
            className="rounded-full"
          >
            {isDarkMode ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </Button>
          <a 
            href="https://github.com/DictumMortuum/tools" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="gap-1 rounded-full">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
                <path d="M7.49933 0.25C3.49635 0.25 0.25 3.49593 0.25 7.50024C0.25 10.703 2.32715 13.4206 5.2081 14.3797C5.57084 14.446 5.70302 14.2222 5.70302 14.0299C5.70302 13.8576 5.69679 13.4019 5.69323 12.797C3.67661 13.235 3.25112 11.825 3.25112 11.825C2.92132 10.9874 2.44599 10.7644 2.44599 10.7644C1.78773 10.3149 2.49584 10.3238 2.49584 10.3238C3.22353 10.375 3.60629 11.0711 3.60629 11.0711C4.25298 12.1868 5.30335 11.8574 5.71638 11.6729C5.78225 11.205 5.96962 10.8765 6.17658 10.7043C4.56675 10.5319 2.87415 9.89928 2.87415 7.12104C2.87415 6.32925 3.15677 5.68257 3.62053 5.17563C3.54576 4.99226 3.29697 4.25521 3.69174 3.25691C3.69174 3.25691 4.30015 3.06196 5.68522 3.99973C6.26337 3.83906 6.8838 3.75895 7.50022 3.75583C8.1162 3.75895 8.73619 3.83906 9.31523 3.99973C10.6994 3.06196 11.3069 3.25691 11.3069 3.25691C11.7026 4.25521 11.4538 4.99226 11.3795 5.17563C11.8441 5.68257 12.1245 6.32925 12.1245 7.12104C12.1245 9.9063 10.4292 10.5292 8.81452 10.6978C9.07444 10.9081 9.30633 11.3274 9.30633 11.9668C9.30633 12.8866 9.29742 13.7932 9.29742 14.0299C9.29742 14.2239 9.42828 14.4496 9.79591 14.379C12.6746 13.4179 14.75 10.7025 14.75 7.50024C14.75 3.49593 11.5036 0.25 7.49933 0.25Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
              </svg>
              GitHub
            </Button>
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
