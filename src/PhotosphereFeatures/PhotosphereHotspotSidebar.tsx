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

import {
  Hotspot2D,
  Hotspot3D,
  Photosphere,
  VFE,
} from "../Pages/PageUtility/DataStructures";

export interface PhotosphereHotspotSideBarProps {
  vfe: VFE;
  currentPS: string;
  hotspotArray: (Hotspot3D | Hotspot2D)[];
  setValue: (value: string) => void;
  setHotspotArray: (arr: (Hotspot3D | Hotspot2D)[]) => void;
  centerHotspot: (hotspotArray: (Hotspot3D | Hotspot2D)[]) => void;
}

function PhotosphereHotspotSideBar({
  vfe,
  currentPS,
  hotspotArray,
  setValue,
  setHotspotArray,
  centerHotspot,
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

  function handlePSListClick(photosphere: string) {
    currentPS === photosphere ? null : setValue(photosphere);
  }

  function handleHSListClick(hotspot: Hotspot3D, photosphereId: string) {
    if (currentPS !== photosphereId) setValue(photosphereId);
    setHotspotArray([hotspot]);
    centerHotspot(hotspotArray);
  }

  function hasHotspots(
    data: any,
  ): data is { hotspots: Record<string, Hotspot2D> } {
    return (
      data &&
      typeof data === "object" &&
      "hotspots" in data &&
      typeof data.hotspots === "object"
    );
  }

  const photosphereList = (vfe: VFE) => (
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
            <ListItemButton onClick={() => handlePSListClick(photosphere.id)}>
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
                  (hotspot) => hotspotList(hotspot, [], photosphere),
                )}
              </List>
            </Collapse>
          </React.Fragment>
        ))}
      </List>
    </Box>
  );

  const hotspotList = (
    hotspot: Hotspot3D,
    path: (Hotspot3D | Hotspot2D)[] = [],
    photosphere: Photosphere,
  ) =>
    hotspot.data.tag === "PhotosphereLink" ? null : hasHotspots(
        hotspot.data,
      ) ? (
      <>
        <ListItem
          key={hotspot.id}
          secondaryAction={
            Object.keys(hotspot.data.hotspots).length > 0 && (
              <IconButton
                edge="end"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleList(hotspot.id);
                }}
                size="small"
              >
                {expandList[hotspot.id] ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            )
          }
          disablePadding
        >
          <ListItemButton
            onClick={() => {
              handleHSListClick(hotspot, photosphere.id);
              setHotspotArray([...path, hotspot]);
              centerHotspot([...path, hotspot]);
            }}
          >
            <ListItemText primary={hotspot.tooltip} />
          </ListItemButton>
        </ListItem>
        {Object.keys(hotspot.data.hotspots).length > 0 && (
          <Collapse in={expandList[hotspot.id]} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {Array.from(Object.values(hotspot.data.hotspots)).map(
                (nestedHotspot) => (
                  <React.Fragment key={nestedHotspot.id}>
                    {nestedHotspotList(
                      nestedHotspot,
                      [...path, hotspot],
                      photosphere,
                    )}
                  </React.Fragment>
                ),
              )}
            </List>
          </Collapse>
        )}
      </>
    ) : (
      <ListItem key={hotspot.id} disablePadding>
        <ListItemButton
          onClick={() => {
            handleHSListClick(hotspot, photosphere.id);
            setHotspotArray([...path, hotspot]);
            centerHotspot([...path, hotspot]);
          }}
        >
          <ListItemText primary={hotspot.tooltip} />
        </ListItemButton>
      </ListItem>
    );

  const nestedHotspotList = (
    hotspot: Hotspot2D,
    path: (Hotspot3D | Hotspot2D)[] = [],
    photosphere: Photosphere,
  ) =>
    hasHotspots(hotspot.data) ? (
      <>
        <ListItem
          key={hotspot.id}
          secondaryAction={
            Object.keys(hotspot.data.hotspots).length > 0 && (
              <IconButton
                edge="end"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleList(hotspot.id);
                }}
                size="small"
              >
                {expandList[hotspot.id] ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            )
          }
          disablePadding
        >
          <ListItemButton
            onClick={() => {
              setHotspotArray([...path, hotspot]);
              centerHotspot([...path, hotspot]);
            }}
          >
            <ListItemText primary={hotspot.tooltip} />
          </ListItemButton>
        </ListItem>
        {Object.keys(hotspot.data.hotspots).length > 0 && (
          <Collapse in={expandList[hotspot.id]} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {Array.from(Object.values(hotspot.data.hotspots)).map(
                (nestedHotspot) => (
                  <React.Fragment key={nestedHotspot.id}>
                    {nestedHotspotList(
                      nestedHotspot,
                      [...path, hotspot],
                      photosphere,
                    )}
                  </React.Fragment>
                ),
              )}
            </List>
          </Collapse>
        )}
      </>
    ) : (
      <ListItem key={hotspot.id} disablePadding>
        <ListItemButton
          onClick={() => {
            setHotspotArray([...path, hotspot]);
            centerHotspot([...path, hotspot]);
          }}
        >
          <ListItemText primary={hotspot.tooltip} />
        </ListItemButton>
      </ListItem>
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
        {photosphereList(vfe)}
      </Drawer>
    </>
  );
}

export default PhotosphereHotspotSideBar;
