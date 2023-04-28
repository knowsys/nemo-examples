# Ontology-256 data

Obtain the data from the [chasebench repository](https://github.com/dbunibas/chasebench/tree/master/scenarios/Ontology-256/data):
* Copy `data.zip.001`, `data.zip.002`, `data.zip.003` to this directory
* Combine and uncompress it:
```bash
cat data.zip* > data.zip
unzip data.zip
```
* For every file, compress it with `gzip`:
```bash
for f in *.csv; do gzip $f; done
```
