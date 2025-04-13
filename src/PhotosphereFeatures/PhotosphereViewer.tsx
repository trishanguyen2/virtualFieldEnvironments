import React, { useState } from "react";

import {
  Box,
  Button,
  FormControlLabel,
  Stack,
  Switch,
  SwitchProps,
  styled,
} from "@mui/material";

import {
  Hotspot2D,
  Hotspot3D,
  Photosphere,
  VFE,
} from "../Pages/PageUtility/DataStructures";
import PopOver from "../Pages/PageUtility/PopOver";
import { HotspotUpdate } from "../Pages/PageUtility/VFEConversion";
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
  const [splitPhotosphere, setSplitPhotosphere] = React.useState<Photosphere>(
    vfe.photospheres[currentPS],
  );
  const [mapStatic, setMapStatic] = useState(false);
  const [hotspotArray, setHotspotArray] = useState<(Hotspot3D | Hotspot2D)[]>(
    [],
  );
  const hotspotPath = hotspotArray.map((h) => h.id);

  const [isSplitView, setIsSplitView] = useState(false);

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
          <Button
            sx={{ padding: "0", width: "4px", height: "40px" }}
            variant="contained"
            color="primary"
            onClick={() => {
              setIsSplitView(!isSplitView);
            }}
          >
            Split View
          </Button>
        </Box>
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
        {isSplitView && (
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
        )}
      </Stack>
    </>
  );
}

export default PhotosphereViewer;
