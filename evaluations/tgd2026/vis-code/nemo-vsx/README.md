# Nemo Rule Engine Language Support

Features:

-   Nemo Rule File language configuration
-   Basic syntax highlighting
-   Syntax error diagnostics
-   Document outline
-   Find references of predicates, local variables, functions and aggregates
-   Rename all occurences of predicates, local variables, functions and aggregates

This editor extension works with VSIX-compatible editors such as [VSCodium](https://vscodium.com/) and [Eclipse Theia](https://theia-ide.org/).

## Installation

-   Install extension `.vsix` file

In [web contexts](https://code.visualstudio.com/docs/editor/vscode-web#_extensions), this extension works out of the box (using web assembly). In all other contexts, one needs to setup the Nemo language server manually:

-   Build the [Nemo language server](https://github.com/knowsys/nemo/tree/main/nemo-language-server) for your platform

    ```
    git clone https://github.com/knowsys/nemo.git
    cd nemo
    cargo build --release --package nemo-language-server --bin nemo-language-server
    # Get path to language server binary
    realpath target/release/nemo-language-server
    ```

-   Setup path to Nemo language server in the extension settings

## Building the `.vsix` extension

-   Clone the repository
-   Build the [Nemo WASM library](https://github.com/knowsys/nemo/tree/main/nemo-wasm)
-   Build and package the extension

    ```bash
    # Copy nemo-wasm library to the correct location
    cp -r $PATH_TO_NEMO_WASM/nemoWASMWeb .

    npm install
    npm run package
    ```
