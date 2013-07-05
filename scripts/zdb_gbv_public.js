/*	Datei:	zdb_gbv_public.js
	Autor:	Karen Hachmann, GBV
	edited	ZDB 2013
	Datum:	2006
*/


function getSpecialPath(theDirName, theRelativePath)
{
	//gibt den Pfad als String aus
	const nsIProperties = Components.interfaces.nsIProperties;
	var dirService = Components.classes["@mozilla.org/file/directory_service;1"]
							.getService(nsIProperties);
	var theFile = dirService.get(theDirName, Components.interfaces.nsILocalFile);
	theFile.appendRelativePath(theRelativePath);
	return theFile.path;
}
function getSpecialDirectory(name)
{
	const nsIProperties = Components.interfaces.nsIProperties;
	var dirService = Components.classes["@mozilla.org/file/directory_service;1"].getService(nsIProperties);
	return dirService.get(name, Components.interfaces.nsIFile);
}
//-------------------------------------------------------------------------------
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
function __Materialbenennung()
{
	// Funktion wird von Aaup() und Avu() verwendet, um den Materialcode für 1108 zu ermitteln
	// außerdem beim Anlegen von Aufsätzen
	switch (__matCode1())
	{
		case "B":
			Materialart = "\n1108 Bildtonträger";
			break;
		case "E":
			Materialart = "\n1108 Mikroform";
			break;
		case "G":
			Materialart = "\n1108 Tonträger";
			break;
		case "M":
			Materialart = "\n1108 Musikdruck";
			break;
		case "O":
			Materialart = "\n1108 Elektronische Ressource";
			break;
		case "S":
			Materialart = "\n1108 Elektronische Ressource";
			break;
		case "Z":
			Materialart = "\n1108 "; //hier kann man nicht wissen, welches Material vorliegt
			break;
		default:
			Materialart = "";
	}
	//if (Materialart != "") Materialart = "\n" + Materialart;
	return Materialart;
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
function meldungenInZwischenspeicher()
{
	var strMeldung = __alleMeldungen();
	//am Ende Zeilenumbruch entfernen:
	strMeldung = strMeldung.substr(0, strMeldung.length-1);
	application.activeWindow.clipboard = "\u0022" + strMeldung + "\u0022"; // u0022 = Quot
	application.activeWindow.appendMessage("Der Meldetext wurde in den Zwischenspeicher kopiert.", 3);
}
function __blanksLinksLoeschen()
{
	var blankTest;
	do {
		application.activeWindow.title.charLeft(1, true);
		blankTest = application.activeWindow.title.selection;
		if (blankTest == " ") application.activeWindow.title.deleteSelection();
	}
	while (blankTest == " ");
}

function __formatD()
{
	//Präsentationsformat prüfen und auf "D" umstellen
	if (application.activeWindow.getVariable("P3GPR") != "D") {
		application.activeWindow.command ("\\too d", false);
	}

}

function ZETA()
{
	var strkat;
	if (!application.activeWindow.title){
		application.shellExecute ("http://www.zeitschriftendatenbank.de/erschliessung/arbeitsunterlagen/zeta.html", 5, "open", "");
	} else {
		strkat = application.activeWindow.title.tag;
		application.shellExecute ("http://www.zeitschriftendatenbank.de/erschliessung/arbeitsunterlagen/zeta/" + strkat + ".html", 5, "open", "");
		}
}
function WinIBWHandbuch()
{
	application.shellExecute ("http://www.gbv.de/wikis/cls/WinIBW3:Handbuch", 5, "open", "");
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
//----------------------------------------------------------
function Kategorienbeschreibung()
{
	var xulFeatures = "centerscreen, chrome, close, titlebar,resizable, modal=no, dependent=yes, dialog=yes";
	open_xul_dialog("chrome://ibw/content/xul/gbv_kategorie_dialog.xul", xulFeatures);
}
function Sacherschliessungsrichtlinie()
{
	application.shellExecute ("http://www.gbv.de/vgm/info/mitglieder/02Verbund/01Erschliessung/02Richtlinien/04Sacherschliessungsrichtlinie/index", 5, "open", "");
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

function kategorieAnalysePlus(zeile, strFeld)
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

function kategorienLoeschen(kategorien)
{
	//Ersatz für title.ttl in Sonderfällen:
	//Beispiel Funktionsaufruf: (Alle) Kategorie(n) in einem gemeinsamen String:
	//kategorienLoeschen("2150|4201|4730|4731|5060|5065|5545|5587|5588|5589");
	//Aus dem eingehenden Parameter wird ein Array gebildet:
	kategorien = kategorien.split("|");
	//im Titleedit-Schirm: jedes Vorkommnis jeder im Array befindlichen Kategorie wird gelöscht 
	for (var i = 0; i < kategorien.length; i++){
		while (application.activeWindow.title.findTag(kategorien[i], 0, true, true, false) != ""){
			application.activeWindow.title.deleteLine(1);
		}
	}
}

function kategorienSammeln(kategorien){
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

function loescheZeileAbPosition(kategorie, position)
{
	//Sucht Kategorie und löscht den Rest der Zeile ab position
	if(application.activeWindow.title.findTag(kategorie, 0, true, true, true) != "")
	{
		application.activeWindow.title.startOfField(false);
		application.activeWindow.title.charRight(position, false);
		application.activeWindow.title.deleteToEndOfLine();
	}
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

//----------------------------------------------------------

function __loescheIdentnummern()
{
	var n= 0;
	var letzteZeile, strKategorie;
	//lösche alles außer 2000: d.h. 200x, 20xx, 2xxx
	var regExpIdentnummer = /200[1-9]|20[1-9][0-9]|2[1-9][0-9][0-9]/;

	//wieviele Zeilen sollen geprüft werden?
	application.activeWindow.title.endOfBuffer (false);
	letzteZeile = application.activeWindow.title.currentLineNumber;
	application.activeWindow.title.startOfBuffer (false);
	
	for (n=0; n<= letzteZeile; n++) {
		strKategorie = application.activeWindow.title.tag;
		if (regExpIdentnummer.test(strKategorie)){
			application.activeWindow.title.deleteLine (1);
		} else {
			application.activeWindow.title.endOfField(false);//wichtig bei mehrzeiligen Inhalten!
			application.activeWindow.title.lineDown (1, false);
		}
	}
}

function __loescheAlleExemplare()
{
	for(var i = 7001; i<=7099; i++){
		if (application.activeWindow.title.findTag(i, 0, true, true, true) != ""){
			application.activeWindow.title.startOfField(false); 
			application.activeWindow.title.endOfBuffer(true);
			application.activeWindow.title.deleteSelection();
			break;
		}
	}
}

function __NameInvertiert(strperson)
{
	//Neu: Diese Funktion gibt den Namen ohne Links und Unterfeldbezeichnungen zurück
	var lpos;
	//Funktionsbezeichnung entfernen:	
	strperson = strperson.replace(/\$[P5]/, "");
	
	//Unterfelder durch Blank ersetzen:
	strperson = strperson.replace(/\$[cnl]/, " ");
	
	//alles ab PPN-Link abschneiden:
	lpos = strperson.indexOf("!");
	if (lpos != -1){
		strperson = strperson.substring(0, lpos);
	}
	
	//alles ab $7 abschneiden:
	lpos = strperson.indexOf("$7");
	if (lpos != -1){
		strperson = strperson.substring(0, lpos);
	}

	//Text in ## entfernen:
	strperson = strperson.replace(/#.*#/, "");
	
	//Text in ** entfernen:
	strperson = strperson.replace(/\*.*\*/, "");
	
	//Text in [] entfernen:
	strperson = strperson.replace(/\[.*\]/, "");
	

	//Namenskommentar entfernen:
	strperson = strperson.replace(/ %.*/, "");
	
	//entferne $T + $U 
	strperson = strperson.replace(/\$T\d{2}\$U\D{4}%%/, "");
	return strperson;
}

function stringTrim(meinString)
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

function __pfadTitelkopie()
{
	//Korrektur für falsch eingestellten Titelkopie-Pfad der WinIBW3.3.7.05 (Oktober 2010)
	var titlecopyfileLokal = application.getProfileString("winibw.filelocation", "titlecopy", "");
	if (titlecopyfileLokal == "resource:/scripts/title.ttl"){
		titlecopyfileLokal = titlecopyfileLokal.replace(/scripts/, "ttlcopy");
		application.activeWindow.titleCopyFile = titlecopyfileLokal;
		__meldung("Der Pfad der Titelkopiedatei wurde geändert in: " + titlecopyfileLokal);
	}
}

function ppnlisteDownload()
{
	//PPN-Datei muss im Profiles-Verzeichnis des Benutzers gespeichert werden
	//liest Datei, ruft jede PPN auf und führt Download aus.
	var theFileInput = utility.newFileInput();
	var theLine;
	var fileName = "\\" + "ppnliste.txt";
	if (!theFileInput.openSpecial("ProfD", fileName)) {
			application.messageBox("Datei suchen","Datei " + fileName + " wurde nicht gefunden.", "error-icon");
			return;
	}
	while (!theFileInput.isEOF()) {
		theLine = theFileInput.readLine();
		//Zeilen ohne PPN werden ausgelassen
		if (theLine.length >= 9) {
			application.activeWindow.command("f ppn " + theLine, false);
			application.activeWindow.command("dow d" + theLine, false);
		}
	}
	theFileInput.close();
}

function stapelJob()
{
	var xulFeatures = "centerscreen, chrome, close, titlebar,resizable, modal=no, dependent=yes, dialog=no";
	open_xul_dialog("chrome://ibw/content/xul/gbv_stapelJob_dialog.xul", xulFeatures);
}

//-------------------------------------------------------------------

function inputBox(ttl,txt,dflt) {
/* Die interne Funktion oeffnet eine Input-Box und gibt den eingegebenen Wert zurück.
Mit Parameter ttl kann der Text fuer die Titelzeile der Eingabebox uebergeben werden. 
Parameter txt enthaelt den Text der Input-Box und mit dflt kann ein Default-Wert definiert werden.
Historie:
2010-08-09 Stefan Grund (DNB): erstellt
2011-02-02 umbenannt in inputBox
*/
	var prompter = utility.newPrompter();
	var msg;
	msg = prompter.prompt(ttl,txt,dflt,null,null);
	if (msg == 1)	msg = prompter.getEditValue();
	else			msg = null;
	return msg;
}

function templateID_melden(){
	var strscreen = application.activeWindow.getVariable("scr");
	application.activeWindow.clipboard = strscreen;
	__meldung("Template: " + strscreen);
}

function alleSchriftenArray(zeilen){
	//Diese Funktion erwartet den kopierten Datensatz oder einzelne Zeilen daraus
	//Sie gibt einen Array aller Schriften zurück in der Form: "$UHebr%%"
	var alleSchriften = zeilen.match(/\$U\D{4}%%*/g);
	if (alleSchriften) {
		alleSchriften.sort();
		for (i = 1; i <= alleSchriften.length; i++){
			//wichtig, damit am Ende des Arrays keine Fehlermeldung kommt (undefined): 
			if (alleSchriften[i]) {
				while(alleSchriften[i] == alleSchriften[i-1]){
					alleSchriften.splice(i, 1);
				}
			}
		}
	} 
	return alleSchriften;
}

//----------------------------------------
function hackSystemVariables() {
	//Clemens Buijs:
	var i, j, varName, varValue, reportG = "", reportV = "", reportL = "";
	alpha = "!0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	
	//G:
	for (i = 0; i <= alpha.length; i++) {
		for (j = 0; j <= alpha.length; j++) {
		//	Use P3G for global, P3L for local, P3V for field variables
			varName = "P3G" + alpha.charAt(i) + alpha.charAt(j);
			varValue = application.activeWindow.getVariable(varName);
			if (varValue) reportG = reportG + "- " + varName + ": " + varValue + "\r\n\r\n";
		}
	}
	//application.messageBox("G-Variable:", reportG, "message-icon");
	
	//V:
	for (i = 0; i <= alpha.length; i++) {
		for (j = 0; j <= alpha.length; j++) {
		//	Use P3G for global, P3L for local, P3V for field variables
			varName = "P3V" + alpha.charAt(i) + alpha.charAt(j);
			varValue = application.activeWindow.getVariable(varName);
			if (varValue) reportV = reportV + "- " + varName + ": " + varValue + "\r\n\r\n";
		}
	}
	//application.messageBox("V-Variable:", reportV, "message-icon");
	
	//L:
	for (i = 0; i <= alpha.length; i++) {
		for (j = 0; j <= alpha.length; j++) {
		//	Use P3G for global, P3L for local, P3V for field variables
			varName = "P3L" + alpha.charAt(i) + alpha.charAt(j);
			varValue = application.activeWindow.getVariable(varName);
			if (varValue) reportL = reportL + "- " + varName + ": " + varValue + "\r\n\r\n";
		}
	}
	//application.messageBox("L-Variable:", reportL, "message-icon");
	// Output to clipboard
	application.activeWindow.clipboard = reportG + reportV + reportL;
	application.messageBox("hackSystemVariables", "Alle Variablen befinden sich jetzt im Zwischenspeicher", "message-icon");
	application.activeWindow.appendMessage("Alle Variablen befinden sich jetzt im Zwischenspeicher", 2);
}
//-------------------------------------------------------------------------------
function filtereRecherche(suchBegriffe)
{
	//ein String wird geliefert, z.B. aus einem Titel 
	//diese Begriffe sollen für eine Recherche weitergenutzt werden
	//Begriffe und Zeichen, die gleichzeitig Operatoren sind, müssen herausgefiltert werden.
	// \b = als Wort \u0022 = ", \u0027 = '
	//alle Semikola und alle Operatoren entfernen, ansonsten Kommandofehler bzw. falsche Treffermengen:
	suchBegriffe = suchBegriffe.replace(/;|\boder\b|\bor\b|\bnicht\b|\bnot\b| - |\bbei\b|\bnear\b/gi, " ");
	suchBegriffe = suchBegriffe.replace(/;|\?|\*|!|"|'|#|\||\[|\]/gi, "");
	return suchBegriffe;
}

function WinIBW3_Verzeichnisse(){
	//Funktion gibt Informationen über Installations- und Benutzerverzeichnis aus.
	var verzeichnisProgramme = getSpecialDirectory("BinDir");
	var verzeichnisBenutzer = getSpecialDirectory("ProfD");
	var verzeichnisStart = application.getProfileString("ibw.startup", "homepage", "");
	verzeichnisStart = verzeichnisStart.replace(/file:\/\/\//, "");
	verzeichnisStart = verzeichnisStart.replace(/\//g, "\\");
	
	var dieVerzeichnisse = "Programmverzeichnis: " + verzeichnisProgramme.path 
		+ "\nBenutzerverzeichnis: " + verzeichnisBenutzer.path
		+ "\nVerwendete Startdatei: " + verzeichnisStart;
	
	application.activeWindow.clipboard = dieVerzeichnisse;
	
	application.messageBox("Verzeichnisse der WinIBW3", dieVerzeichnisse + "\n\n--- Die hier angezeigten Informationen wurden im Zwischenspeicher abgelegt ---" +
		"\n--- Einfügen mit Strg+v ---", "message-icon");
}