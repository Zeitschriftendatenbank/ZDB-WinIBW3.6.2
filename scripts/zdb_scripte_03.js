// Datei:		zdb_scripte_03.js
/**
 * checks if a user script file is already configured . If not a file is created and path configured
 * this function is called on startup
 * */
 __enableUserScriptFile();
function __enableUserScriptFile(){
	var loadandSave = application.getProfileString("ibw.userscript.location","loadandSave","");
	if(loadandSave == "")
	{
		var language = application.getProfileString("ibw.userscript","language","JS").toLowerCase();
		var theOutput = utility.newFileOutput();
		var fileOutput = theOutput.createSpecial("ProfD", "winibw." + language);
		theOutput.close();
	}
}
