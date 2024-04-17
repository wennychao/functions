// Load the JSON data from the file
d3.json("Plastic based Textiles in clothing industry.json").then(function(data) {
    // Filter the data to include only entries from the year 2022
    data = data.filter(entry => entry.Production_Year === "2022");
    console.log(data);

    // Set up SVG dimensions
    const width = window.innerWidth - 300; // Adjust for company list width
    const height = window.innerHeight;

    // Create SVG container
    const svg = d3.select("#bubble-chart")
    .attr("width", width)
    .attr("height", height);

    // Define environmental metrics
    const metrics = ["Greenhouse_Gas_Emissions", "Pollutants_Emitted", "Water_Consumption", "Energy_Consumption", "Waste_Generation"];

}).catch(function(error) {
    console.error('Error loading the JSON file: ', error);
});