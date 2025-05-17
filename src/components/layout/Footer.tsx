
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <p className="text-sm text-muted-foreground md:text-base">
          &copy; {new Date().getFullYear()} DevTools. All rights reserved.
        </p>
        
        <div className="flex flex-col md:flex-row gap-4 md:items-center text-sm text-muted-foreground">
          <Link to="/about" className="hover:underline">
            About
          </Link>
          <Link to="/" className="hover:underline">
            Tools
          </Link>
          <a
            href="https://github.com/DictumMortuum/tools"
            target="_blank"
            rel="noreferrer"
            className="hover:underline"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
