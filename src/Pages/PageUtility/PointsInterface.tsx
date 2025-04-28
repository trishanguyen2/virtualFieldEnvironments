import localforage from "localforage";

// Using a separite instance of localforage so we dont interfere with loading of VFEs
const pointsStore = localforage.createInstance({
  name: "pointsStore",
});

let maxPoints = 100;
const points = await pointsStore.getItem<number>("Points");

export function getPointTotal() {
  console.log("Points total:" + points);
  return points ?? 0;
}

export function getMaxPoints() {
  //use effect for constant updates?
  return maxPoints;
}

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

  //initialize this if component does not exist, load from VFE save data otherwise
  maxPoints = 100;
}

// will need a set maxPoints function eventually that saves the max points to VFE
// save data when changed in the editor

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

// export async function GetProgressBarData() {
//   const [points, setPoints] = useState(0);
//   const maxPoints = getMaxPoints();
//   const pointsFromMemory = await getPointTotal();

//   useEffect(() => {
//     setPoints(pointsFromMemory ? pointsFromMemory : 0);
//   }, [pointsFromMemory]);

//   return [points, maxPoints];
// }
