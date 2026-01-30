import csv
import os
import statistics
import matplotlib.pyplot as plt
from pathlib import Path
import scipy.stats as stats
import numpy as np

def parse_times(row, start_idx):
    return [int(row[start_idx]), int(row[start_idx + 1]), int(row[start_idx + 2])]

files = [f for f in os.listdir() if f.endswith(".results")]
colors = plt.cm.get_cmap('tab10', len(files))
scatter_data = []

for idx, filename in enumerate(files):
    filename_baseline = str(Path(filename).with_suffix(".baseline"))

    with open(filename) as csvfile, open(filename_baseline) as csvfile_baseline:
        reader = csv.reader(csvfile)
        reader_baseline = csv.reader(csvfile_baseline)

        headers = next(reader)
    
        sizes, depths, answers = [], [], []
        prep_times, exec_times, ans_times = [], [], []
        under_1000ms_count = 0
        under_5000ms_count = 0
        total = 0

        for row in reader:
            query_size = int(row[1])
            query_depth = int(row[2])
            answer_size = int(row[3])
           
            exec_ = parse_times(row, 4)

            avg_exec = statistics.mean(exec_)

            sizes.append(query_size)
            depths.append(query_depth)
            answers.append(answer_size)
            exec_times.append(avg_exec)

            if all(t < 1000 for t in exec_):
                under_1000ms_count += 1
            if all(t < 5000 for t in exec_):
                under_5000ms_count += 1

            scatter_data.append((query_size, avg_exec, idx))
            total += 1

        sizes_sd = np.array(sizes).std(ddof=1)
        exec_times_sd = np.array(exec_times).std(ddof=1)
        answers_sd = np.array(answers).std(ddof=1)

        print(f"\nResults for {filename}")
        print(f"Average Query Size: {statistics.mean(sizes):.2f}, Max: {max(sizes)}, Min: {min(sizes)}")
        print(f"Query Size STD: {sizes_sd}")
        print(f"Average Query Depth: {statistics.mean(depths):.2f}, Max: {max(depths)}, Min: {min(depths)}")
        print(f"Average Answer Size: {statistics.mean(answers):.2f}, Max: {max(answers)}, Min: {min(answers)}")
        print(f"Answer Size STD: {answers_sd}")
        print(f"Average Execution Time: {statistics.mean(exec_times):.2f} ms, Max: {max(exec_times)} ms, Min: {min(exec_times)} ms")
        print(f"Exectution Time STD: {exec_times_sd}")
        print(f"Percentage of execution times under 1000ms: {(under_1000ms_count/total)*100:.2f}%")
        print(f"Percentage of execution times under 5000ms: {(under_5000ms_count/total)*100:.2f}%")
      
        headers = next(reader_baseline)

        if len(headers) <= 1:
            print(f"Baseline average tracing time: TIMEOUT")
            print(f"Baseline average matching time: TIMEOUT")
            
            continue

        baseline_row_first = next(reader_baseline)
        tracing_times = parse_times(baseline_row_first, 1)
        avg_tracing_time = statistics.mean(tracing_times)

        matching_times = []
      
        for row in reader_baseline:
            times = parse_times(row, 1)
            avg_time = statistics.mean(times)
            matching_times.append(avg_time)
      
        avg_matching_time = statistics.mean(matching_times)
      
        print(f"Baseline average tracing time: {avg_tracing_time:.2f}")
        print(f"Baseline average matching time: {avg_matching_time:.2f}")
        
# Plotting
plt.figure(figsize=(10, 6))
for i in range(len(files)):
    x = [q for q, _, idx in scatter_data if idx == i]
    y = [e for _, e, idx in scatter_data if idx == i]
    plt.scatter(x, y, label=files[i], color=colors(i))

plt.xlabel("Query Size")
plt.ylabel("Average Execution Time (ms)")
plt.title("Query Size vs Execution Time")
plt.legend()
plt.grid(True)
plt.tight_layout()
plt.savefig("execution_scatter.png")
plt.show()