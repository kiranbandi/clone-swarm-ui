import * as d3 from 'd3';
import axios from 'axios';
import setupRoot from './setupRoot';
import processCloneInfo from './processCloneInfo';
import processQueryParams from './processQueryParams';
import cloneSwarm from './cloneSwarm/cloneSwarm';
import displayInformation from './displayInformation';
import toastr from './toastr';


// get the source name based on window query params or set to default - windows powershell
var sourceName = processQueryParams().source || 'powershell';
var sourceLink;
if (['powershell', 'sentinel', 'jhotdraw', 'curl', 'springboot', 'git', 'django', 'keras', 'scikitlearn', 'pandas', 'guava', 'tensorflow', 'gcc', 'open-ssl', 'unity'].indexOf(sourceName) > -1) {
    sourceLink = 'assets/files/clone-info-' + sourceName + '.xml';
} else {
    sourceLink = "https://s3.ca-central-1.amazonaws.com/cloneswarm-store/clone-data/clone-xml-info/" + sourceName + "-clone-info.xml";
}

var serverLink = "https://clone-swarm.usask.ca:8443";

//initialise root ,navbar and homepage form
setupRoot(serverLink);

// Loading the clone info file 
axios.get(sourceLink).then(function(cloneInfo) {
    //hide loader once file loading and processing is complete
    d3.select('#loader-container').classed('hide', true);
    var cloneData = processCloneInfo(cloneInfo.data);
    displayInformation(cloneData.information, sourceLink);
    if (cloneData.classes.length == 0) {
        d3.select('#info-header').text("No code clones were indentified in the " + cloneData.information.system + " project");
    } else {
        cloneSwarm(cloneData);
    }
}).catch(function(error) {
    console.log(error);
    d3.select('#loader-container').classed('hide', true);
    toastr["error"]('Could fetch clone information files', "ERROR");
    d3.select('#info-header').text("Couldnt fetch clone information for the given source.");
});