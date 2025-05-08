import { useEffect, useState } from "react";

import { MenuItem, Select, SelectChangeEvent } from "@mui/material";

import { useVFELoaderContext } from "../Hooks/VFELoaderContext";

export interface PhotosphereTimelineSelectProps {
  onSelect: (psId: string) => void;
}

function PhotosphereTimelineSelect({
  onSelect,
}: PhotosphereTimelineSelectProps) {
  const { vfe, currentPS } = useVFELoaderContext();
  const [selected, setSelected] = useState<string>(currentPS);
  const parentPS = vfe.photospheres[currentPS].parentPS
    ? vfe.photospheres[vfe.photospheres[currentPS].parentPS]
    : vfe.photospheres[currentPS];
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
