import { createContext } from "react";
import { ViewerAPI } from "react-photo-sphere-viewer";

import { Photosphere, VFE } from "../Pages/PageUtility/DataStructures";
import { HotspotUpdate } from "../Pages/PageUtility/VFEConversion";

export interface ViewerStates {
  references: React.MutableRefObject<ViewerAPI | null>[];
  states: Photosphere[];
  setStates: React.Dispatch<React.SetStateAction<Photosphere>>[];
}

export interface ViewerContextObj {
  vfe: VFE;
  currentPS: string;
  onChangePS: (id: string) => void;
  onViewerClick?: (elevation: number, direction: number) => void;
  onUpdateHotspot?: (
    hotspotPath: string[],
    update: HotspotUpdate | null,
  ) => void;
  photosphereOptions?: string[];
  states: ViewerStates;
}

export const ViewerContext = createContext<ViewerContextObj | undefined>(
  undefined,
);
