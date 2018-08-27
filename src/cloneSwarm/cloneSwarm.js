import * as d3 from 'd3';
import cloneClassesInfo from "./cloneClassesInfo";

export default function(cloneData) {

    var cloneInformation = cloneData;

    var colorScale = d3.scaleLinear()
        .domain([1, cloneInformation.maxSourceCloneClassesPerFile.count])
        .range(['#555', 'red'])
        .interpolate(d3.interpolateRgb);


    function displayCloneClasses(filePath) {
        cloneClassesInfo(filePath, cloneInformation, true);
    };

    // clear previous dom elements if any
    if (d3.select('.rootContainer').node()) {
        d3.select('.rootContainer').remove();
    }

    var rootContainer = d3.select("#tool-root")
        .append('div')
        .attr('class', 'rootContainer col s12');

    // Create root svg 
    var svg_wrapper = rootContainer.append('div')
        .attr('class', 'graph-wrapper');

    svg_wrapper.append('div').attr('class', 'instruction-panel')
        .style('width', Math.max(screen.width * 0.4, 750) + "px")
        .html('<p><b>Instructions</b> : The interactive graph below is a radial tree map of all the clones in the project.' +
            'Every node is a folder or a file and hovering with the mouse on it will show its name.' +
            'Each <b>leaf node</b>(final node in a branch) is a file and the more red it is the more clones it has.Double clicking a leaf node will display all the clones sets detected in it, in the panel to the side.</p>' +
            '<p>The panel by default displays the clone sets found in the file with the maximum clones in it.Clicking on a clone set in the panel will show all the similar code fragments in that clone set.Each fragment can be clicked to view its source code and also compared with other fragments.</p>')


    var svg = svg_wrapper.append('svg')
        .attr('width', Math.max(screen.width * 0.4, 750))
        .attr('height', Math.max(screen.width * 0.4, 750))
        .attr('class', 'blockViewRoot');

    // create and translate inner g container 
    var width = +svg.attr("width"),
        height = +svg.attr("height"),
        g = svg.append("g").attr("transform", "translate(" + (width / 2 + 10) + "," + (height / 2 + 10) + ")");

    // create an instance of d3 zoom
    var zoomInstance = d3.zoom()
        .scaleExtent([1, 4])
        .filter(() => !(d3.event.type == 'dblclick'))
        .on("zoom", () => {
            var transform = d3.event.transform;
            g.attr("transform", transform);
            g.attr("transform", "translate(" + (transform.x + (transform.k * (width / 2 + 10))) + "," + (transform.y + (transform.k * (height / 2 + 10))) + ") scale(" + transform.k + ")");
        });
    // attach zoom event callback
    svg.call(zoomInstance);

    var customStratify = d3.stratify()
        .id(function(d) { return d; })
        .parentId(function(d) { return d.substring(0, d.lastIndexOf("/")); });

    var tree = d3.tree()
        .size([2 * Math.PI, 325])
        .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

    var root = tree(customStratify(cloneData.uniqueSourceArray));

    var links = root.links();
    var descendants = root.descendants();
    var bigNodeGraph = descendants.length > 1000;

    var link = g.selectAll(".link")
        .data(links)
        .enter().append("path")
        .attr("class", "link")
        .attr("d", d3.linkRadial()
            .angle(function(d) { return d.x; })
            .radius(function(d) { return d.y; }));

    var node = g.selectAll(".node")
        .data(descendants)
        .enter().append("g")
        .attr("class", function(d) { return "node" + (d.children ? " node--internal" : " node--leaf"); })
        .attr("transform", function(d) { return "translate(" + radialPoint(d.x, d.y) + ")"; });


    node.append("circle")
        .attr("r", 2.5)
        .attr("fill", '#999')
        .filter(function(d) {
            var name = d.id.substring(d.id.lastIndexOf("/") + 1);
            // matches only files ending with .cs or .py or .java or .cs
            return /^.+\.(cs|java|c|py)$/.test(name);
        })
        .attr('fill', function(d) {
            return colorScale(cloneInformation.uniqueSourceCollection["'" + d.id + "'"].length);
        });

    node.append("title")
        .text(function(d) { return d.id.substring(d.id.lastIndexOf("/") + 1); });


    node.filter(function(d) {
            var name = d.id.substring(d.id.lastIndexOf("/") + 1);
            // matches only files ending with .cs or .py or .java or .cs
            return /^.+\.(cs|java|c|py)$/.test(name);
        })
        .on('dblclick', function(d) {
            displayCloneClasses(d.id);
        })
        .filter((d) => { return !bigNodeGraph; })
        .append("text")
        .attr("dy", "0.31em")
        .attr("x", function(d) { return d.x < Math.PI === !d.children ? 6 : -6; })
        .attr("text-anchor", function(d) { return d.x < Math.PI === !d.children ? "start" : "end"; })
        .attr("transform", function(d) { return "rotate(" + (d.x < Math.PI ? d.x - Math.PI / 2 : d.x + Math.PI / 2) * 180 / Math.PI + ")"; })
        .text(function(d) { return d.id.substring(d.id.lastIndexOf("/") + 1); });

    // reset button 
    svg
        .append('rect')
        .attr('class', 'chromosomeViewReset')
        .style('cursor', 'pointer')
        .attr('x', width - 75)
        .attr('y', 35)
        .attr('height', 24)
        .attr('width', 24)
        .on('click', resetEffects.bind(zoomInstance));

    // icon for reset button
    svg
        .append('svg')
        .attr('x', width - 75)
        .attr('y', 35)
        .append('path')
        .style('cursor', 'pointer')
        .style('fill', '#2bbbad')
        .style('pointer-events', 'all')
        .attr('d', 'M 15.324219 4.445313 C 13.496094 3.640625 11.433594 3.515625 9.515625 4.121094 C 5.871094 5.269531 3.507813 8.726563 3.753906 12.53125 L 1.265625 12.695313 C 0.945313 7.738281 4.027344 3.238281 8.765625 1.742188 C 11.539063 0.867188 14.546875 1.171875 17.097656 2.550781 L 19.484375 0 L 20.121094 7.074219 L 12.628906 7.324219 Z M 15.230469 22.257813 C 14.179688 22.585938 13.089844 22.753906 12.007813 22.753906 C 10.242188 22.753906 8.488281 22.296875 6.90625 21.445313 L 4.515625 24 L 3.882813 16.925781 L 11.371094 16.675781 L 8.679688 19.554688 C 10.5 20.355469 12.5625 20.484375 14.480469 19.878906 C 18.125 18.726563 20.492188 15.265625 20.246094 11.46875 L 22.730469 11.304688 C 23.058594 16.253906 19.972656 20.757813 15.230469 22.257813 Z ')
        .on('click', resetEffects.bind(zoomInstance));


    // invert color button 
    svg
        .append('rect')
        .attr('class', 'colorInvert')
        .style('cursor', 'pointer')
        .attr('x', width - 120)
        .attr('y', 35)
        .attr('height', 24)
        .attr('width', 24)
        .on('click', function() { toggleLights(); });

    // icon for color button
    svg
        .append('svg')
        .attr('x', width - 120)
        .attr('y', 35)
        .append('path')
        .style('cursor', 'pointer')
        .style('fill', '#2bbbad')
        .style('pointer-events', 'all')
        .attr('d', 'M12,0C7,0,3,4,3,9c0,1.1,0.2,2.1,0.5,3L6,17c0.3,0.4,0.6,0.8,1,1c0,0,0,0,0,0v1c0,0.6,0.4,1,1,1v1c0,0.6,0.4,1,1,1v1   c0,0.6,0.4,1,1,1h4c0.6,0,1-0.4,1-1v-1c0.6,0,1-0.4,1-1v-1c0.6,0,1-0.4,1-1v-1c0,0,0,0,0-0.1c0.4-0.1,0.8-0.5,1-0.9l2.5-5   c0.3-0.9,0.5-1.9,0.5-3C21,4,17,0,12,0z M14,23h-4v-1h4V23z M15,21h-1h-4H9v-1h6V21z M16,19h-1H9H8v-1h8V19z M18.3,12l-2,4H7.7   l-2-4C5.2,11.1,5,10.1,5,9c0-3.9,3.1-7,7-7s7,3.1,7,7C19,10.1,18.8,11.1,18.3,12z')
        .on('click', function() { toggleLights(); });


    // Display the clone Class Info of the file with max clone classes by default 
    cloneClassesInfo(cloneInformation.maxSourceCloneClassesPerFile.path, cloneInformation);

}

function resetEffects() {
    d3.select('.rootContainer svg').call(this.transform, d3.zoomIdentity.scale(1).translate(0, 0));
}

function toggleLights() {
    d3.select('.blockViewRoot').classed('dark', !d3.select('.blockViewRoot').classed('dark'));
}

function radialPoint(x, y) {
    return [(y = +y) * Math.cos(x -= Math.PI / 2), y * Math.sin(x)];
}