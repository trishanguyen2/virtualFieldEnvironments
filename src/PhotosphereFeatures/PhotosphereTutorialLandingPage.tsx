import Joyride, {
  CallBackProps,
  Status,
  STATUS,
  Step,
  ACTIONS,
  EVENTS,
} from "react-joyride";

interface Props {
  runTutorial: boolean;
  stepIndex: number;
  setRunTutorial: React.Dispatch<React.SetStateAction<boolean>>;
  setStepIndex: React.Dispatch<React.SetStateAction<number>>;
}

export default function PhotosphereTutorial({
  runTutorial,
  stepIndex,
  setRunTutorial,
  setStepIndex,
}: Props) {
  const tutorialSteps: Step[] = [
    {
      target: ".dropzone-area",
      content: "Upload an existing VFE files here.",
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: ".vfe-list-area",
      content: "Existing VFE's will appear here.",
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: ".create-vfe-button",
      content: "Lets get started by creating a new VFE.",
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: "fake-step",
      content: "This should not appear and should be skipped.",
      disableBeacon: true,
    },
  ];

  function isFinishedOrSkipped(status: Status): status is "finished" | "skipped" {
    return status === STATUS.FINISHED || status === STATUS.SKIPPED;
  }

  return (
    <Joyride
      steps={tutorialSteps}
      run={runTutorial}
      stepIndex={stepIndex}
      continuous
      showSkipButton
      showProgress
      disableOverlayClose
      styles={{ 
        options: { 
          zIndex: 10000 ,
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

            const isLastLandingStep = index === 2;
            if (isLastLandingStep) {
              setStepIndex(index + 1);
              localStorage.setItem("resumeTutorial", "true");
            }
          } 
          else if (action === ACTIONS.PREV) 
            setStepIndex(index - 1);
        }
      }}
    />
  );
}
