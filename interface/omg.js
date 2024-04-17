// Load the JSON data from the file
d3.json("Plastic based Textiles in clothing industry.json").then(function(data) {

    // Filter the data to include only entries from the year 2022
    data = data.filter(entry => entry.Production_Year === "2022");
    
    // Set up SVG dimensions
    const width = window.innerWidth - 200; // Adjust for company list width
    const height = window.innerHeight;

    // Create SVG container
    const svg = d3.select("#bubble-chart")
        .attr("width", width)
        .attr("height", height);

    // Define environmental metrics
    const metrics = ["Greenhouse_Gas_Emissions", "Pollutants_Emitted", "Water_Consumption", "Energy_Consumption", "Waste_Generation"];

    // Function to update the visualization based on selected company
    function updateChart(selectedCompany) {
        let filteredData = data;
        if (selectedCompany !== "All") {
            filteredData = data.filter(entry => entry.Company === selectedCompany);
        }

        // Define scales for x and y coordinates
        const xScale = d3.scaleBand()
            .domain(metrics)
            .range([50, width - 50]);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(filteredData, d => d3.max(metrics, m => +d[m]))])
            .range([height - 50, 50]);

        // Define color scale for metrics
        const color = d3.scaleOrdinal(d3.schemeTableau10);

        // Create bubbles for each environmental metric
        metrics.forEach((metric, i) => {
            const sizeScale = d3.scaleLinear()
                .domain([0, d3.max(filteredData, d => +d[metric])])
                .range([5, 30]);

            // Randomize bubble positions
            const bubbleData = filteredData.map(d => ({
                x: Math.random() * (width - 100) + 50, // Random x position within the SVG width
                y: Math.random() * (height - 100) + 50, // Random y position within the SVG height
                radius: sizeScale(+d[metric]), // Bubble radius based on data
                color: color(i), // Bubble color based on metric
                delay: Math.random() * 10000,
                speed: Math.random() * 2000 + 500,
            }));

            svg.selectAll(".bubble-" + metric).remove(); // Remove existing bubbles before updating

            svg.selectAll(".bubble-" + metric)
                .data(bubbleData)
                .enter()
                .append("circle")
                .attr("class", "bubble bubble-" + metric)
                .attr("cx", d => d.x)
                .attr("cy", d => d.y)
                .attr("r", d => d.radius)
                .attr("fill", d => d.color)
                .attr("opacity", 0.7)
                .attr("cy", d => d.delay); 
        });
    }

    // Function to handle click event on company name
    function handleCompanyClick(selectedCompany) {
        updateChart(selectedCompany);
    }

    // Create clickable filters for each company
    const companies = [...new Set(data.map(item => item.Company))];
    const companyList = document.getElementById('company-list');
    companies.forEach(company => {
        const listItem = document.createElement('li');
        listItem.textContent = company;
        listItem.addEventListener('click', () => handleCompanyClick(company));
        companyList.appendChild(listItem);
    });

    // Define the color scale for metrics
    const color = d3.scaleOrdinal(d3.schemeTableau10).domain(metrics);

    // Function to draw or update the legend
    function drawLegend() {
    // Create the legend at the bottom-left
    const legend = svg.selectAll(".legend")
    .data(color.domain())
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("transform", (d, i) => `translate(20, ${height - (20 * (i + 1))})`); // Position at the bottom-left


   // Add colored rectangles to the legend
   legend.append("rect")
   .attr("x", 0) // Positioned at the starting point of the group
   .attr("width", 18)
   .attr("height", 18)
   .style("fill", color);

     // Add text labels to the legend
    legend.append("text")
        .attr("x", 24) // Positioned to the right of the rectangle
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .style("fill", "white") // Set the text color to white
        .text(d => d);
}

// Call this function to initially draw the legend
drawLegend();


     // Initialize chart with all companies selected
     updateChart("All");

});
