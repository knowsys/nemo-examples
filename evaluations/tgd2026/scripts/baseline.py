import csv
import os
import subprocess

NEMO_PATH = os.path.abspath("../nemo/target/release/nmo")
QUERIES_DIR = os.path.abspath("../queries")
CONFIG_FILE = "config.csv"
TIMEOUT = 15 * 60 # seconds

with open(CONFIG_FILE, newline='') as csvfile:
    reader = csv.reader(csvfile)
    for name, ruleset_dir in reader:
        ruleset_dir = os.path.abspath(ruleset_dir)

        rls_files = [f for f in os.listdir(ruleset_dir) if f.endswith(".rls")]
        if len(rls_files) != 1:
            raise ValueError(f"Expected one .rls file in {ruleset_dir}, found {len(rls_files)}")
        rls_path = os.path.join(ruleset_dir, rls_files[0])
        queries_path = os.path.join(QUERIES_DIR, name)

        result_file = f"{name}.baseline"

        if os.path.exists(result_file):
            continue

        try: 
            with open(result_file, "w") as outfile:
                subprocess.run(
                    [NEMO_PATH, rls_files[0], "--x-baseline", queries_path],
                    cwd=ruleset_dir,
                    stdout=outfile,
                    check=True,
                    timeout=TIMEOUT
                )
        except subprocess.TimeoutExpired:
            continue
