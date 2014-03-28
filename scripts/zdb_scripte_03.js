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

function zdbFID(){
    const params = Components.classes["@mozilla.org/embedcomp/dialogparam;1"]
    .createInstance(Components.interfaces.nsIDialogParamBlock);
    params.SetNumberStrings(5);
    params.SetString(0,"pa");
    open_xul_dialog("chrome://ibw/content/xul/ZDB_FID.xul", null,params);
    // on cancel
    if(params.GetString(1) == "cancel") {
        return;
    }
    
    var csv = new CSV();
    var file = params.GetString(1);
    csv.delimiter = params.GetString(2);
    var start = parseInt(params.GetString(3));
    var zdbid = parseInt(params.GetString(4));
    zdbid = zdbid-1;
    params = null;
    var lineArray;
    var zdbids = new Array();
    
    // load file object
	var theFileInput = utility.newFileInput();
	if (!theFileInput.open(file))
    {
        alert("Datei " + file + " wurde nicht gefunden.");
        return false;
	}
    var prompter = utility.newPrompter();
    if(prompter.confirm("Set erstellen","Erstelle ein Set anhand der Datei " + file+ ". Melde mich wieder, wenn ich fertig bin."))
    {
        // read the start line
        var aLine = "";
        var i = 1;
        var x = 0;
        while( (aLine = theFileInput.readLine()) != null)
        {
            if("" == aLine) continue;
            if(start <= i)
            {
                lineArray = csv.__csvToArray(aLine);
                zdbids[x] = lineArray[zdbid];
                x++;
            }
            i++;
        }
        theFileInput.close();
        
        application.activeWindow.command("del s0",false);
        var parallel = new Array();
        for(var y = 0; y < zdbids.length; y++)
        {
            application.activeWindow.command("f zdb " + zdbids[y],false);
            var tinumber = application.activeWindow.getVariable("P3GTI");
            application.activeWindow.command("sav " + tinumber,false);
            if(parallel = __zdbGetParallel())
            {
            
                for(var o in parallel)
                {
                    application.activeWindow.command("f idn " + parallel[o].idn,false);
                    var tinumber = application.activeWindow.getVariable("P3GTI");
                    application.activeWindow.command("sav " + tinumber,false);
                }
            }
        }
        application.activeWindow.command("s s0",false);
        if(prompter.confirm("Set erstellt","Fertig! Habe Set erstellt. Soll das Excel-Skript zum Download geöffnet werden?"))
        {
            var xulFeatures = "centerscreen, chrome, close, titlebar,modal=no,dependent=yes, dialog=yes";
            open_xul_dialog("chrome://ibw/content/xul/ZDB_excelFID_dialog.xul", xulFeatures,params);
        }
    }
    else
    {
        prompter.alert("Abbruch","Habe Vorgang abgebrochen.")
    }
    
}

function csvBatchTitel()
{
	var csv = new CSV();
	csv.__csvBatchTitle = function ()
	{
		var codes = "";
		var fields = new Array("0600","0601");
		var values = new Array(csv.code,csv.isil);
		application.activeWindow.command("k", false);
		for(var f in fields){
			// we don't want empty fields
			if(fields[f] != "") 
			{
				//	check if field alredy exists
					if((codes = application.activeWindow.title.findTag(fields[f], 0, false, true, false)) == false)
					{
				//		move cursor to the end of the buffer
						application.activeWindow.title.endOfBuffer(false);
				//		insert a new field with the params value
						application.activeWindow.title.insertText(fields[f] + " " + values[f] + "\n");
				//	field does already exist		
					}
					else
					{
						var codeFalse = 0;
						// check field  if code is already in it
						var code = codes.split(";");
						for(var y in code){
							if(code[y].replace (/^\s+/, '').replace (/\s+$/, '') == values[f].replace (/^\s+/, '').replace (/\s+$/, '')){ // replace leading an following whitespaces
								csv.__csvLOG("Zeichenkette " + values[f] + " war schon im Feld " + fields[f] + " vorhanden.");
								codeFalse = 1;
							}
						}
						// if code is not already in field
						if(codeFalse == 0) {
							application.activeWindow.title.endOfField(false);
						//		insert params value
									
							application.activeWindow.title.insertText(";" + values[f]);
						}
					}
			} 
			else
			{
				//do nothing
			}
		}
		//			save buffer		
			return csv.__csvSaveBuffer(true,"hinzugefuegt " + values[f]);
	}
	
	csv.__csvSetProperties(csv.__csvBatchTitle,["","ZDB-ID"],'ZDB-ID','zdb',false,"ZDB_LOG.txt");
	try
	{
		csv.__csvConfig();
		csv.__csvBatch();
	} 
	catch(e)
	{
		csv.__csvError(e);
	}
}
