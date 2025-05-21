
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  Paper, 
  CircularProgress 
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { toolsList } from "@/data/tools";

// Tool components
import DiceRoller from "@/components/tools/boardgame/DiceRoller";
import TurnTracker from "@/components/tools/boardgame/TurnTracker";
import GameTables from "@/components/tools/boardgame/GameTables";
import Wishlist from "@/components/tools/boardgame/Wishlist";

const ToolPage = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const tool = toolsList.find(t => t.id === id);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [id]);

  if (!tool) {
    return (
      <Container maxWidth="md" sx={{ py: 5 }}>
        <Box sx={{ mb: 3 }}>
          <Button 
            component={Link} 
            to="/"
            startIcon={<ArrowBack />}
            variant="text"
            color="inherit"
          >
            Back to Tools
          </Button>
        </Box>
        
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Tool Not Found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Sorry, the tool you're looking for doesn't exist.
          </Typography>
          <Button component={Link} to="/" variant="contained">
            Return to Tools
          </Button>
        </Box>
      </Container>
    );
  }

  const renderToolComponent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    // Return the appropriate tool component based on id
    switch (tool.id) {
      case 'dice-roller':
        return <DiceRoller />;
      case 'turn-tracker':
        return <TurnTracker />;
      case 'game-tables':
        return <GameTables />;
      case 'game-wishlist':
        return <Wishlist />;
      default:
        return (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Box sx={{ fontSize: '2rem', mb: 2 }}>{tool.icon}</Box>
            <Typography variant="h5" component="h2" gutterBottom>
              Tool Interface Coming Soon
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
              The {tool.title.toLowerCase()} tool is under development.
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Box sx={{ mb: 3 }}>
        <Button 
          component={Link} 
          to="/"
          startIcon={<ArrowBack />}
          variant="text"
          color="inherit"
        >
          Back to Tools
        </Button>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ 
            p: 1.5, 
            borderRadius: 1, 
            bgcolor: 'primary.light', 
            color: 'primary.contrastText',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {tool.icon}
          </Box>
          <Typography variant="h4" component="h1" fontWeight="bold">
            {tool.title}
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          {tool.description}
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        {renderToolComponent()}
      </Paper>
    </Container>
  );
};

export default ToolPage;
