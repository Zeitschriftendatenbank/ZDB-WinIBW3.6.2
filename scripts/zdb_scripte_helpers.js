// Datei:			zdb_scripte_helpers.js
// Autor:			Carsten Klee (ZDB)
//
var messageBoxHeader = "Header";
//--------------------------------------------------------------------------------------------------------
//name:		__zdbGetRecord
//calls:		__zdbCheckKurztitelAuswahl, __zdbGetExpansionFromP3VTX, __zdbError
//description:	returns title record in a desired format
//user:	  	internal
//input: 		string format, bool extmode
//return:		string satz: title record
//edited:		2011-12-16
//--------------------------------------------------------------------------------------------------------
function __zdbGetRecord ( format, extmode ) {

    var scr;
    var satz = null;
    scr = application.activeWindow.getVariable("scr");
    if ( (scr == "") || ("#7A#8A#".indexOf(scr) < 0) ) {
    __zdbError("Dieses Skript muss aus der Volldarstellung oder der "
                + "Kurztitelliste aufgreufen werden.");
        return null;
    }
    if ( (format != "P") && (format != "D") ) {
        __zdbError("Funktion getRecord mit falschem Format \"" + format
                    + "\"aufgerufen.\n"
                    + "Bitte wenden Sie sich an Ihre Systembetreuer.");
        return null;
    }
    if (scr == "7A") {
        if (!__zdbCheckKurztitelAuswahl())	return null;
    }
    application.activeWindow.command("show " + format, false);
    if (extmode) {
        satz = __zdbGetExpansionFromP3VTX();
    } else {
        satz = application.activeWindow.copyTitle();
        //satz = satz.replace(/\r/g,"");
    }
    if (scr == "7A")
        application.activeWindow.simulateIBWKey("FE");
    else 
    if (format == "P")
        application.activeWindow.command("show D",false);
    satz = satz + "\n";	
    return satz;
}

//--------------------------------------------------------------------------------------------------------
//name:		__zdbError
//calls:		__zdbMsg
//description:	simplifies __zdbMsg by setting the error msgicon
//user:	  	internal
//input: 		string msgText
//return:		void
//--------------------------------------------------------------------------------------------------------
function __zdbError(msgText) {
    __zdbMsg(msgText,"e");
    return;
}

function __zdbYesNo(msgtxt) {

    var prompter = utility.newPrompter();
    var button;
    button = prompter.confirmEx(messageBoxHeader,msgtxt,
                                    "Ja","Nein",null,null,null);
    //prompter = null;
    return !button;
}


function __zdbMsg(msgText,iconChar) {

    var messageBoxHeader;
    var icon;
    switch (iconChar) {
        case "a":	icon = "alert-icon";
                    messageBoxHeader = "Achtung!"; // cs 15.07.10
                    break;
        case "e":	icon = "error-icon";
                    messageBoxHeader = "Fehler!"; // cs 15.07.10
                    break;
        case "q":	icon = "question-icon";
                    messageBoxHeader = "Frage:"; // cs 15.07.10
                    break;
        default: 	icon = "message-icon";
                    messageBoxHeader = "Meldung!"; // cs 15.07.10
                    break;
    }
        application.messageBox(messageBoxHeader,msgText,icon);
        return;
}


function __zdbCheckKurztitelAuswahl() {

    application.activeWindow.simulateIBWKey("FR");
    if (__zdbYesNo("Sie haben das Skript aus der Kurztitelliste aufgerufen.\n"
                + "Zur Sicherheit:\n\n"
                + "Ist dies der gewünschte Datensatz?"))		return true;
    //application.activeWindow.simulateIBWKey("FE");
    return false;
}


function __zdbGetExpansionFromP3VTX() {

    satz = application.activeWindow.getVariable("P3VTX");
    satz = satz.replace("<ISBD><TABLE>","");
    satz = satz.replace("<\/TABLE>","");
    satz = satz.replace(/<BR>/g,"\n");
    satz = satz.replace(/^$/gm,"");
    satz = satz.replace(/^Eingabe:.*$/gm,"");
    satz = satz.replace(/<a[^<]*>/gm,"");
    satz = satz.replace(/<\/a>/gm,"");

    return satz;
}

