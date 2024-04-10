// Fetch the JSON data
fetch('Plastic based Textiles in clothing industry.json')
  .then(response => response.json())
  .then(data => {
        // Extracting unique company names
        const companies = [...new Set(data.map(item => item.Company))];

        // Display the list of companies on the left side
        const companyList = document.getElementById('company-list');
        companies.forEach(company => {
          const listItem = document.createElement('li');
          listItem.textContent = company;
          listItem.addEventListener('click', () => handleCompanyClick(listItem, data));
          companyList.appendChild(listItem);
        });
      })
      .catch(error => console.error('Error fetching data:', error));

        // Function to handle click on company
        function handleCompanyClick(companyItem, data) {
          // Check if the clicked company item is already marked as clicked
          const isClicked = companyItem.classList.contains('clicked');

          // Toggle the clicked class
          if (isClicked) {
            companyItem.classList.remove('clicked'); // Remove 'clicked' class

            // Remove the displayed filtered data
            const filteredDataContainer = document.getElementById('filtered-data');
            filteredDataContainer.innerHTML = ''; // Clear the content
          } else {
            companyItem.classList.add('clicked'); // Add 'clicked' class

            // Filter data based on selected company
            const companyName = companyItem.textContent;
            const filteredData = data.filter(item => item.Company === companyName);
            displayFilteredData(filteredData);
          }
        }

// Function to display filtered data as a bubble chart
function displayFilteredData(filteredData) {
  const bubbleChartData = filteredData.map(item => ({
    x: parseFloat(item.Water_Consumption),
    y: parseFloat(item.Energy_Consumption),
    r: parseFloat(item.Greenhouse_Gas_Emissions) / 100, // Adjust the radius as needed
    pollutants: parseFloat(item.Pollutants_Emitted), // Include Pollutants_Emitted
    waste: parseFloat(item.Waste_Generation), // Include Waste_Generation
    label: item.Company
  }));

  const bubbleChartCanvas = document.getElementById('bubble-chart');

  // Ensure the bubble chart canvas is not null
  if (bubbleChartCanvas) {
    new Chart(bubbleChartCanvas, {
      type: 'bubble',
      data: {
        datasets: [{
          label: 'Environmental Impact',
          data: bubbleChartData,
          backgroundColor: 'rgba(255, 99, 132, 0.6)', // Background color of bubbles
          borderColor: 'rgba(255, 99, 132, 1)', // Border color of bubbles
          borderWidth: 1 // Border width of bubbles
        }]
      },
      options: {
        scales: {
          x: {
            title: {
              display: true,
              text: 'Water Consumption'
            },
            type: 'linear',
            position: 'bottom'
          },
          y: {
            display: false // Hide the y-axis scale
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'Environmental Impact Bubble Chart'
          }
        }
      }
    });
  }
}   

      // Event listener to handle clicks outside the company list
        document.addEventListener('click', (event) => {
          const target = event.target;
          const companyList = document.getElementById('company-list');

          // Check if the clicked element is not within the company list
          if (!companyList.contains(target)) {
            // Reset all company items to default state
            const allCompanyItems = document.querySelectorAll('.company-item');
            allCompanyItems.forEach(item => {
              item.classList.remove('clicked');
            });
          }
        });

// fetch('Plastic_based_Textiles.json')
//   .then(response => response.json())
//   .then(data => {

//     // Reusable function to populate select dropdown menus
//     function populateSelectOptions(uniqueValues, selectElementId) {
//       const selectElement = document.getElementById(selectElementId);
//       uniqueValues.forEach(value => {
//         const option = document.createElement("option");
//         option.value = value;
//         option.textContent = value;
//         selectElement.appendChild(option);
//       });
//     }

//     // Extract unique company names, product types, and production years
//     const uniqueCompanies = [...new Set(data.map(item => item.Company))];
//     const uniqueProductTypes = [...new Set(data.map(item => item.Product_Type))];
//     const uniqueYears = [...new Set(data.map(item => item.Production_Year))];

//     // Populate select dropdown menus dynamically
//     populateSelectOptions(uniqueCompanies, "company-select");
//     populateSelectOptions(uniqueProductTypes, "product-type-select");
//     populateSelectOptions(uniqueYears, "production-year-select");

//     // Iterate over metrics data and create metric elements dynamically
//     const chartContainer = document.querySelector('.chart-container');
//     const metricsData = [
//       { symbol: '🦠', type: 'Greenhouse Gas Emissions', id: 'Greenhouse_Gas_Emissions', unit: 'tCO2e' },
//       { symbol: '☠️', type: 'Pollutants Emitted', quantity:'', unit: 'ppt' },
//       { symbol: '💧', type: 'Water Consumption', quantity:'', unit: 'Mgal/yr' },
//       { symbol: '⚡️', type: 'Energy Consumption', quantity:'', unit: 'GWyr' },
//       { symbol: '🗑️', type: 'Waste Generation', quantity:'', unit: 't' },
//       { symbol: '💸', type: 'Sales Revenue', quantity:'', unit: 'USD' }
//     ];

//     metricsData.forEach(metric => {
//       const metricDiv = document.createElement('div');
//       metricDiv.classList.add('metric');

//       const symbolSpan = document.createElement('div');
//       symbolSpan.textContent = metric.symbol;

//       const typeSpan = document.createElement('div');
//       typeSpan.textContent = metric.type;

//       const quantitySpan = document.createElement('div');
//       quantitySpan.textContent = metric.quantity;

//       const unitSpan = document.createElement('div');
//       unitSpan.textContent = metric.unit;

//       metricDiv.appendChild(symbolSpan);
//       metricDiv.appendChild(typeSpan);
//       metricDiv.appendChild(quantitySpan);
//       metricDiv.appendChild(unitSpan);

//       chartContainer.appendChild(metricDiv);
//     });
//   })
//   .catch(error => console.error('Error fetching data:', error));
