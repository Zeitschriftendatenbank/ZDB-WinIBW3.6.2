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

/*************************************************************************
 * 		GBV Hilfsfunktionen
 * ************************************************************************/

function __inputBox(ttl,txt,dflt) {
/* Die interne Funktion oeffnet eine Input-Box und gibt den eingegebenen Wert zurück.
Mit Parameter ttl kann der Text fuer die Titelzeile der Eingabebox uebergeben werden. 
Parameter txt enthaelt den Text der Input-Box und mit dflt kann ein Default-Wert definiert werden.
Historie:
2010-08-09 Stefan Grund (DNB): erstellt
2011-02-02 umbenannt in inputBox
2012-11-12 umbenannt in __inputBox
*/
	var prompter = utility.newPrompter();
	var msg;
	msg = prompter.prompt(ttl,txt,dflt,null,null);
	if (msg == 1)	msg = prompter.getEditValue();
	else			msg = null;
	return msg;
}

function __fensterWechsel()
{
	/*Prüfung ob zwei Fenster, wechselt von einem zum anderen
	Rückgabewert: Variable System
	Funktionsaufruf: 	__fensterWechsel();
	Funktionsaufruf mit Prüfung: 
		var strSystemNeu = __fensterWechsel();
		if (strSystemNeu != "ACQ" && strSystemNeu != "OUS" && strSystemNeu != "OWC"){
	*/
	var fensterAnzahl = application.windows.count;
	var fensterId = new Array();
		
	if (fensterAnzahl != 2) {
		__meldung("Sie haben " + fensterAnzahl + " Fenster geöffnet. Es müssen genau 2 sein.");
		return "";
	}
	
	for (var i=0; i<fensterAnzahl; i++) {
		//beide Ids:
		fensterId[i] = application.windows.item(i).windowID;
	}
	//__meldung("System: " + strSystem + "\naktuell: " + application.activeWindow.windowID + "\n0: " + fensterId[0] + "\n1: " + fensterId[1]);
	
	//öffne das andere Fenster:
	if (application.activeWindow.windowID == fensterId[0]) {
		application.activateWindow(fensterId[1]);
	} else {application.activateWindow(fensterId[0]);
	}
	return application.activeWindow.getVariable("system");
}
//--------------------------------------------------------------------------------------------------------
//name:		__stringTrim
//description:	trimms a string from leading and ending whitespaces
//user:	  	internal
//input: 		String to Trim
//author: 		Karen Hachmann
// original:		stringTrim aus gbv_public.js
//2012-11-12	 umbenannt in ____stringTrim
//--------------------------------------------------------------------------------------------------------
function __stringTrim(meinString)
{
	//Blanks am Anfang
	while (meinString.charAt(0) == " "){
		meinString = meinString.substring(1)
	}
	//Blanks am Ende
	while (meinString.charAt(meinString.length-1) == " "){
		meinString = meinString.substring(0, meinString.length-1)
	}
	return meinString;
}


function __datum()
{	
	//Form: JJJJ.MM.TT
	var heute = new Date();
	
	var strMonat = heute.getMonth();
	strMonat = strMonat + 1;
	if (strMonat <10){strMonat = "0" + strMonat};
	
	var strTag = heute.getDate();
	if (strTag <10){strTag = "0" + strTag}; 
	
	var datum = heute.getFullYear() + "." + strMonat + "." + strTag;
	return datum;
}

function __datumTTMMJJJJ()
{	
	//Form: JJJJ.MM.TT
	var heute = new Date();
	
	var strMonat = heute.getMonth();
	strMonat = strMonat + 1;
	if (strMonat <10){strMonat = "0" + strMonat};
	
	var strTag = heute.getDate();
	if (strTag <10){strTag = "0" + strTag}; 
	
	var datum = strTag + "." + strMonat + "." + heute.getFullYear();
	return datum;
}

function __datumUhrzeit()
{
	//das Datum und die Uhrzeit wird Bestandteil des Dateinamens
	var jetzt = new Date();
	var jahr = jetzt.getFullYear();
	
	var monat = jetzt.getMonth();
	monat = monat + 1;
	if (monat <10){monat = "0" + monat};
	
	var strTag = jetzt.getDate();
	if (strTag <10){strTag = "0" + strTag}; 
	
	var stunde = jetzt.getHours();
	if (stunde <10){stunde = "0" + stunde};
	
	var minute = jetzt.getMinutes();
	if (minute <10){minute = "0" + minute};
	
	var sekunde = jetzt.getSeconds();
	if (sekunde <10){sekunde = "0" + sekunde};
	
	return jahr + monat + strTag + stunde + minute + sekunde;
}

