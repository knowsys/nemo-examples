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

For the experiments, we used [Version 0.1.0 of Nemo](https://github.com/knowsys/nemo/releases/tag/v0.1.0).

To run an experiment, navigate into the directory named after the experiment which contains the `.rls` file and provide it as an argument to our tool `nmo`. Running the experiment "Doctors 1M" for example would require the following commands:

```bash
cd chasebench/doctors
nmo run-doctors-1m.rls
```

## VLog
The simplest way to use [VLog](https://github.com/karmaresearch/vlog) is through [Rulewerk](https://github.com/knowsys/rulewerk). We used the [Version 0.9.0](https://github.com/knowsys/rulewerk/releases/tag/v0.9.0). 

Performing an experiment requires you to execute the standalone client, load the `.rls` file with the `@load` command, and start the reasoning process with `@reason`. 

Using "Doctors 1M" as an example, the following commands are required:
```bash
java -jar rulewerk-client-0.9.0.jar

rulewerk> @load "run-doctors-1m.rls"
rulewerk> @reason
```

## Results
Each experiment has been repeated three times. The reported run times are the average time and includes the loading of the input data as well as the reasoning itself. All the individual measurements can be found in `results.xlsx`.