import * as d3 from 'd3';

export default function(information) {
    // Information about the project system and the parameters used 
    // to run nicad are displayed in sub headings
    d3.select("#tool-root")
        .append('div').attr("class", 's12 center-align row')
        .selectAll('.subInfoTitle')
        .data(Object.keys(information))
        .enter()
        .append('h6')
        .attr('class', 'subInfoTitle red-text text-lighten-2')
        .text((d) => d + " : " + information[d]);
}