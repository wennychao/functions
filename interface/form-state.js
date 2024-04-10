fetch('Plastic_based_Textiles.json')
  .then(response => response.json())
  .then(data => {

	// Extract unique company names
    const uniqueCompanies = [...new Set(data.map(item => item.Company))];

    // Populate select options dynamically
    const companySelect = document.getElementById("company-select");
    uniqueCompanies.forEach(company => {
      const option = document.createElement("option");
      option.value = company;
      option.textContent = company;
      companySelect.appendChild(option);
    });

    // Extract unique product types
    const uniqueProductTypes = [...new Set(data.map(item => item.Product_Type))];

    // Populate select options dynamically
    const productTypeSelect = document.getElementById("product-type-select");
    uniqueProductTypes.forEach(productType => {
      const option = document.createElement("option");
      option.value = productType;
      option.textContent = productType;
      productTypeSelect.appendChild(option);
    });

	// Extract unique production years
    const uniqueYears = [...new Set(data.map(item => item.Production_Year))];

	// Sort the production years in descending order
    uniqueYears.sort((a, b) => b - a);

    // Populate select options dynamically
    const yearSelect = document.getElementById("production-year-select");
    uniqueYears.forEach(year => {
      const option = document.createElement("option");
      option.value = year;
      option.textContent = year;
      yearSelect.appendChild(option);
    });
	
	const metricsData = [
		{ symbol: '🦠', type: 'Greenhouse Gas Emissions', id: 'Greenhouse_Gas_Emissions', unit: 'tCO2e' },
		{ symbol: '☠️', type: 'Pollutants Emitted', quantity:'', unit: 'ppt' },
		{ symbol: '💧', type: 'Water Consumption', quantity:'', unit: 'Mgal/yr' },
		{ symbol: '⚡️', type: 'Energy Consumption', quantity:'', unit: 'GWyr' },
		{ symbol: '🗑️', type: 'Waste Generation', quantity:'', unit: 't' },
		{ symbol: '💸', type: 'Sales Revenue', quantity:'', unit: 'USD' }
	  ];
	  
	  const chartContainer = document.querySelector('.chart-container');
	  
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
