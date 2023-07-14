This example shows how a simple constant folding and propagation analysis can be evaluated with Nemo. 
The input data for this analysis is created with DOOP for the small expamle "Example_CF.java" including libraries. 
Other examples processed by DOOP are also possible to analyse, however the input file "AssignLocal.facts" has to be reduced as explained in the comments.


 
The analysis handles the following three cases:
 - copying of constants (constant propagation) 
 - constant folding of unary expressions (negation)
 - constant folding of binary expressions (+,-,*,/)




