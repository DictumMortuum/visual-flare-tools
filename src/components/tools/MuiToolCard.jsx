
import { Link } from "react-router-dom";
import { Card, CardContent, CardActionArea, Typography, Box } from "@mui/material";

const MuiToolCard = ({ tool }) => {
  return (
    <Card 
      elevation={1}
      sx={{
        height: '100%',
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3
        }
      }}
    >
      <CardActionArea 
        component={Link} 
        to={`/tools/${tool.id}`} 
        sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
      >
        <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box 
            sx={{ 
              mb: 2,
              p: 1.5,
              borderRadius: 1,
              bgcolor: 'primary.light',
              color: 'primary.contrastText',
              width: 'fit-content',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {tool.icon}
          </Box>
          
          <Typography variant="h6" component="h3" gutterBottom>
            {tool.title}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 'auto' }}>
            {tool.description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default MuiToolCard;
