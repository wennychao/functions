document.addEventListener("DOMContentLoaded", function() {
    fetch("/Plastic based Textiles in clothing industry.json")
    .then(response => response.json())
    .then(data => {
        // Get the dimensions of the container or viewport
        const containerWidth = document.documentElement.clientWidth;
        const containerHeight = document.documentElement.clientHeight;
        
        // Define margins
        const marginTop = 10;
        const marginRight = 10;
        const marginBottom = 80; // Increased to accommodate x-axis labels
        const marginLeft = 100;
        
        // Set width and height based on container size
        const width = containerWidth - marginLeft - marginRight;
        const height = containerHeight - marginTop - marginBottom;


        const fx = d3.scaleBand()
            .domain(new Set(data.map(d => d.Company)))
            .rangeRound([marginLeft, width - marginRight])
            .paddingInner(0.1);

        const fy = d3.scaleLinear()
            .range([height - marginBottom, marginTop]);

        const revenueByCompany = {};
        data.forEach(item => {
            if (item.Production_Year >= 2018 && item.Production_Year <= 2022) {
                revenueByCompany[item.Company] = revenueByCompany[item.Company] || 0;
                revenueByCompany[item.Company] += parseInt(item.Sales_Revenue, 10);
            }
        });

        const maxRevenue = d3.max(Object.values(revenueByCompany));
        fy.domain([0, maxRevenue]);

        const companyNodes = Object.keys(revenueByCompany).map(company => ({
            id: company,
            name: company,
            value: revenueByCompany[company],
        }));

        // Identify unique product types and sum metrics
        const uniqueProductTypes = new Set();
        data.forEach(item => uniqueProductTypes.add(item.Product_Type));
        const productTypeNodes = Array.from(uniqueProductTypes).map(productType => {
            const filteredData = data.filter(d => d.Product_Type === productType);
            return {
                id: productType.replace(/_/g, ' '),
                name: productType.replace(/_/g, ' '),
                totalRevenue: d3.sum(filteredData, d => parseInt(d.Sales_Revenue, 10)),
                Greenhouse_Gas_Emissions: d3.sum(filteredData, d => parseInt(d.Greenhouse_Gas_Emissions, 10)),
                Pollutants_Emitted: d3.sum(filteredData, d => parseInt(d.Pollutants_Emitted, 10)),
                Water_Consumption: d3.sum(filteredData, d => parseInt(d.Water_Consumption, 10)),
                Energy_Consumption: d3.sum(filteredData, d => parseInt(d.Energy_Consumption, 10)),
                Waste_Generation: d3.sum(filteredData, d => parseInt(d.Waste_Generation, 10))
            };
        });

        const color = d3.scaleOrdinal()
            .domain(productTypeNodes.map(d => d.id))
            .range(d3.schemeCategory10);

        const svg = d3.select("#chart")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("style", "max-width: 100%; height: auto;")
            .style("color", "#ffffff");

        const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background", "white")
        .style("padding", "8px")
        .style("border-radius", "6px")
        .style("color", "black")
        .style("font-family", "Poppins, sans-serif");

        const companyGroups = svg.selectAll(".company-group")
            .data(companyNodes)
            .enter().append("g")
            .attr("class", "company-group")
            .attr("transform", d => `translate(${fx(d.name)}, 0)`)
            .attr("fill-opacity", 0.8);

        companyGroups.each(function(companyData) {
            const companyGroup = d3.select(this);

            productTypeNodes.forEach((productType, i) => {
                companyGroup.append("rect")
                    .attr("x", i * fx.bandwidth() / productTypeNodes.length)
                    .attr("y", fy(productType.totalRevenue))
                    .attr("width", fx.bandwidth() / productTypeNodes.length)
                    .attr("height", height - marginBottom - fy(productType.totalRevenue))
                    .attr("fill", color(productType.id))
                    .on("mouseover", function(event, d) {
                        tooltip.style("visibility", "visible")
                               .html(`<strong> ${companyData.name}</strong><br/>
                                      <strong>${productType.name}</strong> <br/>
                                      <ul>
                                          <li><strong>Revenue:</strong> ${productType.totalRevenue.toLocaleString()}</li>
                                          <li><strong>Greenhouse Gas Emissions:</strong> ${productType.Greenhouse_Gas_Emissions} tons</li>
                                          <li><strong>Pollutants Emitted:</strong> ${productType.Pollutants_Emitted} units</li>
                                          <li><strong>Water Consumption:</strong> ${productType.Water_Consumption} liters</li>
                                          <li><strong>Energy Consumption:</strong> ${productType.Energy_Consumption} kWh</li>
                                          <li><strong>Waste Generation:</strong> ${productType.Waste_Generation} kg</li>
                                      </ul>`)
                               .style("left", `${event.pageX + 10}px`)
                               .style("top", `${event.pageY + 10}px`);
                    })
                    .on("mousemove", function(event) {
                        tooltip.style("left", `${event.pageX + 10}px`)
                               .style("top", `${event.pageY + 10}px`);
                    })
                    .on("mouseout", function() {
                        tooltip.style("visibility", "hidden");
                    });
            });
            // Create a legend
        const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width - marginRight - 100}, ${marginTop})`);

    const legendItems = legend.selectAll(".legend-item")
        .data(color.domain())
        .enter().append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0, ${i * 20})`);

    legendItems.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", color);

    legendItems.append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", "0.35em")
        .style("fill", "#ffffff")
        .text(d => d);
        });

        // Append x-axis
        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${height - marginBottom})`)
            .call(d3.axisBottom(fx))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-45)");

        // Append y-axis
        svg.append("g")
            .attr("class", "y-axis")
            .attr("transform", `translate(${marginLeft}, 0)`)
            .call(d3.axisLeft(fy).tickFormat(d => (d / 100000000).toLocaleString() + " million").ticks(5)); // Format ticks as integers

        return svg.node();
    })
    .catch(error => console.error('Error loading or processing data: ', error));
});
