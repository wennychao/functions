fetch('Plastic based Textiles in clothing industry.json')
  .then(response => response.json())
  .then(data => {
        // Filter data for year 2022
        const filteredData = data.filter(d => d.Production_Year === "2022");
        // Aggregate data by company and product type, summing the sales revenue
        const aggregatedData = d3.rollups(filteredData,
            v => d3.sum(v, leaf => +leaf.Sales_Revenue), // Sum sales revenue for each product type within a company
            d => d.Company, d => d.Product_Type) // Group by company and then by product type
            .flatMap(([company, products]) => products.map(([productType, revenue]) => ({
                company,
                productType,
                revenue
            })));

        const container = document.getElementById('chart-container');
        const width = container.clientWidth;
        const height = container.clientHeight;
        const svg = d3.select('#bubble-chart')
            .attr('width', width)
            .attr('height', height);

        // Define a pack layout
        const pack = d3.pack()
        .size([width, height])
        .padding(3); // Padding between bubbles

        const colorPalette = {
            'Viscose': '#ffad66', // Medium orange
            'Linen': '#ff9966', // Slightly redder
            'Synthetic_Blend': '#ff7f50', // Coral
            'Wool': '#ff6347', // Tomato
            'Tencel': '#ff5733', // Crimson
            'Nylon': '#ff4500', // Orange red
            'Polyester': '#ff3300', // Medium red
            'Organic_Cotton': '#E61F00', // Deep orange-red
            'Microfiber': '#B10B00', // Very deep orange-red
        };

        const selectedCompanies = {};

            function toggleCompanySelection(company, listItem) {
                if (selectedCompanies[company]) {
                    delete selectedCompanies[company];
                    listItem.classList.remove('selected');
                } else {
                    selectedCompanies[company] = true;
                    listItem.classList.add('selected');
                }
                updateChart();
            }

            function updateChart() {
                const bubbles = pack(d3.hierarchy({children: aggregatedData}).sum(d => d.revenue)).leaves();
    
                svg.selectAll('circle')
                    .data(bubbles, d => d.data.company + d.data.productType)
                    .join(
                        enter => enter.append('circle')
                            .attr('cx', d => d.x)
                            .attr('cy', d => d.y)
                            .attr('r', d => d.r)
                            .attr('fill', d => colorPalette[d.data.productType] || '#ffad66')
                            .attr("opacity", 0.7)
                            .append('title')
                            .text(d => `${d.data.company} - ${d.data.productType.replace(/_/g, ' ')}: $${d.data.revenue.toLocaleString()}`),
                        update => update
                            .transition().duration(500)
                            .attr('fill', d => Object.keys(selectedCompanies).length === 0 || selectedCompanies[d.data.company] ? (colorPalette[d.data.productType] || '#ffad66') : '#7B7B7B')
                            .attr("opacity", d => Object.keys(selectedCompanies).length === 0 || selectedCompanies[d.data.company] ? 0.7 : 0.3),
                        exit => exit.remove()
                    );
            }

            // Initialize the chart with all data
            updateChart();
        svg.attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');

        // Create legend for product types
        const legend = document.getElementById('product_type_legend');
        Object.entries(colorPalette).forEach(([productType, color]) => {
            const legendItem = document.createElement('div');
            legendItem.className = 'legend-item'; 
            const formattedProductType = productType.replace(/_/g, ' ');
            legendItem.innerHTML = `<span class="legend-circle" style="background-color:${color};"></span>${formattedProductType}`;
            legend.appendChild(legendItem);
        });

        // Extracting unique company names
        const companies = [...new Set(data.map(item => item.Company))];

        // Display the list of companies on the left side
        const companyList = document.getElementById('company-list');
        companies.forEach(company => {
          const listItem = document.createElement('li');
          listItem.textContent = company;
          listItem.addEventListener('click', () => toggleCompanySelection(company, listItem));
          companyList.appendChild(listItem);
        });
      })
      .catch(error => console.error('Error fetching data:', error));