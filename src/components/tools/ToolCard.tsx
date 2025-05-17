
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface ToolCardProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
}

const ToolCard = ({ id, title, description, icon, category }: ToolCardProps) => {
  return (
    <Link to={`/tools/${id}`} className="block group">
      <Card className="h-full transition-all border-border/40 hover:border-primary/40 hover:shadow-md overflow-hidden">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              {icon}
            </div>
            <div className="text-xs font-medium text-muted-foreground px-2.5 py-1 bg-muted rounded-full">
              {category}
            </div>
          </div>
          <CardTitle className="text-xl group-hover:text-primary transition-colors">
            {title}
          </CardTitle>
          <CardDescription className="line-clamp-2">
            {description}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
};

export default ToolCard;
