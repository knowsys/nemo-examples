# Experiments for KR 2024

This document contains all information needed to reproduce the experiments of the paper "Nemo: Your Friendly and Versatile Rule Reasoning Toolkit". The individual times that were measured for each reasoner can be found in `runtimes.ods`.

## Rule Sets

All rule sets have been automatically translated from the internal representation of Nemo into the file formats of the other reasoners. The resulting rule files are uploaded in `programs/<benchmark>/<reasoner>`.

## Data

To run the benchmarks, 
the input data has to be placed inside of `programs/data`.

### Benchmarking the Chase

The datasets for the scenarios "Benchmarking the Chase" or instructions on how to obtain them can be found in: https://github.com/knowsys/nemo-examples/tree/main/chasebench

### EL-Reasoning

The preproessed Galen ontology can be found here: https://github.com/knowsys/nemo-examples/tree/main/examples/owl-el/from-preprocessed-csv/data

Note that SNOMED is not freely available.

### Gringo

For Gringo, the input files have to be translated into a series of facts, which is appended to the rule file. For this, we created a simple python script:

```sh
cd programs/<benchmark>/gringo
cp program.lp run.lp
python3 ../../../data_gringo.py ../data >> run.lp
```

## Reasoners

### Nemo

Build instructions for Nemo are available on its [github page](https://github.com/knowsys/nemo?tab=readme-ov-file#installation). To run a benchmark, execute the following commands:

```sh
cd programs/<benchmark>/nemo
nmo run.rls
```

### Gringo 

Build instructions for Gringo are available on its [github page](https://github.com/potassco/clingo/blob/master/INSTALL.md).
To run a benchmark, execute the following commands:

```sh
cd programs/<benchmark>/gringo
gringo run.lp > /dev/null
```

### Souffle

Build instructins for Souffle can be found [here](https://souffle-lang.github.io/build).
To run Souffle in interpreted mode, use the following commands:

```sh
cd programs/<benchmark>/souffle
souffle run.dl
```

To use it in compiled mode, run:

```sh
cd programs/<benchmark>/souffle
souffle run.dl --dl-program=compiled
./compiled
```

### VLog

Build instructions for VLog are available on its [github page](https://github.com/knowsys/nemo?tab=readme-ov-file#installation). To run a benchmark, execute the following commands:

```sh
cd programs/<benchmark>/vlog
vlog mat --edb edb.conf --rules run.dlog -l error
```