
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t py-8">
      <div className="container flex flex-col items-center justify-between gap-6 md:flex-row md:gap-4">
        <p className="text-sm text-muted-foreground md:text-base">
          &copy; {new Date().getFullYear()} Boardgame Tools. All rights reserved.
        </p>
        
        <div className="flex gap-8 md:items-center text-sm text-muted-foreground">
          <Link to="/about" className="hover:text-primary transition-colors">
            About
          </Link>
          <Link to="/" className="hover:text-primary transition-colors">
            Tools
          </Link>
          <a
            href="https://github.com/DictumMortuum/tools"
            target="_blank"
            rel="noreferrer"
            className="hover:text-primary transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
