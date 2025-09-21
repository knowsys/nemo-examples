# Aggregating CO2 emissions by country

This example integrates CO2 emission data from [Carbon Majors](https://carbonmajors.org/) with
company information from [Wikdiata](https://wikidata.org/). In the example, we associate companies
with countries and aggregate total CO2 (equivalent) emissions per country.

Key features shown:
- CSV input loading from online sources
- SPARQL query inputs from Wikidata
- Ad hoc data integration by matching attributes across sources, using fall-back rules
