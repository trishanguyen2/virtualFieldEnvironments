import { useState } from "react";

import { MenuItem, Select, SelectChangeEvent, Stack } from "@mui/material";

import { VFE } from "../Pages/PageUtility/DataStructures";

export interface PhotosphereTimelineSelectProps {
  onSelect: (psId: string) => void;
  parentPs: string;
  vfe: VFE;
}

function PhotosphereTimelineSelect({
  onSelect,
  parentPs,
  vfe,
}: PhotosphereTimelineSelectProps) {
  const [selected, setSelected] = useState<string>("");
  const timeline: Record<string, string> = vfe.photospheres[parentPs].timeline;

  function handleChange(e: SelectChangeEvent) {
    setSelected(e.target.value);
    onSelect(e.target.value);
  }
  return (
    <Select
      MenuProps={{
        disablePortal: true,
        PaperProps: {
          sx: {
            position: "absolute",
            height: "10px",
            zIndex: 100,
            p: 0,
          },
        },
      }}
      value={selected}
      onChange={handleChange}
    >
      {Object.entries(timeline).map(([time, ps]) => (
        <MenuItem key={time} value={ps}>
          time
        </MenuItem>
      ))}
    </Select>
  );
}

export default PhotosphereTimelineSelect;
