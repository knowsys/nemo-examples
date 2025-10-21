# Empty classes in Wikidata

This example looks for Wikidata classes that cannot have instances if
we want to respect the stated disjointness of some classes. Disjointness
means that two classes must not have common instances and is stated in
disjoint-union statements (P2738). A class that is subclass to two disjoint
classes must be empty.

The example shows:
- how to import Wikidata content from SPARQL,
- how to find all subproperties of a property, with their direct (wdt:) IRIs,
- how to find maximal classes in a class hierarchy (while being prepared for cycles in that hierarchy).

Note: There might not (currently) be any cycles in the class hierarchy, but
it is still good practice to consider this case in code that is meant to detect
modelling errors.
