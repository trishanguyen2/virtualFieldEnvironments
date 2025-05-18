import dayjs from "dayjs";
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
      sx={{
        width: "fit-content",
      }}
      value={selected}
      onChange={handleChange}
      size="small"
    >
      {Object.entries(timeline).map(([time, ps]) => {
        let time_string;
        if (time !== "Now") {
          const curr_time = dayjs();
          const pass_time = dayjs(time);
          const difference = curr_time.diff(pass_time, "months");
          time_string =
            pass_time.format("YYYY-DD-MM") + "(" + difference + "months ago)";
        } else {
          time_string = time;
        }
        return (
          <MenuItem key={time} value={ps} sx={{ fontSize: "small" }}>
            {time_string}
          </MenuItem>
        );
      })}
    </Select>
  );
}

export default PhotosphereTimelineSelect;
