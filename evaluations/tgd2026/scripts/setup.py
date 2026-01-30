import csv
import os
import shutil
import subprocess

NEMO_PATH = os.path.abspath("../nemo/target/release/nmo")
QUERIES_DIR = os.path.abspath("../queries")
CONFIG_FILE = "config.csv"

NUM_QUERIES = 1000

with open(CONFIG_FILE, newline='') as csvfile:
    reader = csv.reader(csvfile)

    for name, ruleset_dir in reader:
        ruleset_dir = os.path.abspath(ruleset_dir)

        # Get the rule set file
        rls_files = [f for f in os.listdir(ruleset_dir) if f.endswith(".rls")]
        if len(rls_files) != 1:
            raise ValueError(f"Expected one .rls file in {ruleset_dir}, found {len(rls_files)}")
        rls_path = os.path.join(ruleset_dir, rls_files[0])

        # Run nemo
        subprocess.run(
            [NEMO_PATH, rls_files[0], "--x-create-queries", str(NUM_QUERIES), "--log=info"],
            cwd=ruleset_dir,
            check=True,
        )

        # Move and rename output
        output_path = os.path.join(ruleset_dir, "output")
        if not os.path.exists(output_path):
            raise RuntimeError(f"No output folder created in {ruleset_dir}")
        destination = os.path.join(QUERIES_DIR, name)
        shutil.move(output_path, destination)