function __zdbArrayUnique(a) {

    var r = new Array();
    o:for(var i = 0, n = a.length; i < n; i++)
    {
            for(var x = 0, y = r.length; x < y; x++)
            {
                if(r[x]==a[i]) continue o;
            }
            r[r.length] = a[i];
    }
    return r;
}

//--------------------------------------------------------------------------------------------------------
//name:		__zdbGetTag
//replaces:		__zdbGetTag
//calls:		__kategorieInhalt
//description:	simplifies __kategorieInhalt by copy the title an leaving the tag out
//user:	  	all users
//input: 		string tag
//return:		value of the tagline
//author: 		Carsten Klee
//date:		2010-09-10
//version:		1.0.0.0
//--------------------------------------------------------------------------------------------------------

function __zdbGetTag(tag){
    return __kategorieInhalt(application.activeWindow.copyTitle(), tag, false);
}
//--------------------------------------------------------------------------------------------------------
//name:		__zdbClipTag
//replaces:		__zdbClipTag
//calls:		__zdbGetTag
//description:	same as __zdbGetTag but puts the tagline value into the clipboard
//user:	  	all users
//input: 		string tag
//return:		Clipboard contains value of the tagline
//author: 		Carsten Klee
//date:		2010-09-10
//version:		1.0.0.0
//--------------------------------------------------------------------------------------------------------

function __zdbClipTag(tag){
    application.activeWindow.clipboard = __zdbGetTag(tag);
    return;
}

//--------------------------------------------------------------------------------------------------------
//name:		__zdbGetZDB
//description:	returning the zdb-id for the active title or a given idn
// calls		__zdbGetRecord; __zdbError; __kategorieInhalt; __zdbWorkWindow
//user:	  	internal
//input: 		idn (optional)
//return:		ZDB ID
//author: 		Carsten Klee
//date:		2012-02-02
//--------------------------------------------------------------------------------------------------------

function __zdbGetZDB(idn) {
    var zdbid;
    if(idn != null) // get zdb id of a dirrerent title in a work window
    {
        var myWindowId = __zdbOpenWorkWindow();
        application.activeWindow.commandLine("\zoe idn "+idn);
    }
    var strScreen = application.activeWindow.getVariable("scr");
    // Korrekturmodus
    if (strScreen == "MT")
    {
        zdbid = application.activeWindow.title.findTag("2110",0,false,false,true);
    } 
    else if("#7A#8A#".indexOf(strScreen) < 0) 
    {
        return false;
    } 
    else 
    {
        var satz = __zdbGetRecord("D",false);
        zdbid = __kategorieInhalt(satz, "2110", false);
    }
    if(idn != null) // close work window and return to old
    {
        __zdbCloseWorkWindow(myWindowId);
    }	
    return zdbid;
}
//--------------------------------------------------------------------------------------------------------
//name:		__zdbOpenWorkWindow
//description:	opens a new window for temporary works
//user:	  	internal
//input: 		none
// return		the old window id to return later
//author: 		Carsten Klee
//date:		2012-02-02
//--------------------------------------------------------------------------------------------------------
function __zdbOpenWorkWindow(){
    var myWindowId = application.activeWindow.windowID;
    application.newWindow();
    return myWindowId;
}
//--------------------------------------------------------------------------------------------------------
//name:		__zdbCloseWorkWindow
//description:	closes the window for temporary works and return to the old one
//user:	  	internal
//input: 		none
//author: 		Carsten Klee
//date:		2012-02-02
//--------------------------------------------------------------------------------------------------------
function __zdbCloseWorkWindow(myWindowId){
    if(myWindowId == null) return false;
    application.activeWindow.close();
    application.activateWindow(myWindowId);
    return;
}

//--------------------------------------------------------------------------------------------------------
//name:		__zdbEResource
//calls:		__zdbEResource4060
// called by:	db_Digitalisierung; zdb_Parallelausgabe
//description:	Kategorie 4000: falls 4005 nicht vorhanden, Text "[[Elektronische Ressource]]" anfügen
//			Kategorie 4005: falls vorhanden, Text "[[Elektronische Ressource]]" anfügen
//user:	  	all users
//author: 		Carsten Klee
//date:		2012-11-06
//version:		1.0.0.0
//--------------------------------------------------------------------------------------------------------

