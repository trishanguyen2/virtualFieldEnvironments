import * as React from "react";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import LocationOnIcon from "@mui/icons-material/LocationOn";
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

import { Hotspot2D, Hotspot3D, VFE } from "../Pages/PageUtility/DataStructures";

export interface PhotosphereHotspotSideBarProps {
  vfe: VFE;
  currentPS: string;
  setValue: (value: string) => void;
}

function PhotosphereHotspotSideBar({
  vfe,
  currentPS,
  setValue,
}: PhotosphereHotspotSideBarProps) {
  const [expandDrawer, setExpandDrawer] = React.useState(false);
  const [expandList, setExpandList] = React.useState<{
    [key: string]: boolean;
  }>({});
  const toggleList = (listId: string) => {
    setExpandList((prev) => ({
      ...prev,
      [listId]: !prev[listId],
    }));
  };

  function toggleDrawer(open: boolean) {
    return (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === "keydown" &&
        ((event as React.KeyboardEvent).key === "Tab" ||
          (event as React.KeyboardEvent).key === "Shift")
      ) {
        return;
      }

      setExpandDrawer(open);
    };
  }

  function handleClick(photosphere: string) {
    currentPS === photosphere ? null : setValue(photosphere);
  }

  const nestedHotspotList = (hotspot: Hotspot2D) =>
    hotspot.data.tag === "Image" ? (
      <>
        <ListItemButton key={hotspot.id} onClick={() => toggleList(hotspot.id)}>
          <ListItemText primary={hotspot.tooltip} />
          {Object.keys(hotspot.data.hotspots).length > 0 ? (
            <>{expandList[hotspot.id] ? <ExpandLess /> : <ExpandMore />}</>
          ) : null}
        </ListItemButton>
        <>
          {Object.keys(hotspot.data.hotspots).length > 0 ? (
            <Collapse in={expandList[hotspot.id]} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {Array.from(Object.values(hotspot.data.hotspots)).map(
                  (nestedHotspot) => (
                    <>{nestedHotspotList(nestedHotspot)}</>
                  ),
                )}
              </List>
            </Collapse>
          ) : null}
        </>
      </>
    ) : (
      <>
        <ListItemButton key={hotspot.id}>
          <ListItemText primary={hotspot.tooltip} />
        </ListItemButton>
      </>
    );

  const hotspotList = (hotspot: Hotspot3D) =>
    hotspot.data.tag === "PhotosphereLink" ? null : hotspot.data.tag ===
      "Image" ? (
      <>
        <ListItemButton key={hotspot.id} onClick={() => toggleList(hotspot.id)}>
          <ListItemText primary={hotspot.tooltip} />
          {Object.keys(hotspot.data.hotspots).length > 0 ? (
            <>{expandList[hotspot.id] ? <ExpandLess /> : <ExpandMore />}</>
          ) : null}
        </ListItemButton>
        <>
          {Object.keys(hotspot.data.hotspots).length > 0 ? (
            <Collapse in={expandList[hotspot.id]} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {Array.from(Object.values(hotspot.data.hotspots)).map(
                  (nestedHotspot) => (
                    <>{nestedHotspotList(nestedHotspot)}</>
                  ),
                )}
              </List>
            </Collapse>
          ) : null}
        </>
      </>
    ) : (
      <>
        <ListItemButton key={hotspot.id}>
          <ListItemText primary={hotspot.tooltip} />
        </ListItemButton>
      </>
    );

  const drawer = (vfe: VFE) => (
    <Box sx={{ width: 250 }} role="presentation">
      <List>
        <ListItem component="div" disablePadding>
          <IconButton id="sidebar-closer-button" onClick={toggleDrawer(false)}>
            <CloseRoundedIcon color="primary" id="sidebar-close-button-icon" />
          </IconButton>
          <Divider orientation="vertical" variant="middle" flexItem />
          <ListItemText
            sx={{
              alignContent: "center",
            }}
          >
            Hotspot Sidebar
          </ListItemText>
        </ListItem>
      </List>
      <Divider />
      <List>
        {Array.from(Object.values(vfe.photospheres)).map((photosphere) => (
          <React.Fragment key={photosphere.id}>
            <ListItemButton onClick={() => handleClick(photosphere.id)}>
              <ListItemText primary={photosphere.id} />
              <IconButton onClick={() => toggleList(photosphere.id)}>
                {expandList[photosphere.id] ? (
                  <ExpandLess color="primary" />
                ) : (
                  <ExpandMore color="primary" />
                )}
              </IconButton>
            </ListItemButton>
            <Collapse
              in={expandList[photosphere.id]}
              timeout="auto"
              unmountOnExit
            >
              <List component="div" disablePadding>
                {Array.from(Object.values(photosphere.hotspots))?.map(
                  (hotspot) => hotspotList(hotspot),
                )}
              </List>
            </Collapse>
          </React.Fragment>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <IconButton
        id="sidebar-toggle-button"
        color="primary"
        sx={{
          alignContent: "center",
        }}
        onClick={toggleDrawer(true)}
      >
        <LocationOnIcon id="sidebar-toggle-button-icon" sx={{ fontSize: 35 }} />
      </IconButton>
      <Drawer anchor="right" open={expandDrawer} onClose={toggleDrawer(false)}>
        {drawer(vfe)}
      </Drawer>
    </>
  );
}

export default PhotosphereHotspotSideBar;
