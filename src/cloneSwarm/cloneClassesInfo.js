import * as d3 from 'd3';
import _ from 'lodash';

export default function(filePath, cloneData, selected) {


    var compareSelectedSources = {};

    var currentlyActiveClassData;

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
        .append('span').attr('class', "green-text text-lighten-1 truncate").text(filePath);
    // Display Number of Clone sets 
    cloneInfoContainer
        .append('p')
        .attr('class', 'clone-info-p')
        .text("No of Clone Sets : ")
        .append('span').attr('class', "green-text text-lighten-1").text(cloneClassCollection.length);


    var cloneClassBoxes = cloneInfoContainer
        .append('div').attr('class', 'classes-container')
        .append('ul')
        .attr('class', 'collapsible class-collapsible')
        .selectAll('.source-box')
        .data(_.map(cloneClassCollection, function(o) { return cloneData.classes[o] }).sort(function(a, b) { return (b.similarity - a.similarity) }))
        .enter()
        .append('li')
        .attr('id', function(d) { return "class-" + d.classId });

    var cloneHeaders = cloneClassBoxes
        .append('div')
        .attr('class', 'collapsible-header');

    cloneHeaders.append('p').attr('class', 'class-box-p').text("Percentage Similarity: ").append('span').text(function(d) { return d.similarity; });
    cloneHeaders.append('p').attr('class', 'class-box-p').text("No of Clones: ").append('span').text(function(d) { return d.nClones; });
    cloneHeaders.append('p').attr('class', 'class-box-p').text("No of Lines: ").append('span').text(function(d) { return d.nLines; });
    cloneHeaders.append('p').attr('class', 'class-box-p').text("Clone Class ID: ").append('span').text(function(d) { return d.classId; });


    var collapsibleInstances = M.Collapsible.init(document.querySelectorAll('.collapsible'), {
        onOpenEnd: function(element) {
            currentlyActiveClassData = d3.select(element).datum();
        }
    });
    var modalInstance = M.Modal.init(document.getElementById('cloneswarm-modal'), {});

    var collapsibleBody = cloneClassBoxes
        .append('div')
        .attr('class', 'collapsible-body source-collapsible')
        .selectAll('.source-link-box')
        .data(function(d) {
            return _.map(d.sources, function(source) { return cloneData.sources[source]; });
        })
        .enter()
        .append('span')
        .attr('class', 'source-marker blue-text text-lighten-2')
        .text(function(d) { return d.id; })
        .on('click', function(d) {
            d3.select('#modal-file-path').text("File Path: ").append('span').text(d.id);
            d3.select('#modal-start-line').text("Start Line Number: ").append('span').text(d.startLine);
            d3.select('#modal-end-line').text("End Line Number: ").append('span').text(d.endLine);
            d3.select('#modal-code').text(d.code).style('white-space', 'pre-wrap');
            modalInstance.open();
        })

    var innerLabels = collapsibleBody.append('label').on('click', function(d) {
        d3.event.stopPropagation();
    });

    innerLabels
        .append('input')
        .attr('type', 'checkbox')
        .attr('class', 'filled-in')
        .on('change', function(d) {
            // being turned on first time 
            if (d3.event.target.checked) {
                if (compareSelectedSources[currentlyActiveClassData.classId]) {
                    compareSelectedSources[currentlyActiveClassData.classId].push(d.pcid);
                } else {
                    compareSelectedSources[currentlyActiveClassData.classId] = [d.pcid];
                }
            }
            //  turned off , so value is already in the store just remove it from list 
            else {
                _.remove(compareSelectedSources[currentlyActiveClassData.classId], function(o) {
                    return o == d.pcid;
                });
            }
        });

    innerLabels
        .append('span')
        .attr('class', 'clickbox');

    cloneClassBoxes
        .select('.source-collapsible')
        .append('a')
        .attr('class', 'waves-effect waves-light btn-small red compare-button')
        .on('click', function(d) {
            d3.event.stopPropagation();
        })
        .text('COMPARE')
        .append('i')
        .attr('class', 'material-icons left')
        .text('call_split');


}