function __zdbEResource(){
    // Kategorie 4000: falls 4005 nicht vorhanden, Text "[[Elektronische Ressource]]" anfügen
    if (application.activeWindow.title.findTag("4005", 0, false, true, true) == "") {
        var f4000 = application.activeWindow.title.findTag("4000", 0, true, true, false);
        if (f4000.indexOf(" // ") !== -1) {
            application.activeWindow.title.endOfField(false);
        } else if (f4000.indexOf(" : ") !== -1) {
            application.activeWindow.title.startOfField(false);
            application.activeWindow.title.charRight(f4000.indexOf(" : "), false);
        } else if (f4000.indexOf(" = ") !== -1) {
            application.activeWindow.title.startOfField(false);
            application.activeWindow.title.charRight(f4000.indexOf(" = "), false);
        } else if (f4000.indexOf(" / ") !== -1) {
            application.activeWindow.title.startOfField(false);
            application.activeWindow.title.charRight(f4000.indexOf(" / "), false);
        } else {
            application.activeWindow.title.findTag("4000", 0, true, true, false)
            application.activeWindow.title.endOfField(false);
        }
        application.activeWindow.title.insertText(" [[Elektronische Ressource]]");
        __zdbEResource4060();
        return;

    // Kategorie 4005: falls vorhanden, Text "[[Elektronische Ressource]]" anfügen
    } else {
        var f4005 = application.activeWindow.title.findTag("4005", 0, true, true, false);
        if (f4005.indexOf(" // ") !== -1) {
            application.activeWindow.title.endOfField(false);
        } else if (f4005.indexOf(" : ") !== -1) {
            application.activeWindow.title.startOfField(false);
            application.activeWindow.title.charRight(f4005.indexOf(" : "), false);
        } else if (f4005.indexOf(" = ") !== -1) {
            application.activeWindow.title.startOfField(false);
            application.activeWindow.title.charRight(f4005.indexOf(" = "), false);
        } else if (f4005.indexOf(" / ") !== -1) {
            application.activeWindow.title.startOfField(false);
            application.activeWindow.title.charRight(f4005.indexOf(" / "), false);
        } else {
            application.activeWindow.title.findTag("4005", 0, true, true, false)
            application.activeWindow.title.endOfField(false);
        }
        application.activeWindow.title.insertText(" [[Elektronische Ressource]]");
        __zdbEResource4060();
        return;
    }
}
//--------------------------------------------------------------------------------------------------------
//name:		__zdbEResource4060
// called by:	__zdbEResource
//description:	 Kategorie 4060: falls Feld vorhanden, wird Inhalt mit Text "Online-Ressource" überschrieben
//			   falls Feld nicht vorhanden, wird es angelegt und mit Text "Online-Ressource" befüllt
//user:	  	all users
//author: 		Carsten Klee
//date:		2012-11-06
//version:		1.0.0.0
//--------------------------------------------------------------------------------------------------------
function __zdbEResource4060(){
    // Kategorie 4060: falls Feld vorhanden, wird Inhalt mit Text "Online-Ressource" überschrieben
    //			   falls Feld nicht vorhanden, wird es angelegt und mit Text "Online-Ressource" befüllt
    if (application.activeWindow.title.findTag("4060", 0, false, true, true) != "") {
        application.activeWindow.title.insertText("Online-Ressource\n");
    } else {
        application.activeWindow.title.endOfBuffer(false);
        application.activeWindow.title.insertText("4060 Online-Ressource\n");
    }
    return;
}

//--------------------------------------------------------------------------------------------------------
//name:		__zdbGetParallel
//description:	Liefert ein Objekt über die Parallelausgaben zurueck
//user:	  	all users
//author: 		Carsten Klee
//date:		2014-03-24
//--------------------------------------------------------------------------------------------------------

