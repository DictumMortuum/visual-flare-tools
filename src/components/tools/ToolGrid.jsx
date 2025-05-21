
import { useState } from "react";
import { 
  Box, 
  Grid, 
  Typography, 
  Tabs, 
  Tab, 
  TextField, 
  InputAdornment 
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import { toolsList } from "@/data/tools";
import MuiToolCard from "./MuiToolCard";

const ToolGrid = () => {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  
  const categories = ["all", ...new Set(toolsList.map((tool) => tool.category))];
  
  const filteredTools = toolsList.filter((tool) => {
    const matchesCategory = category === "all" || tool.category === category;
    const matchesSearch = tool.title.toLowerCase().includes(search.toLowerCase()) ||
                         tool.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' }, mb: 3, gap: 2 }}>
        <Tabs 
          value={category}
          onChange={(_, newValue) => setCategory(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {categories.map((cat) => (
            <Tab 
              key={cat}
              label={cat === "all" ? "All Tools" : cat} 
              value={cat}
              sx={{ textTransform: 'capitalize' }}
            />
          ))}
        </Tabs>
        
        <TextField
          placeholder="Search tools..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: { xs: '100%', md: '250px' } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      
      {filteredTools.length > 0 ? (
        <Grid container spacing={3}>
          {filteredTools.map((tool) => (
            <Grid item xs={12} sm={6} md={4} key={tool.id}>
              <MuiToolCard tool={tool} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ py: 10, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No tools found matching your criteria
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ToolGrid;
