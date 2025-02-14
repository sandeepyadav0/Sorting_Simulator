// Global Variables
let array = [];
let comparisons = 0;
let swaps = 0;
let startTime = 0;
const delay = 500; // Animation step delay (ms)
let nextStepResolve = null;
let chart; // Chart.js instance

// Pseudocode and Explanations for Each Algorithm
const pseudocodeDict = {
  bubble: [
    "for i from 0 to n-1:",
    "  for j from 0 to n-i-2:",
    "    if array[j] > array[j+1]:",
    "      swap array[j] and array[j+1]"
  ],
  insertion: [
    "for i from 1 to n-1:",
    "  key = array[i]",
    "  j = i - 1",
    "  while j >= 0 and array[j] > key:",
    "    array[j+1] = array[j]",
    "    j = j - 1",
    "  array[j+1] = key"
  ],
  selection: [
    "for i from 0 to n-1:",
    "  minIndex = i",
    "  for j from i+1 to n-1:",
    "    if array[j] < array[minIndex]:",
    "      minIndex = j",
    "  swap array[i] and array[minIndex]"
  ],
  merge: [
    "if array length > 1:",
    "  mid = length(array) / 2",
    "  left = array[0:mid]",
    "  right = array[mid:]",
    "  mergeSort(left)",
    "  mergeSort(right)",
    "  merge left and right into array"
  ],
  quick: [
    "if start < end:",
    "  pivot = array[end]",
    "  i = start",
    "  for j from start to end-1:",
    "    if array[j] < pivot:",
    "      swap array[i] and array[j]",
    "      i = i + 1",
    "  swap array[i] and array[end]",
    "  quickSort(array, start, i-1)",
    "  quickSort(array, i+1, end)"
  ]
};

const algorithmExplanations = {
  bubble: "Bubble Sort repeatedly steps through the list, comparing adjacent elements and swapping them if needed. Best-case: O(n) if sorted; average and worst-case: O(n²).",
  insertion: "Insertion Sort builds a sorted array one element at a time. Best-case: O(n) if sorted; average/worst-case: O(n²).",
  selection: "Selection Sort finds the minimum from the unsorted part and places it at the beginning. Complexity: O(n²) in all cases.",
  merge: "Merge Sort divides the array into halves, recursively sorts them, and merges the sorted halves. It runs in O(n log n) time.",
  quick: "Quick Sort uses a pivot to partition the array. Its average-case is O(n log n) while the worst-case is O(n²) if the pivot is poorly chosen."
};

// Complexity Information
const complexityDict = {
  bubble: { best: "O(n) (if already sorted)", average: "O(n²)", worst: "O(n²)" },
  insertion: { best: "O(n) (if already sorted)", average: "O(n²)", worst: "O(n²)" },
  selection: { best: "O(n²)", average: "O(n²)", worst: "O(n²)" },
  merge: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)" },
  quick: { best: "O(n log n)", average: "O(n log n)", worst: "O(n²)" }
};

// Update pseudocode display with optional highlighted line and tooltips
function updatePseudocodeHighlight(algorithm, highlightLine = -1) {
  const codeLines = pseudocodeDict[algorithm];
  let html = "";
  codeLines.forEach((line, index) => {
    const tooltip = algorithmExplanations[algorithm];
    if (index === highlightLine) {
      html += `<div class="highlight-line" title="${tooltip}">${line}</div>`;
    } else {
      html += `<div title="${tooltip}">${line}</div>`;
    }
  });
  document.getElementById("pseudocode").innerHTML = html;
}

// Update complexity info display
function updateComplexityInfo(algorithm) {
  const comp = complexityDict[algorithm];
  const html = `
    <p><strong>Best-case:</strong> ${comp.best}</p>
    <p><strong>Average-case:</strong> ${comp.average}</p>
    <p><strong>Worst-case:</strong> ${comp.worst}</p>
  `;
  document.getElementById("complexity-info").innerHTML = html;
}

// Log events in the Log Panel
function logEvent(message) {
  const logPanel = document.getElementById("log-panel");
  const p = document.createElement("p");
  p.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  logPanel.appendChild(p);
  logPanel.scrollTop = logPanel.scrollHeight;
}

// Initialize performance chart using Chart.js
function initPerformanceChart() {
  const ctx = document.getElementById("performanceChart").getContext("2d");
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        { label: 'Comparisons', data: [], borderColor: 'red', fill: false },
        { label: 'Swaps', data: [], borderColor: 'green', fill: false }
      ]
    },
    options: {
      responsive: true,
      title: { display: true, text: 'Performance Metrics Over Time' },
      scales: {
        xAxes: [{ display: true, scaleLabel: { display: true, labelString: 'Steps' } }],
        yAxes: [{ display: true, scaleLabel: { display: true, labelString: 'Count' } }]
      }
    }
  });
}

// Update performance chart with current metrics
function updatePerformanceChart(step) {
  chart.data.labels.push(step);
  chart.data.datasets[0].data.push(comparisons);
  chart.data.datasets[1].data.push(swaps);
  chart.update();
}

