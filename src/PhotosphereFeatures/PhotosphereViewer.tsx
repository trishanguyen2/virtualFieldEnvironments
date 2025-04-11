import { Point, Viewer, ViewerConfig } from "@photo-sphere-viewer/core";
import { MapHotspot } from "@photo-sphere-viewer/map-plugin";
import { MarkerConfig } from "@photo-sphere-viewer/markers-plugin";
import {
  VirtualTourLink,
  VirtualTourNode,
} from "@photo-sphere-viewer/virtual-tour-plugin";
import React, { useEffect, useRef, useState } from "react";
import {
  MapPlugin,
  MapPluginConfig,
  MarkersPlugin,
  ReactPhotoSphereViewer,
  ViewerAPI,
  VirtualTourPlugin,
  VirtualTourPluginConfig,
} from "react-photo-sphere-viewer";

import {
  Box,
  FormControlLabel,
  Stack,
  Switch,
  SwitchProps,
  alpha,
  styled,
} from "@mui/material";
import { common } from "@mui/material/colors";

import { useVisitedState } from "../Hooks/HandleVisit";
import {
  Hotspot2D,
  Hotspot3D,
  NavMap,
  Photosphere,
  VFE,
} from "../Pages/PageUtility/DataStructures";
import PopOver from "../Pages/PageUtility/PopOver";
import { HotspotUpdate } from "../Pages/PageUtility/VFEConversion";
import { LinkArrowIconHTML } from "../UI/LinkArrowIcon";
import AudioToggleButton from "../buttons/AudioToggleButton";
import PhotospherePlaceholder from "./PhotospherePlaceholder";
import PhotosphereSelector from "./PhotosphereSelector";

// modified from https://mui.com/material-ui/react-switch/#customization 'iOS style'
const StyledSwitch = styled((props: SwitchProps) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 42,
  height: 26,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 2,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(16px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: theme.palette.primary.main,
        opacity: 1,
        border: 0,
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: 0.5,
      },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      border: "6px solid #fff",
    },
    "&.Mui-disabled .MuiSwitch-thumb": {
      color:
        theme.palette.mode === "light"
          ? theme.palette.grey[100]
          : theme.palette.grey[600],
    },
    "&.Mui-disabled + .MuiSwitch-track": {
      opacity: theme.palette.mode === "light" ? 0.7 : 0.3,
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 22,
    height: 22,
  },
  "& .MuiSwitch-track": {
    borderRadius: 26 / 2,
    backgroundColor: theme.palette.mode === "light" ? "#E9E9EA" : "#39393D",
    opacity: 1,
  },
}));

/** Convert yaw/pitch degrees from numbers to strings ending in "deg" */
function degToStr(val: number): string {
  return String(val) + "deg";
}

/** Convert sizes from numbers to strings ending in "px" */
function sizeToStr(val: number): string {
  return String(val) + "px";
}

/** Convert non-link hotspots to markers with type-based content/icons */
function convertHotspots(
  hotspots: Record<string, Hotspot3D>,
  isViewerMode: boolean,
): MarkerConfig[] {
  const markers: MarkerConfig[] = [];

  for (const hotspot of Object.values(hotspots)) {
    if (isViewerMode && hotspot.data.tag === "PhotosphereLink") continue;

    const marker: MarkerConfig = {
      id: hotspot.id,
      size: { width: 64, height: 64 },
      position: {
        yaw: degToStr(hotspot.yaw),
        pitch: degToStr(hotspot.pitch),
      },
      tooltip: hotspot.tooltip,
    };
    if (hotspot.data.tag === "PhotosphereLink") {
      marker.html = LinkArrowIconHTML({
        color: alpha(common.white, 0.8),
        size: 80,
      });
    } else {
      marker.image = hotspot.icon.path;
    }

    markers.push(marker);
  }

  return markers;
}

interface LinkData {
  tooltip: string;
}

/** Convert photosphere-link hotspots to virtual tour links  */
function convertLinks(
  hotspots: Record<string, Hotspot3D>,
  isViewerMode: boolean,
): VirtualTourLink[] {
  if (!isViewerMode) {
    return [];
  }

  const links: VirtualTourLink[] = [];

  for (const hotspot of Object.values(hotspots)) {
    if (hotspot.data.tag !== "PhotosphereLink") continue;

    links.push({
      nodeId: hotspot.data.photosphereID,
      position: {
        pitch: degToStr(hotspot.pitch),
        yaw: degToStr(hotspot.yaw),
      },
      data: { tooltip: hotspot.tooltip } as LinkData,
    });
  }

  return links;
}

