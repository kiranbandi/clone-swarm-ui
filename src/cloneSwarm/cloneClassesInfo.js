import * as d3 from 'd3';
import _ from 'lodash';
import cloneSource from './cloneSource';

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
        .append('div').attr('class', 'classes-container')
        .append('ul')
        .attr('class', 'collapsible class-collapsible')
        .selectAll('.source-box')
        .data(_.map(cloneClassCollection, function(o) { return cloneData.classes[o] }).sort(function(a, b) { return (b.similarity - a.similarity) }))
        .enter()
        .append('li');

    var cloneHeaders = cloneClassBoxes
        .append('div')
        .attr('class', 'collapsible-header');

    cloneHeaders.append('p').attr('class', 'class-box-p').text("Percentage Similarity: ").append('span').text(function(d) { return d.similarity; });
    cloneHeaders.append('p').attr('class', 'class-box-p').text("No of Clones: ").append('span').text(function(d) { return d.nClones; });
    cloneHeaders.append('p').attr('class', 'class-box-p').text("No of Lines: ").append('span').text(function(d) { return d.nLines; });
    cloneHeaders.append('p').attr('class', 'class-box-p').text("Clone Class ID: ").append('span').text(function(d) { return d.classId; });

    var cloneBodyElements = cloneClassBoxes
        .append('div')
        .attr('class', 'collapsible-body')
        .append('span').text('Lorem Ipsum');

    var elems = document.querySelectorAll('.collapsible');
    var instances = M.Collapsible.init(elems, {});
}