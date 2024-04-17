d3.json("Plastic based Textiles in clothing industry.json").then(function(data) {
    console.log(data);
    
    // Initialize an empty object to store company data
    let companyData = {};

    // Iterate through the data
    data.forEach(function(datum) {
        const companyName = datum.Company;
        if (!companyData.hasOwnProperty(companyName)) {
            companyData[companyName] = [];
        }
        companyData[companyName].push({
            "Greenhouse_Gas_Emissions": datum.Greenhouse_Gas_Emissions,
            "Pollutants_Emitted": datum.Pollutants_Emitted,
            "Water_Consumption": datum.Water_Consumption,
            "Energy_Consumption": datum.Energy_Consumption,
            "Waste_Generation": datum.Waste_Generation,
        });
    });

    // Create a container for company names
    const container = d3.select("#companyNamesContainer");
    const ul = container.append("ul");

    // Create a chart container 
    const chartContainer = d3.select("body")
        .append("div")
        .attr("id", "chartContainer");

    // Display each company's name as list items
    Object.keys(companyData).forEach(function(companyName) {
        // Create a new <li> element for each company name
        const li = ul.append("li")
            .text(companyName);

        // Add a click event listener to each list item
        li.on("click", function() {
            // Toggle the visibility of the company's data
            const details = chartContainer.selectAll(".details").data([null]);
            details.enter()
                .append("chartContainer")
                .classed("details", true)
                .merge(details)
                .html(function() {
                    return companyData[companyName].map(function(d) {
                        return "<p><strong>Greenhouse Gas Emissions:</strong> " + d.Greenhouse_Gas_Emissions + "</p>" +
                            "<p><strong>Pollutants Emitted:</strong> " + d.Pollutants_Emitted + "</p>" +
                            "<p><strong>Water Consumption:</strong> " + d.Water_Consumption + "</p>" +
                            "<p><strong>Energy Consumption:</strong> " + d.Energy_Consumption + "</p>" +
                            "<p><strong>Waste Generation:</strong> " + d.Waste_Generation + "</p>";
                    }).join("");
                });

            // Remove the details section if it's already visible
            if (!details.empty()) {
                details.remove();
            }
        });
    });
    
}).catch(function(error) {
    // If there's an error loading the data, handle it here
    console.error("Error loading the JSON file: ", error);
});