function convertMap(
  map: NavMap,
  photospheres: Record<string, Photosphere>,
  currentCenter?: Point,
  staticEnabled = false,
): MapPluginConfig {
  const hotspots: MapHotspot[] = [];

  for (const [id, photosphere] of Object.entries(photospheres)) {
    if (photosphere.center === undefined) continue;

    hotspots.push({
      id: id,
      tooltip: id,
      x: photosphere.center.x,
      y: photosphere.center.y,
      color: "yellow",
    });
  }

  return {
    imageUrl: map.src.path,
    center: currentCenter ?? map.defaultCenter,
    rotation: map.rotation,
    defaultZoom: map.defaultZoom,
    minZoom: 1,
    maxZoom: 100,
    size: sizeToStr(map.size),
    hotspots,
    static: staticEnabled,
  };
}

export interface PhotosphereViewerProps {
  vfe: VFE;
  currentPS: string;
  onChangePS: (id: string) => void;
  onViewerClick?: (pitch: number, yaw: number) => void;
  onUpdateHotspot?: (
    hotspotPath: string[],
    update: HotspotUpdate | null,
  ) => void;
  photosphereOptions?: string[];
}

function PhotosphereViewer({
  vfe,
  currentPS,
  onChangePS,
  onViewerClick,
  onUpdateHotspot,
  photosphereOptions,
}: PhotosphereViewerProps) {
  const [primaryPhotosphere, setPrimaryPhotosphere] =
    React.useState<Photosphere>(vfe.photospheres[currentPS]);
  const [splitPhotosphere, setSplitPhotosphere] =
    React.useState<Photosphere>(vfe.photospheres[currentPS]);
  const [mapStatic, setMapStatic] = useState(false);
  const [hotspotArray, setHotspotArray] = useState<(Hotspot3D | Hotspot2D)[]>(
    [],
  );
  const hotspotPath = hotspotArray.map((h) => h.id);

  return (
    <>
      <Stack
        direction="row"
        sx={{
          position: "absolute",
          top: "16px",
          left: 0,
          right: 0,
          maxWidth: "420px",
          width: "fit-content",
          minWidth: "150px",
          height: "45px",
          padding: "4px",
          margin: "auto",
          backgroundColor: "white",
          borderRadius: "4px",
          boxShadow: "0 0 4px grey",
          zIndex: 100,
          justifyContent: "space-between",
          alignItems: "center",
        }}
        gap={1}
      >
        <Box sx={{ padding: "0 5px" }}>
          <PhotosphereSelector
            size="small"
            options={Object.keys(vfe.photospheres)}
            value={primaryPhotosphere.id}
            setValue={(id) => {
              setPrimaryPhotosphere(vfe.photospheres[id]);
              setSplitPhotosphere(vfe.photospheres[id]);
              onChangePS(id);
            }}
          />
        </Box>
        {primaryPhotosphere.backgroundAudio && (
          <AudioToggleButton src={primaryPhotosphere.backgroundAudio.path} />
        )}
        <FormControlLabel
          control={
            <StyledSwitch
              defaultChecked
              onChange={() => {
                setMapStatic(!mapStatic);
              }}
            />
          }
          label="Map Rotation"
          componentsProps={{
            typography: {
              sx: { fontSize: "14px", padding: 1, width: "60px" },
            },
          }}
          sx={{ margin: 0 }}
        />
      </Stack>

      {hotspotArray.length > 0 && (
        <PopOver
          key={hotspotPath.join()}
          hotspotPath={hotspotPath}
          hotspot={hotspotArray[hotspotArray.length - 1]}
          pushHotspot={(add: Hotspot2D) => {
            setHotspotArray([...hotspotArray, add]);
          }}
          popHotspot={() => {
            setHotspotArray(hotspotArray.slice(0, -1));
          }}
          closeAll={() => {
            setHotspotArray([]);
          }}
          onUpdateHotspot={onUpdateHotspot}
          changeScene={(id) => {
            setPrimaryPhotosphere(vfe.photospheres[id]);
            onChangePS(id);
          }}
          photosphereOptions={photosphereOptions}
        />
      )}
      <Stack
        direction="row"
        sx={{
          top: "16px",
          left: 0,
          right: 0,
          width: "100%",
          minWidth: "150px",
          height: "100%",
          padding: "4px",
          margin: "auto",
          backgroundColor: "white",
          borderRadius: "4px",
          boxShadow: "0 0 4px grey",
          zIndex: 100,
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <PhotospherePlaceholder
          vfe={vfe}
          currentPS={currentPS}
          onChangePS={onChangePS}
          onUpdateHotspot={onUpdateHotspot}
          onViewerClick={onViewerClick}
          isPrimary={true}
          setHotspotArray={setHotspotArray}
          currentPhotosphere={primaryPhotosphere}
          setCurrentPhotosphere={setPrimaryPhotosphere}
        />
        <PhotospherePlaceholder
          vfe={vfe}
          currentPS={currentPS}
          onChangePS={onChangePS}
          onUpdateHotspot={onUpdateHotspot}
          onViewerClick={onViewerClick}
          isPrimary={false}
          setHotspotArray={setHotspotArray}
          currentPhotosphere={splitPhotosphere}
          setCurrentPhotosphere={setSplitPhotosphere}
        />
      </Stack>
    </>
  );
}

export default PhotosphereViewer;