function __alleMeldungen()
{
	var msgAnzahl, msgText, msgType;
	var i;
	var alleMeldungen = "";
	msgAnzahl = application.activeWindow.messages.count;
	for (i=0; i<msgAnzahl; i++)	
	{
		msgText = application.activeWindow.messages.item(i).text;
		msgType = application.activeWindow.messages.item(i).type;
		alleMeldungen += msgText + "\n";
	}
	//application.messageBox("Bitte beachten Sie die Meldungen!", alleMeldungen, "message-icon");
	return alleMeldungen;
}

function __formatD()
{
	//Präsentationsformat prüfen und auf "D" umstellen
	if (application.activeWindow.getVariable("P3GPR") != "D") {
		application.activeWindow.command ("\\too d", false);
	}

}

function __screenID(){
	return application.activeWindow.getVariable("scr");
}

function __matCode(){
	return application.activeWindow.materialCode;
}

function __matCode1(){
	//0500, 005 1. Position
	return application.activeWindow.materialCode.charAt(0);
}
function __matCode2(){
	//0500, 005 2. Position
	return application.activeWindow.materialCode.charAt(1);
}
function __matCode3(){
	//0500, 005 3. Position
	return application.activeWindow.materialCode.charAt(2);
}

function __docType(){
	//funktioniert nur im title-edit-control!
	//Bei Neuaufnahmen kann application.activeWindow.materialCode nicht verwendet werden
	//weil kein Rückgabewert.
	var str0500 = application.activeWindow.title.findTag("0500", 0, false, false, true);
	if (str0500 != ""){
		return str0500;
	} else {
		return application.activeWindow.title.findTag("005", 0, false, false, true)
		}
}
// ------- MessageBoxen GBV --------

function __warnung(meldungstext)
{
	application.messageBox("Warnung", meldungstext, "alert-icon");
}
function __fehler(meldungstext)
{
	application.messageBox("Fehler", meldungstext, "error-icon");
}

function __meldung(meldungstext)
{
	application.messageBox("Hinweis", meldungstext, "message-icon");
}
function __frage(meldungstext)
{
	application.messageBox("Frage", meldungstext, "question-icon");
}
// ------- Ende MessageBoxen GBV --------

function __ppnPruefung(zeile)
{
	//kommt im String ein PPN-Link vor?
	var regExpPPN = /!(\d{8}[\d|x|X])!/;
	if (regExpPPN.test(zeile) == true){
		regExpPPN.exec(zeile);
		return RegExp.$1;
	} else {return "";}
}

function __alleZeilenArray()
{
	//gibt alle Zeilen des in der Vollanzeige befindlichen Datensatzes als Array aus.
	var zeilen = application.activeWindow.copyTitle().split("\r\n");
	return zeilen;
}

//----------------------------------------------------------
//Beide Funktionen gehören zusammen!
function __loescheBisKategorieEnde()
{
	//Im WinIBW3-Menü 'Bearbeiten', Menübefehl 'Lösche bis Ende der Kategorie', Strg+E
	if (!application.activeWindow.title) {
	return false;
	}
}
function loescheBisKategorieEnde()
{
	//steht nur zur Verfügung, wenn __loescheBisKategorieEnde() nicht false
	application.activeWindow.title.deleteToEndOfLine();
}
//----------------------------------------------------------
//Beide Funktionen gehören zusammen!
function __loescheKategorie()
{
	//Im WinIBW3-Menü 'Bearbeiten', Menübefehl 'Lösche Kategorie', Stry+Y
	if (!application.activeWindow.title) {
	return false;
	}
}
function loescheKategorie()
{
	//steht nur zur Verfügung, wenn __loescheKategorie() nicht false
	application.activeWindow.title.deleteLine(1);
}


