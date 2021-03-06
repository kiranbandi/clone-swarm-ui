import * as d3 from 'd3';
import axios from 'axios';
import documentationTemplate from './template/documentation.html';
import loaderTemplate from './template/loader.html';
import toastr from './toastr';
import processQueryParams from './processQueryParams';

export default function(serverLink) {

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

    // If the query params has page set to dashboard then directly open the dashboard 
    if (processQueryParams().page == 'dashboard') {
        d3.selectAll('.root-container').classed('hide', true);
        d3.select('#tool-root').classed('hide', false);
    }

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
            var granularity = document.getElementById("granularity").value;

            if (!(githubLink.indexOf('.git') > -1)) {
                toastr["error"]("Please enter a valid git link , the link should be a .git link that can be used to clone the repostiory.", "ERROR");
            } else if (email && language && granularity) {
                axios.get(serverLink + "/process-repository", { params: { 'githubLink': githubLink, 'email': email, 'language': language, 'granularity': granularity } })
                    .then(() => {
                        toastr["success"]("Your project is being analyzed , We will send you a mail once the results are ready.", "STATUS");
                        d3.select('#submit-job-form').classed('hide', true);
                        d3.select('#submit-job-complete').classed('hide', false);
                    })
                    .catch((err) => {
                        toastr["error"]("Servers are Down Currently, Please try later", "ERROR");
                    })
            } else {
                toastr["error"]("Please fill all the values before submitting", "ERROR");
            }

        })


}