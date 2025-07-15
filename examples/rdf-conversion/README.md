# RDF format conversion

This demonstrates the use of global parameters. Run this as follows to convert `input.nt` from NTriples to Turtle:
```
nix run github:knowsys/nemo -- rdf-conversion.rls --param input=\"input.nt\" --param output=\"output.ttl\"
```
