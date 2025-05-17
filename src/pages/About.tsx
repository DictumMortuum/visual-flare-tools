
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="container py-10">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">About DevTools</h1>
          <p className="text-lg text-muted-foreground">
            A collection of simple and useful tools for developers and designers.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p>
                This project is an open-source collection of developer tools, designed to make common tasks easier.
                All tools are free to use and run completely in your browser - no data is sent to any server.
              </p>
              
              <h2>Features</h2>
              <ul>
                <li>All tools run entirely in your browser</li>
                <li>No data is collected or sent to any server</li>
                <li>Responsive design that works on mobile and desktop</li>
                <li>Dark mode support</li>
                <li>Open-source code</li>
              </ul>

              <h2>Built With</h2>
              <ul>
                <li>React</li>
                <li>TypeScript</li>
                <li>Tailwind CSS</li>
                <li>Shadcn UI</li>
              </ul>

              <h2>Contributing</h2>
              <p>
                Contributions are welcome! Feel free to submit issues or pull requests on GitHub.
              </p>

              <div className="not-prose mt-6">
                <Link 
                  to="/"
                  className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Back to Tools
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;
