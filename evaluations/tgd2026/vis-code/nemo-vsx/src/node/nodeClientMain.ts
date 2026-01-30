import { access, readFile } from "fs/promises";
import * as vscode from "vscode";
import {
    Executable,
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
} from "vscode-languageclient/node";
import * as common from "../common/common";
import { dirname, join } from "path";

export async function activate(context: vscode.ExtensionContext) {
    await common.activate(context, createLanguageClient);

    vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration("nemo.languageServerExecutablePath")) {
            vscode.commands.executeCommand("nemo.restartLanguageServer");
        }
    });
}


export function deactivate() {
    common.deactivate();
}

async function getLanguageServerExecutablePath(
    context: vscode.ExtensionContext
): Promise<string | undefined> {
    let executablePath = vscode.workspace
        .getConfiguration()
        .get<string>("nemo.languageServerExecutablePath");

    if (typeof executablePath !== "string" || executablePath === "") {
        const chosenOption = await vscode.window.showInformationMessage(
            "Nemo language server could not be found",
            "Setup path to executable"
        );

        if (chosenOption === "Setup path to executable") {
            await vscode.commands.executeCommand(
                "workbench.action.openSettings",
                "nemo.languageServerExecutablePath"
            );
        }
        return undefined;
    }

    try {
        await access(executablePath);
        return executablePath;
    } catch (error: any) {
        vscode.window.showErrorMessage(
            "Error while starting Nemo language server: Executable could not be accessed!",
            {
                detail:
                    `Error while accessing file at path ${executablePath}:\n` +
                    error.toString(),
            }
        );
        return undefined;
    }
}

async function createLanguageClient(
    context: vscode.ExtensionContext
): Promise<LanguageClient | undefined> {
    const command = await getLanguageServerExecutablePath(context);

    if (command === undefined) {
        return undefined;
    }

    const executable: Executable = {
        command,
    };

    const serverOptions: ServerOptions = {
        run: executable,
        debug: executable,
    };

    const clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: "file", language: "nemo" }],
        outputChannel: common.outputChannel,
        traceOutputChannel: common.traceOutputChannel,
    };

    return new LanguageClient(
        "nemo",
        "Nemo Language Client",
        serverOptions,
        clientOptions
    );
}
