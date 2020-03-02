// @TODO: YOUR CODE HERE!
var sWidth = 1550;
var sHeight = 500;

var marg = {
    top: 20,
    bottom: 100,
    left: 150,
    right: 210,
}

var width = sWidth - marg.left - marg.right;
var height = sHeight - marg.top - marg.bottom;

var svg = d3
    .select('#scatter')
    .append('svg')
    .attr('width', sWidth)
    .attr('height', sHeight);

var chartsGroup = svg.append('g')
    .attr('transform', `translate(${marg.left}, ${marg.top})`);

var selectedXAxis = 'age';
var selectedYAxis = 'smokes';

function xScale(healthData, selectedXAxis) {
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d[selectedXAxis]) * 0.8,
            d3.max(healthData, d => d[selectedXAxis]) * 1.2
        ])
        .range([0, width]);
    return xLinearScale;
}

function yScale(healthData, selectedYAxis) {
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d[selectedYAxis]) * 0.8,
            d3.max(healthData, d => d[selectedYAxis]) * 1.2
        ])
        .range([height, 0]);
    return yLinearScale;
}

function rendXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
}

function rendYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    return yAxis;
}

function rendCirc(circGroup, newXScale, newYScale, selectedXAxis, selectedYAxis) {
    circGroup.transition()
        .duration(1000)
        .attr('cx', d => newXScale(d[selectedXAxis]))
        .attr('cy', d => newYScale(d[selectedYAxis]));
    return circGroup;
}

function rendText(textGroup, newXScale, newYScale, selectedXAxis, selectedYAxis) {
    textGroup.transition()
        .duration(1000)
        .attr('x', d => newXScale(d[selectedXAxis]))
        .attr('y', d => newYScale(d[selectedYAxis]));
    return textGroup;
}

function updateTip(selectedXAxis, selectedYAxis, circGroup) {
    if (selectedXAxis === 'age') {
        var xLabel = 'Age: ';
    }

    else if (selectedXAxis === 'income') {
        var xLabel = 'Income: $';
    }
    
    else {
        var xLabel = 'Poverty: ';
    }

    if (selectedYAxis === 'smokes') {
        var yLabel = 'Smokes: ';
    }

    else if (selectedYAxis === 'obesity') {
        var yLabel = 'Obesity ';
    }

    else {
        var yLabel = 'Healthcare: ';
    }

    var toolTip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([80, -60])
        .html(function(d) {
            // console.log(d.abbr)
            if (selectedXAxis === 'age' || selectedYAxis === 'income') {
                return (`${d.state}<br>${xLabel} ${d[selectedXAxis]} <br>${yLabel} ${d[selectedYAxis]}%`)
            }
            else {
                return (`${d.state}<br>${xLabel} ${d[selectedXAxis]}% <br>${yLabel} ${d[selectedYAxis]}%`)
            }
        });
    
    circGroup.call(toolTip);

    circGroup.on('mouseover', function(data) {
        toolTip.show(data, this)
        d3.select(this).style('stroke', 'black');
    })
        .on('mouseout', function(data, index) {
            toolTip.hide(data, this)
            d3.select(this).style('stroke', 'white');
        })
    return circGroup;
}

