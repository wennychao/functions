d3.json("Plastic based Textiles in clothing industry.json").then(data => {
    // Filter data to include only entries from the year 2022
    data = data.filter(entry => entry.Production_Year === "2022");

    // Hierarchical data setup
    let hierarchy = {
        name: "Root",
        children: []
    };

    data.forEach(entry => {
        let companyNode = hierarchy.children.find(c => c.name === entry.Company);
        if (!companyNode) {
            companyNode = {
                name: entry.Company,
                children: []
            };
            hierarchy.children.push(companyNode);
        }

        let productNode = companyNode.children.find(p => p.name === entry.Product_Type);
        if (!productNode) {
        productNode = {
            name: entry.Product_Type,
            children: [],
            metrics: {
                Greenhouse_Gas_Emissions: 0,
                Pollutants_Emitted: 0,
                Water_Consumption: 0,
                Energy_Consumption: 0,
                Waste_Generation: 0
            }
        };
        companyNode.children.push(productNode);
    }

         // Define the metrics to add as separate nodes
    const metrics = [
        { name: "Greenhouse Gas Emissions", value: parseInt(entry.Greenhouse_Gas_Emissions) },
        { name: "Pollutants Emitted", value: parseInt(entry.Pollutants_Emitted) },
        { name: "Water Consumption", value: parseInt(entry.Water_Consumption) },
        { name: "Energy Consumption", value: parseInt(entry.Energy_Consumption) },
        { name: "Waste Generation", value: parseInt(entry.Waste_Generation) }
    ];

    // Add each metric as a child node
    metrics.forEach(metric => {
        productNode.children.push({
            name: metric.name,
            value: metric.value,
            details: { ...entry.details, metric: metric.name }  // Assumes there are other details to include
        });
    });
});

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]]; // Swap elements
        }
      }
      
    // Randomize parent nodes
    shuffle(hierarchy.children);

    // Compute the layout for packed circle
    const width = window.innerWidth; 
    const height = window.innerHeight;
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const pack = data => d3.pack()
        .size([width, height])
        .padding(3)
        (d3.hierarchy(data)
        .sum(d => d.value)
        .sort(() => 0.5 - Math.random()));
        
    const root = pack(hierarchy);

    // Create the SVG container
    const svg = d3.create("svg")
    .attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`)
    .attr("width", width)
    .attr("height", height)
    .attr("style", `max-width: 80%; height: auto; display: block; margin: 0 -14px; cursor: pointer;`);

    // Append the nodes
    const node = svg.append("g")
        .selectAll("circle")
        .data(root.descendants().slice(1))
        .join("circle")
        .attr("fill", d => d.children ? color(d.depth) : "white")
        .attr("pointer-events", d => !d.children ? "none" : null)
        .on("mouseover", function() { d3.select(this).attr("stroke", "#000"); })
        .on("mouseout", function() { d3.select(this).attr("stroke", null); })
        .on("click", (event, d) => focus !== d && (zoom(event, d), event.stopPropagation()));

    // Append the text labels
    const label = svg.append("g")
        .style("font", "10px sans-serif")
        .attr("pointer-events", "none")
        .attr("text-anchor", "middle")
        .selectAll("text")
        .data(root.descendants())
        .join("text")
        .style("fill-opacity", d => d.parent === root ? 1 : 0)
        .style("display", d => d.parent === root ? "inline" : "none")
        .text(d => d.data.name);

    // Create the zoom behavior and zoom immediately into the initial focus node
    svg.on("click", (event) => zoom(event, root));
    let focus = root;
    let view;
    zoomTo([focus.x, focus.y, focus.r * 2]);

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

    document.getElementById("zoom-chart").appendChild(svg.node());
});
