import { Point, Viewer, ViewerConfig } from "@photo-sphere-viewer/core";
import { MapHotspot } from "@photo-sphere-viewer/map-plugin";
import { MarkerConfig } from "@photo-sphere-viewer/markers-plugin";
import {
  VirtualTourLink,
  VirtualTourNode,
} from "@photo-sphere-viewer/virtual-tour-plugin";
import React, { useEffect, useRef, useState } from "react";
import { ViewerAPI } from "react-photo-sphere-viewer";
import {
  MapPlugin,
  MapPluginConfig,
  MarkersPlugin,
  ReactPhotoSphereViewer,
  VirtualTourPlugin,
  VirtualTourPluginConfig,
} from "react-photo-sphere-viewer";

import { alpha } from "@mui/material";
import { common } from "@mui/material/colors";

import { useVisitedState } from "../Hooks/HandleVisit";
import {
  Hotspot2D,
  Hotspot3D,
  NavMap,
  Photosphere,
} from "../Pages/PageUtility/DataStructures";
import { LinkArrowIconHTML } from "../UI/LinkArrowIcon";
import { PhotosphereViewerProps } from "./PhotosphereViewer";

/** Convert sizes from numbers to strings ending in "px" */
function sizeToStr(val: number): string {
  return String(val) + "px";
}

/** Convert yaw/pitch degrees from numbers to strings ending in "deg" */
function degToStr(val: number): string {
  return String(val) + "deg";
}

function convertMap(
  map: NavMap,
  photospheres: Record<string, Photosphere>,
  currentCenter?: Point,
  staticEnabled = false,
): MapPluginConfig {
  const hotspots: MapHotspot[] = [];

  for (const [id, photosphere] of Object.entries(photospheres)) {
    if (photosphere.center === undefined) continue;

    hotspots.push({
      id: id,
      tooltip: id,
      x: photosphere.center.x,
      y: photosphere.center.y,
      color: "yellow",
    });
  }

  return {
    imageUrl: map.src.path,
    center: currentCenter ?? map.defaultCenter,
    rotation: map.rotation,
    defaultZoom: map.defaultZoom,
    minZoom: 1,
    maxZoom: 100,
    size: sizeToStr(map.size),
    hotspots,
    static: staticEnabled,
  };
}

function convertHotspots(
  hotspots: Record<string, Hotspot3D>,
  isViewerMode: boolean,
): MarkerConfig[] {
  const markers: MarkerConfig[] = [];

  for (const hotspot of Object.values(hotspots)) {
    if (isViewerMode && hotspot.data.tag === "PhotosphereLink") continue;

    const marker: MarkerConfig = {
      id: hotspot.id,
      size: { width: 64, height: 64 },
      position: {
        yaw: degToStr(hotspot.yaw),
        pitch: degToStr(hotspot.pitch),
      },
      tooltip: hotspot.tooltip,
    };
    if (hotspot.data.tag === "PhotosphereLink") {
      marker.html = LinkArrowIconHTML({
        color: alpha(common.white, 0.8),
        size: 80,
      });
    } else {
      marker.image = hotspot.icon.path;
    }

    markers.push(marker);
  }

  return markers;
}

/** Convert photosphere-link hotspots to virtual tour links  */
function convertLinks(
  hotspots: Record<string, Hotspot3D>,
  isViewerMode: boolean,
): VirtualTourLink[] {
  if (!isViewerMode) {
    return [];
  }

  const links: VirtualTourLink[] = [];

  for (const hotspot of Object.values(hotspots)) {
    if (hotspot.data.tag !== "PhotosphereLink") continue;

    links.push({
      nodeId: hotspot.data.photosphereID,
      position: {
        pitch: degToStr(hotspot.pitch),
        yaw: degToStr(hotspot.yaw),
      },
      data: { tooltip: hotspot.tooltip } as LinkData,
    });
  }

  return links;
}

interface LinkData {
  tooltip: string;
}

interface PhotospherePlaceholderProps extends PhotosphereViewerProps {
  isPrimary: boolean;
  setHotspotArray: (hotspotArray:(Hotspot2D | Hotspot3D)[])=> void;
}