d3.csv('assets/data/data.csv').then(function(healthData, err) {
    if (err) throw err;

    healthData.forEach(function(data) {
        data.age = +data.age
        data.income = +data.income
        data.poverty = +data.poverty
        data.obesity = +data.obesity
        data.smokes = +data.smokes
        data.healthcare = +data.healthcare
    });

    var xLinearScale = xScale(healthData, selectedXAxis);

    var yLinearScale = yScale(healthData, selectedYAxis);

    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    var xAxis = chartsGroup.append('g')
        .classed('x-axis', true)
        .attr('transform', `translate(0, ${height})`)
        .call(bottomAxis);

    var yAxis = chartsGroup.append('g')
        .classed('y-axis', true)
        .call(leftAxis);

    var circles = chartsGroup.selectAll('g circle')
        .data(healthData)
        .enter()
        .append('g');

    var circGroup = circles.append('circle')
        .attr('cx', d => xLinearScale(d[selectedXAxis]))
        .attr('cy', d => yLinearScale(d[selectedYAxis]))
        .attr('r', 20)
        .classed('stateCirc', true)
        .attr('opacity', '.5');

    var textGroup = circles.append('text')
        .text(d => d.abbr)
        .style('font-size', '10px')
        .attr('x', d => xLinearScale(d[xLinearScale]))
        .attr('y', d => yLinearScale(d[yLinearScale]))
        .classed('stateText', true)
        .style('font-weight', '800')

    var labelsXGroup = chartsGroup.append('g')
        .attr('transform', `translate(${width / 2}, ${height + 20})`);

    var ageLabel = labelsXGroup.append('text')
        .attr('x', 0)
        .attr('y', 20)
        .attr('value', 'age')
        .classed('active', true)
        .text('Age average');

    var incomeLabel = labelsXGroup.append('text')
        .attr('x', 0)
        .attr('y', 40)
        .attr('value', 'income')
        .classed('inactive', true)
        .text('Household Income (Median)');

    var povertyLabel = labelsXGroup.append('text')
        .attr('x', 0)
        .attr('y', 60)
        .attr('value', 'poverty') // value to grab for event listener
        .classed('inactive', true)
        .text('Poverty (%)');

    var labelsYGroup = chartsGroup.append('g')
        .attr('transform', `translate(${0-marg.left/4}, ${height/2})`);

    var smokesLabel = labelsYGroup.append('text')
        .attr('x', 0)
        .attr('y', -20)
        .attr('transform', 'rotate(-90)')
        .attr('value', 'smokes') // value to grab for event listener
        .classed('active', true)
        .text('Smokes (%)');

    var obeseLabel = labelsYGroup.append('text')
        .attr('x', 0)
        .attr('y', -40)
        .attr('transform', 'rotate(-90)')
        .attr('value', 'obesity') // value to grab for event listener
        .classed('inactive', true)
        .text('Obese (%)');

    var healthcareLabel = labelsYGroup.append('text')
        .attr('x', 0)
        .attr('y', -60)
        .attr('transform', 'rotate(-90)')
        .attr('value', 'healthcare') // value to grab for event listener
        .classed('inactive', true)
        .text('Lacks Healthcare (%)');

    var circGroup = updateTip(selectedXAxis, selectedYAxis, circGroup);

    labelsXGroup.selectAll('text')
        .on('click', function() {
            var value = d3.select(this).attr('value');

            if (value !== selectedXAxis) {
                selectedXAxis = value;

                xLinearScale = xScale(healthData, selectedXAxis);

                xAxis = rendXAxis(xLinearScale, xAxis);

                circGroup = rendCirc(circGroup, xLinearScale, yLinearScale, selectedXAxis, selectedYAxis);
                textGroup = rendText(textGroup, xLinearScale, yLinearScale, selectedXAxis, selectedYAxis);

                circGroup = updateTip(selectedXAxis, selectedYAxis, circGroup);

                if (selectedXAxis === 'age') {
                    ageLabel
                        .classed('active', true)
                        .classed('inactive', false);
                    incomeLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    povertyLabel
                        .classed('active', false)
                        .classed('inactive', true);
                }
                else if (selectedXAxis === 'income') {
                    ageLabel
                        .classed(newFunction(), false)
                        .classed('inactive', true);
                    incomeLabel
                        .classed('active', true)
                        .classed('inactive', false);
                    povertyLabel
                        .classed('active', false)
                        .classed('inactive', true);
                }
                else {
                    ageLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    incomeLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    povertyLabel
                        .classed('active', true)
                        .classed('inactive', false);
                }
            }
        });

    labelsYGroup.selectAll('text')
        .on('click', function() {
            var value = d3.select(this).attr('value');
            
            if (value !== selectedYAxis) {
                selectedYAxis = value;
        
                yLinearScale = yScale(healthData, selectedYAxis);

                yAxis = rendYAxis(yLinearScale, yAxis);

                circGroup = rendCirc(circGroup, xLinearScale, yLinearScale, selectedXAxis, selectedYAxis);

                circGroup = updateTip(selectedXAxis, selectedYAxis, circGroup);
                textGroup = rendText(textGroup, xLinearScale, yLinearScale, selectedXAxis, selectedYAxis);

                if (selectedYAxis === 'smokes') {
                    smokesLabel
                        .classed('active', true)
                        .classed('inactive', false);
                    obeseLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    healthcareLabel
                        .classed('active', false)
                        .classed('inactive', true);
                }
                else if (selectedYAxis === 'obesity') {
                    smokesLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    obeseLabel
                        .classed('active', true)
                        .classed('inactive', false);
                    healthcareLabel
                        .classed('active', false)
                        .classed('inactive', true);
                }
                else {
                    smokesLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    obeseLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    healthcareLabel
                        .classed('active', true)
                        .classed('inactive', false);
                }
            }
        });
}).catch(function(error) {
    console.log(error);
});
function newFunction() {
    return 'active';
}

