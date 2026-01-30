import {
    BrowserMessageReader,
    BrowserMessageWriter,
    RequestMessage,
    ResponseMessage,
} from "vscode-languageserver/browser";

// See https://stackoverflow.com/questions/70420273/how-can-i-make-webpack-embed-my-wasm-for-use-in-a-web-worker#71673305
// @ts-ignore
import wasmModule from "../../nemoWASMWeb/nemo_wasm_bg.wasm";
import init, {
    NemoLspChannelClientInitiated,
    NemoLspRequestsServerInitiated,
    NemoLspResponsesServerInitiated,
    createNemoLanguageServer,
    setAllocErrorHook,
    setPanicHook,
} from "../../nemoWASMWeb/nemo_wasm.js";

const messageReader = new BrowserMessageReader(self);
const messageWriter = new BrowserMessageWriter(self);

let languageServer:
    | [
          NemoLspChannelClientInitiated,
          NemoLspRequestsServerInitiated,
          NemoLspResponsesServerInitiated
      ]
    | undefined = undefined;

// Used to wait until the server got started
const startPromise = start();

startPromise.catch((error) => {
    console.error(
        "Error while initializing Nemo WASM module and creating language server"
    );
    console.error(error);
});

async function start() {
    await init(wasmModule);

    setPanicHook();
    setAllocErrorHook();

    languageServer = createNemoLanguageServer();

    console.debug("[browserServerMain] Created language server", {
        languageServer,
    });

    // Handle requests made by the server in the background
    (async function () {
        while (true) {
            const request = await languageServer[1].getNextRequest();

            console.debug(
                "[browserServerMain] Received request from language server",
                {
                    request,
                }
            );

            messageWriter.write(request);
        }
    })().catch(console.error);
}

// Undefined, if no response is currently being sent
// An array, if at least one response is currently being sent
// The array contents are the responses that still need to be sent (after the request that is currently being sent)
//
// This mechanism is required, because only one request can be sent at a time
let pendingResponses: ResponseMessage[] | undefined = undefined;

messageReader.listen(async (message: RequestMessage | ResponseMessage) => {
    if (languageServer === undefined) {
        // Wait until the language server got started
        await startPromise;
    }

    if (languageServer === undefined) {
        // Wait until the language server got started
        console.error(
            "[browserServerMain] Cannot handle message because language server is not running"
        );
        // @ts-ignore
        if (self !== undefined && self.terminate !== undefined) {
            console.error("[browserServerMain] Stopping worker");
            // @ts-ignore
            self.terminate();
        }
        return;
    }

    // Check if message is a request from the client or a response from the client to a server's request
    if (message.hasOwnProperty("method")) {
        console.debug(
            "[browserServerMain] Sending request to language server",
            {
                message,
            }
        );

        const response = await languageServer[0].sendRequest(message);

        console.debug(
            "[browserServerMain] Received response from language server",
            {
                response,
            }
        );

        if (response === null) {
            return;
        }

        messageWriter.write(response);
    } else {
        sendResponseToServer(message).catch(console.error);
    }
});

async function sendResponseToServer(response: ResponseMessage) {
    if (pendingResponses === undefined) {
        console.debug(
            "[browserServerMain] Delaying response to be sent to the language server",
            {
                response,
            }
        );
        pendingResponses.push(response);

        return;
    }

    pendingResponses = [response];

    // Send all pending responses and new pending responses that got added in the process
    while (pendingResponses.length !== 0) {
        // This is an atomic operation because of single-threadedness
        const currentPendingBatch = pendingResponses;
        pendingResponses = [];

        for (const pendingResponse of currentPendingBatch) {
            console.debug(
                "[browserServerMain] Sending response to language server",
                {
                    response,
                }
            );

            await languageServer[2].sendResponse(pendingResponse);
        }
    }

    pendingResponses = undefined;
}