// Parse array input string into an array of numbers
const parseArrayInput = (inputStr) => {
  const tokens = inputStr.trim().split(/\s+/);
  const arr = tokens.map(x => parseFloat(x));
  if (arr.length !== tokens.length || arr.some(x => isNaN(x))) return null;
  return arr;
};

// Render array as vertical bars with centered index and value
function renderArray(highlightIndices = {}, swapIndices = {}) {
  const container = document.getElementById("array-container");
  container.innerHTML = "";
  const containerHeight = container.clientHeight;
  const maxValue = Math.max(...array) || 1;
  array.forEach((value, idx) => {
    const bar = document.createElement("div");
    bar.classList.add("array-bar");
    const scaledHeight = (value / maxValue) * (containerHeight - 20) + 20;
    bar.style.height = scaledHeight + "px";
    bar.style.width = (100 / array.length) + "%";
    if (highlightIndices[idx]) bar.classList.add("bar-active");
    if (swapIndices[idx]) bar.classList.add("bar-swap");
    bar.textContent = `${idx}: ${value}`;
    container.appendChild(bar);
  });
}

// Update stats counters in the UI
function updateStats() {
  document.getElementById("comparisons").textContent = comparisons;
  document.getElementById("swaps").textContent = swaps;
}

// Delay function with step-mode support
async function waitForStepOrDelay() {
  if (document.getElementById("step-mode").checked) {
    document.getElementById("next-step").disabled = false;
    await new Promise(resolve => { nextStepResolve = resolve; });
    document.getElementById("next-step").disabled = true;
  } else {
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

// "Next Step" button event
document.getElementById("next-step").addEventListener("click", () => {
  if (nextStepResolve) {
    nextStepResolve();
    nextStepResolve = null;
  }
});

// Sorting Algorithms with step-mode, pseudocode highlighting, logging, and performance updates

async function bubbleSort() {
  const algo = "bubble";
  updatePseudocodeHighlight(algo);
  logEvent("Starting Bubble Sort");
  const n = array.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      updatePseudocodeHighlight(algo, 2);
      renderArray({ [j]: true, [j + 1]: true });
      comparisons++;
      updateStats();
      await waitForStepOrDelay();
      updatePerformanceChart(`Step ${comparisons + swaps}`);
      if (array[j] > array[j + 1]) {
        updatePseudocodeHighlight(algo, 3);
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
        swaps++;
        updateStats();
        renderArray({}, { [j]: true, [j + 1]: true });
        logEvent(`Swapped indices ${j} and ${j + 1}`);
        await waitForStepOrDelay();
        updatePerformanceChart(`Step ${comparisons + swaps}`);
      }
    }
  }
  logEvent("Bubble Sort Completed");
}

async function insertionSort() {
  const algo = "insertion";
  updatePseudocodeHighlight(algo);
  logEvent("Starting Insertion Sort");
  const n = array.length;
  for (let i = 1; i < n; i++) {
    let key = array[i];
    let j = i - 1;
    while (j >= 0 && array[j] > key) {
      renderArray({ [j]: true, [j + 1]: true });
      comparisons++;
      array[j + 1] = array[j];
      swaps++;
      updateStats();
      await waitForStepOrDelay();
      updatePerformanceChart(`Step ${comparisons + swaps}`);
      j--;
    }
    array[j + 1] = key;
    renderArray();
    await waitForStepOrDelay();
  }
  logEvent("Insertion Sort Completed");
}

async function selectionSort() {
  const algo = "selection";
  updatePseudocodeHighlight(algo);
  logEvent("Starting Selection Sort");
  const n = array.length;
  for (let i = 0; i < n; i++) {
    let minIndex = i;
    for (let j = i + 1; j < n; j++) {
      renderArray({ [minIndex]: true, [j]: true });
      comparisons++;
      updateStats();
      await waitForStepOrDelay();
      updatePerformanceChart(`Step ${comparisons + swaps}`);
      if (array[j] < array[minIndex]) {
        minIndex = j;
      }
    }
    if (minIndex !== i) {
      [array[i], array[minIndex]] = [array[minIndex], array[i]];
      swaps++;
      updateStats();
      renderArray({}, { [i]: true, [minIndex]: true });
      logEvent(`Swapped indices ${i} and ${minIndex}`);
      await waitForStepOrDelay();
      updatePerformanceChart(`Step ${comparisons + swaps}`);
    }
  }
  logEvent("Selection Sort Completed");
}

async function mergeSortWrapper() {
  logEvent("Starting Merge Sort");
  await mergeSort(0, array.length - 1);
  logEvent("Merge Sort Completed");
}

async function mergeSort(start, end) {
  if (start >= end) return;
  const mid = Math.floor((start + end) / 2);
  await mergeSort(start, mid);
  await mergeSort(mid + 1, end);
  await merge(start, mid, end);
}

