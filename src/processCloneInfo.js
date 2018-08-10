import _ from 'lodash';

export default function(cloneInfoXML) {

    var XMLLineArray = cloneInfoXML.split("\n");

    var cloneData = {
        classes: [],
        sources: [],
        information: {}
    };

    var uniqueSourceArray = [];
    var uniqueSourceCollection = {};

    // Local function with access to cloneData 
    function stratifySource(sourcePath, classId) {
        _.reduce(sourcePath.split("/"), function(previousPath, pathSnippet) {
            previousPath += previousPath ? "/" + pathSnippet : pathSnippet;
            if (!(uniqueSourceArray.indexOf(previousPath) > -1)) {
                uniqueSourceArray.push(previousPath);
                uniqueSourceCollection["'" + previousPath + "'"] = [classId];
            } else {
                uniqueSourceCollection["'" + previousPath + "'"].push(classId);
            }
            return previousPath;
        }, '');
    }

    // Start processing Line by Line 
    var tempClassStore = {};
    var tempSourceStore = {};
    var buffer = [];
    var shouldStoreInBuffer = false;
    var iterator = 0;
    var classIterator = 0;

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
            var sourceIndex = cloneData.sources.push(_.clone(tempSourceStore)) - 1;
            stratifySource(tempSourceStore.id, classIterator);
            tempClassStore.sources.push(sourceIndex);
            buffer = [];
        }
        // For end of class tag push the classStore into the array and clear it
        else if (line == '</class>') {
            cloneData.classes.push(_.clone(tempClassStore));
            classIterator += 1;
        } else if (line.indexOf('<systeminfo') > -1) {
            cloneData.information = processCloneSystemInfo(line);
        } else if (shouldStoreInBuffer) {
            buffer.push(line);
        }
        // increment iterator to go to the next line
        iterator += 1;
    }

    // Sort the unique sourceArray based on the file path length
    cloneData.uniqueSourceArray = uniqueSourceArray.sort(function(a, b) { return b.length - a.length; });
    // Remove duplicates for each entry 
    cloneData.uniqueSourceCollection = _.each(uniqueSourceCollection, function(path, key) { uniqueSourceCollection[key] = _.uniq(path); });
    // Find the file that has the maximum no of clone classes attached to it 
    cloneData.maxSourceCloneClassesPerFile = _.reduce(uniqueSourceArray, function(max, filePath) {
        if (/^.+\.(cs|java|c|py)$/.test(filePath) && uniqueSourceCollection["'" + filePath + "'"].length > max.count) {
            return {
                'path': filePath,
                'count': uniqueSourceCollection["'" + filePath + "'"].length
            };
        } else { return max; }
    }, { 'count': uniqueSourceCollection["'" + uniqueSourceArray[0] + "'"].length, 'path': uniqueSourceArray[0] });

    return cloneData;
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

    // For C and C# files have an extra addition to the name that must be sliced out 
    var filePath = sourceInfoArray[0].slice(6, -1);
    if (filePath.indexOf(".ifdefed") > -1) {
        filePath = filePath.slice(0, -8);
    }

    return {
        'id': filePath,
        'startLine': sourceInfoArray[1].slice(11, -1),
        'endLine': sourceInfoArray[2].slice(9, -1),
        'pcid': sourceInfoArray[3].slice(6, -1)
    };
}

function processCloneSystemInfo(line) {

    var systemInfo = line.slice(12, -2).split(" ");

    return {
        "processor": systemInfo[0].split("=")[1].slice(1, -1) || 'nicad',
        "system": systemInfo[1].split("=")[1].slice(1, -1) || '',
        "granularity": systemInfo[2].split("=")[1].slice(1, -1) || '',
        "threshold": systemInfo[3].split("=")[1].slice(1, -1) || ''
    };
}