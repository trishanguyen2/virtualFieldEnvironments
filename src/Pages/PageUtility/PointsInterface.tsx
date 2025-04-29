/* eslint-disable func-style */
import localforage from "localforage";
import { useState } from "react";

// Using a separite instance of localforage so we dont interfere with loading of VFEs
const pointsStore = localforage.createInstance({
  name: "pointsStore",
});

let maxPoints = 100;
const points = await pointsStore.getItem<number>("Points");

export const getPoints = () => {
  return points;
};

export function getMaxPoints() {
  //use effect for constant updates?
  return maxPoints;
}

//Can also be used to reset points
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

  //initialize this if component does not exist, load from VFE save data otherwise
  maxPoints = 100;
}

// will need a set maxPoints function eventually that saves the max points to VFE
// save data when changed in the editor

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
