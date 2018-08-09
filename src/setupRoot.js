import * as d3 from 'd3';
import axios from 'axios';
import documentationTemplate from './template/documentation.html';
import loaderTemplate from './template/loader.html';

export default function() {

    var serverLink = "https://cloneswarm.serveo.net/processRepository"

    // load the documentation and loader template files
    d3.select('#doc-root').html(documentationTemplate);
    d3.select('#tool-root').append('div').html(loaderTemplate);

    //materialize instantiate navbar
    document.addEventListener('DOMContentLoaded', function() {
        var elems = document.querySelectorAll('.sidenav');
        var instances = M.Sidenav.init(elems, {});
    });

    var elems = document.querySelectorAll('select');
    var instances = M.FormSelect.init(elems, {});


    d3.selectAll('.nav-link')
        .on('click', function() {
            d3.event.preventDefault();
            d3.selectAll('.root-container').classed('hide', true);
            if (d3.select(this).attr('class').indexOf('doc') > -1) {
                d3.select('#doc-root').classed('hide', false);
            } else {
                d3.select('#tool-root').classed('hide', false);
            }
        })

    d3.select("#submit-job")
        .on('click', function() {
            d3.event.preventDefault();

            var githubLink = document.getElementById("github-link").value;
            var email = document.getElementById("email").value;
            var language = document.getElementById("prog-language").value;

            if (!(githubLink.indexOf('.git') > -1)) {
                alert("Please enter a valid github link");
            } else if (email && language) {

                axios.get(serverLink + "/processRepository", { params: { 'githubLink': githubLink, 'email': email, 'language': language } })
                    .then(() => {
                        alert("Your project is being analyzed , We will send you a mail once the results are ready.");
                    })
                    .catch((err) => {
                        alert("Servers are Down Currently, Please try later");
                    })
            }

        })


}