const SharedMap = require('fluid-framework').SharedMap;
const TinyliciousClient  = require('@fluidframework/tinylicious-client').TinyliciousClient;
const readline = require('readline-async');

const schema = {
    initialObjects: { map: SharedMap }
}

const keyValue = "node-server-bot";

const client = new TinyliciousClient();

async function createContainer() {
    const { container } = await client.createContainer(schema);
    container.initialObjects.map.set(keyValue, 1);
    const id = await container.attach();
    console.log("Initializing Node Client----------", id);
    loadCli(container.initialObjects.map);
    return id;
}

async function loadContainer(id) {
    const { container } = await client.getContainer(id, schema);
    console.log("Loading Existing Node Client----------", id);
    loadCli(container.initialObjects.map);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function loadCli(map) {
    map.set(keyValue, Math.floor(Math.random() * 6) + 1);

    const updateConsole = () => {
        console.log("Value: ", map.get(keyValue));
    }
    updateConsole();
    map.on("valueChanged", updateConsole);
    await sleep(10000);
    loadCli(map);
}

async function readInput() {
    var containerId = "";
    console.log("Enter Container ID: ");
    await readline().then( line => {
        console.log("You entered: " + line);
        containerId = line;
    });
    return containerId;
}

async function start() {
    const containerId = await readInput();

    if(containerId.length === 0 || containerId === 'undefined' || containerId === 'null') {
        await createContainer();
    } else {
        await loadContainer(containerId);
    }
}

start().catch(console.error());
