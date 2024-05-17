advisor(X, Y) :- src_advisor(X, Y) .
assistantprofessor(X) :- src_assistantprofessor(X) .
associateprofessor(X) :- src_associateprofessor(X) .
course(X) :- src_course(X) .
department(X) :- src_department(X) .
doctoraldegreefrom(X, Y) :- src_doctoraldegreefrom(X, Y) .
emailaddress(X, Y) :- src_emailaddress(X, Y) .
fullprofessor(X) :- src_fullprofessor(X) .
graduatecourse(X) :- src_graduatecourse(X) .
graduatestudent(X) :- src_graduatestudent(X) .
headof(X, Y) :- src_headof(X, Y) .
lecturer(X) :- src_lecturer(X) .
mastersdegreefrom(X, Y) :- src_mastersdegreefrom(X, Y) .
memberof(X, Y) :- src_memberof(X, Y) .
name(X, Y) :- src_name(X, Y) .
publication(X) :- src_publication(X) .
publicationauthor(X, Y) :- src_publicationauthor(X, Y) .
researchassistant(X) :- src_researchassistant(X) .
researchgroup(X) :- src_researchgroup(X) .
researchinterest(X, Y) :- src_researchinterest(X, Y) .
suborganizationof(X, Y) :- src_suborganizationof(X, Y) .
takescourse(X, Y) :- src_takescourse(X, Y) .
teacherof(X, Y) :- src_teacherof(X, Y) .
teachingassistant(X) :- src_teachingassistant(X) .
teachingassistantof(X, Y) :- src_teachingassistantof(X, Y) .
telephone(X, Y) :- src_telephone(X, Y) .
undergraduatedegreefrom(X, Y) :- src_undergraduatedegreefrom(X, Y) .
undergraduatestudent(X) :- src_undergraduatestudent(X) .
university(X) :- src_university(X) .
worksfor(X, Y) :- src_worksfor(X, Y) .
employee(X) :- administrativestaff(X) .
person(X) :- advisor(X, _X1) .
professor(X1) :- advisor(_X, X1) .
organization(X) :- affiliatedorganizationof(X, _X1) .
organization(X1) :- affiliatedorganizationof(_X, X1) .
organization(X) :- affiliateof(X, _X1) .
person(X1) :- affiliateof(_X, X1) .
person(X) :- age(X, _X1) .
publication(X) :- article(X) .
professor(X) :- assistantprofessor(X) .
professor(X) :- associateprofessor(X) .
publication(X) :- book(X) .
headof(X, headof_42_0_1(X)), department(department_42_1_0(X)) :- chair(X) .
person(X) :- chair(X) .
professor(X) :- chair(X) .
administrativestaff(X) :- clericalstaff(X) .
organization(X) :- college(X) .
article(X) :- conferencepaper(X) .
work(X) :- course(X) .
headof(X, headof_49_0_1(X)), college(college_49_1_0(X)) :- dean(X) .
professor(X) :- dean(X) .
person(X) :- degreefrom(X, _X1) .
university(X1) :- degreefrom(_X, X1) .
hasalumnus(X, Y) :- degreefrom(Y, X) .
organization(X) :- department(X) .
headof(X, headof_55_0_1(X)), program(program_55_1_0(X)) :- director(X) .
person(X) :- director(X) .
person(X) :- doctoraldegreefrom(X, _X1) .
university(X1) :- doctoraldegreefrom(_X, X1) .
degreefrom(X, Y) :- doctoraldegreefrom(X, Y) .
person(X) :- emailaddress(X, _X1) .
person(X) :- employee(X) .
worksfor(X, worksfor_62_0_1(X)), organization(organization_62_1_0(X)) :- employee(X) .
employee(X) :- faculty(X) .
professor(X) :- fullprofessor(X) .
course(X) :- graduatecourse(X) .
person(X) :- graduatestudent(X) .
takescourse(X, takescourse_67_0_1(X)), graduatecourse(graduatecourse_67_1_0(X)) :- graduatestudent(X) .
person(X1) :- hasalumnus(_X, X1) .
university(X) :- hasalumnus(X, _X1) .
degreefrom(X, Y) :- hasalumnus(Y, X) .
dean(X) :- headof(X, X1), college(X1) .
worksfor(X, Y) :- headof(X, Y) .
organization(X) :- institute(X) .
article(X) :- journalarticle(X) .
faculty(X) :- lecturer(X) .
course(X1) :- listedcourse(_X, X1) .
schedule(X) :- listedcourse(X, _X1) .
publication(X) :- manual(X) .
person(X) :- mastersdegreefrom(X, _X1) .
university(X1) :- mastersdegreefrom(_X, X1) .
degreefrom(X, Y) :- mastersdegreefrom(X, Y) .
organization(X) :- member(X, _X1) .
person(X1) :- member(_X, X1) .
memberof(X, Y) :- member(Y, X) .
member(X, Y) :- memberof(Y, X) .
organization(X) :- orgpublication(X, _X1) .
publication(X1) :- orgpublication(_X, X1) .
chair(X) :- person(X), headof(X, X1), department(X1) .
director(X) :- person(X), headof(X, X1), program(X1) .
student(X) :- person(X), takescourse(X, X1), course(X1) .
teachingassistant(X) :- person(X), teachingassistantof(X, X1), course(X1) .
employee(X) :- person(X), worksfor(X, X1), organization(X1) .
faculty(X) :- postdoc(X) .
faculty(X) :- professor(X) .
organization(X) :- program(X) .
person(X1) :- publicationauthor(_X, X1) .
publication(X) :- publicationauthor(X, _X1) .
publication(X) :- publicationdate(X, _X1) .
publication(X) :- publicationresearch(X, _X1) .
research(X1) :- publicationresearch(_X, X1) .
work(X) :- research(X) .
person(X) :- researchassistant(X) .
worksfor(X, worksfor_103_0_1(X)), researchgroup(researchgroup_103_1_0(X)) :- researchassistant(X) .
organization(X) :- researchgroup(X) .
research(X1) :- researchproject(_X, X1) .
researchgroup(X) :- researchproject(X, _X1) .
publication(X) :- software(X) .
publication(X1) :- softwaredocumentation(_X, X1) .
software(X) :- softwaredocumentation(X, _X1) .
software(X) :- softwareversion(X, _X1) .
publication(X) :- specification(X) .
person(X) :- student(X) .
takescourse(X, takescourse_113_0_1(X)), course(course_113_1_0(X)) :- student(X) .
organization(X) :- suborganizationof(X, _X1) .
organization(X1) :- suborganizationof(_X, X1) .
suborganizationof(X, Z) :- suborganizationof(X, Y), suborganizationof(Y, Z) .
administrativestaff(X) :- systemsstaff(X) .
course(X1) :- teacherof(_X, X1) .
faculty(X) :- teacherof(X, _X1) .
person(X) :- teachingassistant(X) .
teachingassistantof(X, teachingassistantof_121_0_1(X)), course(course_121_1_0(X)) :- teachingassistant(X) .
course(X1) :- teachingassistantof(_X, X1) .
teachingassistant(X) :- teachingassistantof(X, _X1) .
article(X) :- technicalreport(X) .
person(X) :- telephone(X, _X1) .
professor(X) :- tenured(X, _X1) .
person(X) :- title(X, _X1) .
person(X) :- undergraduatedegreefrom(X, _X1) .
university(X1) :- undergraduatedegreefrom(_X, X1) .
degreefrom(X, Y) :- undergraduatedegreefrom(X, Y) .
student(X) :- undergraduatestudent(X) .
organization(X) :- university(X) .
publication(X) :- unofficialpublication(X) .
professor(X) :- visitingprofessor(X) .
memberof(X, Y) :- worksfor(X, Y) .