import { SharedMap } from "fluid-framework";
import { TinyliciousClient } from "@fluidframework/tinylicious-client";
import readlineSync from "readline-sync";

const schema = {
  initialObjects: { sharedRandomNumber: SharedMap },
};

const randomNumberKey = "random-number-key";

const client = new TinyliciousClient();

async function createContainer() {
  const { container } = await client.createContainer(schema);
  container.initialObjects.sharedRandomNumber.set(randomNumberKey, 1);
  const id = await container.attach();
  console.log("Initializing Node Client----------", id);
  loadCli(container.initialObjects.sharedRandomNumber);
  return id;
}

async function loadContainer(id) {
  const { container } = await client.getContainer(id, schema);
  console.log("Loading Existing Node Client----------", id);
  loadCli(container.initialObjects.sharedRandomNumber);
}

function loadCli(map) {
  // Set a timer to update the random number every 1 second
  const newRandomNumber = () => {
    map.set(randomNumberKey, Math.floor(Math.random() * 100) + 1);
  };
  setInterval(newRandomNumber, 1000);

  // Listen for updates and print changes to the random number
  const updateConsole = () => {
    console.log("Value: ", map.get(randomNumberKey));
  };
  updateConsole();
  map.on("valueChanged", updateConsole);
}

async function start() {
  const containerId = readlineSync.question(
    "Type a Container ID or press Enter to continue: "
  );

  if (
    containerId.length === 0 ||
    containerId === "undefined" ||
    containerId === "null"
  ) {
    await createContainer();
  } else {
    await loadContainer(containerId);
  }
}

start().catch(console.error());
