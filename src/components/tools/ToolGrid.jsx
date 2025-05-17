
import { useState } from "react";
import ToolCard from "./ToolCard";
import { Input } from "@/components/ui/input";
import { toolsList } from "@/data/tools";
import { Button } from "@/components/ui/button";
import { BadgeCheck, Search, X } from "lucide-react";

const ToolGrid = ({ tools = toolsList }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  const categories = Array.from(new Set(toolsList.map(tool => tool.category)));

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? tool.category === selectedCategory : true;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center bg-muted/50 rounded-xl p-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tools..."
            className="pl-9 border-muted-foreground/20 focus-visible:ring-primary/30 rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-muted-foreground/10 rounded-full"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              size="sm"
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => 
                setSelectedCategory(selectedCategory === category ? null : category)
              }
              className={`flex gap-1 items-center rounded-full text-xs px-4 ${
                selectedCategory === category 
                  ? "bg-primary hover:bg-primary/90" 
                  : "border-muted-foreground/20 hover:border-muted-foreground/40 hover:bg-muted-foreground/5"
              }`}
            >
              {selectedCategory === category && <BadgeCheck className="h-3 w-3" />}
              {category}
            </Button>
          ))}
        </div>
      </div>

      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-fade-in">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} {...tool} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-muted/30 rounded-xl">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-xl font-medium mb-2">No tools found</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Try adjusting your search or filter criteria to find the tools you're looking for.
          </p>
        </div>
      )}
    </div>
  );
};

export default ToolGrid;
