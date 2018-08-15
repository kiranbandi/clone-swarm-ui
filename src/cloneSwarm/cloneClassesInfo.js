import * as d3 from 'd3';
import _ from 'lodash';
import Prism from 'prismjs';
import 'prismjs/themes/prism-okaidia.css';
import 'prismjs/components/prism-csharp.min.js';
import 'prismjs/components/prism-c.min.js';
import 'prismjs/components/prism-java.min.js';
import 'prismjs/components/prism-python.min.js';
import 'prismjs/components/prism-clike.min.js';
import 'prismjs/plugins/line-numbers/prism-line-numbers.js';
import 'prismjs/plugins/line-numbers/prism-line-numbers.css';

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
    var compareModalInstance = M.Modal.init(document.getElementById('compare-modal'), {});

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
            var language = getLanguage(d.id);
            d3.select('#modal-file-path').text("File Path: ").append('span').text(d.id);
            d3.select('#modal-code')
                .html('')
                .append('pre')
                .attr('class', "line-numbers " + " language-" + language)
                .attr('data-start', d.startLine)
                .append('code').html(Prism.highlight(d.code, Prism.languages[language], language));
            Prism.highlightAll();
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
            var allSourcesForClass = _.map(currentlyActiveClassData.sources, function(source) { return cloneData.sources[source]; });
            var selectedSources = compareSelectedSources[currentlyActiveClassData.classId];

            if (!selectedSources || selectedSources.length < 2) {
                alert('select 2 sources to compare');
            } else if (selectedSources.length > 2) {
                alert('You can compare only 2 sources at a time');
            } else {
                var sources = _.filter(allSourcesForClass, function(o) { return selectedSources.indexOf(o.pcid) > -1; });
                d3.select('#source-modal-box > span').text(sources[0].code);
                d3.select('#source-path').text("File Path: ").append('span').text(d.id);
                d3.select('#target-modal-box > span').text(sources[1].code);
                d3.select('#target-path').text("File Path: ").append('span').text(d.id);

                var sourceLang = getLanguage(sources[0].id);
                d3.select('#source-modal-box > p.path-box').text("File Path: ").append('span').text(sources[0].id);
                d3.select('#source-modal-box div.code-block > pre')
                    .html('')
                    .attr('class', "line-numbers " + " language-" + sourceLang)
                    .attr('data-start', sources[0].startLine)
                    .append('code').html(Prism.highlight(sources[0].code, Prism.languages[sourceLang], sourceLang));


                var targetLang = getLanguage(sources[1].id);
                d3.select('#target-modal-box > p.path-box').text("File Path: ").append('span').text(sources[1].id);
                d3.select('#target-modal-box div.code-block > pre')
                    .html('')
                    .attr('class', "line-numbers " + " language-" + targetLang)
                    .attr('data-start', sources[1].startLine)
                    .append('code').html(Prism.highlight(sources[1].code, Prism.languages[targetLang], targetLang));


                Prism.highlightAll();

                compareModalInstance.open();
            }

        })
        .text('COMPARE')
        .append('i')
        .attr('class', 'material-icons left')
        .text('call_split');


}

function getLanguage(filePath) {

    if (/^.+\.c$/.test(filePath)) {
        return 'c';
    } else if (/^.+\.cs$/.test(filePath)) {
        return 'csharp';
    } else if (/^.+\.java$/.test(filePath)) {
        return 'java';
    } else if (/^.+\.py$/.test(filePath)) {
        return 'python';
    } else {
        return 'clike';
    }
}