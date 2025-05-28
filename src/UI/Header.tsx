import { useNavigate } from "react-router-dom";

import {
  ExitToAppSharp,
  LibraryAddSharp,
  TerrainSharp,
} from "@mui/icons-material";
import { AppBar, Button, IconButton, Stack, Typography, Toolbar} from "@mui/material";

export interface HeaderProps {
  onCreateVFE: () => void;
  onLoadTestVFE: () => void;
}

function Header({ onCreateVFE, onLoadTestVFE }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <AppBar position="sticky" sx={{ px: 2, py: 1 }}>
      <Toolbar disableGutters>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          width="100%"
        >
          {/* Logo and title */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton onClick={() => navigate("/")}>
              <TerrainSharp
                sx={{ color: "primary.contrastText", fontSize: 40 }}
              />
            </IconButton>
            <Typography
              variant="h5"
              sx={{
                color: "primary.contrastText",
                fontWeight: 600,
              }}
            >
              Field Trip
            </Typography>
          </Stack>

          {/* Buttons */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              variant="outlined"
              onClick={onCreateVFE}
              endIcon={<LibraryAddSharp />}
              sx={{
                color: "primary.contrastText",
                borderColor: "primary.contrastText",
                "&:hover": {
                  borderColor: "white",
                },
              }}
            >
              Create
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={onLoadTestVFE}
              endIcon={<ExitToAppSharp />}
              sx={{
                backgroundColor: "primary.contrastText",
                color: "primary.main",
                "&:hover": {
                  backgroundColor: "white",
                },
              }}
            >
              Demo
            </Button>
          </Stack>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
