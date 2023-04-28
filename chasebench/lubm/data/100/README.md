# LUBM-100 data

Obtain the data from the [chasebench repository](https://github.com/dbunibas/chasebench/tree/master/scenarios/LUBM/data/100):
* Copy `data.zip.001` to this directory
* Uncompress it:
```bash
unzip data.zip.001
```
* For every file, compress it with `gzip`:
```bash
for f in *.csv; do gzip $f; done
```
