import { useCallback, useEffect, useState } from "react";

import { Hotspot3D } from "../Pages/PageUtility/DataStructures";

//export type VisitedState = Record<string, Record<string, boolean>>;
export type VisitedState = Partial<Record<string, Record<string, boolean>>>;

export function useVisitedState(initialHotspots: Record<string, Hotspot3D[]>) {
  // Function to initialize state from local storage or initial hotspots
  function initializeVisitedState(): VisitedState {
    const storedState: string | null = localStorage.getItem("visitedState");
    const parsedStoredState: VisitedState = storedState
      ? (JSON.parse(storedState) as VisitedState)
      : {};

    const initialVisitedState: VisitedState = {};

    for (const [psId, hotspots] of Object.entries(initialHotspots)) {
      initialVisitedState[psId] = Object.fromEntries(
        hotspots.map((hotspot) => [
          hotspot.id,
          parsedStoredState[psId]?.[hotspot.id] ?? false,
        ]),
      );
    }
    return initialVisitedState;
  }

  // State to manage visited hotspots
  const [visited, setVisited] = useState<VisitedState>(
    initializeVisitedState(),
  );

  // Store state in local storage
  useEffect(() => {
    localStorage.setItem("visitedState", JSON.stringify(visited));
  }, [visited]);

  // Function to mark hotspot as visited
  const handleVisit = useCallback(
    (photosphereId: string, hotspotId: string) => {
      setVisited((prevState) => ({
        ...prevState,
        [photosphereId]: {
          ...prevState[photosphereId],
          [hotspotId]: true,
        },
      }));
    },
    [],
  );

  function resetVistedState() {
    setVisited({});
    initializeVisitedState;
  }

  return [visited, handleVisit, resetVistedState] as const;
}
