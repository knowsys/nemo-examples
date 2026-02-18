# SPARQLing Datalog for Rule-Based Reasoning over Large Knowledge Graphs

This repository contains the supplementary material for the paper "SPARQLing Datalog for Rule-Based Reasoning over Large Knowledge Graphs".

## Queries 

All programs that were used in the evaluation (Section 6) are available in the `queries` directory under the names used in Table 1.

Each query is implemented in Nemo (`nemo-*`) and in rulewerk (`rulewerk-*`) syntax using the WikiData Query Service as endpoints. For benchmarks that were adapted from previously existing examples, we also include the original rule file (`baseline.rls`), which we used to verify the correctness of the translation and implementation. 

## Running the Experiments

To run the experiments, run the following [nix](https://nix.dev/) command:

```sh
nix run
```

To install nix, follow this guide: https://nix.dev/install-nix#install-nix

## Results

We provide the raw time measurements for our experiments in `results.ods`. All values are given in seconds. The file contains one table for each rule set. Each table includes the runtimes for each of the tested systems as well as the individual runtimes for the ablation study. 

We compare the following systems:
* nmo-0.8: Version 0.8 of Nemo
* rulewerk: Version 0.9 of [Rulewerk](https://github.com/knowsys/rulewerk/)
* ours: The current implementation of Nemo with all optimizations enabled

For the ablation study, we consider all possible feature combinations, abbreviated as follows:
* (SN) semi-naive SPARQL evaluation for any binding pattern
* (EC)
multiple binding atoms based on extended components (Algorithm 1) vs. (noEC) single binding pattern that joins all local conditions
* (MT) triple patterns merged
into queries based on extended components vs. (noMT) triple patterns used as
individual queries.