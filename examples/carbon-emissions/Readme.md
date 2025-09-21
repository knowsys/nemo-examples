# Aggregating CO2 emissions by country

This example integrates CO2 emission data from [Carbon Majors](https://carbonmajors.org/) with
company information from [Wikdiata](https://wikidata.org/). In the example, we associate companies
with countries and aggregate total CO2 (equivalent) emissions per country.

Key features shown:
- CSV input loading from online sources
- SPARQL query inputs from Wikidata
- Ad hoc data integration by matching attributes across sources, using fall-back rules

## References and acknowledgements

Data file `emissions_low_granularity.csv` courtesy of Carbon Majors (see [Downloads](https://carbonmajors.org/Downloads)).

- Source URL: (https://carbonmajors.org/evoke/391/get_cm_file?type=Basic&file=emissions_low_granularity.csv), copied Sept 2025.

The original source URL can be used in the example, but only in the command-line client. In the Nemo Web app, the data cannot
be loaded due to configuration problems on the site (misconfigured its CORE headers, blocked by browser security policy), and
this is the only reason for keeping a copy here.
