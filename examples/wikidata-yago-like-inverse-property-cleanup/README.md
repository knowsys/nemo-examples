# Wikidata - Yago-Inspired Inverse Property Cleanup 

For inverse properties in Wikidata, 
we aim to mark the one that has less objects per subject on average.

To execute the example, you have to obtain a truthy Wikidata dump.
We include our `results` in the repo as well as the `cli-output.txt` for you to check without running this yourself (as it requires hundreds of gigabytes of working memory).
We have to drop the output for the table `objCountPerPredAndSource` , however, since GitHub does not allow files with size >100MB.

IF you want to run it, you can proceed as follows:


```
wget https://dumps.wikimedia.org/wikidatawiki/entities/latest-truthy.nt.gz
mv latest-truthy.nt.gz wikidata.nt.gz
nix run github:knowsys/nemo -- -e idb -g --report all --log info yagoExample.rls >cli-output.txt 2>&1
```

Of course, `nix run github:knowsys/nemo --` can be replaced by a path to a compiled nmo binary.

