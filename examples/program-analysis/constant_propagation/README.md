This example shows how a simple constant folding and propagation analysis can be evaluated with Nemo. 
The input data for this analysis is created with [DOOP](https://bitbucket.org/yanniss/doop/src/master/) for the small example "Example_CF.java" including libraries. 
Other examples processed by [DOOP](https://bitbucket.org/yanniss/doop/src/master/) are also possible to analyse, however the input file "AssignLocal.facts" should be 
stripped of lines that contain the string "phi-assign" as explained in the comments.


 
The analysis handles the following three cases:
 - copying of constants (constant propagation) 
 - constant folding of unary expressions (negation)
 - constant folding of binary expressions (+,-,*,/)




