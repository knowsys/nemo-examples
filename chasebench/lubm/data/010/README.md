# LUBM-010 data

Obtain the data from the [chasebench repository](https://github.com/dbunibas/chasebench/tree/master/scenarios/LUBM/data/010):
* Copy all data files to this directory
* For every file, compress it with `gzip`:
```bash
for f in *.csv; do gzip $f; done
```
