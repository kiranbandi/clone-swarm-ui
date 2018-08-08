import _ from 'lodash';

export default function(cloneInfoXML) {

    var XMLLineArray = cloneInfoXML.split("\n");

    var cloneInfo = {
        classes: [],
        sources: []
    };

    // Start processing Line by Line 
    var iterator = 0;
    var tempClassStore = {};
    var tempSourceStore = {};
    var buffer = [];
    var shouldStoreInBuffer = false;

    while (iterator < XMLLineArray.length) {
        var line = XMLLineArray[iterator];
        // If the line is the start of a class then store the class info in tempClassStore
        if (line.indexOf('classid') > -1 && line.indexOf('nclones') > -1) {
            tempClassStore = processCloneClassInfo(line);
        }
        // If the line is the start of a source file then store its information in the tempSourceStore
        else if (line.indexOf('<source') > -1 && line.indexOf('startline') > -1) {
            tempSourceStore = processCloneSourceInfo(line);
            // Turn the buffer store flag one to indicate that from next line onwards we should start storing lines
            shouldStoreInBuffer = true;
        }
        // Indicates end of source tag so store the value in tempClassStore and clear buffer and tempSourceStore
        else if (line == '</source>') {
            shouldStoreInBuffer = false;
            tempSourceStore.code = buffer.join("\n");
            // Store the actual source info in the source store array , copy just the index in the tempClass to keep track
            // by reference only , the push returns the length of the array , subtracting 1 from which gives the index of the element
            // that was added 
            var sourceIndex = cloneInfo.sources.push(_.clone(tempSourceStore)) - 1;
            tempClassStore.sources.push(sourceIndex);
            buffer = [];
        }
        // For end of class tag push the classStore into the array and clear it
        else if (line == '</class>') {
            cloneInfo.classes.push(_.clone(tempClassStore));
        } else if (shouldStoreInBuffer) {
            buffer.push(line);
        }
        // increment iterator to go to the next line
        iterator += 1;
    }
    return cloneInfo;
};


function processCloneClassInfo(cloneClassInfo) {
    var cloneClassInfoArray = cloneClassInfo.slice(7, -1).split(" ");
    return {
        'classId': cloneClassInfoArray[0].slice(9, -1),
        'nClones': cloneClassInfoArray[1].slice(9, -1),
        'nLines': cloneClassInfoArray[2].slice(8, -1),
        'similarity': cloneClassInfoArray[3].slice(12, -1),
        'sources': []
    };
}

function processCloneSourceInfo(cloneSourceInfo) {
    var sourceInfoArray = cloneSourceInfo.slice(8, -1).split(" ");
    return {
        'file': sourceInfoArray[0].slice(6, -1),
        'startLine': sourceInfoArray[1].slice(11, -1),
        'endLine': sourceInfoArray[2].slice(9, -1),
        'pcid': sourceInfoArray[3].slice(6, -1)
    };
}