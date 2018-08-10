export default function(cloneData) {
    // Clone Information is displayed
    d3.select("#tool-root")
        .append('div').attr("class", 's12 center-align')
        .selectAll('.subInfoTitle')
        .data(Object.keys(cloneData.information))
        .enter()
        .append('h6')
        .attr('class', 'subInfoTitle red-text text-lighten-2')
        .text((d) => d + " : " + cloneData.information[d]);

}