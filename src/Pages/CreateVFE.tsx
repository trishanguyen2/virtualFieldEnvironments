import { MuiFileInput } from "mui-file-input";
import { useState } from "react";

import AttachFileIcon from "@mui/icons-material/AttachFile";
import { Button, Stack, TextField, Typography } from "@mui/material";

import PhotosphereLocationSelector from "../PhotosphereFeatures/PhotosphereLocationSelector.tsx";
import PhotosphereTutorialCreate from "../PhotosphereFeatures/PhotosphereTutorialCreate.tsx";
import Header, { HeaderProps } from "../UI/Header.tsx";
import { alertMUI } from "../UI/StyledDialogWrapper.tsx";
import {
  NavMap,
  VFE,
  calculateImageDimensions,
  newID,
} from "./PageUtility/DataStructures.ts";

//import { PhotosphereCenterFieldset } from "./buttons/AddPhotosphere.tsx";

/* -----------------------------------------------------------------------
    Create a Virtual Field Environment (VFE) that will contain many
    Photospheres.

    * Props object allows us to send the new Photosphere back to parent
    * Pass props object to AddPhotosphere function
    * Input data
    * Check for errors
    * Create newPhotosphere object
    * Pass it back to parent to update the VFE with the newPhotosphere
   ----------------------------------------------------------------------- */

// Properties passed down from parent
interface CreateVFEFormProps {
  onCreateVFE: (data: VFE) => void;
  header: HeaderProps;
  onClose: () => void;
}

// Add a new VFE
function CreateVFEForm({ onCreateVFE, header, onClose }: CreateVFEFormProps) {
  // Base states
  const [vfeName, setVFEName] = useState("");
  const [photosphereName, setPhotosphereName] = useState(""); // State for Photosphere Name
  const [panoImage, setPanoImage] = useState("");
  const [panoFile, setPanoFile] = useState<File | null>(null); // needed for MuiFileInput
  const [audio, setAudio] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null); // for MuiFileInput
  const [navMap, setNavMap] = useState<NavMap | undefined>(undefined);
  const [navMapFile, setNavMapFile] = useState<File | null>(null); // for MuiFileInput
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [photospherePosition, setPhotospherePosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Error Handling: Ensure the data is not empty

  async function handleCreateVFE() {
    if (vfeName.trim() === "" || photosphereName.trim() === "" || !panoImage) {
      await alertMUI(
        "Please provide a VFE name, add at least one scene, and choose a default starting point.",
      );
      return;
    }

    const data: VFE = {
      name: vfeName,
      defaultPhotosphereID: photosphereName,
      photospheres: {
        [photosphereName]: {
          id: photosphereName,
          src: { tag: "Runtime", id: newID(), path: panoImage },
          center: photospherePosition ? photospherePosition : undefined,
          hotspots: {},
          backgroundAudio: audio
            ? { tag: "Runtime", id: newID(), path: audio }
            : undefined,
          timeline: {},
        },
      },
      map: navMap,
    };

    onCreateVFE(data);
  }

  function handleImageChange(file: File | null) {
    if (file) {
      setPanoFile(file);
      setPanoImage(URL.createObjectURL(file));
    }
  }

  function handleAudioChange(file: File | null) {
    if (file) {
      setAudioFile(file);
      setAudio(URL.createObjectURL(file));
    }
  }

  async function handleNavMapChange(navmapimage: string | undefined) {
    if (navmapimage) {
      const navmapsize = 300;
      const { width, height } = await calculateImageDimensions(navmapimage);
      const maxDimension = Math.max(width, height);
      const navMapData: NavMap = {
        id: newID(),
        src: { tag: "Runtime", id: newID(), path: navmapimage },
        width: width,
        height: height,
        rotation: 0, // Set default rotation
        defaultZoom: (navmapsize / maxDimension) * 100,
        defaultCenter: { x: width / 2, y: height / 2 }, // Set default center
        size: navmapsize,
      };
      setNavMap(navMapData);
    }
  }

  // Add styling to input interface

  return (
    <>
      <Header {...header} />
      <PhotosphereTutorialCreate /> {}
      <Stack sx={{ width: 450, margin: "auto", paddingTop: 10 }} gap={3}>
        <Typography variant="h4">Create a New VFE</Typography>
        <Stack direction="row" gap={1}>
          <TextField
            required
            label="VFE Name"
            className="vfe-display-name-input"
            sx={{ flexGrow: 1 }}
            onChange={(e) => {
              setVFEName(e.target.value);
            }}
          />
          <TextField
            required
            label="Photosphere Name"
            className="vfe-scene-name-input"
            sx={{ flexGrow: 1 }}
            onChange={(e) => {
              setPhotosphereName(e.target.value);
            }}
          />
        </Stack>
        <MuiFileInput
          required
          placeholder="Upload a Panorama *"
          className="vfe-image-input"
          value={panoFile}
          onChange={handleImageChange}
          inputProps={{ accept: "image/*" }}
          InputProps={{
            startAdornment: <AttachFileIcon />,
          }}
        />
        <MuiFileInput
          placeholder="Upload Background Audio"
          className="vfe-audio-input"
          value={audioFile}
          onChange={handleAudioChange}
          inputProps={{ accept: "audio/*" }}
          InputProps={{
            startAdornment: <AttachFileIcon />,
          }}
        />
        <MuiFileInput
          placeholder="Upload Navigation Map"
          className="vfe-Navigation-map-input"
          value={navMapFile}
          onChange={(file) => {
            if (file) {
              setNavMapFile(file);
              const url = URL.createObjectURL(file);
              void handleNavMapChange(url);
            }
          }}
          inputProps={{ accept: "image/*" }}
          InputProps={{
            startAdornment: <AttachFileIcon />,
          }}
        />
        {navMap && (
          <Button
            variant="outlined"
            onClick={() => {
              setMapDialogOpen(true);
            }}
          >
            Select Photosphere Location
          </Button>
        )}
        <Stack direction="row" gap={1}>
          <Button variant="outlined" sx={{ flexGrow: 1 }} onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            sx={{ flexGrow: 1 }}
            onClick={() => {
              void handleCreateVFE();
            }}
          >
            Create
          </Button>
        </Stack>

        {navMap && mapDialogOpen && (
          <PhotosphereLocationSelector
            navMap={navMap}
            initialPosition={photospherePosition}
            onSelect={(position) => {
              setPhotospherePosition(position);
              setMapDialogOpen(false);
            }}
            onCancel={() => {
              setMapDialogOpen(false);
            }}
          />
        )}
      </Stack>
    </>
  );
}

export default CreateVFEForm;
