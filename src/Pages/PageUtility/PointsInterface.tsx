import localforage from "localforage";

// Using a separite instance of localforage so we dont interfere with loading of VFEs
const pointsStore = localforage.createInstance({
  name: "pointsStore",
});

//Can also be used to reset points
export function InitializePoints() {
  pointsStore
    .setItem("Points", 0)
    .then(() => {
      console.log("Points initialized successfully!");
    })
    .catch((error) => {
      console.error("Error storing data:", error);
    });
}

//Increment Points by Amount, must be whole number
export async function AddPoints(amount: number) {
  let points = await pointsStore.getItem<number>("Points");

  if (points != null) {
    points = points + amount;
  } else return;

  pointsStore
    .setItem("Points", points)
    .then(() => {
      console.log("Points updated successfully! New points are: " + points);
      return;
    })
    .catch((error) => {
      console.error("Error storing data:", error);
    });
}

// Show current points
export function PointsDisplay() {
  //use effect for constant updates?

  pointsStore
    .getItem("Points")
    .then((data) => {
      console.log("Retrieved points:", data);
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}
