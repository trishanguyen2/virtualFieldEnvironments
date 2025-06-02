import { Point, Viewer, ViewerConfig } from "@photo-sphere-viewer/core";
import { MapHotspot } from "@photo-sphere-viewer/map-plugin";
import { MarkerConfig } from "@photo-sphere-viewer/markers-plugin";
import {
  VirtualTourLink,
  VirtualTourNode,
} from "@photo-sphere-viewer/virtual-tour-plugin";
import { MapPin, MapTrifold, PushPinSimple } from "phosphor-react";
import { useEffect, useRef } from "react";
import ReactDOMServer from "react-dom/server";
import {
  MapPlugin,
  MapPluginConfig,
  MarkersPlugin,
  ReactPhotoSphereViewer,
  VirtualTourPlugin,
  VirtualTourPluginConfig,
} from "react-photo-sphere-viewer";

import { Box, alpha } from "@mui/material";
import { common } from "@mui/material/colors";

import { useTimelineSelectedContext } from "../Hooks/TimelineSelected";
import { useVFELoaderContext } from "../Hooks/VFELoaderContext";
import {
  Hotspot2D,
  Hotspot3D,
  NavMap,
  Photosphere,
} from "../Pages/PageUtility/DataStructures";
import PopOver from "../Pages/PageUtility/PopOver";
import { ViewerProps } from "../Pages/PhotosphereViewer";
import { LinkArrowIconHTML } from "../UI/LinkArrowIcon";

/** Convert sizes from numbers to strings ending in "px" */
function sizeToStr(val: number): string {
  return String(val) + "px";
}

/** Convert elevation/direction degrees from numbers to strings ending in "deg" */
export function degToStr(val: number): string {
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
        yaw: degToStr(hotspot.direction),
        pitch: degToStr(hotspot.elevation),
      },
      tooltip: hotspot.tooltip,
    };
    if (hotspot.data.tag === "PhotosphereLink") {
      marker.html = LinkArrowIconHTML({
        color: alpha(common.white, 0.8),
        size: 80,
      });
    } else if (
      hotspot.icon?.path?.startsWith("blob:") ||
      hotspot.icon?.path?.match(/\.(png|jpe?g|svg)$/)
    ) {
      marker.image = hotspot.icon.path;
    } else {
      let IconComponent = MapPin;
      if (hotspot.icon?.path === "PushPinSimple") {
        IconComponent = PushPinSimple;
      } else if (hotspot.icon?.path === "MapTrifold") {
        IconComponent = MapTrifold;
      }

      marker.html = ReactDOMServer.renderToString(
        <IconComponent
          size={32}
          weight="duotone"
          color={hotspot.color}
          className="hotspot-icon"
        />,
      );
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
        pitch: degToStr(hotspot.elevation),
        yaw: degToStr(hotspot.direction),
      },
      data: { tooltip: hotspot.tooltip } as LinkData,
    });
  }

  return links;
}

interface LinkData {
  tooltip: string;
}

interface PhotospherePlaceholderProps {
  viewerProps: ViewerProps;
  isPrimary: boolean;
  mapStatic: boolean;
  lockViews: boolean;
  hotspotArray: (Hotspot3D | Hotspot2D)[];
  setHotspotArray: (arr: (Hotspot3D | Hotspot2D)[]) => void;
  addPoints: (amount: number) => Promise<void>;
  visited: Partial<Record<string, Record<string, boolean>>>;
  handleVisit: (photosphereId: string, hotspotId: string) => void;
  isEditor: boolean;
}

