// Import Chart.js library
import Chart from 'chart.js/auto';

// Get the predicted labels and their scores
const predictedLabels = model.predict(inputData).argMax(-1);
const scores = model.predict(inputData);

// Create a chart data object
const chartData = {
  labels: ['Negative', 'Neutral', 'Positive'],
  datasets: [{
    label: 'Scores',
    data: scores[0],
    backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(75, 192, 192, 0.2)'],
    borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(75, 192, 192, 1)'],
    borderWidth: 1
  }]
};

// Create a chart element
const chartElement = document.createElement('canvas');
chartElement.id = 'chart';

// Insert the chart element into the DOM
document.body.appendChild(chartElement);

// Create a chart instance
const chart = new Chart(chartElement, {
  type: 'bar',
  data: chartData,
  options: {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});
