# Reasoning Examples

We provide the following examples:
* `constant-folding`: program analysis that detects constant propagation and constant folding with unary and binary expressions
  *(uses: TSV input from DOOP, arithmetic expressions `+`,`-`,`/`,`*`)*
* `datalogMtlSensor`: simulates DatalogMTL reasoning to compute alerts for a temperature sensor
  *(uses: arithmetic expressions, arithmetic comparisons, `MIN`/`MAX` aggregates)*
* `datalogMtlWeather`: simulates DatalogMTL reasoning to compute alerts based on weather observations
  *(uses: arithmetic expressions, arithmetic comparisons, `MIN`/`MAX` aggregates)*
* `lime-trees`: finding old lime trees in Dresden by integrating two different data sources and numeric comparisons
   *(uses: CSV input with numerical data, numerical comparisons)*
* `owl-el`: classification of OWL EL ontologies, possibly directly from the original OWL/RDF file
  *(uses: negation, existential rules, RDF input, CSV input)*
* `rdf-conversion`: converts between RDF formats
  *(uses: RDF input, RDF output, global parameters)*
* `wikidata-awards`: retrieves awards of Douglas Adams from Wikidata
  *(uses: SPARQL queries, language strings)*
* `wikidata-yago-like-inverse-property-cleanup`: identifies inverse properties that have the most objects per subject on average
  *(uses: NTriples input, string comparisons, aggregates, arithmetic expressions, stratified negation)*
* `wind-turbines`: checks whether a proposed wind turbine project is far enough away from houses and endangered species
  *(uses: CSV input with numerical and string data, arithmetic expressions, arithmetic comparisons, arithmetic functions, stratified negation)*
