import { useState } from "react";
import PhotosphereTutorial from "../PhotosphereFeatures/PhotosphereTutorialLandingPage";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
} from "@mui/material";

import Header from "../UI/Header";
import MuiDropzone from "../UI/MuiDropzone";
import VFEList from "./PageUtility/VFEList";

interface LandingPageProps {
  onLoadTestVFE: () => void;
  onCreateVFE: () => void;
  onLoadVFE: (file: File, openInViewer: boolean) => void;
}

function LandingPage({
  onLoadTestVFE,
  onCreateVFE,
  onLoadVFE,
}: LandingPageProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  function handleFileUpload(file: File) {
    setSelectedFile(file);
    setOpenDialog(true);
  }

  function handleCloseDialog() {
    setOpenDialog(false);
    setSelectedFile(null);
  }

  function handleLoadVFEWithChoice(openInViewer: boolean) {
    if (selectedFile) {
      onLoadVFE(selectedFile, openInViewer);
      handleCloseDialog();
    }
  }

  // Joyride tutorial
  const [runTutorial, setRunTutorial] = useState(false); 
  const [stepIndex, setStepIndex] = useState(0);

  return (
    <>
      <Header onCreateVFE={onCreateVFE} onLoadTestVFE={onLoadTestVFE} />
        <Stack sx={{ width: "78%", margin: "auto", padding: 2 }}>
          <Button 
            variant="outlined" 
            onClick={() => {
              setRunTutorial(true);
              setStepIndex(0);
            }}
            sx={{ mb: 2 }}
          >
            Confused? Click here
        </Button>

        <PhotosphereTutorial
          runTutorial={runTutorial}
          stepIndex={stepIndex}
          setRunTutorial={setRunTutorial}
          setStepIndex={setStepIndex}
        />

        <MuiDropzone
          label="Drag and drop a VFE or click"
          onInput={(files) => {
            handleFileUpload(files[0]);
          }}
          className="dropzone-area"
          sx={{
            height: "300px",
            width: "80%",
            margin: "auto",
          }}
        />
        <VFEList 
          className="vfe-list-area"
        />
      </Stack>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Open VFE</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Do you want to open the VFE in Viewer or Editor?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              handleLoadVFEWithChoice(true);
            }}
          >
            Viewer
          </Button>
          <Button
            onClick={() => {
              handleLoadVFEWithChoice(false);
            }}
          >
            Editor
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default LandingPage;
