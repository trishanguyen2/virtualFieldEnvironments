import { useEffect, useState } from "react";

import { MenuItem, Select, SelectChangeEvent } from "@mui/material";

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
  const [selected, setSelected] = useState<string>(parentPs);
  const parentPS = vfe.photospheres[parentPs].parentPS
    ? vfe.photospheres[vfe.photospheres[parentPs].parentPS]
    : vfe.photospheres[parentPs];
  var timeline: Record<string, string> = parentPS.timeline;
  timeline = { ...timeline, ["Now"]: parentPS.id };

  useEffect(() => {
    setSelected(parentPS.id);
  }, [parentPS]);

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
            height: "fit-content",
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
          {time}
        </MenuItem>
      ))}
    </Select>
  );
}

export default PhotosphereTimelineSelect;
