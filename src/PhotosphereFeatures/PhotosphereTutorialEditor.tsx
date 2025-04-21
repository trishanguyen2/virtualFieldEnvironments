import Joyride, {
  CallBackProps,
  Step,
  STATUS,
  Status,
  EVENTS,
  ACTIONS,
} from "react-joyride";
import { useEffect } from "react";

interface Props {
  runTutorial: boolean;
  stepIndex: number;
  setRunTutorial: React.Dispatch<React.SetStateAction<boolean>>;
  setStepIndex: React.Dispatch<React.SetStateAction<number>>;
}

export default function PhotosphereTutorialEditor({
  runTutorial,
  stepIndex,
  setRunTutorial,
  setStepIndex,
}: Props) {
  const steps: Step[] = [
    {
      target: ".add-features-button",
      content: "Add Photosphere features that skipped in the create step",
      placement: "right",
      disableBeacon: true,
    },
    {
      target: ".edit-features-button",
      content: "Change the current scene or the NavMap",
      placement: "right",
      disableBeacon: true,
    },
    {
      target: ".remove-features-button",
      content: "Remove the current scene or the NavMap",
      placement: "right",
      disableBeacon: true,
    },
    {
      target: ".export-button",
      content: "Save the created VFE to your computer",
      placement: "right",
      disableBeacon: true,
    },
    {
      target: ".scene-header",
      content: "Added scenes are listed here",
      placement: "bottom",
      disableBeacon: true,
    },
  ];

  function isFinishedOrSkipped(status: Status): status is "finished" | "skipped" {
    return status === STATUS.FINISHED || status === STATUS.SKIPPED;
  }

  useEffect(() => {
    const shouldResume = localStorage.getItem("resumeTutorialEditor") === "true";
    if (shouldResume) {
      setRunTutorial(true);
      setStepIndex(0);
      localStorage.removeItem("resumeTutorialEditor");
      localStorage.removeItem("resumeTutorialCreate")

    }
  }, []);

  return (
    <Joyride
      steps={steps}
      run={runTutorial}
      stepIndex={stepIndex}
      continuous
      showSkipButton
      showProgress
      disableOverlayClose={true}
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
      callback={(data: CallBackProps) => {
        const { status, action, index, type } = data;

        if (isFinishedOrSkipped(status)) {
          setRunTutorial(false);
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
