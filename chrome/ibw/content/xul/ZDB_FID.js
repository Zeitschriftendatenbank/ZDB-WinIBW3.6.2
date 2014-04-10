var application = Components.classes["@oclcpica.nl/kitabapplication;1"]
					.getService(Components.interfaces.IApplication);

// get params from open_xul_dialog()
var params = this.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock);

var theDir;

const utility = 
{
	newFileInput: function() {
		return Components.classes["@oclcpica.nl/scriptinputfile;1"]
								.createInstance(Components.interfaces.IInputTextFile);
	},

     newFileOutput: function() {
        return Components.classes["@oclcpica.nl/scriptoutputfile;1"]
                                 .createInstance(Components.interfaces.IOutputTextFile);
	},

	newPrompter: function() {
         return Components.classes["@oclcpica.nl/scriptpromptutility;1"]
                                   .createInstance(Components.interfaces.IPromptUtilities);
   }
};

function fidOnCancel()
{
	params.SetString(1, "cancel");
	return true;
}

function fidOnAccept(){
    //__zeigeEigenschaften(theDir);
    //alert(theDir.path);
    var theList = document.getElementById('idFileListMenu');
	// push filename to params for later use
	pushToParams(theDir.path +"\\"+theList.value, 1);
	var strDelimiter = document.getElementById('delimiter');
	// push the delimiter to params for later use
	pushToParams(strDelimiter.value, 2);
	var theStart = document.getElementById('sZeile');
	// push the start line number to params for later use
	pushToParams(theStart.value, 3);
    var theId = document.getElementById('idSpalte');
	// push the start line number to params for later use
	pushToParams(theId.value, 4);
	return true;

}

function pushToParams(key, num){
	params.SetString(num, key);
}


//----------------------------------------------------------------------------
function getSpecialDirectory(name)
{
	const nsIProperties = Components.interfaces.nsIProperties;
    var dirService = Components.classes["@mozilla.org/file/directory_service;1"]
    					.getService(nsIProperties);
    
    return dirService.get(name, Components.interfaces.nsIFile);
}
//----------------------------------------------------------------------------


//----------------------------------------------------------------------------
function loadFiles()
{
	try {

		//document.getElementById('delimit').value = this.arguments[0].QueryInterface(Components.interfaces.nsIDialogParamBlock).GetString(0);
		
		//params.SetString(1, "out");
		var arNames = new Array(); // Array to store the names of the files in
		// Get the user's csv files:
		theDir = getSpecialDirectory("ProfD");
		theDir.append("csv");
		if (theDir.exists()) {
			theDirEnum = theDir.directoryEntries;
			while (theDirEnum.hasMoreElements()) {
				var theItem = theDirEnum.getNext();
				var theFile = theItem.QueryInterface(Components.interfaces.nsIFile);
				if (theFile.isFile()) {
					for (found = false, i = 0; (i < arNames.length) && !found; i++) {
						found = (arNames[i] == theFile.leafName);
					}
					if (!found) arNames.push(theFile.leafName);
				}
			}
		} else {
			alert('Der Ordner '+ theDir + ' existiert nicht.');
		}
		arNames.sort();
		var theFileList = document.getElementById("idFileList");
		for (i = 0; i < arNames.length; i++) {
			var theEle = document.createElement("menuitem");
			theEle.setAttribute("label", arNames[i]);
			theEle.setAttribute("value", arNames[i]);
			theFileList.appendChild(theEle);
		}

		document.getElementById("idFileListMenu").selectedIndex = 0;
		arNames = null;
        return;
	} catch(e) { alert('loadFiles: '+ e.name + ': ' + e.message); }
}