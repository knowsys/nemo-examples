# Find old trees in Dresden

This example finds particularly old trees in a CSV-based dataset of
all municipal trees in the city of Dresden.

Wikidata is used to find specific species and varieties of trees
(such as different kinds of lime/linden tree). Parameters are used
to set what kinds of tree we are looking for, and how old it should be.

The example shows:
- how to load (typed) data from (compressed) CSV files,
- how to fetch data from a SPARQL query service,
- how to perform a recursive reachability query,
- how to use parameters to customise a Nemo query, 
- how to use datatype built-ins.

The program can be modified to use a different species or genus of plant, and by
changing the required age.
