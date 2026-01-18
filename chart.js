// Load and process the data
d3.csv('boston_311_2025_by_reason.csv').then(data => {
    // Convert the Count column to numbers
    data.forEach(d => {
        d.Count = +d.Count;
    });

    // Sort by count in descending order (largest first)
    data.sort((a, b) => b.Count - a.Count);

    // Get the top 10 reasons
    const top10 = data.slice(0, 10);

    let isShowingAll = false;
    let currentData = top10;

    // Button functionality
    document.getElementById('viewAllBtn').addEventListener('click', function() {
        isShowingAll = !isShowingAll;
        currentData = isShowingAll ? data : top10;
        document.getElementById('viewAllBtn').textContent = isShowingAll ? 'Show Top 10' : 'Show All Data';
        
        // Clear the chart and redraw
        d3.select('#chart svg').remove();
        drawChart(currentData);
    });

    // Initial chart draw
    drawChart(top10);

    // Function to draw the chart
    function drawChart(chartData) {

        // Dynamically adjust height based on data size
        const chartHeight = Math.max(550, chartData.length * 35);
        const margin = { top: 20, right: 40, bottom: 100, left: 220 };
        const width = 900 - margin.left - margin.right;
        const height = chartHeight - margin.top - margin.bottom;

        // Create SVG container
        const svg = d3.select('#chart')
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom + 40)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Create scales
        // X scale: for the bar lengths (goes from 0 to max count)
        const xScale = d3.scaleLinear()
            .domain([0, d3.max(chartData, d => d.Count)])
            .range([0, width]);

        // Y scale: for the position of each bar (one bar per reason)
        const yScale = d3.scaleBand()
            .domain(chartData.map(d => d.reason))
            .range([0, height])
            .padding(0.2);

        // Create color scale (uniform blue)
        const colorScale = d3.scaleLinear()
            .domain([0, chartData.length - 1])
            .range(['#1f77b4', '#1f77b4']);

        // Add bars to the chart
        svg.selectAll('.bar')
            .data(chartData)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', 0)
            .attr('y', d => yScale(d.reason))
            .attr('width', d => xScale(d.Count))
            .attr('height', yScale.bandwidth())
            .attr('fill', (d, i) => colorScale(i))
            .on('mouseenter', function(event, d) {
                const tooltip = document.getElementById('tooltip');
                tooltip.textContent = d.Count.toLocaleString();
                tooltip.style.opacity = '1';
            })
            .on('mousemove', function(event) {
                const tooltip = document.getElementById('tooltip');
                tooltip.style.left = (event.pageX + 10) + 'px';
                tooltip.style.top = (event.pageY - 10) + 'px';
            })
            .on('mouseleave', function() {
                const tooltip = document.getElementById('tooltip');
                tooltip.style.opacity = '0';
            });

        // Add value labels on the bars
        svg.selectAll('.bar-label')
            .data(chartData)
            .enter()
            .append('text')
            .attr('class', 'bar-label')
            .attr('x', d => xScale(d.Count) - 8)
            .attr('y', d => yScale(d.reason) + yScale.bandwidth() / 2)
            .attr('dy', '0.35em')
            .attr('text-anchor', 'end')
            .text(d => d.Count.toLocaleString());

        // Add X axis (horizontal axis at the top/bottom)
        const xAxis = d3.axisBottom(xScale);
        const xAxisGroup = svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${height})`)
            .call(xAxis);

        // Rotate x-axis labels for better readability
        xAxisGroup.selectAll('text')
            .attr('transform', 'rotate(45)')
            .attr('text-anchor', 'start')
            .attr('dx', '10px')
            .attr('dy', '5px');

        // Add Y axis (vertical axis on the left)
        const yAxis = d3.axisLeft(yScale);
        svg.append('g')
            .attr('class', 'y-axis')
            .call(yAxis);

        // Add axis labels
        svg.append('text')
            .attr('class', 'axis-label')
            .attr('x', width / 2)
            .attr('y', height + 65)
            .attr('text-anchor', 'middle')
            .style('font-size', '14px')
            .style('fill', '#888')
            .text('Number of Calls');

        svg.append('text')
            .attr('class', 'axis-label')
            .attr('transform', 'rotate(-90)')
            .attr('y', -205)
            .attr('x', -height / 2)
            .attr('text-anchor', 'middle')
            .style('font-size', '14px')
            .style('fill', '#888')
            .text('Reason Category');

        // Add source attribution
        svg.append('text')
            .attr('x', 0)
            .attr('y', height + 85)
            .style('font-size', '11px')
            .style('fill', '#999')
            .style('font-weight', '400')
            .text('Source: Boston.Gov 311 Data');

        svg.append('text')
            .attr('x', 0)
            .attr('y', height + 100)
            .style('font-size', '11px')
            .style('fill', '#999')
            .style('font-weight', '400')
            .text('Created by: Ivan Melchor and Christina Escalera');
    }

});
