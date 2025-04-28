import * as React from "react";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import LocationSearchingIcon from "@mui/icons-material/LocationSearching";
import {
  Box,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";

import { HotspotData, VFE } from "../Pages/PageUtility/DataStructures";
import { HotspotUpdate } from "../Pages/PageUtility/VFEConversion";

type Anchor = "top" | "left" | "bottom" | "right";

export interface PhotosphereHotspotSideBarProps {
  vfe: VFE;
  currentPS: string;
  onChangePS: (id: string) => void;
  onUpdateHotspot?: (
    hotspotPath: string[],
    update: HotspotUpdate | null,
  ) => void;
}

let anchorOptions: Anchor = "right";
const [open, setOpen] = React.useState(true);
const openList = () => {
  setOpen(!open);
};

function PhotosphereHotspotSideBar({
  vfe,
  currentPS,
  onChangePS,
  onUpdateHotspot,
}: PhotosphereHotspotSideBarProps) {
  const [state, setState] = React.useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  });

  const photospheres = new Map(Object.entries(vfe.photospheres));

  const toggleDrawer =
    (anchor: Anchor, open: boolean) =>
    (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === "keydown" &&
        ((event as React.KeyboardEvent).key === "Tab" ||
          (event as React.KeyboardEvent).key === "Shift")
      ) {
        return;
      }

      setState({ ...state, [anchor]: open });
    };

  const list = (anchor: Anchor) => (
    <Box
      sx={{ width: anchor === "top" || anchor === "bottom" ? "auto" : 250 }}
      role="presentation"
    >
      <List>
        <ListItem component="div" disablePadding>
          <ListItem>
            <IconButton
              id="sidebar-closer-button"
              onClick={toggleDrawer(anchor, true)}
            >
              <CloseRoundedIcon id="sidebar-close-button-icon" />
            </IconButton>
            <ListItemText>Hotspot Sidebar</ListItemText>
          </ListItem>
        </ListItem>
      </List>
      <Divider />
      <List>
        {Array.from(Object.values(vfe.photospheres)).map((photosphere) => (
          <ListItem key={photosphere.id} disablePadding>
            <ListItemButton onClick={openList}>
              <ListItemText primary={photosphere.id} />
              {open ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {Array.from(Object.values(photosphere.hotspots))?.map(
                  (hotspot) => (
                    <ListItem key={hotspot.id} component="div" disablePadding>
                      <ListItemButton onClick={openList}>
                        <ListItemText primary={hotspot.id} />
                      </ListItemButton>
                      {"hotspots" in hotspot && hotspot?.hotspots ? (
                        <ListItemButton onClick={openList}>
                          {open ? <ExpandLess /> : <ExpandMore />}
                        </ListItemButton>
                      ) : null}
                      {"hotspots" in hotspot && hotspot?.hotspots ? (
                        <Collapse in={open} timeout="auto" unmountOnExit>
                          <List>
                            {Array.from(Object.values(hotspot.hotspots))?.map(
                              (nestedHotspot) => (
                                <ListItemButton onClick={openList}>
                                  <ListItemText primary={nestedHotspot.id} />
                                </ListItemButton>
                              ),
                            )}
                          </List>
                        </Collapse>
                      ) : null}
                    </ListItem>
                  ),
                )}
              </List>
            </Collapse>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <div>
      {([anchorOptions] as const).map((anchor) => (
        <React.Fragment key={anchor}>
          <IconButton
            id="sidebar-toggle-button"
            color="primary"
            onClick={toggleDrawer(anchor, true)}
            sx={{
              position: "fixed",
              top: "16px",
              right: "16px",
              zIndex: 1000,
            }}
          >
            <LocationSearchingIcon id="sidebar-toggle-button-icon" />
          </IconButton>
          <Drawer
            anchor={anchor}
            open={state[anchor]}
            onClose={toggleDrawer(anchor, false)}
          >
            {list(anchor)}
          </Drawer>
        </React.Fragment>
      ))}
    </div>
  );
}

export default PhotosphereHotspotSideBar;
