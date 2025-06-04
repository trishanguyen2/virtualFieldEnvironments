import Joyride, {
  CallBackProps,
  Step,
  STATUS,
  EVENTS,
  ACTIONS,
  Status,
} from "react-joyride";
import { useEffect } from "react";

export const editFeaturesSteps: Step[] = [
    { 
      target: ".edit-photosphere-buttonEdit",
      content: "Edit existing Photosphere.",
      placement: "right",
      disableBeacon: true 
    },
    {
      target: ".edit-nav-map-button",
      content: "Edit existing NavMap.",
      placement: "right",
      disableBeacon: true 
    },
];

interface Props {
  runSubmenuEditTutorial: boolean;
  submenuEditStepIndex: number;
  setRunSubmenuEditTutorial: React.Dispatch<React.SetStateAction<boolean>>;
  setSubmenuEditStepIndex: React.Dispatch<React.SetStateAction<number>>;
  editSteps: Step[];
}

export default function PhotosphereTutorialSubmenuEdit({
  runSubmenuEditTutorial,
  submenuEditStepIndex,
  setRunSubmenuEditTutorial,
  setSubmenuEditStepIndex,
  editSteps,
}: Props) {
  function isFinishedOrSkipped(status: Status): boolean {
    return status === STATUS.FINISHED || status === STATUS.SKIPPED;
  }

  useEffect(() => {
    const shouldResume = localStorage.getItem("resumeSubmenuEditTutorial") === "true";
    if (shouldResume) {
      setRunSubmenuEditTutorial(true);
      setSubmenuEditStepIndex(0);
      localStorage.removeItem("resumeSubmenuEditTutorial");
    }
}
, [setRunSubmenuEditTutorial, setSubmenuEditStepIndex]);

  return (
    <Joyride
      steps={editSteps}
      run={runSubmenuEditTutorial}
      stepIndex={submenuEditStepIndex}
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
          setRunSubmenuEditTutorial(false);
          setSubmenuEditStepIndex(0);
        } else if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
          setSubmenuEditStepIndex(action === ACTIONS.NEXT ? index + 1 : index - 1);
        }
      }}
    />
  );
}