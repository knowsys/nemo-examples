{
  description = "evaluation setup for SPARQLing Datalog";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.05";
    utils.url = "github:gytis-ivaskevicius/flake-utils-plus";

    nemo-08.url = "github:knowsys/nemo/refs/tags/v0.8.0";
    nemo-patched.url = "./nemo-patched";

    rulewerk.url = "github:knowsys/rulewerk";
  };

  outputs =
    inputs@{
      self,
      utils,
      nemo-patched,
      nemo-08,
      rulewerk,
      ...
    }:
    utils.lib.mkFlake {
      inherit self inputs;
      supportedSystems = [ "x86_64-linux" ];

      outputsBuilder =
        channels:
        let
          pkgs = channels.nixpkgs;
          inherit (pkgs) lib system;

          runtimeInputs = lib.attrValues {
            inherit (pkgs)
              coreutils
              hyperfine
              systemd # for systemd-run
              ;

            inherit (nemo-patched.packages.${system})
              nemo-SN-EC-MT
              nemo-SN-EC-noMT
              nemo-SN-noEC-MT
              nemo-SN-noEC-noMT
              nemo-noSN-noEC-noMT
              ;
            inherit (rulewerk.packages.${system}) rulewerk;
            nemo-08 = pkgs.writeShellScriptBin "nmo-0.8" ''
              ${lib.getExe nemo-08.packages.${system}.nemo} $*
            '';
          };

          queries = lib.pipe ./queries [
            builtins.readDir
            (lib.filterAttrs (_: v: v == "directory"))
            lib.attrNames
          ];
          endpoints = [
            "wdqs"
          ];
          programs = {
            nmo-noSN-noEC-noMT = "nemo";
            nmo-SN-noEC-noMT = "nemo";
            nmo-SN-noEC-MT = "nemo";
            nmo-SN-EC-noMT = "nemo";
            nmo-SN-EC-MT = "nemo";
            "nmo-0.8" = "nemo";
            rulewerk = "rulewerk";
          };

          arguments = {
            nemo =
              {
                program,
                name,
                query,
                output,
              }:
              lib.concatStringsSep " " [
                program
                query
                "--export-dir=${output}/results-\${HYPERFINE_ITERATION}.rls"
                "--report=all"
                "--log=info"
                "2>&1 | tee ${output}/${program}-\${HYPERFINE_ITERATION}.log"
              ];
            rulewerk =
              {
                program,
                name,
                query,
                output,
                ...
              }:
              lib.concatStringsSep " " [
                program
                "shell"
                "--log-level=INFO"
                ''
                  <<EOF
                  @load "${query}"
                  @reason
                  @export INFERENCES "outputs/$DATE/${name}/results-''${HYPERFINE_ITERATION}.rls"
                  @exit
                  EOF
                ''
                ""
                " 2>&1 | tee ${output}/${program}-\${HYPERFINE_ITERATION}.log"

              ];
          };

          mkVariant =
            qry:
            {
              program,
              endpoint,
              ...
            }:
            let
            in
            {
              inherit program;
              query = "queries/${qry}/${programs.${program}}.rls";
              name = "${program}-${qry}";
            };

          command =
            {
              program,
              query,
              name,
              output,
              ...
            }:

            arguments.${programs.${program}} {
              inherit
                program
                name
                query
                output
                ;
            };

          timeout = "10m";
          maxMem = "16G";
          runs = 10;

          mkQuery =
            query:
            let
              variants = lib.mapCartesianProduct (mkVariant query) {
                endpoint = endpoints;
                program = (lib.attrNames programs);
              };
            in
            lib.concatLines [
              "DATE=$(date --iso-8601=seconds)"
              "export DATE"
              "mkdir -p outputs/\"$DATE\""
              ''
                # shellcheck disable=SC2016
                hyperfine \
                  --time-unit second \
                  --export-csv outputs/"$DATE"/${query}.csv \
                  --export-orgmode outputs/"$DATE"/${query}.org \
                  --runs ${toString runs} \
                  --output=pipe \
                  --ignore-failure \
                  --shell "systemd-run --user --pipe --same-dir --wait --collect --setenv=PATH --setenv=DATE --setenv=HYPERFINE_ITERATION --property MemoryMax=${maxMem} --property MemorySwapMax=0 --property MemoryZSwapMax=0 timeout ${timeout} bash --norc" \''
              (lib.concatMapStringsSep ""
                (
                  {
                    program,
                    name,
                    query,
                    ...
                  }:
                  ''
                    --prepare 'mkdir -p outputs/"$DATE"/${name}' \
                    --command-name "${name}" \
                    '${
                      command {
                        inherit
                          program
                          query
                          name
                          ;
                        output = "outputs/\"$DATE\"/${name}";
                      }
                    }' \
                  ''
                )
                (
                  [
                    {
                      name = "baseline-${query}";
                      program = "nmo-SN-EC-MT";
                      query = "queries/${query}/baseline.rls";
                    }
                  ]
                  ++ variants
                )
              )
              ""
            ];
        in
        {
          packages.default = pkgs.writeShellApplication {
            name = "run-sparqling-evaluation";

            inherit runtimeInputs;

            text = lib.concatLines [
              (lib.concatMapStringsSep "\n" (query: ''
                echo running evaluation for ${query}
                ${mkQuery query}
              '') queries)
              ''
                echo "all done!"
              ''
            ];
          };

          devShells.default = pkgs.mkShell {
            name = "sparqling-datalog-eval";
            nativeBuildInputs = runtimeInputs;
          };
        };
    };
}