function __kategorieInhalt(strTitle, kategorie, bPlus)
{
	/*Ermitteln von Kategorien aus der Vollanzeige (nicht Korrekturstatus!)
	Kategorie + Inhalt werden ausgegeben
	In strTitle muss der kopierte Datensatz übergeben werden
	In kategorie muss die gesuchte Kategorie genannt werden
	Mit bPlus wird festgelegt, ob Ausgabewert mit Kategorie (true) oder ohne Kategorie (false) 
	Funktionsaufruf: __kategorieInhalt(strTitle, "4000", true)
	auch Pica+ möglich: __kategorieInhalt(strTitle, "209A", true);
	*/
	var strKategorie, strKategoriePlus;
	var zeilen = strTitle.split("\r\n");
	var laenge = kategorie.length;
	var i;
	for (i=0; i<zeilen.length; i++){
		if (zeilen[i].substring(0,laenge) == kategorie) {
			strKategoriePlus = zeilen[i];
			strKategorie = zeilen[i].substring(laenge+1);
			break;
		} else {
			strKategoriePlus= "";
			strKategorie = "";
		}
	}
	//Rückgabewert mit Kategorie oder ohne?
	if (bPlus == true){
		return strKategoriePlus;
		} else {
			return strKategorie
		}
}
//--------------------------------------------------------------------------------------------------------
//name:		__kategorieAnalysePlus
//description:	???
//user:	  	internal
//input: 		??
//author: 		Karen Hachmann
// original:		kategorieAnalysePlus aus gbv_public.js
//2012-11-12	 umbenannt in __kategorieAnalysePlus
//--------------------------------------------------------------------------------------------------------
function __kategorieAnalysePlus(zeile, strFeld)
{
	/*
	Erhält einzelne Zeilen und ermittelt den Inhalt des Unterfeldes
	u192 = $
	*/
	var analysePlus = "";
	var lPos1 = zeile.indexOf("\u0192" + strFeld);
	
	if (lPos1 != -1) {
		analysePlus = zeile.substring(lPos1+2);
		var lPos2 = analysePlus.indexOf("\u0192"); //Beginn des nächsten Unterfeldes
		if (lPos2 != -1){ 
			analysePlus = analysePlus.substring(0, lPos2);
		}
	}
	return analysePlus;
}
//--------------------------------------------------------------------------------------------------------
//name:		__kategorienLoeschen
//Ersatz für title.ttl in Sonderfällen:
//Beispiel Funktionsaufruf: (Alle) Kategorie(n) in einem gemeinsamen String:
//kategorienLoeschen("2150|4201|4730|4731|5060|5065|5545|5587|5588|5589");
//Aus dem eingehenden Parameter wird ein Array gebildet:
//input: 		Kategorien getrennt mit |
//author: 		Karen Hachmann
// original:		kategorienLoeschen aus gbv_public.js
//2012-11-12	 umbenannt in __kategorienLoeschen
//--------------------------------------------------------------------------------------------------------
function __kategorienLoeschen(kategorien)
{
	kategorien = kategorien.split("|");
	//im Titleedit-Schirm: jedes Vorkommnis jeder im Array befindlichen Kategorie wird gelöscht 
	for (var i = 0; i < kategorien.length; i++){
		while (application.activeWindow.title.findTag(kategorien[i], 0, true, true, false) != ""){
			application.activeWindow.title.deleteLine(1);
		}
	}
}
//--------------------------------------------------------------------------------------------------------
//name:		__kategorienSammeln
//description:	???
//user:	  	internal
//input: 		??
//author: 		Karen Hachmann
// original:		kategorienSammeln aus gbv_public.js
//2012-11-12	 umbenannt in __kategorienSammeln
//--------------------------------------------------------------------------------------------------------
function __kategorienSammeln(kategorien){
	var i, n;
	var rueckgabe = "";
	var strSuche = "";
	kategorien = kategorien.split("|");
	//im Titleedit-Schirm: jedes Vorkommnis jeder im Array befindlichen Kategorie wird gesucht
	for (i = 0; i < kategorien.length; i++){
		n = 0;
		do {
			strSuche = application.activeWindow.title.findTag(kategorien[i], n, true, true, false);
			if (strSuche != "") {
				rueckgabe = rueckgabe + "\n" + strSuche;
			}
			n++;
		} while (strSuche != "")
	}
	return rueckgabe;
}

function __kat70xxDatumLoeschen()
{
	var str70xx;
	for (var kat = 7001; kat <= 7099; kat++){
		str70xx = application.activeWindow.title.findTag(kat, 0, true, true, false);
		if (str70xx != ""){
			application.activeWindow.title.startOfField(false);
			application.activeWindow.title.wordRight(1, false);
			application.activeWindow.title.charRight(11, true);
			application.activeWindow.title.deleteSelection();
		}
	}
}
//--------------------------------------------------------------------------------------------------------
//name:		__loescheZeileAbPosition
//description:	Sucht Kategorie und löscht den Rest der Zeile ab position
//user:	  	internal
//input: 		Kategorie, Position ab der gelöscht werden soll
//author: 		Karen Hachmann
// original:		loescheZeileAbPosition aus gbv_public.js
//2012-11-12	 umbenannt in __loescheZeileAbPosition
//--------------------------------------------------------------------------------------------------------
function __loescheZeileAbPosition(kategorie, position)
{
	//Sucht Kategorie und löscht den Rest der Zeile ab position
	if(application.activeWindow.title.findTag(kategorie, 0, true, true, true) != "")
	{
		application.activeWindow.title.startOfField(false);
		application.activeWindow.title.charRight(position, false);
		application.activeWindow.title.deleteToEndOfLine();
	}
}
