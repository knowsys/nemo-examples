inf_init(C) :- nf_isMainClass(C) .
inf_init(C) :- inf_ex(E, R, C) .
inf_subClassOf(C, C) :- inf_init(C) .
inf_subClassOf(C, http___www_w3_org_2002_07_owl_Thing) :- nf_isMainClass(C) .
inf_subClassOf(C, D1) :- inf_subClassOf(C, Y), nf_conj(Y, D1, D2) .
inf_subClassOf(C, D2) :- inf_subClassOf(C, Y), nf_conj(Y, D1, D2) .
inf_subClassOf(C, I) :- inf_subClassOf(C, D1), inf_subClassOf(C, D2), nf_conj(I, D1, D2), nf_isSubClass(I) .
inf_ex(E, R, C) :- inf_subClassOf(E, Y), nf_exists(Y, R, C) .
inf_subClassOf(E, Y) :- inf_ex(E, R, C), inf_subClassOf(C, D), nf_subProp(R, S), nf_exists(Y, S, D), nf_isSubClass(Y) .
inf_ex(E, S, D) :- inf_ex(E, R1, C), inf_ex(C, R2, D), nf_subProp(R1, S1), nf_subProp(R2, S2), nf_subPropChain(S1, S2, S) .
inf_subClassOf(C, E) :- inf_subClassOf(C, D), nf_subClassOf(D, E) .
inf_subClassOf(E, http___www_w3_org_2002_07_owl_Nothing) :- inf_ex(E, R, C), inf_subClassOf(C, http___www_w3_org_2002_07_owl_Nothing) .

mainSubClassOf(A, B) :- inf_subClassOf(A, B), nf_isMainClass(A), nf_isMainClass(B) .
