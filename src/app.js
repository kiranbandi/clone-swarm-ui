import * as d3 from 'd3';
import axios from 'axios';
import setupRoot from './setupRoot';
import processCloneInfo from './processCloneInfo';
import processQueryParams from './processQueryParams';
import cloneSwarm from './cloneSwarm/cloneSwarm';

//initialise root ,navbar and homepage form
setupRoot();

// get the source name based on window query params or set to default - windows powershell
let sourceName = processQueryParams().source || 'powershell';
let sourceLink;
if (['powershell', 'sentinel', 'jhotdraw', 'curl', 'springboot'].indexOf(sourceName) > -1) {
    sourceLink = 'assets/files/clone-info-' + sourceName + '.xml';
} else {
    sourceLink = "https://s3.ca-central-1.amazonaws.com/cloneswarm-store/clone-data/clone-xml-info/" + sourceName + "-clone-info.xml";
}
// Loading the clone info file 
axios.get(sourceLink).then(function(cloneInfo) {
    //hide loader once file loading and processing is complete
    d3.select('#loader-container').classed('hide', true);
    var cloneInformation = processCloneInfo(cloneInfo.data);
    cloneSwarm(cloneInformation);
});