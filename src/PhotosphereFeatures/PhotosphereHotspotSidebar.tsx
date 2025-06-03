import * as React from "react";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ImageIcon from "@mui/icons-material/Image";
import MapIcon from "@mui/icons-material/Map";
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
    [parentId: string]: string | null;
  }>({ root: null });
  const [expandedImage, setExpandedImage] = React.useState<string | null>(null);

  const toggleList = (parentId: string, listId: string) => {
    setExpandList((prev) => ({
      ...prev,
      [parentId]: prev[parentId] === listId ? null : listId,
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
        <ListItem
          component="div"
          disablePadding
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box sx={{ flex: "0 0 auto", px: 1 }}>
            <IconButton
              id="sidebar-closer-button"
              onClick={toggleDrawer(false)}
            >
              <CloseRoundedIcon
                color="primary"
                id="sidebar-close-button-icon"
              />
            </IconButton>
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box
            sx={{ flex: 1, display: "flex", justifyContent: "center", px: 1 }}
          >
            <ListItemText
              primary="Hotspots"
              sx={{
                textAlign: "center",
                m: 0,
                "& .MuiListItemText-primary": {
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  color: "primary.main",
                },
              }}
            />
          </Box>
        </ListItem>
      </List>
      <Divider />
      <List>
        {Object.values(vfe.photospheres).map((photosphere, idx, arr) => (
          <React.Fragment key={photosphere.id}>
            <ListItem
              disablePadding
              sx={{ backgroundColor: getBackgroundColor(0) }}
            >
              <ListItemButton onClick={() => handlePSListClick(photosphere.id)}>
                <ListItemText
                  primary={
                    <span style={{ display: "flex", alignItems: "center" }}>
                      {photosphere.id}
                    </span>
                  }
                />
              </ListItemButton>
              <IconButton onClick={() => toggleList("root", photosphere.id)}>
                {expandList["root"] === photosphere.id ? (
                  <ExpandLess color="primary" />
                ) : (
                  <ExpandMore color="primary" />
                )}
              </IconButton>
            </ListItem>
            {idx < arr.length - 1 && <Divider />}
            <Collapse
              in={expandList["root"] === photosphere.id}
              timeout="auto"
              unmountOnExit
            >
              <List component="div" disablePadding>
                {Object.values(photosphere.hotspots).map(
                  (hotspot, hIdx, hArr) => (
                    <React.Fragment key={hotspot.id}>
                      {hotspotList(hotspot, [], photosphere, 1, photosphere.id)}
                      {hIdx < hArr.length - 1 && <Divider />}
                    </React.Fragment>
                  ),
                )}
              </List>
            </Collapse>
          </React.Fragment>
        ))}
      </List>
    </Box>
  );

  function getBackgroundColor(depth: number) {
    const shade = Math.max(255 - depth * 18, 26);
    return `rgb(${shade},${shade},${shade})`;
  }

  function getImageData(hotspot: Hotspot3D | Hotspot2D) {
    if (hotspot.data?.tag === "Image" && hotspot.data?.src) {
      return hotspot.data.src.path;
    }
    return null;
  }

  const hotspotList = (
    hotspot: Hotspot3D,
    path: (Hotspot3D | Hotspot2D)[] = [],
    photosphere: Photosphere,
    depth = 1,
    parentId: string,
  ) => {
    const imagePath = getImageData(hotspot);

    return hotspot.data.tag === "PhotosphereLink" ? null : hasHotspots(
        hotspot.data,
      ) ? (
      <>
        <ListItem
          key={hotspot.id}
          disablePadding
          sx={{ backgroundColor: getBackgroundColor(depth) }}
          secondaryAction={
            <>
              {imagePath && (
                <IconButton
                  edge="end"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedImage(
                      expandedImage === hotspot.id ? null : hotspot.id,
                    );
                  }}
                  size="small"
                >
                  <ImageIcon />
                </IconButton>
              )}
              {Object.keys(hotspot.data.hotspots).length > 0 && (
                <IconButton
                  edge="end"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleList(parentId, hotspot.id);
                  }}
                  size="small"
                >
                  {expandList[parentId] === hotspot.id ? (
                    <ExpandLess />
                  ) : (
                    <ExpandMore />
                  )}
                </IconButton>
              )}
            </>
          }
        >
          <ListItemButton
            onClick={() => {
              handleHSListClick(hotspot, photosphere.id);
              setHotspotArray([...path, hotspot]);
              centerHotspot([...path, hotspot]);
            }}
            sx={{ backgroundColor: getBackgroundColor(depth) }}
          >
            {/* Thumbnail removed from here */}
            <ListItemText
              primary={
                <span style={{ display: "flex", alignItems: "center" }}>
                  {hotspot.tooltip}
                </span>
              }
              sx={{
                flex: 1,
                minWidth: 0,
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
              }}
            />
          </ListItemButton>
        </ListItem>
        {imagePath && expandedImage === hotspot.id && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              backgroundColor: getBackgroundColor(depth + 1),
              py: 1,
            }}
          >
            <img
              src={imagePath}
              alt="expanded-thumbnail"
              style={{ maxWidth: "90%", maxHeight: 150, borderRadius: 8 }}
            />
          </Box>
        )}
        {Object.keys(hotspot.data.hotspots).length > 0 && (
          <Collapse
            in={expandList[parentId] === hotspot.id}
            timeout="auto"
            unmountOnExit
          >
            <List component="div" disablePadding>
              {Object.values(hotspot.data.hotspots).map((nestedHotspot) =>
                nestedHotspotList(
                  nestedHotspot,
                  [...path, hotspot],
                  photosphere,
                  depth + 1,
                  hotspot.id,
                ),
              )}
            </List>
          </Collapse>
        )}
      </>
    ) : (
      <>
        <ListItem
          key={hotspot.id}
          disablePadding
          sx={{ backgroundColor: getBackgroundColor(depth) }}
          secondaryAction={
            imagePath && (
              <IconButton
                edge="end"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedImage(
                    expandedImage === hotspot.id ? null : hotspot.id,
                  );
                }}
                size="small"
              >
                <ImageIcon />
              </IconButton>
            )
          }
        >
          <ListItemButton
            onClick={() => {
              handleHSListClick(hotspot, photosphere.id);
              setHotspotArray([...path, hotspot]);
              centerHotspot([...path, hotspot]);
            }}
            sx={{ backgroundColor: getBackgroundColor(depth) }}
          >
            {/* Thumbnail removed from here */}
            <ListItemText
              primary={
                <span style={{ display: "flex", alignItems: "center" }}>
                  {hotspot.tooltip}
                </span>
              }
              sx={{
                flex: 1,
                minWidth: 0,
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
              }}
            />
          </ListItemButton>
        </ListItem>
        {imagePath && expandedImage === hotspot.id && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              backgroundColor: getBackgroundColor(depth + 1),
              py: 1,
            }}
          >
            <img
              src={imagePath}
              alt="expanded-thumbnail"
              style={{ maxWidth: "90%", maxHeight: 150, borderRadius: 8 }}
            />
          </Box>
        )}
      </>
    );
  };

  const nestedHotspotList = (
    hotspot: Hotspot2D,
    path: (Hotspot3D | Hotspot2D)[] = [],
    photosphere: Photosphere,
    depth = 2,
    parentId: string,
  ) => {
    const imagePath = getImageData(hotspot);

    return hasHotspots(hotspot.data) ? (
      <>
        <ListItem
          key={hotspot.id}
          disablePadding
          sx={{ backgroundColor: getBackgroundColor(depth) }}
          secondaryAction={
            <>
              {imagePath && (
                <IconButton
                  edge="end"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedImage(
                      expandedImage === hotspot.id ? null : hotspot.id,
                    );
                  }}
                  size="small"
                >
                  <ImageIcon />
                </IconButton>
              )}
              {Object.keys(hotspot.data.hotspots).length > 0 && (
                <IconButton
                  edge="end"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleList(parentId, hotspot.id);
                  }}
                  size="small"
                >
                  {expandList[parentId] === hotspot.id ? (
                    <ExpandLess />
                  ) : (
                    <ExpandMore />
                  )}
                </IconButton>
              )}
            </>
          }
        >
          <ListItemButton
            onClick={() => {
              setHotspotArray([...path, hotspot]);
              centerHotspot([...path, hotspot]);
            }}
            sx={{ backgroundColor: getBackgroundColor(depth) }}
          >
            {/* Thumbnail removed from here */}
            <ListItemText
              primary={
                <span style={{ display: "flex", alignItems: "center" }}>
                  {hotspot.tooltip}
                </span>
              }
              sx={{
                flex: 1,
                minWidth: 0,
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
              }}
            />
          </ListItemButton>
        </ListItem>
        {imagePath && expandedImage === hotspot.id && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              backgroundColor: getBackgroundColor(depth + 1),
              py: 1,
            }}
          >
            <img
              src={imagePath}
              alt="expanded-thumbnail"
              style={{ maxWidth: "90%", maxHeight: 150, borderRadius: 8 }}
            />
          </Box>
        )}
        {Object.keys(hotspot.data.hotspots).length > 0 && (
          <Collapse
            in={expandList[parentId] === hotspot.id}
            timeout="auto"
            unmountOnExit
          >
            <List component="div" disablePadding>
              {Object.values(hotspot.data.hotspots).map((nestedHotspot) =>
                nestedHotspotList(
                  nestedHotspot,
                  [...path, hotspot],
                  photosphere,
                  depth + 1,
                  hotspot.id,
                ),
              )}
            </List>
          </Collapse>
        )}
      </>
    ) : (
      <>
        <ListItem
          key={hotspot.id}
          disablePadding
          sx={{ backgroundColor: getBackgroundColor(depth) }}
          secondaryAction={
            imagePath && (
              <IconButton
                edge="end"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedImage(
                    expandedImage === hotspot.id ? null : hotspot.id,
                  );
                }}
                size="small"
              >
                <ImageIcon />
              </IconButton>
            )
          }
        >
          <ListItemButton
            onClick={() => {
              setHotspotArray([...path, hotspot]);
              centerHotspot([...path, hotspot]);
            }}
            sx={{ backgroundColor: getBackgroundColor(depth) }}
          >
            {/* Thumbnail removed from here */}
            <ListItemText
              primary={
                <span style={{ display: "flex", alignItems: "center" }}>
                  {hotspot.tooltip}
                </span>
              }
              sx={{
                flex: 1,
                minWidth: 0,
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
              }}
            />
          </ListItemButton>
        </ListItem>
        {imagePath && expandedImage === hotspot.id && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              backgroundColor: getBackgroundColor(depth + 1),
              py: 1,
            }}
          >
            <img
              src={imagePath}
              alt="expanded-thumbnail"
              style={{ maxWidth: "90%", maxHeight: 150, borderRadius: 8 }}
            />
          </Box>
        )}
      </>
    );
  };

  return (
    <>
      <Box
        className="hotspot-sidebar"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          borderRadius: "999px",
          backgroundColor: "background.paper",
          boxShadow: 1,
          cursor: "pointer",
          px: 2,
          py: 0.5,
          height: 40,
          minWidth: 0,
          fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
        }}
        onClick={toggleDrawer(true)}
      >
        <MapIcon
          id="sidebar-toggle-button-icon"
          sx={{
            fontSize: 32,
            color: "primary.main",
            mr: 1,
          }}
        />
        <Box
          sx={{
            fontWeight: 500,
            fontSize: "1rem",
            color: "primary.main",
            whiteSpace: "nowrap",
            userSelect: "none",
            fontFamily: "inherit",
          }}
        >
          Hotspots
        </Box>
      </Box>
      <Drawer anchor="right" open={expandDrawer} onClose={toggleDrawer(false)}>
        {photosphereList(vfe)}
      </Drawer>
    </>
  );
}

export default PhotosphereHotspotSideBar;
