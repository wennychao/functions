document.addEventListener("DOMContentLoaded", function() {
    fetch("/Plastic based Textiles in clothing industry.json")
    .then(response => response.json())
    .then(data => {

        const companySet = new Set(data.map(item => item.Company));
        const companySelect = document.getElementById("company-select");
        companySet.forEach(company => {
            const option = document.createElement("option");
            option.value = company;
            option.textContent = company;
            companySelect.appendChild(option);
        });
        
 
        // Initialize indices for environmental metrics and product types
        const environmentalMetrics = ["Greenhouse_Gas_Emissions", "Pollutants_Emitted", "Water_Consumption", "Energy_Consumption", "Waste_Generation"];
        const metricIndex = {}, productTypeIndex = {};
        environmentalMetrics.forEach((metric, idx) => metricIndex[metric] = idx);
        data.forEach(item => {
            if (!(item.Product_Type in productTypeIndex)) {
                productTypeIndex[item.Product_Type] = Object.keys(productTypeIndex).length + environmentalMetrics.length;
            }
        });

        // Initialize matrix and populate with data
        let matrix = initializeMatrix(data, metricIndex, productTypeIndex, environmentalMetrics);
        createChordDiagram(matrix, environmentalMetrics, Object.keys(productTypeIndex));

        // Handle company selection changes
        document.getElementById("company-select").addEventListener("change", function() {
            const selectedCompany = this.value;
            let filteredData = selectedCompany === "all" ? data : data.filter(item => item.Company === selectedCompany);
            let filteredMatrix = initializeMatrix(filteredData, metricIndex, productTypeIndex, environmentalMetrics);
            createChordDiagram(filteredMatrix, environmentalMetrics, Object.keys(productTypeIndex));
        });
    })
    .catch(error => console.error('Error loading or processing data: ', error));
});

function initializeMatrix(data, metricIndex, productTypeIndex, environmentalMetrics) {
    const matrixSize = Object.keys(metricIndex).length + Object.keys(productTypeIndex).length;
    let matrix = Array.from({length: matrixSize}, () => new Array(matrixSize).fill(0));
    data.forEach(item => {
        environmentalMetrics.forEach(metric => {
            if (item.Production_Year >= 2018 && item.Production_Year <= 2022) {
                const metricIdx = metricIndex[metric];
                const productTypeIdx = productTypeIndex[item.Product_Type];
                matrix[metricIdx][productTypeIdx] += parseInt(item[metric], 10);
                matrix[productTypeIdx][metricIdx] += parseInt(item[metric], 10);
            }
        });
    });
    return matrix;
}

function createChordDiagram(matrix, metricNames, productTypeNames) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const margin = 340;
    const outerRadius = Math.min(width - margin, height - margin) * 0.5;
    const innerRadius = outerRadius - 30;

    d3.select("svg").remove(); // Clear previous SVG
    const svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    const chord = d3.chord()
        .padAngle(0.05)
        .sortSubgroups(d3.descending)(matrix);

    const arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);

    const ribbon = d3.ribbon()
        .radius(innerRadius);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const tooltip = d3.select("#tooltip");

    const group = svg.append("g")
        .selectAll("g")
        .data(chord.groups)
        .enter().append("g");

        group.append("path")
            .attr("d", arc)
            .style("fill", d => color(d.index))
            .style("stroke", d => d3.rgb(color(d.index)).darker())
            .attr("id", (d, i) => `arc${i}`)
            .attr("d", arc);
            
        group.append("text")
        .each(d => { d.angle = (d.startAngle + d.endAngle) / 2; })
        .attr("dy", ".35em")
        .attr("transform", d => `
            rotate(${(d.angle * 180 / Math.PI - 90)})
            translate(${outerRadius + 5})
            ${d.angle > Math.PI ? "rotate(180)" : ""}
        `)
        .style("text-anchor", d => d.angle > Math.PI ? "end" : null)
        .style("font-family", "Poppins, sans-serif")
        .style("text-transform", "uppercase")
        .style("fill", "white")
        .text(d => (metricNames[d.index] || productTypeNames[d.index - metricNames.length]).replace(/_/g, ' '));
    

        svg.append("g")
        .attr("fill-opacity", 0.67)
        .selectAll("path")
        .data(chord)
        .enter().append("path")
        .attr("d", ribbon)
        .style("fill", d => color(d.target.index))
        .style("stroke", d => d3.rgb(color(d.target.index)).darker())
        .on("mouseover", (event, d) => {
            tooltip.style("opacity", 1)
                .style("background-color", "#1D1D1D")
                .html("From: " + (metricNames[d.source.index] || productTypeNames[d.source.index - metricNames.length]).replace(/_/g, ' ') +
                    "<br/>To: " + (metricNames[d.target.index] || productTypeNames[d.target.index - metricNames.length]).replace(/_/g, ' ') +
                    "<br/>Impact: " + d.source.value.toLocaleString() + " units") // Changed "Value" to "Impact" and removed the dollar sign
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY + 10) + "px");
        })
        .on("mouseout", () => tooltip.style("opacity", 0));
        
}

