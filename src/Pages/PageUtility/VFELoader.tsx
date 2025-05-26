import localforage from "localforage";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Alert, Stack } from "@mui/material";

import { VFELoaderContext } from "../../Hooks/VFELoaderContext";
import { VFE } from "./DataStructures";
import { useGamificationState, usePoints } from "./PointsInterface.tsx";
import {
  convertRuntimeToStored,
  convertStoredToRuntime,
  convertVFE,
} from "./VFEConversion";

export interface ElementProps {
  vfe: VFE;
  onUpdateVFE: (updatedVFE: VFE) => void;
  currentPS: string;
  onChangePS: (id: string) => void;
}

export interface PhotosphereLoaderProps {
  ChildComponent: React.FC<{ isGamified: boolean }>;
}

function VFELoader({ ChildComponent }: PhotosphereLoaderProps) {
  const [isGamified, , SetGamifyState] = useGamificationState();
  const [, , , maxPoints, SetMaxPoints, pointGain, SetPointGain] = usePoints();
  const navigate = useNavigate();
  const { vfeID, photosphereID } = useParams() as {
    vfeID: string;
    photosphereID?: string;
  };
  const [vfe, setVFE] = useState<VFE | null>();

  useEffect(() => {
    async function load() {
      const vfe = await localforage.getItem<VFE>(vfeID);
      if (vfe) {
        const networkVFE = await convertVFE(
          vfe,
          convertStoredToRuntime(vfe.name),
        );
        await SetGamifyState(networkVFE.isGamified ?? false);
        await SetMaxPoints(networkVFE.maxPoints ?? 100);
        await SetPointGain(networkVFE.pointGain ?? 10);
        setVFE(networkVFE);
      }
    }

    void load();
  }, [vfeID]);

  async function saveVFE(networkVFE: VFE) {
    const localVFE = await convertVFE(
      networkVFE,
      convertRuntimeToStored(networkVFE.name),
    );
    await localforage.setItem(localVFE.name, localVFE);
  }

  if (!vfe) {
    return (
      <Stack minHeight="100vh" alignItems="center" justifyContent="center">
        <Alert variant="filled" severity="info">
          Loading VFE data.
        </Alert>
      </Stack>
    );
  }

  if (photosphereID && !(photosphereID in vfe.photospheres)) {
    return (
      <Stack minHeight="100vh" alignItems="center" justifyContent="center">
        <Alert variant="filled" severity="error">
          Photosphere &apos;{photosphereID}&apos; not found.
        </Alert>
      </Stack>
    );
  }

  return (
    <VFELoaderContext.Provider
      value={{
        vfe,
        onUpdateVFE: (updatedVFE) => {
          setVFE(updatedVFE);
          void saveVFE(updatedVFE);
        },
        currentPS: photosphereID ?? vfe.defaultPhotosphereID,
        onChangePS: (id) => {
          if (id !== photosphereID) {
            navigate(id, { replace: true });
          }
        },
      }}
    >
      <ChildComponent isGamified={isGamified ?? false} />
    </VFELoaderContext.Provider>
  );
}

export default VFELoader;
