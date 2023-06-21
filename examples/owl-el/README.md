# OWL EL Reasoning

This example shows how Nemo can be used to reason in the ontology language OWL EL.
To achieve this, we use a completely unoptimised, literal encoding of the EL
reasoning calculus published in Fig. 3 of

   Kazakov, Krötzsch, Simančík: **[The Incredible ELK](https://doi.org/10.1007/s10817-013-9296-3)**. J Autom. Reasoning, 2014

in Datalog rules.

The calculus requires a normalised version of the EL ontology as input data. We provide two examples:
- [`from-preprocessed-csv`](https://github.com/knowsys/nemo-examples/tree/main/examples/owl-el/from-preprocessed-csv) shows only the OWL EL calculus, working on the preprocessed data encoded in several CSV files.
- [`from-owl-rdf`](https://github.com/knowsys/nemo-examples/tree/main/examples/owl-el/from-owl-rdf) uses rules (with negation and existential quantifiers) to extract the preprocessed data from an OWL file in OWL/RDF format, which can then directly be used in reasoning

The latter therefore implements a complete OWL EL reasoner (file parsing, ontology preprocessing, reasoning, and output of class hierarchy) in Nemo.

The example data provided here was obtained by normalising an OWL EL version of Galen, but can be swapped for, e.g., a normalised version of SNOMED CT.

For details on, e.g., the normalisation procedure, refer to the
materials provided for the [KR2020
Tutorial](https://iccl.inf.tu-dresden.de/web/Rules_KR_Tutorial_2020).
