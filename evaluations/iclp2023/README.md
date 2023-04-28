# Experiments for ICLP 2023

This is a detailled descripton of the experimental setup used in our paper "Nemo: First Glimpse of a New Rule Engine".

## Data Sets
We performed the experiments on the following data sets:
- From "Benchmarking the Chase":
  - `chasebench/deep`
  - `chasebench/doctors`
  - `chasebench/lubm`
  - `chasebench/Ontology-256`
- Based on the EL reasoning calculus:
  - `examples/owl-el`
  - Snomed cannot be made publicly available

## Nemo

For the experiments, we used [Version 0.1.0 of Nemo](https://github.com/knowsys/nemo/releases/tag/v0.1.0):

```bash
git clone https://github.com/knowsys/nemo
git checkout v0.1.0
```

This version requires the nightly build of Rust. Hence, to compile use
```bash
rustup toolchain install nightly
cargo +nightly build -r
```

To run an experiment, navigate into the directory named after the experiment which contains the `.rls` file and provide it as an argument to our tool `nmo`. Running the experiment "Doctors 1M" for example would require the following commands:

```bash
cd chasebench/doctors
nemo/targets/release/nmo run-doctors-1m.rls
```

## VLog
The simplest way to use [VLog](https://github.com/karmaresearch/vlog) is through [Rulewerk](https://github.com/knowsys/rulewerk). We used the [Version 0.9.0](https://github.com/knowsys/rulewerk/releases/tag/v0.9.0). 

To build the standalone client, run `mvn install -Pclient`. This generates `standalone-rulewerk-client-[VERSION].jar` in `rulewerk-client/target`.

Performing an experiment requires you to execute the standalone client, load the `.rls` file with the `@load` command, and start the reasoning process with `@reason`. 

Using "Doctors 1M" as an example, the following commands are required:
```bash
java -jar rulewerk-client/target/standalone-rulewerk-client-0.10.0-SNAPSHOT.jar 

rulewerk> @load "run-doctors-1m.rls"
rulewerk> @reason
```

## Results
Each experiment has been repeated three times. The reported run times are the average time and includes the loading of the input data as well as the reasoning itself. All the individual measurements can be found in `results.xlsx`.