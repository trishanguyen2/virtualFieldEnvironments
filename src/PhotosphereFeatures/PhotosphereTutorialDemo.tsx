import Joyride, {
  CallBackProps,
  Step,
  STATUS,
  Status,
  EVENTS,
  ACTIONS,
} from "react-joyride";
import { useEffect, useState } from "react";

export default function PhotosphereTutorialDemo() {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const steps: Step[] = [
    {
      target: ".split-view-button",
      content: "Toggle split view to compare two panoramas side by side.",
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: ".scene-header",
      content: "Select a scene from the map rotation.",
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: ".audio-button",
      content: "Toggle VFE audio settings.",
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: ".map-rotation",
      content: "Lock and unlock the map rotation.",
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: ".hotspot-sidebar",
      content: "Click to view the list of available hotspots.",
      placement: "bottom",
      disableBeacon: true,
    },
  ];

  function isFinishedOrSkipped(status: Status): status is "finished" | "skipped" {
    return status === STATUS.FINISHED || status === STATUS.SKIPPED;
  }

  useEffect(() => {
    // Start the demo tutorial when the component mounts
    setRun(true);
  }, []);

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      continuous
      debug
      showSkipButton
      disableOverlayClose
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: "#1976d2",
        },
        tooltip: {
          fontFamily: "Roboto, sans-serif",
          fontSize: "16px",
        },
        buttonClose: {
          display: "none",
        },
      }}
      locale={{ 
        next: "Next",
        last: "Done" 
      }}
      callback={(data: CallBackProps) => {
        const { status, action, index, type } = data;
        if (isFinishedOrSkipped(status)) {
          setRun(false);
          setStepIndex(0);
        } else if (
          type === EVENTS.STEP_AFTER ||
          type === EVENTS.TARGET_NOT_FOUND
        ) {
          if (action === ACTIONS.NEXT) 
            setStepIndex(index + 1);
          else if (action === ACTIONS.PREV) 
            setStepIndex(index - 1);
        }
      }}
    />
  );
}
