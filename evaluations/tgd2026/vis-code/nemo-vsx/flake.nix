rec {
  description = "Visual Studio Code extension for the Nemo rule language";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.05";
    utils.url = "github:gytis-ivaskevicius/flake-utils-plus";
    dream2nix = {
      url = "github:nix-community/dream2nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    nemo = {
      url = "github:knowsys/nemo";
      inputs = {
        nixpkgs.follows = "nixpkgs";
        utils.follows = "utils";
      };
    };
  };

  outputs =
    inputs@{
      self,
      utils,
      nemo,
      dream2nix,
      ...
    }:
    utils.lib.mkFlake {
      inherit self inputs;

      channels.nixpkgs.overlaysBuilder = channels: [
        nemo.overlays.default
      ];

      overlays = {
        default =
          final: prev:
          let
            pkgs = self.packages.${final.system};
          in
          {
            inherit (pkgs) nemo-vscode-extension-vsix nemo-vscode-extension;
          };
      };

      outputsBuilder =
        channels:
        let
          pkgs = channels.nixpkgs;

          npmMeta = builtins.fromJSON (builtins.readFile ./package.json);
          inherit (npmMeta) version;

          meta = {
            inherit description;
            homepage = npmMeta.repository.url;
          };

          nemoWASMWeb =
            config:
            pkgs.runCommandLocal "nemoWASMWeb" { } ''
              mkdir $out
              cp -R ${config.deps.nemo-wasm-web}/lib/node_modules/nemo-wasm/ $out/nemoWASMWeb
            '';

          nemo-vscode-extension-source =
            config:
            pkgs.runCommandLocal "nemo-vscode-extension-source" { } ''
              mkdir $out
              cp ${./.vscodeignore} $out # clearSource will drop this, but vsce requires it
              cp -R ${pkgs.lib.cleanSource ./.}/* $out
              cp -R ${nemoWASMWeb config}/nemoWASMWeb $out
            '';

          nemo-vscode-extension-vsix = dream2nix.lib.evalModules {
            packageSets.nixpkgs = pkgs;

            modules = [
              {
                paths = {
                  projectRoot = ./.;
                  projectRootFile = "flake.nix";
                  package = ./.;
                };
              }

              (
                {
                  lib,
                  config,
                  dream2nix,
                  ...
                }:
                {
                  name = "nemo-vscode-extension-vsix";
                  inherit version;

                  imports = [
                    dream2nix.modules.dream2nix.nodejs-package-lock-v3
                    dream2nix.modules.dream2nix.nodejs-granular-v3
                  ];

                  mkDerivation = {
                    src = nemo-vscode-extension-source config;

                    installPhase = ''
                      runHook preInstall

                      cp nemo-${version}.vsix $out

                      runHook postInstall
                    '';
                  };

                  deps =
                    { nixpkgs, ... }:
                    {
                      inherit (nixpkgs) stdenv pkg-config libsecret;
                      nemo-wasm-web = lib.mkDefault nemo.packages.${nixpkgs.system}.nemo-wasm-web;
                    };

                  nodejs-package-lock-v3 = {
                    packageLockFile = "${config.mkDerivation.src}/package-lock.json";
                  };

                  nodejs-granular-v3 = {
                    buildScript = "npm run package";

                    overrides.keytar.mkDerivation.buildInputs = [
                      config.deps.pkg-config
                      config.deps.libsecret
                    ];
                  };
                }
              )
            ];
          };
        in
        {
          packages = rec {
            inherit nemo-vscode-extension-vsix;

            nemo-vscode-extension =
              let
                pname = "nemo";
                publisher = "knowsys";
              in
              pkgs.vscode-utils.buildVscodeExtension {
                inherit version meta pname;
                name = "${pname}-${version}";
                src = "${nemo-vscode-extension-vsix}/${pname}-${version}.vsix";
                vscodeExtUniqueId = "${publisher}.${pname}";
                vscodeExtPublisher = publisher;
                vscodeExtName = pname;

                nativeBuildInputs = [
                  pkgs.jq
                  pkgs.moreutils
                ];

                unpackPhase = ''
                  unzip $src
                '';

                preInstall = ''
                  jq '.contributes.configuration.properties."nemo.languageServerExecutablePath".default = $s' \
                    --arg s "${pkgs.nemo-language-server}/bin/nemo-language-server" \
                  package.json | sponge package.json
                '';
              };

            default = nemo-vscode-extension;
          };

          devShells.default = dream2nix.lib.evalModules {
            packageSets.nixpkgs = pkgs;

            modules = [
              {
                paths = {
                  projectRoot = ./.;
                  projectRootFile = "flake.nix";
                  package = ./.;
                };
              }

              (
                {
                  lib,
                  config,
                  dream2nix,
                  ...
                }:
                {
                  name = "nemo-vscode-extension-vsix";
                  inherit version;

                  imports = [
                    dream2nix.modules.dream2nix.nodejs-package-lock-v3
                    dream2nix.modules.dream2nix.nodejs-devshell-v3
                  ];

                  mkDerivation = {
                    src = nemo-vscode-extension-source config;

                    nativeBuildInputs = [
                      pkgs.nodejs
                    ];

                    buildPhase = "mkdir $out";
                  };

                  deps =
                    { nixpkgs, ... }:
                    {
                      inherit (nixpkgs) stdenv pkg-config libsecret;
                      nemo-wasm-web = lib.mkDefault nemo.packages.${nixpkgs.system}.nemo-wasm-web;
                    };

                  nodejs-package-lock-v3 = {
                    packageLockFile = "${config.mkDerivation.src}/package-lock.json";
                  };

                  nodejs-devshell-v3.nodeModules.nodejs-granular-v3.overrides.keytar.mkDerivation.buildInputs = [
                    config.deps.pkg-config
                    config.deps.libsecret
                  ];
                }
              )
            ];
          };

          formatter = channels.nixpkgs.nixfmt-rfc-style;
        };

    };
}
