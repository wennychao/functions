am5.ready(function() {
    // Create root element
    var root = am5.Root.new("sankey-chart");

    // Set themes
    root.setThemes([am5themes_Animated.new(root)]);

    // Create a color set
    var colorSet = am5.ColorSet.new(root, {});

    // Create series
    var series = root.container.children.push(am5flow.Sankey.new(root, {
        sourceIdField: "from",
        targetIdField: "to",
        valueField: "value",
        paddingTop: -80,
        paddingLeft: 20,
        paddingRight: 220,
        paddingBottom: 40
    }));

    // Fetch data from a JSON file
    fetch("Plastic based Textiles in clothing industry.json")
        .then(response => response.json())
        .then(data => {
            // Revenue aggregation by company for years 2018 to 2022
            const revenueByCompany = {};
            data.forEach(item => {
                if (item.Production_Year >= 2018 && item.Production_Year <= 2022) {
                    revenueByCompany[item.Company] = revenueByCompany[item.Company] || 0;
                    revenueByCompany[item.Company] += parseInt(item.Sales_Revenue, 10);
                }
            });

            // Convert revenue data into nodes for amCharts
            const companyNodes = Object.keys(revenueByCompany).map(company => ({
                id: company,
                name: company,
                value: revenueByCompany[company],
                fill: colorSet.next()
            }));
            
            // Extract and map unique product types to nodes
            const uniqueProductTypes = new Set();
            data.forEach(item => uniqueProductTypes.add(item.Product_Type));
            const productTypeNodes = Array.from(uniqueProductTypes).map(productType => ({
                id: productType.replace(/_/g, ' '),
                name: productType,
                fill: colorSet.next()
            }));
            
            const scalingFactor = 25;
            // Environmental metrics summed for 2018 to 2022
            const metricsSum = {};
            const environmentalMetrics = ["Greenhouse_Gas_Emissions", "Pollutants_Emitted", "Water_Consumption", "Energy_Consumption", "Waste_Generation"];
            environmentalMetrics.forEach(metric => {
                metricsSum[metric] = data.reduce((sum, item) => {
                    if (item.Production_Year >= 2018 && item.Production_Year <= 2022) {
                        return sum + parseInt(item[metric], 10);
                    }
                    return sum;
                }, 0) * scalingFactor;
            });
            
            const environmentalMetricNodes = environmentalMetrics.map(metric => ({
                id: metric,
                name: metric.replace(/_/g, ' '),
                value: metricsSum[metric],
                fill: colorSet.next()
            }));
            
            // Define links
            const links = [];
            companyNodes.forEach(company => {
                productTypeNodes.forEach(productType => {
                    links.push({
                        from: company.id,
                        to: productType.id,
                        value: revenueByCompany[company.name]
                    });
                });
            });
            
            productTypeNodes.forEach(productType => {
                environmentalMetricNodes.forEach(metric => {
                    links.push({
                        from: productType.id,
                        to: metric.id.replace(/_/g, ' '),
                        value: metricsSum[metric.name.replace(/\s/g, '_')]
                    });
                });
            });
            console.log()

            // Set all nodes and links into the series data
            series.data.setAll([...companyNodes, ...productTypeNodes, ...environmentalMetricNodes, ...links]);

            // Configure node appearance and behavior
            series.nodes.template.setAll({
                draggable: true,
                tooltipText: "{name}: [bold]{value}[/]",
                fillOpacity: 1,
            });

            // Configure link appearance and behavior
            series.links.template.setAll({
                fillOpacity: 0.5,
                tooltipText: "{fromName} to {toName}: [bold]{value}[/]"
            });

            // Animate the diagram on load
            series.appear(1000, 100);
        })
        .catch(error => console.error('Error loading or processing data: ', error));
});
