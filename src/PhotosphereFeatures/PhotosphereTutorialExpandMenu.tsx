import { useEffect, useState } from 'react';
import Joyride, { CallBackProps, STATUS, Step, ACTIONS, EVENTS } from 'react-joyride';

interface ExpandMenuTutorialProps {
  run: boolean;
  onFinish: () => void;
}

const steps: Step[] = [
  {
    target: '.expand-change-time',
    content: 'Select a scene from a different time.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '.expand-split-view-button',
    content: 'Enable split view settings.',
    placement: 'bottom',
    disableBeacon: true,
  },
];

export default function PhotosphereTutorialExpandMenu({ run, onFinish }: ExpandMenuTutorialProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [hasShownTutorial, setHasShownTutorial] = useState(
    localStorage.getItem("expandMenuTutorialShown") === "false"
  );

  useEffect(() => {
    if (run && !hasShownTutorial) {
      setStepIndex(0);
    }
  }, [run, hasShownTutorial]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action, index, type } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      localStorage.setItem("expandMenuTutorialShown", "false");
      setHasShownTutorial(true);
      onFinish();
      setStepIndex(0);
      return;
    }

    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      if (action === ACTIONS.NEXT) {
        setStepIndex(index + 1);
      } else if (action === ACTIONS.PREV) {
        setStepIndex(index - 1);
      }
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run && !hasShownTutorial}
      stepIndex={stepIndex}
      continuous
      debug
      showSkipButton
      disableOverlayClose
      styles={{
        options: { zIndex: 10000, primaryColor: "#1976d2" },
        tooltip: { fontFamily: "Roboto, sans-serif", fontSize: "16px" },
        buttonClose: { display: "none" },
      }}
      locale={{ 
        next: "Next",
        last: "Done" 
      }}
      callback={handleJoyrideCallback}
    />
  );
}

