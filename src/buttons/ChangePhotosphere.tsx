import { MuiFileInput } from "mui-file-input";
import { useState } from "react";

import AttachFileIcon from "@mui/icons-material/AttachFile";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  FormControlLabel, 
  Checkbox
} from "@mui/material";

import { Photosphere } from "../Pages/PageUtility/DataStructures";
import { alertMUI } from "../UI/StyledDialogWrapper";

interface ChangePhotosphereProps {
  onChangePhotosphere: (name: string, background: string) => void;
  onCancel: () => void;
  ps: Photosphere;
  defaultPhotosphereID: string;
  onChangeDefault: (newDefaultID: string) => void;
}

function ChangePhotosphere({
  onChangePhotosphere,
  onCancel,
  ps,
  defaultPhotosphereID,
  onChangeDefault,
}: ChangePhotosphereProps) {
  const [name, setName] = useState(ps.id);
  const [background, setBackground] = useState(ps.src.path);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [isDefault, setIsDefault] = useState(ps.id === defaultPhotosphereID);

  function handleBackgroundChange(file: File | null) {
    if (file) {
      setBackgroundFile(file);
      setBackground(URL.createObjectURL(file));
    }
  }

  async function handleSubmit() {
    if (!name || !background) {
      await alertMUI("Please provide a valid name and background image");
      return;
    }
    onChangePhotosphere(name, background);
    if (isDefault && ps.id !== defaultPhotosphereID) {
      onChangeDefault(ps.id); 
    }
  }

  return (
    <Dialog open={true} onClose={onCancel}>
      <DialogTitle>Change Photosphere</DialogTitle>
      <DialogContent sx={{ overflow: "visible" }}>
        <Stack gap={2}>
          <TextField
            label="Photosphere Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
          />
          <MuiFileInput
            placeholder={background ? "Change Background" : "Upload Background"}
            value={backgroundFile}
            onChange={handleBackgroundChange}
            inputProps={{ accept: "image/*" }}
            InputProps={{
              startAdornment: <AttachFileIcon />,
            }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
              />
            }
            label="Set as default scene"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            void handleSubmit();
          }}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ChangePhotosphere;
