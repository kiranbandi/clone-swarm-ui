import * as d3 from 'd3';

export default function(information, sourceLink) {
    // Information about the project system and the parameters used 
    // to run nicad are displayed in sub headings
    var titleroot = d3.select("#tool-root")
        .append('div').attr("class", 's12 center-align row');

    titleroot.selectAll('.subInfoTitle')
        .data(Object.keys(information))
        .enter()
        .append('h6')
        .attr('class', 'subInfoTitle red-text text-lighten-2')
        .text((d) => d + " : " + information[d]);

    titleroot.append('a')
        .attr('href', sourceLink)
        .attr('class', 'download-link')
        .attr('target', "_blank")
        .attr('download', information.system.trim() + '-nicad-output')
        .append('i')
        .attr('class', 'material-icons')
        .text('save_alt')
}