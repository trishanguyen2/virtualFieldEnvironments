import localforage from "localforage";

//Initialize or Reset Points
export function InitializePoints() {
  localforage
    .setItem("Points", 0)
    .then(() => {
      console.log("Points initialized successfully!");
    })
    .catch((error) => {
      console.error("Error storing data:", error);
    });
}

//Increment Points by Amount
export async function AddPoints(amount: number) {
  let points = await localforage.getItem<number>("Points");

  if (points != null) {
    points = points + amount;
  } else return;

  localforage
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

  localforage
    .getItem("Points")
    .then((data) => {
      console.log("Retrieved points:", data);
    })
    .catch((error) => {
      console.error("Error retrieving data:", error);
    });
}
