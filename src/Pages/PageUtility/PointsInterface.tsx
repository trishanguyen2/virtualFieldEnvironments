import localforage from "localforage";
import { useState } from "react";

// Using a separite instance of localforage so we dont interfere with loading of VFEs
const pointsStore = localforage.createInstance({
  name: "pointsStore",
});

const points = await pointsStore.getItem<number>("Points");
const gamifiedState = await pointsStore.getItem<boolean>("GamifiedState");

export const getPoints = () => {
  return points;
};

export const getGamifiedState = () => {
  return gamifiedState;
};

export function InitializePoints() {
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

export function InitializeState() {
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
  // will need a set maxPoints function eventually that saves the max points to VFE
  // save data when changed in the editor

  //Increment Points by Amount, must be whole number
  async function AddPoints(amount: number) {
    let pointsStorage = await pointsStore.getItem<number>("Points");

    if (pointsStorage != null) {
      pointsStorage = pointsStorage + amount;
      setPoints(pointsStorage);
    } else {
      console.log("No Points!");
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
        console.error("Error storing data:", error);
      });
  }

  return [points, AddPoints] as const;
}

export function useGamificationState() {
  const [gamifiedState, setGamifiedState] = useState(getGamifiedState());

  async function SwapGamifyState() {
    let stateStorage = await pointsStore.getItem<boolean>("GamifiedState");
    InitializePoints();

    if (stateStorage != null) {
      stateStorage = !stateStorage;
      setGamifiedState(stateStorage);
    } else {
      console.log("No State, intialize!");
      InitializeState();
      return;
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
  }

  async function SetGamifyState(state: boolean) {
    setGamifiedState(state);
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
  }

  return [gamifiedState, SwapGamifyState, SetGamifyState] as const;
}
