import * as d3 from 'd3';

export default function(cloneData) {

    // clear previous dom elements if any
    if (d3.select('.rootContainer').node()) {
        d3.select('.rootContainer').remove();
    }

    let rootContainer = d3.select("#tool-root")
        .append('div')
        .attr('class', 'rootContainer');

    // Create root svg 
    let svg = rootContainer.append('svg')
        .attr('width', 980)
        .attr('height', 980)
        .attr('class', 'blockViewRoot');

    // create and translate inner g container 
    var width = +svg.attr("width"),
        height = +svg.attr("height"),
        g = svg.append("g").attr("transform", "translate(" + (width / 2 + 10) + "," + (height / 2 + 10) + ")");

    // create an instance of d3 zoom
    let zoomInstance = d3.zoom()
        .scaleExtent([1, 4])
        .filter(() => !(d3.event.type == 'dblclick'))
        .on("zoom", () => {
            var transform = d3.event.transform;
            g.attr("transform", "translate(" + (transform.x + (width / 2 + 10)) + "," + (transform.y + (height / 2 + 10)) + ") scale(" + transform.k + ")");
        });
    // attach zoom event callback
    svg.call(zoomInstance);

    var customStratify = d3.stratify()
        .id(function(d) { return d; })
        .parentId(function(d) { return d.substring(0, d.lastIndexOf("/")); });

    var tree = d3.tree()
        .size([2 * Math.PI, 400])
        .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

    var root = tree(customStratify(cloneData.uniqueSourceKeyStore));

    var link = g.selectAll(".link")
        .data(root.links())
        .enter().append("path")
        .attr("class", "link")
        .attr("d", d3.linkRadial()
            .angle(function(d) { return d.x; })
            .radius(function(d) { return d.y; }));

    var node = g.selectAll(".node")
        .data(root.descendants())
        .enter().append("g")
        .attr("class", function(d) { return "node" + (d.children ? " node--internal" : " node--leaf"); })
        .attr("transform", function(d) { return "translate(" + radialPoint(d.x, d.y) + ")"; });

    node.append("circle")
        .attr("r", 2.5);

    node.append("title")
        .text(function(d) { return d.id.substring(d.id.lastIndexOf("/") + 1); });

    node.filter(function(d) {
            var name = d.id.substring(d.id.lastIndexOf("/") + 1);
            return name.indexOf(".cs") > -1 || name.indexOf(".java") > -1 || name.indexOf(".c") > -1 || name.indexOf(".py") > -1;
        })
        .append("text")
        .attr("dy", "0.31em")
        .attr("x", function(d) { return d.x < Math.PI === !d.children ? 6 : -6; })
        .attr("text-anchor", function(d) { return d.x < Math.PI === !d.children ? "start" : "end"; })
        .attr("transform", function(d) { return "rotate(" + (d.x < Math.PI ? d.x - Math.PI / 2 : d.x + Math.PI / 2) * 180 / Math.PI + ")"; })
        .text(function(d) {
            var name = d.id.substring(d.id.lastIndexOf("/") + 1);
            if (name.indexOf(".ifdefed") > -1) {
                name = name.slice(0, -8);
            }
            return name;
        });

    // reset button 
    svg
        .append('rect')
        .attr('class', 'chromosomeViewReset')
        .style('cursor', 'pointer')
        .attr('x', width - 75)
        .attr('y', 35)
        .attr('height', 24)
        .attr('width', 24)
        .style('fill', 'white')
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

}

function resetEffects() {
    d3.select('.rootContainer svg').call(this.transform, d3.zoomIdentity.scale(1).translate(0, 0));
}

function radialPoint(x, y) {
    return [(y = +y) * Math.cos(x -= Math.PI / 2), y * Math.sin(x)];
}