import Joyride, {
  CallBackProps,
  Step,
  STATUS,
  EVENTS,
  ACTIONS,
  Status,
} from "react-joyride";
import { useEffect } from "react";

export const addFeaturesSteps: Step[] = [
    { 
      target: ".add-photosphere-button", 
      content: "Add a new Photosphere.", 
      placement: "right", 
      disableBeacon: true 
    },
    { 
      target: ".add-navmap-button",
      content: "Add or edit the NavMap.",
      placement: "right",
      disableBeacon: true 
    },
    { 
      target: ".add-hotspot-button",
      content: "Add a new Hotspot.",
      placement: "right",
      disableBeacon: true 
    },
    { 
      target: ".upload-audio-button",
      content: "Upload Background Audio.",
      placement: "right",
      disableBeacon: true 
    },
];

interface Props {
  runSubmenuAddTutorial: boolean;
  submenuAddStepIndex: number;
  setRunSubmenuAddTutorial: React.Dispatch<React.SetStateAction<boolean>>;
  setSubmenuAddStepIndex: React.Dispatch<React.SetStateAction<number>>;
  addSteps: Step[];
}

export default function PhotosphereTutorialSubmenuAdd({
  runSubmenuAddTutorial,
  submenuAddStepIndex,
  setRunSubmenuAddTutorial,
  setSubmenuAddStepIndex,
  addSteps,
}: Props) {
  function isFinishedOrSkipped(status: Status): boolean {
    return status === STATUS.FINISHED || status === STATUS.SKIPPED;
  }

  useEffect(() => {
    const shouldResume = localStorage.getItem("resumeSubmenuAddTutorial") === "true";
    if (shouldResume) {
      setRunSubmenuAddTutorial(true);
      setSubmenuAddStepIndex(0);
      localStorage.removeItem("resumeSubmenuAddTutorial");
    }
}
, [setRunSubmenuAddTutorial, setSubmenuAddStepIndex]);

  return (
    <Joyride
      steps={addSteps}
      run={runSubmenuAddTutorial}
      stepIndex={submenuAddStepIndex}
      continuous
      showSkipButton
      showProgress
      disableOverlayClose={true}
      styles={{
        options: { zIndex: 10000, primaryColor: "#1976d2" },
        tooltip: { fontFamily: "Roboto, sans-serif", fontSize: "16px" },
        buttonClose: { display: "none" },
      }}
      locale={{ last: "Done" }}
      callback={(data: CallBackProps) => {
        const { status, action, index, type } = data;

        if (isFinishedOrSkipped(status)) {
          setRunSubmenuAddTutorial(false);
          setSubmenuAddStepIndex(0);
        } else if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
          setSubmenuAddStepIndex(action === ACTIONS.NEXT ? index + 1 : index - 1);
        }
      }}
    />
  );
}
