This example shows how a simple constant folding and propagation analysis can be evaluated with Nemo. 
The input data for this analysis is created with [DOOP](https://bitbucket.org/yanniss/doop/src/master/) for the small example "Example\_CF.java" including libraries. 
Other examples processed by [DOOP](https://bitbucket.org/yanniss/doop/src/master/) are also possible to analyse, however the input file "AssignLocal.facts" should be 
stripped of lines that contain the string "phi-assign" as explained in the comments.


 
The analysis handles the following three cases:
 * copying of constants (constant propagation) 
 * constant folding of unary expressions (negation)
 * constant folding of binary expressions (\+,\-,\*,\/)


To run this analysis with custom DOOP input you have to:
1. install [DOOP](https://bitbucket.org/yanniss/doop/src/master/)
2. navigate to doop/master  
`cd /path/to/doop/master`  
`mkdir my_example`   
3. write an example program "Example_CF.java" and place it in the directory *my_example/*
4. create a .jar file from "Example_CF.java"  
`./bin/mkjar my_example/Example_CF.java 1.8 my_example/Example_CF.jar`
4. run doop  
`./doop -a context-insensitive  -i my_example/Example_CF.jar -id Example --discover-main-methods --facts-only`
5. navigate back to nemo-examples/examples/constant-folding  
`cd /path/to/nemo-examples/examples/constant-folding`
6. copy the necessary DOOP input files into the data/ directory  
`for file in AssignLocal.facts AssignUnop.facts AssignBinop.facts AssignNumConstant.facts OperatorAt.facts AssignOperFrom.facts AssignOperFromConstant.facts; do cp /path/to/doop/master/out/Example/database/$file data/; done`
7. modify the file AssignLocal.facts  
`grep -v -E "phi-assign" data/AssignLocal.facts > data/AssignLocalNoPhi.facts`
8. configure the input directory in constant-folding.rls  
`sed -i 's/.tsv.gz/.facts/g' constant-folding.rls`
9. run nemo  
`/path/to/nemo/nemo/target/release/nmo constant-folding.rls -s`



Please note that you have to change the prefix `/path/to/` depending on the location of *doop* and *nemo-examples*.

