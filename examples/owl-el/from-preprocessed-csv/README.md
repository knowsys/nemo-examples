# OWL EL Reasoning on preprocessed ontologies

This example shows how Nemo can be used to implement the core reasoning algorithm for the ontology language OWL EL,
based on preprocessed input files (in CSV format) that encode the ontology in a relational format.

The rules file `el-calc.rls` contains a small number of plain Datalog rules that do the work.
The ontology is read from the `data` directory, where a preprocessed version of the Galen EL ontology is found.
Other ontologies can also be used: suitable preprocessed files can also be created with Nemo, using the 
[logic program for EL reasoning from OWL/RDF](https://github.com/knowsys/nemo-examples/tree/main/examples/owl-el/from-owl-rdf).





