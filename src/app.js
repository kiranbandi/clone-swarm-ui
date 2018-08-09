import * as d3 from 'd3';
import axios from 'axios';
import setupRoot from './setupRoot';
import processCloneInfo from './processCloneInfo';

//initialise root and navbar
setupRoot();

// Loading the gff file  - Will Eventually be moved into the file loader container
axios.get('assets/files/clone-info-jhotdraw.xml').then(function(cloneInfo) {
    //hide loader one file loading and processing is complete
    d3.select('#loader-container').classed('hide', true);
    console.log('Data loading and processing complete...');
    var cloneInfo = processCloneInfo(cloneInfo.data);
    start(cloneInfo);
});

function start(cloneInfo) {

    let rootContainer = d3.select("#tool-root")
        .append('div')
        .attr('class', 'rootContainer');

    let svg = rootContainer.append('svg')
        .attr('width', 960)
        .attr('height', 1000)
        .attr('class', 'blockViewRoot');

    var width = +svg.attr("width"),
        height = +svg.attr("height"),
        g = svg.append("g").attr("transform", "translate(" + (width / 2 + 10) + "," + (height / 2 + 10) + ")");

    var stratify = d3.stratify()
        .parentId(function(d) { return d.id.substring(0, d.id.lastIndexOf(".")); });

    var customStratify = d3.stratify()
        .id(function(d) { return d; })
        .parentId(function(d) { return d.substring(0, d.lastIndexOf("/")); });

    var tree = d3.tree()
        .size([2 * Math.PI, 450])
        .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });


    var uniqueSourceKeyStore = cloneInfo.uniqueSourceKeyStore;

    uniqueSourceKeyStore = uniqueSourceKeyStore.sort(function(a, b) {
        return b.length - a.length;
    })

    var ourRoot = tree(customStratify(uniqueSourceKeyStore));

    var link = g.selectAll(".link")
        .data(ourRoot.links())
        .enter().append("path")
        .attr("class", "link")
        .attr("d", d3.linkRadial()
            .angle(function(d) { return d.x; })
            .radius(function(d) { return d.y; }));

    var node = g.selectAll(".node")
        .data(ourRoot.descendants())
        .enter().append("g")
        .attr("class", function(d) { return "node" + (d.children ? " node--internal" : " node--leaf"); })
        .attr("transform", function(d) { return "translate(" + radialPoint(d.x, d.y) + ")"; });

    node.append("circle")
        .attr("r", 2.5);

    node.append("title")
        .text(function(d) { return d.id.substring(d.id.lastIndexOf("/") + 1); });

    node.filter(function(d) {
            var name = d.id.substring(d.id.lastIndexOf("/") + 1);
            return name.indexOf(".cs") > -1;
        })
        .append("text")
        .attr("dy", "0.31em")
        .attr("x", function(d) { return d.x < Math.PI === !d.children ? 6 : -6; })
        .attr("text-anchor", function(d) { return d.x < Math.PI === !d.children ? "start" : "end"; })
        .attr("transform", function(d) { return "rotate(" + (d.x < Math.PI ? d.x - Math.PI / 2 : d.x + Math.PI / 2) * 180 / Math.PI + ")"; })
        .text(function(d) { return d.id.substring(d.id.lastIndexOf("/") + 1); });

    function radialPoint(x, y) {
        return [(y = +y) * Math.cos(x -= Math.PI / 2), y * Math.sin(x)];
    }

}