import { forwardRef, useState} from "react";
import { HexColorPicker } from "react-colorful";
import "react-h5-audio-player/lib/styles.css";

import {
  Add,
  Article,
  Audiotrack,
  ExpandLess,
  ExpandMore,
  Image,
  Quiz,
  Title,
  Videocam,
} from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardHeader,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  Link,
  MenuItem,
  Popover,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
  alpha,
  lighten,
} from "@mui/material";
import Box from "@mui/material/Box";

import {
  Asset,
  Hotspot2D,
  Hotspot3D,
  HotspotData,
  newID,
  photosphereLinkTooltip,
} from "./PageUtility/DataStructures";
import { LinkArrowIcon } from "../UI/LinkArrowIcon";
import { HotspotDataEditor} from "../buttons/AddHotspot";
import { MuiFileInput } from "mui-file-input";

import { useVFELoaderContext } from "../Hooks/VFELoaderContext";

export interface HotspotIconProps {
  hotspotData: HotspotData;
  color?: string;
  icon?: Asset;
}

export function HotspotIcon({ hotspotData, color, icon }: HotspotIconProps) {
  if (icon && hotspotData.tag !== "PhotosphereLink") {
    return <img src={icon.path} height={24} />;
  }

  const iconProps = { color };
  switch (hotspotData.tag) {
    case "Image":
      return <Image sx={iconProps} />;
    case "Audio":
      return <Audiotrack sx={iconProps} />;
    case "Video":
      return <Videocam sx={iconProps} />;
    case "Doc":
      return <Article sx={iconProps} />;
    case "URL":
      return <Link sx={iconProps} />;
    case "Message":
      return <Title sx={iconProps} />;
    case "Quiz":
      return <Quiz sx={iconProps} />;
    case "PhotosphereLink":
      return <LinkArrowIcon color={color} size={24} />;
  }
}

function newBlankHotspot(): Hotspot2D {
  return {
    x: 50,
    y: 50,
    id: newID(),
    tooltip: "New Hotspot",
    color: "#FF0000",
    data: { tag: "Message", content: "New Hotspot Content" },
  };
}

export interface NestedHotspotBoxProps {
  hotspot: Hotspot2D;
  onClick?: () => void;
}

export const NestedHotspotBox = forwardRef<HTMLElement, NestedHotspotBoxProps>(
  function NestedHotspotBox(props, ref) {
    const { hotspot, onClick, ...otherProps } = props;

    return (
      <Box
        {...otherProps}
        ref={ref}
        onClick={onClick}
        position="absolute"
        left={`${hotspot.x}%`}
        top={`${hotspot.y}%`}
        width={50}
        height={50}
        border={"5px solid"}
        borderColor={alpha(hotspot.color, 0.75)}
        sx={{
          transform: "translate(-50%, -50%)",
          pointerEvents: onClick ? "unset" : "none",
          "&:hover": onClick && {
            borderColor: lighten(hotspot.color, 0.5),
            backgroundColor: alpha(hotspot.color, 0.25),
          },
        }}
      />
    );
  },
);

interface HotspotColorPickerProps {
  anchor: HTMLElement;
  hotspot: Hotspot2D;
  onChange: (hotspot: Hotspot2D) => void;
  onClose: () => void;
}

function HotspotColorPicker({
  anchor,
  hotspot,
  onChange,
  onClose,
}: HotspotColorPickerProps) {
  function updateHotspot(color: string) {
    onChange({ ...hotspot, color });
  }

  return (
    <Popover
      anchorEl={anchor}
      open={true}
      anchorOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      onClose={onClose}
    >
      <Box padding="3px">
        <HexColorPicker color={hotspot.color} onChange={updateHotspot} />
      </Box>
    </Popover>
  );
}

interface HotspotLocationPickerProps {
  image: string;
  hotspot: Hotspot2D;
  onSave: (hotspot: Hotspot2D) => void;
  onClose: () => void;
}

