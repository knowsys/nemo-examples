#!/usr/bin/python
# -*- coding: utf-8 -*-

# Script that turns the contents of a CSV file into logic programming facts
# that are compatible with other logic programming tools. The mapping is a simple
# one-way sanitisation that replaces problematic symbols in constants with _.
# It is not meant to be reversible, but it should be bijective on real-world
# databases.

import csv
import sys
import gzip
import os

def transformConstant(csvString):
    if csvString == "not":
        csvString = "constant_not"

    outstring = csvString.lstrip('<').rstrip('>').replace(',','_').replace('#','_').replace(':','_').replace('.','_').replace('/','_').replace('-','_').replace('@','_')
    if outstring[0].isdigit():
        outstring = "c" + outstring
    if outstring[0].isupper() :
        outstring = outstring[0].lower() + outstring[1:]

    if outstring == "_":
        return "constant_underscore"

    return outstring

def processCsvFile(csvfile,predname):
    csvreader = csv.reader(csvfile, delimiter=',')
    for row in csvreader:
        print(predname + "(", end='')
        first = True
        for value in row:
            if first:
                first = False
            else:
                 print(',', end='')
            print(transformConstant(value), end='')
        print(') .')

if len(sys.argv) != 2:
    print("Usage: csv2facts.py <directory>")
    sys.exit()

directory = sys.argv[1]

for filename in os.listdir(directory):
    full_path = os.path.join(directory, filename)
    
    if os.path.isfile(full_path):
        if filename.endswith('.gz'):
            filename = filename[:-3] 

        predname = os.path.splitext(filename)[0]
        # predname = "nf_" + predname

        with gzip.open(full_path, mode="rt") as csvfile:
            try:   
                processCsvFile(csvfile,predname)
            except OSError:
                with open(full_path, 'r') as csvfile:
                    processCsvFile(csvfile,predname)


