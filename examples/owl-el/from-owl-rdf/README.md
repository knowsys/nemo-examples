# OWL EL Reasoning from OWL/RDF

This example shows how Nemo can be used to reason in the ontology language OWL EL,
based on input that is the W3C standard encoding of an OWN ontology in RDF, using
the NTriples syntax. 

There are two rules files:
- `owl-rdf-complete-reasoning.rls`: Complete reasoner, producing a file of all inferred class subsumptions as output.
- `owl-rdf-preprocessing.rls`: Preprocessing only, producing seven CSV files with preprocesed ontology axioms as ouput.
  These output files can be used by the [Datalog program for EL reasoning on preprocessed CSVs](https://github.com/knowsys/nemo-examples/tree/main/examples/owl-el/from-preprocessed-csv).

The files can be used on other OWL EL ontologies by changing the `@source` declaration in the files.
However, this proof of concept is not meant to be a production-ready OWL tool, and it only supports selected features
(arguably those that are most important for OWL EL) and may produce incorrect results on ontologies that use other
language features.