function PhotospherePlaceholder({
  vfe,
  isPrimary,
  currentPS,
  onChangePS,
  onUpdateHotspot,
  onViewerClick,
  setHotspotArray
}: PhotospherePlaceholderProps) {
  const photosphereRef = React.createRef<ViewerAPI>();
  const [currentPhotosphere, setCurrentPhotosphere] = useState<Photosphere>(
    vfe.photospheres[currentPS],
  );
  const [mapStatic, setMapStatic] = useState(false);

  const ready = useRef(false);
  const defaultPan = useRef(vfe.photospheres[currentPS].src.path);

  const initialPhotosphereHotspots: Record<string, Hotspot3D[]> = Object.keys(
    vfe.photospheres,
  ).reduce<Record<string, Hotspot3D[]>>((acc, psId) => {
    acc[psId] = Object.values(vfe.photospheres[psId].hotspots);
    return acc;
  }, {});

  const [visited, handleVisit] = useVisitedState(initialPhotosphereHotspots);
  console.log("in viewer", visited);

  const isViewerMode = onUpdateHotspot === undefined;

  useEffect(() => {
    if (ready.current) {
      const virtualTour =
        photosphereRef.current?.getPlugin<VirtualTourPlugin>(VirtualTourPlugin);
      void virtualTour?.setCurrentNode(currentPhotosphere.id);

      if (isPrimary) {
        const map = photosphereRef.current?.getPlugin<MapPlugin>(MapPlugin);
        if (currentPhotosphere.center) {
          map?.setCenter(currentPhotosphere.center);
        }
      }
    }
  }, [currentPhotosphere, photosphereRef]);

  const plugins: ViewerConfig["plugins"] = [
    [MarkersPlugin, {}],

    [
      VirtualTourPlugin,
      {
        renderMode: "markers",
        getLinkTooltip(_content: string, link: VirtualTourLink): string {
          return (link.data as LinkData).tooltip;
        },
      } as VirtualTourPluginConfig,
    ],
  ];
  isPrimary &&
    plugins.push(
      // Only fill map plugin config when VFE has a map
      [
        MapPlugin,
        vfe.map
          ? convertMap(
              vfe.map,
              vfe.photospheres,
              currentPhotosphere.center ?? vfe.map.defaultCenter,
              mapStatic,
            )
          : {},
      ],
    );

  function handleReady(instance: Viewer) {
    const markerTestPlugin: MarkersPlugin = instance.getPlugin(MarkersPlugin);

    markerTestPlugin.addEventListener("select-marker", ({ marker }) => {
      if (marker.config.id.includes("__tour-link")) return;

      // setCurrentPhotosphere has to be used to get the current state value because
      // the value of currentPhotosphere does not get updated in an event listener
      setCurrentPhotosphere((currentState) => {
        const passMarker = currentState.hotspots[marker.config.id];
        setHotspotArray([passMarker]);
        handleVisit(currentState.id, marker.config.id);
        return currentState;
      });
    });

    instance.addEventListener("click", ({ data }) => {
      if (!data.rightclick) {
        onViewerClick?.(data.pitch, data.yaw);
      }
    });

    const virtualTour =
      instance.getPlugin<VirtualTourPlugin>(VirtualTourPlugin);

    const nodes: VirtualTourNode[] = Object.values(vfe.photospheres).map(
      (p) => {
        return {
          id: p.id,
          panorama: p.src.path,
          name: p.id,
          markers: convertHotspots(p.hotspots, isViewerMode),
          links: convertLinks(p.hotspots, isViewerMode),
        };
      },
    );

    virtualTour.setNodes(nodes, currentPS);
    virtualTour.addEventListener("node-changed", ({ node }) => {
      setCurrentPhotosphere(vfe.photospheres[node.id]);
      onChangePS(node.id);
      setHotspotArray([]); // clear popovers on scene change
    });
    if (isPrimary) {
      const map = instance.getPlugin<MapPlugin>(MapPlugin);
      map.addEventListener("select-hotspot", ({ hotspotId }) => {
        const photosphere = vfe.photospheres[hotspotId];
        setCurrentPhotosphere(photosphere);
        onChangePS(photosphere.id);
      });
    }
    ready.current = true;
  }

  return (
    <ReactPhotoSphereViewer
      key={mapStatic ? "static" : "dynamic"}
      onReady={handleReady}
      ref={photosphereRef}
      src={defaultPan.current}
      plugins={plugins}
      height={"100vh"}
      width={"100%"}
      navbar={["autorotate", "zoom", "caption", "download", "fullscreen"]}
    />
  );
}

export default PhotospherePlaceholder;
