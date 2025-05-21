
import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";
import { Box, Container } from "@mui/material";

const Layout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <NavBar />
      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        <Outlet />
      </Container>
      <Box 
        component="footer" 
        sx={{ 
          mt: 'auto', 
          py: 3, 
          px: 2, 
          borderTop: 1, 
          borderColor: 'divider',
          backgroundColor: 'background.paper',
        }}
      >
        <Container>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Box component="p" sx={{ color: 'text.secondary', mb: { xs: 2, md: 0 } }}>
              &copy; {new Date().getFullYear()} Boardgame Tools. All rights reserved.
            </Box>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Box component="a" href="/about" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                About
              </Box>
              <Box component="a" href="/" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                Tools
              </Box>
              <Box component="a" href="https://github.com/DictumMortuum/tools" target="_blank" rel="noreferrer" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                GitHub
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
