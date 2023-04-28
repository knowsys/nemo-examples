# Doctors 10k data

Obtain the data from the [chasebench repository](https://github.com/dbunibas/chasebench/tree/master/scenarios/doctors/data/10k).
* Copy each `.csv` file into this directory
* For every file, compress it with `gzip`:
```bash
for f in *.csv; do gzip $f; done
```
