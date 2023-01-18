// map bundle source links to original source
import "source-map-support/register";

import {connectDatabase, setupServer, startServer} from "./server";

async function start() {
    await connectDatabase();
    await setupServer();
    await startServer();
}

start();
