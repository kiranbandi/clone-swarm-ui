import * as d3 from 'd3';
import _ from 'lodash';

export default function(filePath, cloneData, selected) {

    var cloneClassCollection = cloneData.uniqueSourceCollection["'" + filePath + "'"];

    var label = selected ? "Clone information for the selected file - " : "The file with the maximum clone sets is -";

    // clear previous dom elements if any
    if (d3.select('#cloneInfoContainer').node()) {
        d3.select('#cloneInfoContainer').remove();
    }

    var rootContainerWidth = +d3.select(".rootContainer").node().getBoundingClientRect().width;
    var cloneInfoContainerWidth = rootContainerWidth - (Math.max(screen.width * 0.4, 750));

    var cloneInfoContainer = d3.select(".rootContainer")
        .append('div')
        .attr('id', 'cloneInfoContainer')
        .style('width', cloneInfoContainerWidth + 'px')

    // Display Top label
    cloneInfoContainer
        .append('p')
        .attr('class', 'clone-info-p')
        .text(label)
        .style("margin-bottom", "20px");
    // Display Filepath  
    cloneInfoContainer
        .append('p')
        .attr('class', 'clone-info-p')
        .text("File Path : ")
        .append('span').attr('class', "blue-text text-lighten-1").text(filePath);
    // Display Number of Clone sets 
    cloneInfoContainer
        .append('p')
        .attr('class', 'clone-info-p')
        .text("No of Clone Sets : ")
        .append('span').attr('class', "blue-text text-lighten-1").text(cloneClassCollection.length);

    var cloneClassBoxes = cloneInfoContainer
        .append('div')
        .attr('class', 'classes-container')
        .selectAll('.class-box')
        .data(_.map(cloneClassCollection, function(o) { return cloneData.classes[o] }))
        .enter()
        .append('div')
        .attr('class', 'class-box');

    cloneClassBoxes.append('p').attr('class', 'class-box-p').text(function(d) { return "Clone Class ID - " + d.classId; });
    cloneClassBoxes.append('p').attr('class', 'class-box-p').text(function(d) { return "No of Clones - " + d.nClones; });
    cloneClassBoxes.append('p').attr('class', 'class-box-p').text(function(d) { return "No of Lines - " + d.nLines; });
    cloneClassBoxes.append('p').attr('class', 'class-box-p').text(function(d) { return "Share of Similarity - " + d.similarity; });

    cloneClassBoxes.on('click', function(d) {
        // Removed active classes if any
        d3.selectAll('.class-box.active-box').classed('active-box', false);
        // set active class on selected element
        d3.select(this).classed('active-box', true);

        debugger;

    });

}