async function merge(start, mid, end) {
  let left = array.slice(start, mid + 1);
  let right = array.slice(mid + 1, end + 1);
  let i = 0, j = 0, k = start;
  while (i < left.length && j < right.length) {
    renderArray({ [k]: true });
    comparisons++;
    updateStats();
    await waitForStepOrDelay();
    if (left[i] <= right[j]) {
      array[k] = left[i];
      i++;
    } else {
      array[k] = right[j];
      j++;
    }
    swaps++;
    updateStats();
    k++;
    renderArray();
    await waitForStepOrDelay();
    updatePerformanceChart(`Step ${comparisons + swaps}`);
  }
  while (i < left.length) {
    array[k] = left[i];
    i++;
    k++;
    swaps++;
    updateStats();
    renderArray();
    await waitForStepOrDelay();
    updatePerformanceChart(`Step ${comparisons + swaps}`);
  }
  while (j < right.length) {
    array[k] = right[j];
    j++;
    k++;
    swaps++;
    updateStats();
    renderArray();
    await waitForStepOrDelay();
    updatePerformanceChart(`Step ${comparisons + swaps}`);
  }
}

async function quickSort(start = 0, end = array.length - 1) {
  const algo = "quick";
  updatePseudocodeHighlight(algo);
  if (start < end) {
    let pivotIndex = await partition(start, end);
    await quickSort(start, pivotIndex - 1);
    await quickSort(pivotIndex + 1, end);
  }
}

async function partition(start, end) {
  const algo = "quick";
  let pivot = array[end];
  let i = start;
  for (let j = start; j < end; j++) {
    renderArray({ [j]: true, [end]: true });
    comparisons++;
    updateStats();
    await waitForStepOrDelay();
    updatePerformanceChart(`Step ${comparisons + swaps}`);
    if (array[j] < pivot) {
      [array[i], array[j]] = [array[j], array[i]];
      swaps++;
      updateStats();
      renderArray({}, { [i]: true, [j]: true });
      logEvent(`Swapped indices ${i} and ${j}`);
      await waitForStepOrDelay();
      i++;
    }
  }
  [array[i], array[end]] = [array[end], array[i]];
  swaps++;
  updateStats();
  renderArray({}, { [i]: true, [end]: true });
  await waitForStepOrDelay();
  updatePerformanceChart(`Step ${comparisons + swaps}`);
  return i;
}

// "Show Explanation" Modal
document.getElementById("show-explanation").addEventListener("click", () => {
  const algo = document.getElementById("algorithm-select").value;
  document.getElementById("algorithm-explanation").innerHTML = `<p>${algorithmExplanations[algo]}</p>`;
  $('#explanationModal').modal('show');
});

// Initialize performance chart on page load
initPerformanceChart();

// Update chart on tab change
$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
  if(e.target.id === 'performance-tab'){
    chart.resize();
    chart.update();
  }
});

// Event Listeners

// Generate Random Array
document.getElementById("generate-array").addEventListener("click", () => {
  const size = 20;
  array = Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 1);
  document.getElementById("array-input").value = array.join(" ");
  comparisons = 0;
  swaps = 0;
  updateStats();
  renderArray();
  logEvent("Random array generated");
  updatePerformanceChart("Start");
  document.getElementById("input-error").textContent = "";
});

// Update Complexity Info on Algorithm Selection Change
document.getElementById("algorithm-select").addEventListener("change", () => {
  const algo = document.getElementById("algorithm-select").value;
  updateComplexityInfo(algo);
  updatePseudocodeHighlight(algo);
});

// Start Sort: Parse Input and Run Selected Algorithm
document.getElementById("start-sort").addEventListener("click", async () => {
  const inputStr = document.getElementById("array-input").value;
  const parsed = parseArrayInput(inputStr);
  if (parsed === null) {
    document.getElementById("input-error").textContent = "Incorrect input!";
    return;
  }
  document.getElementById("input-error").textContent = "";
  array = parsed.slice();
  comparisons = 0;
  swaps = 0;
  updateStats();
  renderArray();
  startTime = new Date().getTime();
  const algo = document.getElementById("algorithm-select").value;
  updatePseudocodeHighlight(algo);
  updateComplexityInfo(algo);
  logEvent(`Starting ${algo} sort`);
  if (algo === "bubble") {
    await bubbleSort();
  } else if (algo === "insertion") {
    await insertionSort();
  } else if (algo === "selection") {
    await selectionSort();
  } else if (algo === "merge") {
    await mergeSortWrapper();
  } else if (algo === "quick") {
    await quickSort();
  }
  const endTime = new Date().getTime();
  document.getElementById("time-taken").textContent = endTime - startTime;
  logEvent(`Sorting completed in ${endTime - startTime} ms`);
});

// Reset: Clear Fields, Logs, and Stats
document.getElementById("reset-sort").addEventListener("click", () => {
  array = [];
  comparisons = 0;
  swaps = 0;
  updateStats();
  renderArray();
  document.getElementById("array-input").value = "";
  document.getElementById("pseudocode").innerHTML = "";
  document.getElementById("complexity-info").innerHTML = "";
  document.getElementById("time-taken").textContent = "0";
  document.getElementById("log-panel").innerHTML = "";
  logEvent("Reset completed");
});
