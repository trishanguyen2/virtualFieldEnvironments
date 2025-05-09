import React, { useState } from "react";
import { ViewerAPI } from "react-photo-sphere-viewer";

import {
  Box,
  Button,
  FormControlLabel,
  Stack,
  Switch,
  SwitchProps,
  Typography,
  styled,
} from "@mui/material";

import { Photosphere, VFE } from "../Pages/PageUtility/DataStructures";
import { usePoints } from "../Pages/PageUtility/PointsInterface.tsx";
import { HotspotUpdate } from "../Pages/PageUtility/VFEConversion";
import PhotosphereHotspotSideBar from "../PhotosphereFeatures/PhotosphereHotspotSidebar.tsx";
import PhotospherePlaceholder from "../PhotosphereFeatures/PhotospherePlaceholder";
import PhotosphereSelector from "../PhotosphereFeatures/PhotosphereSelector";
import PhotosphereTutorialEditor from "../PhotosphereFeatures/PhotosphereTutorialCreate.tsx";
import AudioToggleButton from "../buttons/AudioToggleButton";

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

export interface PhotosphereViewerProps {
  vfe: VFE;
  currentPS: string;
  onChangePS: (id: string) => void;
  onViewerClick?: (elevation: number, direction: number) => void;
  onUpdateHotspot?: (
    hotspotPath: string[],
    update: HotspotUpdate | null,
  ) => void;
  photosphereOptions?: string[];
  isGamified: boolean;
}

export interface ViewerStates {
  references: React.MutableRefObject<ViewerAPI | null>[];
  states: Photosphere[];
  setStates: React.Dispatch<React.SetStateAction<Photosphere>>[];
}

export interface ViewerProps {
  vfe: VFE;
  currentPS: string;
  onChangePS: (id: string) => void;
  onViewerClick?: (elevation: number, direction: number) => void;
  onUpdateHotspot?: (
    hotspotPath: string[],
    update: HotspotUpdate | null,
  ) => void;
  photosphereOptions?: string[];
  states: ViewerStates;
}

function PhotosphereViewer({
  vfe,
  currentPS,
  onChangePS,
  onViewerClick,
  onUpdateHotspot,
  photosphereOptions,
  isGamified,
}: PhotosphereViewerProps) {
  const primaryPsRef = React.useRef<ViewerAPI | null>(null);
  const splitRef = React.useRef<ViewerAPI | null>(null);
  const [primaryPhotosphere, setPrimaryPhotosphere] =
    React.useState<Photosphere>(vfe.photospheres[currentPS]);
  const [splitPhotosphere, setSplitPhotosphere] = React.useState<Photosphere>(
    vfe.photospheres[currentPS],
  );
  const [mapStatic, setMapStatic] = useState(false);

  const [isSplitView, setIsSplitView] = useState(false);
  const [lockViews, setLockViews] = useState(false);

  const [points, AddPoints] = usePoints();

  const maxPoints = 100;

  const viewerProps: ViewerProps = {
    vfe,
    currentPS,
    onChangePS,
    onViewerClick,
    onUpdateHotspot,
    photosphereOptions,
    states: {
      references: [primaryPsRef, splitRef],
      states: [primaryPhotosphere, splitPhotosphere],
      setStates: [setPrimaryPhotosphere, setSplitPhotosphere],
    },
  };

  return (
    <>
      <PhotosphereTutorialEditor /> {}
      <Stack
        direction="row"
        sx={{
          position: "absolute",
          top: "16px",
          left: 0,
          right: 0,
          maxWidth: "100%",
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
          <Button
            sx={{ height: "35px" }}
            variant="outlined"
            onClick={() => {
              setIsSplitView(!isSplitView);
            }}
          >
            <Typography sx={{ fontSize: "14px" }}>Split View</Typography>
          </Button>
        </Box>
        {isSplitView && (
          <Box>
            <Button
              variant={lockViews ? "contained" : "outlined"}
              sx={{
                height: "35px",
              }}
              onClick={() => {
                setLockViews(!lockViews);
              }}
            >
              <Typography sx={{ fontSize: "14px" }}>
                {lockViews ? "Unl" : "L"}ock Views
              </Typography>
            </Button>
          </Box>
        )}
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
        {isGamified && (
          <Box sx={{ padding: "0 5px" }}>
            <Button
              sx={{ padding: "0", width: "4px", height: "40px" }}
              variant="contained"
              color="primary"
              onClick={() => {
                void AddPoints(10);
              }}
            >
              Add Points!
            </Button>
          </Box>
        )}
      </Stack>
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
          viewerProps={viewerProps}
          isPrimary={true}
          mapStatic={mapStatic}
          lockViews={lockViews}
        />
        {isSplitView && (
          <PhotospherePlaceholder
            viewerProps={viewerProps}
            isPrimary={false}
            mapStatic={mapStatic}
            lockViews={lockViews}
          />
        )}
      </Stack>
      <Box
        sx={{
          position: "fixed",
          top: "16px",
          right: "16px",
          backgroundColor: "white",
          borderRadius: "50%",
          boxShadow: "0 0 4px grey",
          zIndex: 110, // Ensure it appears above other elements
        }}
      >
        <PhotosphereHotspotSideBar
          vfe={vfe}
          currentPS={primaryPhotosphere.id}
          setValue={(id) => {
            setPrimaryPhotosphere(vfe.photospheres[id]);
            setSplitPhotosphere(vfe.photospheres[id]);
            onChangePS(id);
          }}
        />
      </Box>
      {isGamified && (
        <Stack
          direction="row"
          sx={{
            position: "absolute",
            bottom: "44px",
            left: 0,
            right: 0,
            maxWidth: "100%",
            width: "fit-content",
            minWidth: "150px",
            height: "25px",
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
          <progress value={points ?? 0} max={maxPoints} />{" "}
        </Stack>
      )}
    </>
  );
}

export default PhotosphereViewer;
