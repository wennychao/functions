fetch('Plastic based Textiles in clothing industry.json')
  .then(response => response.json())
  .then(data => {
    // Filter data for year 2022
    const filteredData = data.filter(d => d.Production_Year === "2022");
    // Aggregate data by company and product type, including environmental metrics
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
        .attr('preserveAspectRatio', 'xMidYMid meet');

    // Define a pack layout
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
        'Organic_Cotton': '#E61F00',
        'Microfiber': '#B10B00'
    };

    let focus;
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
        const root = d3.hierarchy({children: aggregatedData})
          .sum(d => d.revenue);

        const bubbles = pack(root).leaves();

        const node = svg.selectAll('circle')
          .data(bubbles, d => d.data.company + d.data.productType)
          .join(
            enter => enter.append('circle')
              .attr('cx', d => d.x)
              .attr('cy', d => d.y)
              .attr('r', d => d.r)
              .attr('fill', d => colorPalette[d.data.productType] || '#ffad66')
              .attr("opacity", 0.7)
              .append('title')
              .text(d => `${d.data.company} - ${d.data.productType.replace(/_/g, ' ')}: $${d.data.revenue.toLocaleString()}`)
              .on("click", (event, d) => {
                focus !== d && (zoom(event, d), event.stopPropagation());
              }),
            update => update
              .transition().duration(500)
              .attr('fill', d => Object.keys(selectedCompanies).length === 0 || selectedCompanies[d.data.company] ? (colorPalette[d.data.productType] || '#ffad66') : '#7B7B7B')
              .attr("opacity", d => Object.keys(selectedCompanies).length === 0 || selectedCompanies[d.data.company] ? 0.7 : 0.3),
            exit => exit.remove()
          );
        focus = root; // Initialize focus
    }

    function zoomTo(v) {
        const k = width / v[2];
    
        view = v;
    
        label.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
        node.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
        node.attr("r", d => d.r * k);
      }
    
      function zoom(event, d) {
        const focus0 = focus;
    
        focus = d;
    
        const transition = svg.transition()
            .duration(event.altKey ? 7500 : 750)
            .tween("zoom", d => {
              const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
              return t => zoomTo(i(t));
            });
    
        label
          .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
          .transition(transition)
            .style("fill-opacity", d => d.parent === focus ? 1 : 0)
            .on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
            .on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
      }

    updateChart(); // Initialize the chart with all data

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
    const companyList = document.getElementById('company-list');
    companies.forEach(company => {
      const listItem = document.createElement('li');
      listItem.textContent = company;
      listItem.addEventListener('click', () => toggleCompanySelection(company, listItem));
      companyList.appendChild(listItem);
    });
  })
  .catch(error => console.error('Error fetching data:', error));
