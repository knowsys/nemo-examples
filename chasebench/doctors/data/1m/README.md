# Doctors 1m data

Obtain the data from the [chasebench repository](https://github.com/dbunibas/chasebench/tree/master/scenarios/doctors/data/1m).
* Copy each `.csv` file into this directory
* For every file, compress it with `gzip`:
```bash
for f in *.csv; do gzip $f; done
```
