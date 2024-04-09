// You can put your individual, DOM-specific logic here.
window.stateCallback = () => {
	console.log('Something changed!')
}

fetch('Plastic_based_Textiles.json')
  .then(response => response.json())
  .then(data => {
    // Work with the JSON data here
    console.log(data);
  })
  .catch(error => console.error('Error fetching data:', error));

  // Data for greenhouse gas emissions
const data = {
    labels: ['Company A', 'Company B', 'Company C', 'Company D'],
    datasets: [{
        label: 'Greenhouse Gas Emissions (tons)',
        data: [1500, 2200, 1800, 2000],
        backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)'
        ],
        borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)'
        ],
        borderWidth: 1
    }]
};

// Configuration options
const options = {
    scales: {
        y: {
            beginAtZero: true
        }
    }
};

// Create the chart
const ctx = document.getElementById('greenhouse-gas-chart').getContext('2d');
const myChart = new Chart(ctx, {
    type: 'bar',
    data: data,
    options: options
});