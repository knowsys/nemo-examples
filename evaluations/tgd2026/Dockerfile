FROM nixos/nix:latest AS rust
WORKDIR /nemo

COPY nemo ./nemo

RUN cd nemo && \
    nix --extra-experimental-features "nix-command flakes" build .\#{nemo-wasm-bundler,nemo-wasm-web}

FROM node:20-alpine AS node-builder

RUN apk update && apk add git 

FROM node-builder AS vscode-extension 
WORKDIR /vsx 

COPY ./vis-code/nemo-vsx ./nemo-vsx
COPY --from=rust /nemo/nemo/result-1/lib/node_modules/nemo-wasm /vsx/nemo-vsx/nemoWASMWeb

RUN cd nemo-vsx && npm i
RUN cd nemo-vsx && npm run package

FROM node-builder AS nemo-web 
WORKDIR /web

COPY ./vis-code/nemo-web ./nemo-web
COPY --from=vscode-extension /vsx/nemo-vsx/nemo-0.0.17.vsix /web/nemo-web/nemoVSIX/nemo.vsix
COPY --from=rust /nemo/nemo/result/lib/node_modules/nemo-wasm /web/nemo-web/nemoWASMBundler

RUN cd nemo-web && npm i
RUN cd nemo-web && NODE_OPTIONS=--max_old_space_size=4096 npm run build

COPY ./vis-code/nemo-ev ./nemo-ev
RUN cd nemo-ev && npm i 
RUN cd nemo-ev && npm run build 

FROM nginx

COPY --from=nemo-web /web/nemo-web/dist /usr/share/nginx/html/nemo
COPY --from=nemo-web /web/nemo-ev/dist /usr/share/nginx/html/nemo/ev
