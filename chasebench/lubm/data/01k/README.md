# LUBM-01k data

Obtain the data from the [chasebench repository](https://github.com/dbunibas/chasebench/tree/master/scenarios/LUBM/data/01k):
* Copy all `data.zip.00?` files to this directory
* Combine them into a ZIP archive:
```bash
cat data.zip.00? > data.zip
```
* Uncompress it:
```bash
unzip data.zip
```
* For every file, compress it with `gzip`:
```bash
for f in *.csv; do gzip $f; done
```
