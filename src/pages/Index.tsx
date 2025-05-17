
import ToolGrid from "@/components/tools/ToolGrid";

const Index = () => {
  return (
    <div className="container py-8">
      <div className="mx-auto max-w-4xl text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
          Developer Tools
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          A collection of free, simple, and useful web-based tools for developers, designers, and everyone else.
        </p>
      </div>

      <ToolGrid />
    </div>
  );
};

export default Index;
