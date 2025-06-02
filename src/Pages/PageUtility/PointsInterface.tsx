import localforage from "localforage";
import { useState } from "react";

// Using a separite instance of localforage so we dont interfere with loading of VFEs
const pointsStore = localforage.createInstance({
  name: "pointsStore",
});

const points = await pointsStore.getItem<number>("Points");
const maxPoints = await pointsStore.getItem<number>("MaxPoints");
const pointGain = await pointsStore.getItem<number>("PointGain");
const gamifiedState = await pointsStore.getItem<boolean>("GamifiedState");

function getPoints() {
  return points;
}

function getGamifiedState() {
  return gamifiedState;
}

function getMaxPoints() {
  if (maxPoints) return maxPoints;
  else return 100;
}

function getPointGain() {
  if (pointGain) return pointGain;
  else return 10;
}

function ResetPoints() {
  pointsStore
    .setItem("Points", 0)
    .then(() => {
      window.dispatchEvent(new Event("storage"));
      console.log("Points initialized successfully!");
    })
    .catch((error) => {
      console.error("Error storing data:", error);
    });
}

function ResetMaxPoints() {
  pointsStore
    .setItem("MaxPoints", 100)
    .then(() => {
      window.dispatchEvent(new Event("storage"));
      console.log("Points initialized successfully!");
    })
    .catch((error) => {
      console.error("Error storing data:", error);
    });
}

function ResetPointGain() {
  pointsStore
    .setItem("PointsGain", 10)
    .then(() => {
      window.dispatchEvent(new Event("storage"));
      console.log("Points initialized successfully!");
    })
    .catch((error) => {
      console.error("Error storing data:", error);
    });
}

function InitializeAllPoints() {
  ResetPoints();
  ResetMaxPoints();
  ResetPointGain();
}

function InitializeState() {
  pointsStore
    .setItem("GamifiedState", true)
    .then(() => {
      window.dispatchEvent(new Event("storage"));
      console.log("State initialized successfully!");
    })
    .catch((error) => {
      console.error("Error storing state data:", error);
    });
}

export function usePoints() {
  const [points, setPoints] = useState(getPoints());
  const [maxPoints, setMaxPoints] = useState(getMaxPoints());
  const [pointGain, setPointGain] = useState(getPointGain());
  // will need a set maxPoints function eventually that saves the max points to VFE
  // save data when changed in the editor

  console.log("MAX POINTS", maxPoints);
  console.log("POINT GAIN", pointGain);

  async function AddPoints() {
    let pointsStorage = await pointsStore.getItem<number>("Points");

    if (pointsStorage != null && pointGain) {
      pointsStorage = pointsStorage + pointGain;
      if (pointsStorage > maxPoints) {
        pointsStorage = maxPoints;
      }
      setPoints(pointsStorage);
    } else {
      console.log("No Points!  Initialize!");
      InitializeAllPoints();
      //Recursively call add points here to ensure adding happens?
      return;
    }

    pointsStore
      .setItem("Points", pointsStorage)
      .then(() => {
        console.log(
          "Points updated successfully! New points are: " + pointsStorage,
        );
        window.dispatchEvent(new Event("storage"));
        return;
      })
      .catch((error) => {
        console.error("Error storing points data:", error);
      });
  }

  function ResetPoints() {
    // ResetPoints();
    InitializeAllPoints();
    setPoints(0);
  }

  async function SetMaxPoints(amount: number) {
    const maxPointsStorage = await pointsStore.getItem<number>("MaxPoints");

    if (maxPointsStorage != null) {
      setMaxPoints(amount);
    } else {
      console.log("No Max Points!  Initialize!");
      ResetMaxPoints();
      setMaxPoints(amount);
    }

    pointsStore
      .setItem("MaxPoints", amount)
      .then(() => {
        console.log(
          "Max points updated successfully! New max points are: " + amount,
        );
        window.dispatchEvent(new Event("storage"));
        return;
      })
      .catch((error) => {
        console.error("Error storing max points data:", error);
      });
  }

  async function SetPointGain(amount: number) {
    const pointGainStorage = await pointsStore.getItem<number>("PointGain");

    if (pointGainStorage != null) {
      setPointGain(amount);
    } else {
      console.log("No Point Gain Value!  Initialize!");
      ResetPointGain();
      setPointGain(amount);
    }

    pointsStore
      .setItem("PointGain", amount)
      .then(() => {
        console.log(
          "Point gain updated successfully! New point gain: " + amount,
        );
        window.dispatchEvent(new Event("storage"));
        return;
      })
      .catch((error) => {
        console.error("Error storing point gain data:", error);
      });
  }

  return [
    points,
    AddPoints,
    ResetPoints,
    maxPoints,
    SetMaxPoints,
    pointGain,
    SetPointGain,
  ] as const;
}

export function useGamificationState(initialState?: boolean) {
  const [gamifiedState, setGamifiedState] = useState(
    initialState ? initialState : getGamifiedState(),
  );

  async function SwapGamifyState() {
    let stateStorage = await pointsStore.getItem<boolean>("GamifiedState");
    InitializeAllPoints();

    if (stateStorage != null) {
      stateStorage = !stateStorage;
      setGamifiedState(stateStorage);
    } else {
      console.log("No State, intialize!");
      InitializeState();
      setGamifiedState(true);
    }

    pointsStore
      .setItem("GamifiedState", stateStorage)
      .then(() => {
        console.log("The state storage is: " + stateStorage);
        window.dispatchEvent(new Event("storage"));
        return;
      })
      .catch((error) => {
        console.error("Error storing data:", error);
      });
    return;
  }

  async function SetGamifyState(state: boolean) {
    const stateStorage = await pointsStore.getItem<boolean>("GamifiedState");

    if (stateStorage != null) {
      setGamifiedState(state);
    } else {
      console.log("No State, intialize!");
      InitializeState();
      setGamifiedState(state);
    }
    pointsStore
      .setItem("GamifiedState", state)
      .then(() => {
        console.log("The state storage was set to: " + state);
        window.dispatchEvent(new Event("storage"));
        return;
      })
      .catch((error) => {
        console.error("Error storing data:", error);
      });
    return;
  }

  return [gamifiedState, SwapGamifyState, SetGamifyState] as const;
}