function HotspotLocationPicker({
  image,
  hotspot,
  onSave,
  onClose,
}: HotspotLocationPickerProps) {
  const [previewHotspot, setPreviewHotspot] = useState(hotspot);

  function updateHotspot() {
    onSave(previewHotspot);
    onClose();
  }

  function offsetPercent(value: number, max: number) {
    return Math.floor((value / max) * 100);
  }

  function handleMouseClick(event: React.MouseEvent) {
    const rect = (event.target as HTMLDivElement).getBoundingClientRect();
    const x = offsetPercent(event.clientX - rect.left, rect.width);
    const y = offsetPercent(event.clientY - rect.top, rect.height);

    setPreviewHotspot({ ...previewHotspot, x, y });
  }

  function handleMouseMove(event: React.MouseEvent) {
    // Only update when mouse button is pressed.
    if (event.buttons === 1) {
      handleMouseClick(event);
    }
  }

  return (
    <Dialog open={true} onClose={onClose} maxWidth={false}>
      <DialogTitle>Choose Hotspot Location</DialogTitle>
      <DialogContent>
        <Box position="relative" overflow="hidden">
          <NestedHotspotBox hotspot={previewHotspot} />
          <img
            onClick={handleMouseClick}
            onMouseMove={handleMouseMove}
            draggable={false}
            style={{
              display: "block",
              maxWidth: "100%",
              maxHeight: "60vh",
              objectFit: "contain",
              borderRadius: "4px",
              userSelect: "none",
            }}
            src={image}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={updateHotspot}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}

interface HotspotCardProps {
  hotspot: Hotspot2D;
  edited: boolean;
  setColorAnchor: (anchor: HTMLElement | null) => void;
  setColorHotspot: (hotspot: Hotspot2D | null) => void;
  setLocationHotspot: (hotspot: Hotspot2D | null) => void;
  removeNestedHotspot: (hotspotID: string) => void;
  openNestedHotspot: (hotspot: Hotspot2D) => void;
}

function HotspotCard({
  hotspot,
  edited,
  setColorAnchor,
  setColorHotspot,
  setLocationHotspot,
  removeNestedHotspot,
  openNestedHotspot,
}: HotspotCardProps) {
  const [expandedHotspotID, setExpandedHotspotID] = useState<string | null>(
    null,
  );

  function toggleExpanded(hotspotID: string) {
    if (expandedHotspotID === hotspotID) {
      setExpandedHotspotID(null);
    } else {
      setExpandedHotspotID(hotspotID);
    }
  }

  return (
    <Card key={hotspot.id}>
      <CardHeader
        title={hotspot.tooltip}
        titleTypographyProps={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          onClick: () => {
            toggleExpanded(hotspot.id);
          },
          sx: {
            cursor: "pointer",
          },
        }}
        avatar={
          <Tooltip title="Change Color">
            <IconButton
              size="small"
              onClick={(e: React.MouseEvent<HTMLElement>) => {
                setColorAnchor(e.currentTarget);
                setColorHotspot(hotspot);
              }}
            >
              <HotspotIcon hotspotData={hotspot.data} color={hotspot.color} />
            </IconButton>
          </Tooltip>
        }
        action={
          <IconButton
            size="small"
            onClick={() => {
              toggleExpanded(hotspot.id);
            }}
          >
            {expandedHotspotID === hotspot.id ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        }
        sx={{
          padding: 1,
          overflow: "hidden",
          "& .MuiCardHeader-action": {
            margin: 0,
          },
        }}
      />

      <Collapse in={expandedHotspotID === hotspot.id}>
        <CardActions>
          <Box flexGrow={1} />

          <Button
            color="error"
            size="small"
            onClick={() => {
              removeNestedHotspot(hotspot.id);
            }}
          >
            Delete
          </Button>

          <Button
            size="small"
            onClick={() => {
              setLocationHotspot(hotspot);
            }}
          >
            Move
          </Button>

          <Button
            disabled={edited}
            size="small"
            onClick={() => {
              openNestedHotspot(hotspot);
            }}
          >
            Edit
          </Button>
        </CardActions>
      </Collapse>
    </Card>
  );
}

export interface HotspotEditorProps {
  edited: boolean;
  setEdited: (edited: boolean) => void;
  hotspotPath: string[] | null;
  previewTooltip: string;
  setPreviewTooltip: (tooltip: string) => void;
  previewData: HotspotData | null;
  setPreviewData: (data: HotspotData | null) => void;
  previewIcon: Asset | null;
  setPreviewIcon?: (icon: Asset | null) => void;

  resetHotspot: () => Promise<void>;
  deleteHotspot: () => void;
  updateHotspot: (
    newTooltip: string,
    newData: HotspotData,
    newIcon?: Asset,
    newColor?: string,
  ) => void;
  updatePrevHotspot: (
    newTooltip: string,
    newData: HotspotData,
    newIcon?: Asset,
    newColor?: string,
  ) => void;
  openNestedHotspot: (toOpen: Hotspot2D) => void;
  photosphereOptions: string[];
  previewColor: string;
  setPreviewColor: (color: string) => void;
}

function HotspotEditor({
  edited,
  setEdited,
  hotspotPath,
  previewTooltip,
  setPreviewTooltip,
  previewData,
  setPreviewData,
  previewIcon,
  setPreviewIcon,
  resetHotspot,
  deleteHotspot,
  updateHotspot,
  updatePrevHotspot,
  openNestedHotspot,
  photosphereOptions,
  previewColor, 
  setPreviewColor,
}: HotspotEditorProps) {
  const [isCustomIcon] = useState(false);
  const [customIconFile, setCustomIconFile] = useState<File | null>(null);
  const color = previewColor;
  const setColor = setPreviewColor;
  const [hotspotsCollapsed, setHotspotsCollapsed] = useState(false);
  const [colorAnchor, setColorAnchor] = useState<HTMLElement | null>(null);
  const [colorHotspot, setColorHotspot] = useState<Hotspot2D | null>(null);
  const [locationHotspot, setLocationHotspot] = useState<Hotspot2D | null>(
    null,
  );
  const { vfe, currentPS } = useVFELoaderContext();
  
  const nestedHotspotLength =
    previewData?.tag === "Image"
      ? Object.values(previewData.hotspots).length
      : 0;

  function updateData(newData: HotspotData | null) {
    setPreviewData(newData);
    if (newData?.tag === "PhotosphereLink") {
      setPreviewTooltip(photosphereLinkTooltip(newData.photosphereID));
    }
    setEdited(true);
  }

  function removeNestedHotspot(hotspotID: string) {
    if (previewData?.tag === "Image") {
      const { [hotspotID]: _removed, ...remainingHotspots } =
        previewData.hotspots;

      setPreviewData({
        ...previewData,
        hotspots: remainingHotspots,
      });
      setEdited(true);
    }
  }

  function updateNestedHotspot(updatedHotspot: Hotspot2D) {
    if (previewData?.tag === "Image") {
      setPreviewData({
        ...previewData,
        hotspots: {
          ...previewData.hotspots,
          [updatedHotspot.id]: updatedHotspot,
        },
      });
      setHotspotsCollapsed(false);
      setEdited(true);
    }
  }

  return (
    <Stack gap={2} width="300px" height="100%">
      <Stack alignItems="center">
        <Typography variant="h5">Hotspot Editor</Typography>
      </Stack>

      {previewData?.tag !== "PhotosphereLink" && (
        <TextField
          label="Tooltip"
          value={previewTooltip}
          onChange={(e) => {
            setPreviewTooltip(e.target.value);
            setEdited(true);
          }}
        />
      )}

      <HotspotDataEditor
        hotspotData={previewData}
        setHotspotData={updateData}
        photosphereOptions={photosphereOptions}
      />
      {previewIcon && (
        <FormControl fullWidth>
          <InputLabel id="pin-type-label">Pin Type</InputLabel>
          <Select
            labelId="pin-type-label"
            label="Pin Type"
            value={previewIcon?.path || ""}
            onChange={(e) => {
              const path = e.target.value;
              setPreviewIcon?.({
                tag: "Runtime",
                id: newID(),
                path,
              });
              setEdited(true);
            }}
          >
            <MenuItem value="/pin-blue.png">Blue Pin</MenuItem>
            <MenuItem value="/pin-red.png">Red Pin</MenuItem>
            <MenuItem value="MapPin">Map Pin</MenuItem>
            <MenuItem value="PushPinSimple">Push Pin Simple</MenuItem>
            <MenuItem value="MapTrifold">Map Trifold</MenuItem>
          </Select>
        </FormControl>
      )}

    {previewIcon?.path !== "/pin-blue.png" && previewIcon?.path !== "/pin-red.png" && (
      <Stack direction="row" gap={1}>
        <TextField
          label="Pin Color"
          type="color"
          value={color}
          sx={{ width: "50%" }}
          onChange={(e) => {
            setColor(e.target.value);
            setEdited(true);
          }}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
      {(hotspotPath || []).length > 1 && (
        <Button
          variant="outlined"
          color="inherit"
          sx={{ width: "50%" }}
          onClick={() => {
            const hotspotList: string[] | null = hotspotPath || [];
            const photosphereItem = (sessionStorage.getItem("EditedHotspotPhotoSphere") || currentPS);
            
            let hotspotItem: Hotspot2D | Hotspot3D = vfe.photospheres[photosphereItem].hotspots[hotspotList[0]];
            let hotspotPrev: Hotspot2D | Hotspot3D = hotspotItem;
            
            for (let i = 1; i < hotspotList.length; ++i) {
              if (
                hotspotItem != null &&
                'hotspots' in hotspotItem.data
              ) {
                hotspotPrev = hotspotItem;
                hotspotItem = hotspotItem.data.hotspots[hotspotList[i]];
              }
            }
            
            if (hotspotPrev && hotspotPrev.data.tag == "Image") {
              sessionStorage.setItem("parentHotspot", JSON.stringify(hotspotPrev));
            }
            if (hotspotItem && 'x' in hotspotItem && 'y' in hotspotItem) {
              setLocationHotspot(hotspotItem);
            }
          }}
        >
          Pin Location
        </Button>
        )}
      </Stack>
    )}


    {isCustomIcon && (
      <MuiFileInput
        label="Upload Custom Icon*"
        value={customIconFile}
        onChange={(file) => {
          setCustomIconFile(file);
          if (file) {
            setPreviewIcon?.({
              tag: "Runtime",
              id: newID(),
              path: URL.createObjectURL(file),
            });
            setEdited(true);
          }
        }}
        inputProps={{ accept: "image/*" }}
        fullWidth
      />
    )}


      { (previewData?.tag === "Image" || sessionStorage.getItem("parentHotspot") != null) && (
        <>
          {colorHotspot !== null && colorAnchor !== null && (
            <HotspotColorPicker
              anchor={colorAnchor}
              hotspot={colorHotspot}
              onChange={(updatedHotspot) => {
                updateNestedHotspot(updatedHotspot);
              }}
              onClose={() => {
                setColorHotspot(null);
                setColorAnchor(null);
              }}
            />
          )}
          
          {locationHotspot !== null && (
            <HotspotLocationPicker
              image={(JSON.parse(sessionStorage.getItem("parentHotspot") || "{}").data || previewData).src.path}
              hotspot={locationHotspot}
              onSave={(updatedHotspot) => {
                if (previewData != null) {
                  sessionStorage.setItem("lastEditedHotspotFlag", "1");  // Set to return to hotspot menu after page refresh

                  if (JSON.parse(sessionStorage.getItem("parentHotspot") || "{}").data) {  // This block is for the "Pin Location" button
                    const parentHotspotData = JSON.parse(sessionStorage.getItem("parentHotspot") || "{}").data;

                    parentHotspotData.hotspots[updatedHotspot.id].x = updatedHotspot.x;
                    parentHotspotData.hotspots[updatedHotspot.id].y = updatedHotspot.y;
                    
                    updatePrevHotspot(
                      JSON.parse(sessionStorage.getItem("parentHotspot") || "{}").tooltip || previewTooltip,
                      parentHotspotData,
                      undefined,
                      undefined
                    );
                  }
                  else if ('hotspots' in previewData) {  // This is the standard Move button/Create nested hotspot on the parent hotspot
                    if (updatedHotspot.id in previewData.hotspots) {
                      previewData.hotspots[updatedHotspot.id].x = updatedHotspot.x;
                      previewData.hotspots[updatedHotspot.id].y = updatedHotspot.y;
                    }
                    else {
                      previewData.hotspots = { ...previewData.hotspots, [updatedHotspot.id]: updatedHotspot }
                    }

                    updateHotspot(
                      previewTooltip,
                      previewData,
                      previewIcon ?? undefined,
                      previewColor
                    );
                  }
                }
              }}
              onClose={() => {
                setLocationHotspot(null);
                sessionStorage.removeItem("parentHotspot");
              }}
            />
          )}

          <Stack gap={1}>
            <Stack direction="row">
              {nestedHotspotLength == 0 ? (
                <Box width={32} height={32} padding="1px" />
              ) : (
                <IconButton
                  size="small"
                  onClick={() => {
                    setHotspotsCollapsed(!hotspotsCollapsed);
                  }}
                >
                  {hotspotsCollapsed ? <ExpandMore /> : <ExpandLess />}
                </IconButton>
              )}

              <Typography
                variant="h6"
                flexGrow={1}
                textAlign="center"
                onClick={() => {
                  setHotspotsCollapsed(!hotspotsCollapsed);
                }}
                sx={{ cursor: nestedHotspotLength > 0 ? "pointer" : "unset" }}
              >
                {`Nested Hotspots (${nestedHotspotLength})`}
              </Typography>

              <Tooltip title="Add Hotspot">
                <IconButton
                  size="small"
                  onClick={() => {
                    setLocationHotspot(newBlankHotspot());
                  }}
                >
                  <Add />
                </IconButton>
              </Tooltip>
            </Stack>

            {!hotspotsCollapsed &&
              nestedHotspotLength > 0 &&
              previewData &&
              'hotspots' in previewData && 
              Object.values(previewData.hotspots).map((hotspot2D) => (
                <HotspotCard
                  key={hotspot2D.id}
                  hotspot={hotspot2D}
                  edited={edited}
                  setColorAnchor={setColorAnchor}
                  setColorHotspot={setColorHotspot}
                  setLocationHotspot={setLocationHotspot}
                  removeNestedHotspot={removeNestedHotspot}
                  openNestedHotspot={openNestedHotspot}
                />
              ))}
          </Stack>
        </>
      )}

<Box flexGrow={1} />
      {edited && (
        <Button
          onClick={() => {
            void resetHotspot();
          }}
        >
          Discard All Changes
        </Button>
      )}
      <Stack direction="row" gap={1}>
        <Button
          variant="outlined"
          color="error"
          sx={{ width: "100%" }}
          onClick={deleteHotspot}
        >
          Delete Hotspot
        </Button>
      </Stack>

      <Stack direction="row" gap={1}>
        <Button
          disabled={
            previewTooltip == "" ||
            previewData === null ||
            (setPreviewIcon && previewIcon === null)
          }
          variant="contained"
          sx={{ width: "50%" }}
          onClick={() => {
            if (previewData !== null) {
              sessionStorage.setItem("lastEditedHotspotFlag", "1");

              updateHotspot(
                previewTooltip,
                previewData,
                previewIcon ?? undefined,
                previewColor
              );
            }

          }}
        >
          Save
        </Button>

        <Button
          disabled={
            previewTooltip == "" ||
            previewData === null ||
            (setPreviewIcon && previewIcon === null)
          }
          variant="contained"
          sx={{ width: "50%" }}
          onClick={() => {
            if (previewData !== null) {          
              sessionStorage.setItem("lastEditedHotspotFlag", "0");

              updateHotspot(
                previewTooltip,
                previewData,
                previewIcon ?? undefined,
                previewColor
              );
            }

          }}
        >
          Save and Exit
        </Button>
      </Stack>
    </Stack>
  );
}

export default HotspotEditor;
