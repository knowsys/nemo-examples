# Declarative Debugging for Datalog with Aggregation

This is the supplementary material for the TGD2026 submission titled "Declarative Debugging for Datalog with Aggregation".

It contains:
 * The implementation of proof query answering in Nemo (`nemo`)
 * All rule sets used in the experiments and instructions on how to obtain the input data (`rules`)
 * All queries used in the experiments (`queries`)
 * All individual runtime measurements (`results`)
 * Scripts for generating queries (`setup.py`), performing the experiments (`experiments.py`), and summarizing the results (`evaluate.py`)
 * A `Dockerfile` to build the tool (using the code from `nemo` and `vis-code`). 
 * The code for the proof exploration tool _nemo-ev_, nemo-web, and vs-code extension nemo-vsx (`vis-code`). 
 * A video demonstrating the use of our user interface (`vis-demo.mp4`).
 

# Building Nemo

Build nemo by running

```sh
cd nemo
rustup default nightly
cargo build -r
```

# Reproducing the Performance Experiments

## Obtaining Rule Sets and Data

All rule sets used in the experiments are provided in `rules`. Instructions on how to obtain the data is given in the `data`-directory of the respective rule set.

## Query Preparation

To automatically generate proof queries run 

```sh
cd scripts
python setup.py
```

The queries used in our experiments are given in the directory `queries`. For each set of queries, the file `data.txt` in the respective directory provides additional information about the generated queries, namely, the amount of traces associated with each query shape, the amount of node in the query, and the depth of the query.

## Running the Experiments

To run the experiments, execute: 
```sh
cd scripts
python experiments.py
```
This will produce `.results`-files with the runtimes for each query. Our runtimes are available in `results`.

## Running the Baseline 

To run the experiments for the baseline implementation, execute: 
```sh
cd scripts
python baseline.py
```

This will produce `.baseline`-files with the runtimes for each query. Our runtimes are available in `results`. 

## Summarizing the Runtime Measurements

To summarize the results from the experiments (obtaining the data for Table 2 in the paper) use

```sh
cd scripts
python evaluate.py
```

# Running the Proof Exploration Tool Locally

While the `nemo` and `vis-code` directories contain all relevant code to build everything yourself, 
we recommend to use Docker to build everything automatically and play around with the visualization. 
The code is mainly included for reviwers familiar with web development who want to dive into implementation details.

## Running the Docker Image 

Depending on your Docker setup, **you may need to run the following commands with root privileges**.

```sh 
docker build . -t nemo-ev --progress=plain 
docker run --name=nemo-ev -dp 8000:80 nemo-ev
```
**the `build` command can take several minutes to complete** 

You can now access the modified nemo-web at `http://localhost:8000/nemo/`.
**To open the example from the paper, you can use the following url, containing the example as a base64 encoded string:**

```
http://localhost:8000/nemo/#cGFyKGEsIGIpLiBwYXIoYiwgYykuIHNwKGMsIGQpLgpwYXIoZSwgZCkuIHBhcihmLCBkKS4KCmtpbig/eCwgP3kpIDotIHBhcig/eCwgP3kpLgpraW4oP3gsID95KSA6LSBwYXIoP3gsID96KSwKICAgIHNwKD96LCA/ejIpLCBwYXIoP3ksID96MikuCmtpbig/eCwgP3kpIDotIGtpbig/eSwgP3gpLgpwYXJDb3VudCgjY291bnQoP3kpLCA/eCkgOi0gcGFyKD95LCA/eCkuCm1DKD94KSA6LSBwYXJDb3VudCg/YywgP3gpLCAyIDw9ID9jLg==
```

You can refer to the included `vis-demo.mp4` video for a feature walkthrough and ideas how to play around with the example. Have fun!
