
import { Box, Typography, Container } from "@mui/material";
import ToolGrid from "@/components/tools/ToolGrid";

const Index = () => {
  return (
    <Container>
      <Box sx={{ textAlign: 'center', mb: 6, mt: 2 }}>
        <Typography 
          variant="h2" 
          component="h1" 
          fontWeight="bold" 
          gutterBottom
          sx={{
            background: 'linear-gradient(90deg, #2e2e7e 0%, #5555aa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Boardgame Tools
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '800px', mx: 'auto' }}>
          A collection of free, simple, and useful tools for boardgame enthusiasts and players.
        </Typography>
      </Box>

      <ToolGrid />
    </Container>
  );
};

export default Index;
