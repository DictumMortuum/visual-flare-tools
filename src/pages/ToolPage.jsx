
import React, { useState, useEffect } from 'react';
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toolsList } from "@/data/tools";
import { ArrowLeft, Loader2 } from "lucide-react";
import { UserContext } from '../context';
// Tool components
import DiceRoller from "@/components/tools/boardgame/DiceRoller";
import TurnTracker from "@/components/tools/boardgame/TurnTracker";
import BoardGameTables from "@/components/tools/boardgame/BoardGameTables";
import Wishlist from "@/components/tools/general/Wishlist";
import { useNavigate } from 'react-router-dom';

const ToolPage = () => {
  const { id } = useParams();
  const { state: { user } } = React.useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const tool = toolsList.find(t => t.id === id);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [id]);

  if (!tool) {
    return (
      <div className="container py-10">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="flex items-center space-x-4">
            <Button asChild variant="ghost" size="sm">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Tools
              </Link>
            </Button>
          </div>

          <div className="text-center py-16">
            <h1 className="text-2xl font-bold mb-2">Tool Not Found</h1>
            <p className="text-muted-foreground mb-6">
              Sorry, the tool you're looking for doesn't exist.
            </p>
            <Button asChild>
              <Link to="/">Return to Tools</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const renderToolComponent = () => {
    useEffect(() => {
      if (user === null) {
        navigate("/login");
      }
    }, [user, navigate]);

    if (loading) {
      return (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    // Return the appropriate tool component based on id
    switch (tool.id) {
      case 'dice-roller':
        return <DiceRoller />;
      case 'turn-tracker':
        return <TurnTracker />;
      case 'tables':
        return <BoardGameTables email={user.email} />;
      case 'wishlist':
        return <Wishlist email={user.email} />;
      default:
        return (
          <div className="text-center py-16">
            <div className="text-2xl mb-2">{tool.icon}</div>
            <h2 className="text-xl font-medium mb-2">Tool Interface Coming Soon</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              The {tool.title.toLowerCase()} tool is under development.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="container pl-0 pr-0">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center">
          <Button asChild variant="ghost" size="sm">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tools
            </Link>
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-md text-primary">
              {tool.icon}
            </div>
            <h1 className="text-3xl font-bold">{tool.title}</h1>
          </div>
          <p className="text-muted-foreground">{tool.description}</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            {renderToolComponent()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ToolPage;
