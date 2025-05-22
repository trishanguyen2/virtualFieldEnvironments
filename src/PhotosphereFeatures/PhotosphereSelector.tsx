import { useState } from "react";

import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

import PhotosphereTutorialEditor from "../PhotosphereFeatures/PhotosphereTutorialEditor";

export interface PhotosphereSelectorProps {
  options: string[];
  value: string;
  setValue: (value: string) => void;
  size?: "medium" | "small";
  defaultPhotosphereID?: string;
}

function PhotosphereSelector({
  options,
  value,
  setValue,
  size = "medium",
  defaultPhotosphereID
}: PhotosphereSelectorProps) {
  // Helper function to reduce ternary/undefined repetition.
  function ifSmall<T, D>(value: T, defaultValue?: D): T | D | undefined {
    return size === "small" ? value : defaultValue;
  }

  const [runTutorial, setRunTutorial] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const displayOptions = options
  .filter((id) => !id.startsWith("CHILD_"))
  .map((id) => ({
    label: id === defaultPhotosphereID ? `${id} (default)` : id,
    raw: id,
  }));


  return (
    <FormControl size={size}>
      <PhotosphereTutorialEditor
        runTutorial={runTutorial}
        stepIndex={stepIndex}
        setRunTutorial={setRunTutorial}
        setStepIndex={setStepIndex}
      />
      <InputLabel id="scene-select" sx={ifSmall({ fontSize: "14px" })}>
        Scene
      </InputLabel>
      <Select
        className="scene-header"
        labelId="scene-select"
        label="Scene"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
        sx={ifSmall(
          {
            fontSize: "14px",
            width: "150px",
            height: "35px",
          },
          { minWidth: "150px" },
        )}
      >
      {displayOptions.map(({ raw, label }) => (
        <MenuItem key={raw} value={raw} sx={ifSmall({ fontSize: "13px" })}>
        {label}
        </MenuItem>
      ))}
      </Select>
    </FormControl>
  );
}

export default PhotosphereSelector;