function __zdbGetParallel()
{
    var tag, content,regex,matches;
    var contents = new Array();
    var i = 0;
    var vortext = /Online-Ausg|Druckaus/;
    var parallel = new Object();

    if("MT" == application.activeWindow.getVariable("scr"))
    {
        if(application.activeWindow.getVariable("P3GDB").match(/P|PA/i))
        {
            tag = "039D";
            regex =  new RegExp(delimiterReg+"a([^"+delimiterReg+"]*)"+delimiterReg+"9([^"+delimiterReg+"]*)");
        }
        else if(application.activeWindow.getVariable("P3GDB").match(/D|DA/i))
        {
            tag = "4243";
            regex = /([^!]*)!([^!]*)/;
        }
        while((content = application.activeWindow.title.findTag(tag,i,false,false,false)) != "")
        {
            contents[i] = content;
            content = "";
            i++;
        }
    }
    else if("8A" == application.activeWindow.getVariable("scr"))
    {
        if(application.activeWindow.getVariable("P3GDL").match(/P|PA/i))
        {
            tag = "039D";
            regex = new RegExp(delimiterReg+"a([^"+delimiterReg+"]*)"+delimiterReg+"9([^"+delimiterReg+"]*)");
        }
        else if(application.activeWindow.getVariable("P3GDL").match(/D|DA/i))
        {
            tag = "4243";
            regex = /([^!]*)!([^!]*)/;
        }
        while((content = application.activeWindow.findTagContent(tag,i,false)) != "")
        {
            contents[i] = content;
            content = "";
            i++;
        }
    }
    else
    {
        return false;
    }
    
    for(var x = 0; x < contents.length; x++)
    {
        if(vortext.test(contents[x]))
        {
            matches = regex.exec(contents[x]);
            parallel[x] = {votext:matches[1],idn:matches[2]};
        }
    }
    return (parallel[0]) ? parallel : false;
}

//--------------------------------------------------------------------------------------------------------
//name:		__zeigeEigenschaften
//replaces:		zeigeEigenschaften
//description:	listing a objects properties
//user:	  	developers
//input: 		the object
//return:		messageBox with all properties
//author: 		Carsten Klee
//date:		2011-06-24
//version:		1.0.0.1
//--------------------------------------------------------------------------------------------------------

function __zeigeEigenschaften(object){
	var Namen = new Array();
	var namen = "";
	var type;
	// make a properties list for the prompter
	//for(var name in object) namen += name + "\n";
	for(var name in object) Namen.push(name);
	
	// get out if objects count zero prperties
	if (Namen.length == 0)
	{
		application.messageBox("Länge des Objekts", "Das Objekt hat " + Namen.length + " Eigenschaften.", false);
		return;
	}
	Namen.sort();
	namen = Namen.join("\n");

	// initialize the prompter
	var thePrompter = utility.newPrompter();
	thePrompter.setDebug(true); // only for debugging
	
	// get the selection as string
	var theAnswer = thePrompter.select("Eigenschaften von " + object, "Zeige Eigenschaften von", namen);
	// return if nothing have been selected
	if (!theAnswer) {
		return;	
	} else {
		// eval the answer as an object
		var newObject = eval(object[theAnswer]);
		type = typeof newObject;
		application.messageBox("Typ des Objects", type, false);
		if(type == "object"){
			__zeigeEigenschaften(newObject);
		}
		try {
			if(type == "function")
			{
				application.messageBox("Eigenschaften",newObject.toString() + "\nWeitere Eigenschaften anzeigen?",false);
				__zeigeEigenschaften(newObject);
				return;
			}
			else // strings, integers
			{
				application.messageBox("Eigenschaften", newObject.toString(), false);
			}
		}
		catch(exception)
		{
			application.messageBox("Fehler",exception,false);
		} 
		finally
		{
			return;
		}
	}
}

/**
 * zählt Exemplardatensätze
 * 
 * @return int|null
 */ 
function __exemplareAnzahl()
{
    var strTitle =  application.activeWindow.copyTitle();
    var regexpExe = /\n(70[0-9][0-9])/g;
    var alleExe = new Array();
    alleExe = strTitle.match(regexpExe);
    //application.messageBox("", alleExe.length, "message-icon");
    return (!alleExe) ? null : alleExe.length;
}

/**
* iteriert durch Exemplare und ruft für jedes Exemplar eine Funktion auf
*/
function __iterateExemplare(callback)
{
    var exCount = __exemplareAnzahl();
    for(var i = 1; i <= exCount; i++)
    {
        callback(i);
    }
}