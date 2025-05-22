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

import { useVisitedState } from "../Hooks/HandleVisit.tsx";
import { useVFELoaderContext } from "../Hooks/VFELoaderContext.tsx";
import { Hotspot3D, Photosphere } from "../Pages/PageUtility/DataStructures";
import { usePoints } from "../Pages/PageUtility/PointsInterface.tsx";
import { HotspotUpdate } from "../Pages/PageUtility/VFEConversion";
import PhotosphereHotspotSideBar from "../PhotosphereFeatures/PhotosphereHotspotSidebar.tsx";
import PhotospherePlaceholder from "../PhotosphereFeatures/PhotospherePlaceholder";
import PhotosphereSelector from "../PhotosphereFeatures/PhotosphereSelector";
import PhotosphereTimelineSelect from "../PhotosphereFeatures/PhotosphereTimelineSelect.tsx";
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
  onViewerClick?: (elevation: number, direction: number) => void;
  onUpdateHotspot?: (
    hotspotPath: string[],
    update: HotspotUpdate | null,
  ) => void;
  photosphereOptions?: string[];
  isGamified: boolean;
  isEditor?: boolean;
}

export interface ViewerStates {
  references: React.MutableRefObject<ViewerAPI | null>[];
  states: Photosphere[];
  setStates: React.Dispatch<React.SetStateAction<Photosphere>>[];
}

export interface ViewerProps {
  onViewerClick?: (elevation: number, direction: number) => void;
  onUpdateHotspot?: (
    hotspotPath: string[],
    update: HotspotUpdate | null,
  ) => void;
  photosphereOptions?: string[];
  states: ViewerStates;
}

function PhotosphereViewer({
  onViewerClick,
  onUpdateHotspot,
  photosphereOptions,
  isGamified,
  isEditor = false,
}: PhotosphereViewerProps) {
  const { vfe, currentPS, onChangePS } = useVFELoaderContext();
  const primaryPsRef = React.useRef<ViewerAPI | null>(null);
  const splitRef = React.useRef<ViewerAPI | null>(null);
  const [primaryPhotosphere, setPrimaryPhotosphere] =
    React.useState<Photosphere>(vfe.photospheres[currentPS]);
  const [splitPhotosphere, setSplitPhotosphere] = React.useState<Photosphere>(
    vfe.photospheres[currentPS],
  );
  const [mapRotationEnabled, setMapRotationEnabled] = useState(false);

  const [isSplitView, setIsSplitView] = useState(false);
  const [lockViews, setLockViews] = useState(true);

  const [points, AddPoints, ResetPoints] = usePoints();

  const initialPhotosphereHotspots: Record<string, Hotspot3D[]> = Object.keys(
    vfe.photospheres,
  ).reduce<Record<string, Hotspot3D[]>>((acc, psId) => {
    acc[psId] = Object.values(vfe.photospheres[psId].hotspots);
    return acc;
  }, {});

  const [visited, handleVisit, ResetVistedState] = useVisitedState(
    initialPhotosphereHotspots,
  );
  console.log("in viewer: ", visited);

  const maxPoints = 100;

  const viewerProps: ViewerProps = {
    onViewerClick,
    onUpdateHotspot,
    photosphereOptions,
    states: {
      references: [primaryPsRef, splitRef],
      states: [primaryPhotosphere, splitPhotosphere],
      setStates: [setPrimaryPhotosphere, setSplitPhotosphere],
    },
  };

  console.log("IS EDITOR?", isEditor);
  const currentUrl: string = window.location.href;
  console.log(currentUrl);

  return (
    <>
      <PhotosphereTutorialEditor /> {}
      <Stack
        direction="column"
        sx={{
          position: "absolute",
          top: "16px",
          left: 0,
          right: 0,
          maxWidth: "100%",
          width: "fit-content",
          minWidth: "150px",
          height: "fit-content",
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
        <Stack
          direction="row"
          sx={{
            maxWidth: "100%",
            width: "fit-content",
            minWidth: "150px",
            height: "48px",
            padding: "4px",
            margin: "auto",
            backgroundColor: "white",
            borderRadius: "4px",
            justifyContent: "space-between",
            alignItems: "center",
          }}
          gap={1}
        >
          <Box sx={{ padding: "0 5px" }}>
            <PhotosphereSelector
              size="small"
              options={Object.keys(vfe.photospheres)}
              value={
                primaryPhotosphere.parentPS
                  ? primaryPhotosphere.parentPS
                  : primaryPhotosphere.id
              }
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
                checked={mapRotationEnabled}
                onChange={() => {
                  setMapRotationEnabled(!mapRotationEnabled);
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
                  ResetPoints();
                  ResetVistedState();
                }}
              >
                Reset Points!
              </Button>
            </Box>
          )}
        </Stack>

        <Stack
          direction="row"
          sx={{
            maxWidth: "100%",
            width: "93%",
            minWidth: "150px",
            height: "fit-content",
            justifyContent: "space-between",
            alignItems: "center",
          }}
          gap={1}
        >
          <Stack
            direction="column"
            sx={{
              border: "1px solid gray",
              width: "fit-content",
              height: "fit-content",
              backgroundColor: "white",
              borderRadius: "4px",
              boxShadow: "0 0 4px grey",
              mt: 0,
              p: 1,
            }}
          >
            <Typography variant="caption"> Change Time </Typography>
            <PhotosphereTimelineSelect
              onSelect={(ps: string) => {
                console.log(ps);
                setPrimaryPhotosphere(vfe.photospheres[ps]);
              }}
            />
          </Stack>
          <Box sx={{ padding: "0 5px" }}>
            <Button
              sx={{ height: "45px" }}
              variant={isSplitView ? "contained" : "outlined"}
              onClick={() => {
                setIsSplitView(!isSplitView);
              }}
            >
              <Typography sx={{ fontSize: "14px" }}>Split View</Typography>
            </Button>
          </Box>
          {isSplitView && (
            <>
              <Box>
                <Button
                  variant={lockViews ? "contained" : "outlined"}
                  sx={{
                    height: "45px",
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
              <Stack
                direction="column"
                sx={{
                  border: "1px solid gray",
                  width: "fit-content",
                  height: "fit-content",
                  backgroundColor: "white",
                  borderRadius: "4px",
                  boxShadow: "0 0 4px grey",
                  mt: 0,
                  p: 1,
                }}
              >
                <Typography variant="caption"> Change Time </Typography>
                <PhotosphereTimelineSelect
                  onSelect={(ps: string) => {
                    console.log(ps);
                    setSplitPhotosphere(vfe.photospheres[ps]);
                  }}
                />
              </Stack>
            </>
          )}
        </Stack>
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
          mapStatic={!mapRotationEnabled}
          lockViews={lockViews}
          addPoints={AddPoints}
          visited={visited}
          handleVisit={handleVisit}
          isEditor={isEditor}
        />
        {isSplitView && (
          <PhotospherePlaceholder
            viewerProps={viewerProps}
            isPrimary={false}
            mapStatic={!mapRotationEnabled}
            lockViews={lockViews}
            addPoints={AddPoints}
            visited={visited}
            handleVisit={handleVisit}
            isEditor={isEditor}
          />
        )}
      </Stack>
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
    </>
  );
}

export default PhotosphereViewer;
