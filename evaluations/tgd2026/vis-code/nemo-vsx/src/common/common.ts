import * as vscode from "vscode";
import { BaseLanguageClient } from "vscode-languageclient/node";

let client: BaseLanguageClient | undefined = undefined;

export type LanguageClientFactory = (
    context: vscode.ExtensionContext
) => Promise<BaseLanguageClient | undefined>;
let languageClientFactory: LanguageClientFactory;

export let outputChannel: vscode.OutputChannel | undefined = undefined;
export let traceOutputChannel: vscode.OutputChannel | undefined = undefined;

async function stopLanguageServer() {
    if (client === undefined) {
        throw new Error();
    }

    const oldClient = client;
    client = undefined;
    try {
        await oldClient.stop(0);
    } catch (error) {
        console.error(error);
    }
}

async function startLanguageServer(context: vscode.ExtensionContext) {
    client = await languageClientFactory(context);

    if (client === undefined) {
        return;
    }

    await client.start();
}

export async function activate(
    context: vscode.ExtensionContext,
    createLanguageClient: LanguageClientFactory
) {
    languageClientFactory = createLanguageClient;

    outputChannel = vscode.window.createOutputChannel("Nemo language server");
    traceOutputChannel = vscode.window.createOutputChannel(
        "Nemo language server trace"
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            "nemo.restartLanguageServer",
            async () => {
                if (client !== undefined) {
                    await stopLanguageServer();
                }
                await startLanguageServer(context);
            }
        )
    );
    context.subscriptions.push(
        vscode.commands.registerCommand("nemo.stopLanguageServer", async () => {
            if (client === undefined) {
                vscode.window.showWarningMessage(
                    "Nemo language server is not running!"
                );
            } else {
                await stopLanguageServer();
            }
        })
    );

    startLanguageServer(context);
}

export function deactivate() {
    if (client !== undefined) {
        client.stop();
        client = undefined;
    }
}