function PhotospherePlaceholder({
  viewerProps,
  isPrimary,
  mapStatic,
  lockViews,
  hotspotArray,
  setHotspotArray,
  addPoints,
  visited,
  handleVisit,
  isEditor,
}: PhotospherePlaceholderProps) {
  const { onUpdateHotspot, onViewerClick, photosphereOptions, states } =
    viewerProps;
  const { vfe, currentPS, onChangePS } = useVFELoaderContext();
  const statesIdx = isPrimary ? 0 : 1;
  const photosphereRef = states.references[statesIdx];

  const currentPhotosphere = states.states[statesIdx];
  const setCurrentPhotosphere = states.setStates[statesIdx];

  const hotspotPath = hotspotArray.map((h) => h.id);

  const lockViewsRef = useRef(lockViews);

  const { wasTimelineSelected: _, setWasTimelineSelected } =
    useTimelineSelectedContext();

  useEffect(() => {
    lockViewsRef.current = lockViews;
  }, [lockViews]);

  const ready = useRef(false);
  const defaultPan = useRef(vfe.photospheres[currentPS].src.path);

  const visitedData = useRef(visited[currentPS]);

  useEffect(() => {
    visitedData.current = visited[currentPS];
  });

  console.log("in visted data TOP: ", visitedData);

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
      } as unknown as VirtualTourPluginConfig, // needed to make build happy
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

      console.log("visitedData: ", visitedData);

      // This works on reload but not re-render.  visitedData is only pulled when this function is created, and never again
      const isHotspotVisited: boolean = visitedData.current
        ? visitedData.current[marker.config.id]
        : false;
      console.log("isHotspotVisited: ", isHotspotVisited);

      // setCurrentPhotosphere has to be used to get the current state value because
      // the value of currentPhotosphere does not get updated in an event listener
      setCurrentPhotosphere((currentState) => {
        // Points check has to live here as long as handleVisit is here.  Handle visit cant be passed down further easily, as it causes reload issues.
        if (!isHotspotVisited && !isEditor) {
          void addPoints(10);
        }

        // When the photosphere is in split view, this is so the program doesn't try to get a hotspot from the wrong photosphere after saving
        sessionStorage.setItem("EditedHotspotPhotoSphere", currentState.id);
        
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

    instance.addEventListener("position-updated", ({ position }) => {
      if (!lockViewsRef.current) return;
      const [otherRef] = states.references.filter((ref) => {
        if (ref != photosphereRef) return ref;
      });

      if (!otherRef.current) return;

      otherRef.current.rotate(position);
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
      if (!vfe.photospheres[node.id].parentPS) {
        states.setStates.forEach((setStateFunc) =>
          setStateFunc(vfe.photospheres[node.id]),
        );
      } else {
        // just reset it and don't update all nodes
        setWasTimelineSelected(false);
      }
      onChangePS(node.id);

      // clear popovers on scene change
      // Upon saving a hotspot, the scene will refresh and automatically load back into what ever hotspot was saved last
      if (Number(sessionStorage.getItem("lastEditedHotspotFlag")) == 1) {
        let photosphereItem = (sessionStorage.getItem("EditedHotspotPhotoSphere") || "") || currentPS;
        
        if ( JSON.parse(sessionStorage.getItem("listEditedHotspot") || "[]").length > 0 ) {
          let hotspotItem: Hotspot2D | Hotspot3D =
            vfe.photospheres[photosphereItem].hotspots[
              JSON.parse(sessionStorage.getItem("listEditedHotspot") || "[]")[0]
            ];
          let hotspotList: (Hotspot2D | Hotspot3D)[] = [hotspotItem];
          
          for (
            let i = 1;
            i <
            JSON.parse(sessionStorage.getItem("listEditedHotspot") || "[]")
              .length;
            ++i
          ) {
            if (
                hotspotItem != null &&
                'data' in hotspotItem &&
                'hotspots' in hotspotItem.data
            ) {
              hotspotItem =
                hotspotItem.data.hotspots[
                  JSON.parse(
                    sessionStorage.getItem("listEditedHotspot") || "[]",
                  )[i]
                ];
              hotspotList.push(hotspotItem);
            }
          }
          setHotspotArray(hotspotList);
        }
      } else {
        setHotspotArray([]);
      }

      // Clear these items so they don't affect the hotspot auto-loader
      sessionStorage.setItem("listEditedHotspot", "[]"); 
      sessionStorage.removeItem("lastEditedHotspotFlag");
      sessionStorage.removeItem("EditedHotspotPhotoSphere");
    });
    if (isPrimary) {
      const map = instance.getPlugin<MapPlugin>(MapPlugin);
      map.addEventListener("select-hotspot", ({ hotspotId }) => {
        const photosphere = vfe.photospheres[hotspotId];
        states.setStates.forEach((setPS) => {
          setPS(photosphere);
        });
        onChangePS(photosphere.id);
      });
    }
    ready.current = true;
  }

  return (
    <>
      {hotspotArray.length > 0 && (
        <PopOver
          key={hotspotPath.join()}
          hotspotPath={hotspotPath}
          hotspot={hotspotArray[hotspotArray.length - 1]}
          pushHotspot={(add: Hotspot2D) => {
            setHotspotArray([...hotspotArray, add]);
          }}
          popHotspot={() => {
            setHotspotArray(hotspotArray.slice(0, -1));
          }}
          closeAll={() => {
            setHotspotArray([]);
            sessionStorage.removeItem("EditedHotspotPhotoSphere");
          }}
          onUpdateHotspot={onUpdateHotspot}
          changeScene={(id) => {
            setCurrentPhotosphere(vfe.photospheres[id]);
            onChangePS(id);
          }}
          photosphereOptions={photosphereOptions}
        />
      )}
      <Box
        sx={{
          width: "100%",
          height: "100vh",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <ReactPhotoSphereViewer
          key={mapStatic ? "static" : "dynamic"}
          onReady={handleReady}
          ref={photosphereRef}
          src={defaultPan.current}
          plugins={plugins}
          height={"100vh"}
          width={"100%"}
          navbar={["zoom", "caption", "download", "fullscreen"]}
        />
      </Box>
    </>
  );
}

export default PhotospherePlaceholder;
