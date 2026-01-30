import { Uri } from "vscode";
import { LanguageClientOptions } from "vscode-languageclient";

import { LanguageClient } from "vscode-languageclient/browser";

import * as vscode from "vscode";
import * as common from "../common/common";

export async function activate(context: vscode.ExtensionContext) {
    await common.activate(context, createLanguageClient);
}

export function deactivate() {
    common.deactivate();
}

async function createLanguageClient(
    context: vscode.ExtensionContext
): Promise<LanguageClient | undefined> {
    const documentSelector = [{ language: "plaintext" }, { language: "nemo" }];

    const clientOptions: LanguageClientOptions = {
        documentSelector,
        synchronize: {},
        initializationOptions: {},
    };

    const serverMain = Uri.joinPath(
        context.extensionUri,
        "dist/browserServerMain.js"
    );
    // TODO: Possibly replace with https://github.com/microsoft/vscode-wasm/tree/main/wasm-wasi-core
    const worker = new Worker(serverMain.toString(true));

    return new LanguageClient(
        "nemo",
        "Nemo Language Client",
        clientOptions,
        worker
    );
}
