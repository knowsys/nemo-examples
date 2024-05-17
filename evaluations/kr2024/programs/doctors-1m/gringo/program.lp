prescription(ID, PATIENT, NPI, prescription_0_0_3(ID, NPI, PATIENT)) :- treatment(ID, PATIENT, _HOSPITAL, NPI, _CONF1), physician(NPI, _NAME, _SPEC, _CONF2) .
doctor(NPI, DOCTOR, SPEC, doctor_1_0_3(NPI, DOCTOR, SPEC), doctor_1_0_4(NPI, DOCTOR, SPEC)) :- medprescription(_ID, _PATIENT, NPI, DOCTOR, SPEC, _CONF) .
prescription(ID, PATIENT, NPI, prescription_2_0_3(ID, NPI, PATIENT)) :- medprescription(ID, PATIENT, NPI, _DOCTOR, _SPEC, _CONF) .
doctor(NPI, NAME, SPEC, HOSPITAL, doctor_3_0_4(NAME, NPI, HOSPITAL, SPEC)) :- treatment(_ID, _PATIENT, HOSPITAL, NPI, _CONF1), physician(NPI, NAME, SPEC, _CONF2) .
targethospital(DOCTOR, SPEC, HOSPITAL1, NPI1, HCONF1) :- hospital(DOCTOR, SPEC, HOSPITAL1, NPI1, HCONF1) .