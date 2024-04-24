fetch('Plastic based Textiles in clothing industry.json')
  .then(response => response.json())
  .then(data => {
    const filteredData = data.filter(d => d.Production_Year === "2022");

    const aggregatedData = d3.rollups(filteredData,
        v => ({
          revenue: d3.sum(v, leaf => +leaf.Sales_Revenue),
          metrics: [
            {name: "Greenhouse Gas Emissions", value: d3.sum(v, leaf => +leaf.Greenhouse_Gas_Emissions)},
            {name: "Pollutants Emitted", value: d3.sum(v, leaf => +leaf.Pollutants_Emitted)},
            {name: "Water Consumption", value: d3.sum(v, leaf => +leaf.Water_Consumption)},
            {name: "Energy Consumption", value: d3.sum(v, leaf => +leaf.Energy_Consumption)},
            {name: "Waste Generation", value: d3.sum(v, leaf => +leaf.Waste_Generation)}
          ]
        }),
        d => d.Company, d => d.Product_Type)
        .flatMap(([company, products]) => products.map(([productType, data]) => ({
          company,
          productType,
          revenue: data.revenue,
          metrics: data.metrics
        })));

    const container = document.getElementById('chart-container');
    const width = container.clientWidth;
    const height = container.clientHeight;
    const svg = d3.select('#bubble-chart')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .append('g');

    const pack = d3.pack()
      .size([width, height])
      .padding(3);

      const colorPalette = {
        'Viscose': '#ffad66',
        'Linen': '#ff9966',
        'Synthetic_Blend': '#ff7f50',
        'Wool': '#ff6347',
        'Tencel': '#ff5733',
        'Nylon': '#ff4500',
        'Polyester': '#ff3300',
        'Organic_Cotton': '#cc0000', // Darker shade of red
        'Microfiber': '#990000'       // Even darker shade of red
    };    

    let focus;
    const selectedCompanies = {};

    function updateChart() {
        const root = d3.hierarchy({children: aggregatedData})
          .sum(d => d.revenue);

        const bubbles = pack(root).leaves();

        const node = svg.selectAll('circle')
          .data(bubbles, d => d.data.company + d.data.productType);

        node.join(
            enter => enter.append('circle')
              .attr('cx', d => d.x)
              .attr('cy', d => d.y)
              .attr('r', d => d.r)
              .attr('fill', d => colorPalette[d.data.productType] || '#ffad66')
              .attr("opacity", 0.7)
              .each(function(d) { // Use 'each' to append title to each circle
                d3.select(this).append('title')
                    .text(d => `${d.data.company} - ${d.data.productType.replace(/_/g, ' ')}: $${d.data.revenue.toLocaleString()}`);
              })
              .on("click", (event, d) => { 
                if (focus !== d) { 
                  zoom(event, d); 
                  event.stopPropagation(); 
                } else { // If already focused, zoom out
                  zoom(event, root);
                  event.stopPropagation();
                }
              }),
            update => update
              .transition().duration(500)
              .attr('cx', d => d.x)
              .attr('cy', d => d.y)
              .attr('r', d => d.r)
              .attr('fill', d => Object.keys(selectedCompanies).length === 0 || selectedCompanies[d.data.company] ? (colorPalette[d.data.productType] || '#ffad66') : '#7B7B7B')
              .attr("opacity", d => Object.keys(selectedCompanies).length === 0 || selectedCompanies[d.data.company] ? 0.7 : 0.3),
            exit => exit.remove()
          );
        focus = root; // Initialize focus
    }

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

    function zoomTo(d) {
        const scale = width / (d.r * 2);
        const translate = [width / 2 - scale * d.x, height / 2 - scale * d.y];

        svg.transition().duration(750)
           .attr("transform", `translate(${translate})scale(${scale})`);
    }

    function zoom(event, d) {
        if (focus === d) { // If already focused, zoom out
            focus = null; // Reset focus
            svg.selectAll('.env-metrics').remove(); // Remove environmental metrics group
            zoomTo(root);
            event.stopPropagation();
            return;
        }
    
        focus = d;
        zoomTo(d);
    
        // Setup the environment pack layout
        const envPack = d3.pack()
            .size([d.r * 2, d.r * 2]) // Make the size relative to the radius of the zoomed bubble
            .padding(1);
    
        // Data join for environmental metrics
        const envRoot = d3.hierarchy({ children: d.data.metrics })
            .sum(d => d.value); // Use value for calculating the radius
    
        const envNodes = envPack(envRoot).leaves();
    
        let envGroup = svg.select('.env-metrics');
        if (!envGroup.empty()) envGroup.remove(); // Remove existing environmental metrics group
        envGroup = svg.append('g')
            .attr('class', 'env-metrics')
            .attr('transform', `translate(${d.x - d.r}, ${d.y - d.r})`);
    
        // Append environmental metric bubbles
envGroup.selectAll('circle.env-metric')
.data(envNodes)
.enter()
.append('circle')
.attr('class', 'env-metric')
.attr('cx', d => d.x)
.attr('cy', d => d.y)
.attr('r', d => d.r)
.attr('fill', (d, i) => ['#354E00', '#3E5314', '#424A00', '#354E00', '#3E5314'][i % 5])
.attr("opacity", 1)
.append('title')
.text(d => `${d.data.name}: ${d.data.value.toLocaleString()}`);

// Append text labels to environmental metric bubbles
envGroup.selectAll('text.env-label')
.data(envNodes)
.enter()
.append('text')
.attr('class', 'env-label')
.attr('x', d => d.x)
.attr('y', d => d.y)
.attr('text-anchor', 'middle')
.attr('dy', '0.1em')
.style('fill', 'white')
.style('font-size', '2px')
.style('margin-top', '2px')
.text(d => d.data.name);

    
        // Scale and translate to focus on the environmental metrics
        zoomToEnvironmentalMetrics(d.x, d.y, d.r);
    }
    
    function zoomToEnvironmentalMetrics(x, y, radius) {
        const scale = 6; // Increased scale factor for larger zoom
        const translate = [width / 2 - scale * x, height / 2 - scale * y];
    
        svg.transition().duration(750)
            .attr("transform", `translate(${translate})scale(${scale})`);
    }

    updateChart(); // Initialize the chart with all data

    const legend = document.getElementById('product_type_legend');
    Object.entries(colorPalette).forEach(([productType, color]) => {
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        const formattedProductType = productType.replace(/_/g, ' ');
        legendItem.innerHTML = `<span class="legend-circle" style="background-color:${color};"></span>${formattedProductType}`;
        legend.appendChild(legendItem);
    });

    const companies = [...new Set(data.map(item => item.Company))];
    const companyList = document.getElementById('company-list');
    companies.forEach(company => {
      const listItem = document.createElement('li');
      listItem.textContent = company;
      listItem.addEventListener('click', () => toggleCompanySelection(company, listItem));
      companyList.appendChild(listItem);
    });
  })
  .catch(error => console.error('Error fetching data:', error));
