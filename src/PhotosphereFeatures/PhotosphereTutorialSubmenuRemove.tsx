import Joyride, {
  CallBackProps,
  Step,
  STATUS,
  EVENTS,
  ACTIONS,
  Status,
} from "react-joyride";
import { useEffect } from "react";

export const removeFeaturesSteps: Step[] = [
    {
      target: ".remove-photosphere-button", 
      content: "Remove a Photosphere.",
      placement: "right", 
      disableBeacon: true 
    },
    {
      target: ".remove-nav-map",
      content: "Remove the NavMap.",
      placement: "right",
      disableBeacon: true 
    },
];

interface Props {
  runSubmenuRemoveTutorial: boolean;
  submenuRemoveStepIndex: number;
  setRunSubmenuRemoveTutorial: React.Dispatch<React.SetStateAction<boolean>>;
  setSubmenuRemoveStepIndex: React.Dispatch<React.SetStateAction<number>>;
  removeSteps: Step[];
}

export default function PhotosphereTutorialSubmenuRemove({
  runSubmenuRemoveTutorial,
  submenuRemoveStepIndex,
  setRunSubmenuRemoveTutorial,
  setSubmenuRemoveStepIndex,
  removeSteps,
}: Props) {
  function isFinishedOrSkipped(status: Status): boolean {
    return status === STATUS.FINISHED || status === STATUS.SKIPPED;
  }

  useEffect(() => {
    const shouldResume = localStorage.getItem("resumeSubmenuRemoveTutorial") === "true";
    if (shouldResume) {
      setRunSubmenuRemoveTutorial(true);
      setSubmenuRemoveStepIndex(0);
      localStorage.removeItem("resumeSubmenuRemoveTutorial");
    }
}
, [setRunSubmenuRemoveTutorial, setSubmenuRemoveStepIndex]);

  return (
    <Joyride
      steps={removeSteps}
      run={runSubmenuRemoveTutorial}
      stepIndex={submenuRemoveStepIndex}
      continuous
      showSkipButton
      disableOverlayClose={true}
      styles={{
        options: { zIndex: 10000, primaryColor: "#1976d2" },
        tooltip: { fontFamily: "Roboto, sans-serif", fontSize: "16px" },
        buttonClose: { display: "none" },
      }}
      locale={{ 
        next: "Next",
        last: "Done",
      }}
      callback={(data: CallBackProps) => {
        const { status, action, index, type } = data;

        if (isFinishedOrSkipped(status)) {
          setRunSubmenuRemoveTutorial(false);
          setSubmenuRemoveStepIndex(0);
        } else if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
          setSubmenuRemoveStepIndex(action === ACTIONS.NEXT ? index + 1 : index - 1);
        }
      }}
    />
  );
}