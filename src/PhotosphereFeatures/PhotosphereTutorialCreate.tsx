import Joyride, {
  CallBackProps,
  Step,
  STATUS,
  Status,
  EVENTS,
  ACTIONS,
} from "react-joyride";
import { useEffect, useState } from "react";

export default function PhotosphereTutorialCreate() {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const steps: Step[] = [
    {
      target: ".vfe-display-name-input",
      content: "Required: This is the name of the VFE",
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: ".vfe-scene-name-input",
      content: "Required: This is the scene represented on the photosphere ",
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: ".vfe-image-input",
      content: "Required: Upload a panorama image",
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: ".vfe-audio-input",
      content: "Optional: Upload background audio, this will play in the background and can be paused at any time",
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: ".vfe-Navigation-map-input",
      content: "Optional: Upload a navigation map, image can be a map of the scene",
      placement: "bottom",
      disableBeacon: true,
    },
  ];

  function isFinishedOrSkipped(status: Status): status is "finished" | "skipped" {
    return status === STATUS.FINISHED || status === STATUS.SKIPPED;
  }

  useEffect(() => {
    const shouldResume = localStorage.getItem("resumeTutorial") === "true";
    if (shouldResume) {
        setRun(true);
        setStepIndex(0);
        localStorage.setItem("resumeTutorialEditor", "true");
        localStorage.removeItem("resumeTutorial")
    }
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
        }
      }}
      locale={{
        next: "Next",
        last: "Done",
      }}
      callback={(data: CallBackProps) => {
        const { status, action, index, type } = data;
        if (isFinishedOrSkipped(status)) {
          setRun(false);
          setStepIndex(0);
        } else if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
          if (action === ACTIONS.NEXT) {
            setStepIndex(index + 1);
          } else if (action === ACTIONS.PREV) {
            setStepIndex(index - 1);
          }
        }
      }}
    />
  );
}
