fetch('Plastic_based_Textiles.json')
  .then(response => response.json())
  .then(data => {

    // Reusable function to populate select dropdown menus
    function populateSelectOptions(uniqueValues, selectElementId) {
      const selectElement = document.getElementById(selectElementId);
      uniqueValues.forEach(value => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        selectElement.appendChild(option);
      });
    }

    // Extract unique company names, product types, and production years
    const uniqueCompanies = [...new Set(data.map(item => item.Company))];
    const uniqueProductTypes = [...new Set(data.map(item => item.Product_Type))];
    const uniqueYears = [...new Set(data.map(item => item.Production_Year))];

    // Populate select dropdown menus dynamically
    populateSelectOptions(uniqueCompanies, "company-select");
    populateSelectOptions(uniqueProductTypes, "product-type-select");
    populateSelectOptions(uniqueYears, "production-year-select");

    // Iterate over metrics data and create metric elements dynamically
    const chartContainer = document.querySelector('.chart-container');
    const metricsData = [
      { symbol: '🦠', type: 'Greenhouse Gas Emissions', id: 'Greenhouse_Gas_Emissions', unit: 'tCO2e' },
      { symbol: '☠️', type: 'Pollutants Emitted', quantity:'', unit: 'ppt' },
      { symbol: '💧', type: 'Water Consumption', quantity:'', unit: 'Mgal/yr' },
      { symbol: '⚡️', type: 'Energy Consumption', quantity:'', unit: 'GWyr' },
      { symbol: '🗑️', type: 'Waste Generation', quantity:'', unit: 't' },
      { symbol: '💸', type: 'Sales Revenue', quantity:'', unit: 'USD' }
    ];

    metricsData.forEach(metric => {
      const metricDiv = document.createElement('div');
      metricDiv.classList.add('metric');

      const symbolSpan = document.createElement('div');
      symbolSpan.textContent = metric.symbol;

      const typeSpan = document.createElement('div');
      typeSpan.textContent = metric.type;

      const quantitySpan = document.createElement('div');
      quantitySpan.textContent = metric.quantity;

      const unitSpan = document.createElement('div');
      unitSpan.textContent = metric.unit;

      metricDiv.appendChild(symbolSpan);
      metricDiv.appendChild(typeSpan);
      metricDiv.appendChild(quantitySpan);
      metricDiv.appendChild(unitSpan);

      chartContainer.appendChild(metricDiv);
    });
  })
  .catch(error => console.error('Error fetching data:', error));
