// Datei:		zdb_scripte_02.js
// Autor:			Carsten Klee (ZDB)
function excelTabelle()
{
	var xulFeatures = "centerscreen, chrome, close, titlebar,modal=no,dependent=yes, dialog=yes";
	open_xul_dialog("chrome://ibw/content/xul/gbv_excelTabelle_dialog.xul", xulFeatures);
}

function ZDBWinIBWInfo()
{
	application.shellExecute ("http://www.zeitschriftendatenbank.de/erschliessung/winibw/winibw-3/", 5, "open", "");
}

function WinIBWSupport()
{
	application.shellExecute ("mailto:zdb-winibw@sbb.spk-berlin.de?subject=[WinIBW] ", 5, "open", "");
}

function zeta()
{
	var strkat;
	if (!application.activeWindow.title){
		application.shellExecute ("http://www.zeitschriftendatenbank.de/erschliessung/arbeitsunterlagen/zeta.html", 5, "open", "");
	} else {
		strkat = application.activeWindow.title.tag;
		application.shellExecute ("http://www.zeitschriftendatenbank.de/erschliessung/arbeitsunterlagen/zeta/" + strkat + ".html", 5, "open", "");
		}
}

function zdb_downProdExcelTabelle()
{
	var xulFeatures = "centerscreen, chrome, close, titlebar,modal=no,dependent=yes, dialog=yes";
	open_xul_dialog("chrome://ibw/content/xul/ZDB_excelTabelle_dialog_prod.xul", xulFeatures);
}

function sucheErsetze()
{
	//application.disableScreenUpdate(true);
	var xulFeatures = "centerscreen, chrome, close, titlebar,resizable, modal=no, dependent=yes, dialog=no";
	open_xul_dialog("chrome://ibw/content/xul/gbv_sucheErsetze_dialog.xul", xulFeatures);
	//application.disableScreenUpdate(false);
}

function zdb_gndNormdatensatzKopie(){
	if (application.activeWindow.getVariable("scr") != "8A"){
		application.messageBox("Datensatzkopie","Der Datensatz muss sich in der Vollanzeige befinden!", "alert-icon");
		return;
	}
	//Persoenliche Einstellung des Titelkopie-Pfades ermitteln
	var titlecopyfileStandard = application.getProfileString("winibw.filelocation", "titlecopy", "");
	// Titelkopie auf zdb_titeldatenkopie.ttl setzen
	application.activeWindow.titleCopyFile = "resource:/ttlcopy/gnd_title.ttl";
	
	application.overwriteMode = false;
	var idn = application.activeWindow.getVariable("P3GPP");
	var typ = application.activeWindow.getVariable("P3VMC");
	application.activeWindow.command("show d", false);
	application.activeWindow.copyTitle();
	application.activeWindow.command("ein n", false);
	application.activeWindow.title.insertText(" *** Normdatenkopie *** \n");
	application.activeWindow.pasteTitle();
	application.activeWindow.title.endOfBuffer(false);

	if (typ == "Tb" || typ == "Tg") {
		application.activeWindow.title.insertText("??? !" + idn + "!");
	}
	//application.activeWindow.title.startOfBuffer(false);
	application.activeWindow.title.findTag("005", 0, false, true, true);
	application.activeWindow.title.endOfField(false);
	
	//Wiederherstellen des urspruenglichen Pfades der Titelkopie-Datei:
	application.activeWindow.titleCopyFile = titlecopyfileStandard;
}

/**
* Scherer Birgit, BSZ
* 10.04.2012
*/
function tf_vollenden()
{
	var katString;
	var temp;	
	var pos=0;
	var strCounter=0;
	var windstat;
	

	// String der Kat. 111 auslesen	
	katString = application.activeWindow.title.findTag("111", 0, false, false, true);
	
	
	// Merker alt_ppn auf '0' setzen. Naeheres siehe tf_vollenden_fortsetzen().
	alt_ppn = 0;
	
	
		//-------------------------------------------
	// Behandlung von $d (Datum)
	//-------------------------------------------
	
	temp = katString;  // Urspruenglichen Kategoriestring in temp einspeichern
	
	
	// String $d bis Ende
	pos = temp.indexOf("$d");
	if ((pos > 0) && (temp.length > pos+2)) {
		temp = temp.substring(pos+2);
	}
	
	//** Eine Jahreszahl muss vorhanden sein. Deshalb die unsaubere Programmierung. **
	
	// Falls $c vorhanden, dann nur den Inhalt *bis* $c verwenden
	var pos1 = temp.indexOf("$c");
	var pos2 = temp.indexOf("$g");
	
	// Den kleineren (aber positiven) Wert verwenden.
	// Beachte: $c kommt immer vor $g (Reihenfolge)
	if (pos1 > 0) {
		pos = pos1;
	}
	else { // pos1 ist <= 0, nun pos2 pruefen
		if (pos2 > 0) {
			pos = pos2;
		}
	}
	
	// Nur wenn ein Positionswert gefunden wurde und.. s.u.
	if (pos > 0) {
		temp = temp.substring(0,pos);
		//..und der Datumsstring keinen Bindestrich enthaelt.
		if (temp.indexOf("-") <= 0) {
			temp = "$c" + temp;
		}
	}
	
	
	
	// Enthaelt das Ergebis zwei Jahreszahlen, getrennt durch Bindestrich,
	// ist der Zielwert durch $b zu trennen.
	if (temp.indexOf("-") > 0) {
		
		// Leerzeichen mehrfach durch nichts ersetzen, da es kein allg. replaceAll gibt.
		temp = temp.replace(" ", "");
		temp = temp.replace(" ", "");
		
		// Sonderfall: Kein Endedatum, String endet mit Bindestrich
		if (temp.charAt(temp.length-1) == "-")
			temp = temp.replace("-" , "");
		
		temp = temp.replace("-", "$b");
	}
		
	application.activeWindow.title.endOfBuffer(false);
	application.activeWindow.title.insertText("\n548 " + temp + "$4datv");
	
		
	
	//-------------------------------------------
	// Behandlung der Veranstaltungsorte ($c)
	//-------------------------------------------
		
	var ppn="";
		
	temp = katString;  // Urspruenglichen Kategoriestring in temp einspeichen
	
		
	//-- Erstes $c suchen und den String danach mit split aufteilen (in ein Orte-Array)
	
	pos = temp.indexOf("$c");
	if ((pos > 0) && (temp.length > pos+2)) {
		temp = temp.substring(pos+2);
		
		//_showMessage("$c ist vorhanden");
		
		// Falls noch $g vorkommt
		pos = temp.indexOf("$g");
		if (pos > 0) {
			temp = temp.substring(0,pos);
		}

		var ortArray = temp.split("; ");
		var anzOrte = ortArray.length;
		var ort;
		var winId;

		// Win-ID des aktiven Fensters (fuer die spaetere Reaktivierung)
		edit_winId = application.activeWindow.windowID;

		// Array leeren
		search_winIdArray.length = 0;
		search_ortArray.length = 0;
		
		// Hochzaehlen, nur wenn Suchfenster fuer die Orte angezeigt sind.
		var ortSuchfensterZaehler = 0;  
		var zusatzText = "";
		
		
		// Schleife ueber die Orte (gelistet im Editfenster)
		for (var i=0; i<anzOrte; i++) {
			
			ort = ortArray[i];
			
			// Ggf. 'u.a.' aus Ortsnamen entfernen
			//ort = ort.replace(/u\.a\./, "");
			//ort = ort.replace(/u\.\sa\./, "");			
			ort = ort.replace(/\s+u\.\s*a\./, "");
			
						
			//_showMessage("Ort (nach Bereinigung): " + ort, "vollenden()");  // TEST
						
			// Suchbefehl u. gleichzeitiges OEFFNEN eines neuen Fensters
			application.activeWindow.command("rec n;f kor " + ort + " and bbg tg* and ent gik", true);
			
			// Eintraege in die globalen Arrays einstellen
			winId = application.activeWindow.windowID;  // ID des Suchfensters
			search_winIdArray.push( winId );
			search_ortArray.push( ort );
			
			windstat = application.activeWindow.status;  // Fuer den Nohits-Fall
			
			// Bei Gleichheit der Variablen erscheint die Review-Anzeige.
			// Problem: Die Trefferanzahl kann dann nicht korrekt ausgelesen werden.
			// (Die Treffer erscheinen nicht auf einer Seite..).
			if (application.activeWindow.getVariable("P3GSZ") == application.activeWindow.getVariable("P3GSE"))
				strCounter = "viele";
			else			
				strCounter = application.activeWindow.getVariable("P3GSZ");
			
			
			if (windstat == "NOHITS") {
				application.messageBox("", "Ortssuche ergab keinen Treffer, bitte prüfen Sie den Suchstring. Ort wird als reiner Text hinterlegt", "");
				
				application.activeWindow.closeWindow();  // Schliessen des Suchfensters
				application.activateWindow(edit_winId);  // Editfenster aktivieren
				application.activeWindow.title.insertText("\n551 " + ort + "$4ortv");
				
				// Eintraege aus den globalen Arrays entfernen.
				// (Relevant bei mehreren Orten/Suchfenstern.)
				search_winIdArray.pop();
				search_ortArray.pop();
				
				// Wechsel zu einem evtl. noch vorhandenen Suchfenster
				if (search_winIdArray.length > 0) {
					application.activateWindow( search_winIdArray[search_winIdArray.length-1] )
				}				
			}			
			else { // Es gibt Treffer -> zwei Faelle
				if (strCounter == 1) {
					// Fall 1: Genau ein Treffer
					//application.messageBox("", "Treffer: " + strCounter, "");
					
					ppn = application.activeWindow.getVariable("P3GPP");
					
					application.activeWindow.closeWindow();  // Schliessen des Suchfensters
					application.activateWindow(edit_winId);  // Editfenster aktivieren
					application.activeWindow.title.insertText("\n551 !" + ppn + "!$4ortv");								
					
					// Eintraege aus den globalen Arrays entfernen.
					// (Relevant bei mehreren Orten/Suchfenstern.)
					search_winIdArray.pop();
					search_ortArray.pop();
					
					// Wechsel zu einem evtl. noch vorhandenen Suchfenster
					if (search_winIdArray.length > 0) {
						application.activateWindow( search_winIdArray[search_winIdArray.length-1] )
					}					
				}
				else {  
					// Fall 2: strCounter ist groesser 1 (Anzeige eines Suchfensters).
					// Die notwendigen Aktionen dieses Else-Zweiges werden in der
					// Funktion 'vollenden_fortsetzen' abgearbeitet.
					
					//application.messageBox("", "Treffer (strCounter): " + strCounter, "");  // TEST

					//-- Vor den weiteren Aktionen erfolgt ein prophylaktischer
					// Eintrag der Ortsvorgabe.
					// Hintergrund: Wuerde der Nutzer das Suchfenster (fuer die Orte)
					// einfach schliessen, so gaebe es ueberhaupt einen Eintrag.
					
						// Zum Editfenster wechseln
					application.activateWindow(edit_winId);
						// Der prophylaktische Eintrag
					application.activeWindow.title.insertText("\n551 " + ort + "$4ortv");
						// Wiederaktivieren des Suchfensters
					application.activateWindow( winId );
					
					
					ortSuchfensterZaehler++;  // Hochzaehlen
										
					// Zusatztext fuer die Message-Box (ab zwei Orten)
					if (ortSuchfensterZaehler > 1) {
						zusatzText = "Achtung, Suchfenster fuer den "
						           + ortSuchfensterZaehler + "-ten Ort\n\n";
					}
										
					application.messageBox("", zusatzText
					  + "Die Körperschaftensuche ergab " + strCounter 
					  + " Treffer, bitte wählen Sie einen Satz aus aktivieren Sie"
					  + " dann die Funktion 'TF_Vollenden_Forsetzen'.\n"
				      + "Wenn Sie den passenden Ort nicht finden, können Sie in"
 					  + " dem Fenster eine erneute Suche tätigen und dann erst die"
					  + " Funktion 'TF_Vollenden_Fortsetzen' ausführen", "");
					// "Sollten Sie keinen entsprechenden Normdatensatz vorfinden, 
					//so schließen Sie einfach das aktuelle Fenster.", "");			
				}			
			}
			
		}  // end-for
		
	}
	
}

/**
* Scherer Birgit, BSZ
* 10.04.2012
*/
function tf_vollenden_fortsetzen()
{
	var anzSuchfenster = search_winIdArray.length;  // Anzahl der geoeffneten Suchfenster
	var ppn;
	var winId;
	
	var flgWinId = true;
	var flg = true;
	var suchZeile;


	//-- Stets nur das letzte Suchfenster 'abarbeiten' (sofern es mehrere gibt).		
	winId = search_winIdArray[anzSuchfenster-1];  // ID des (letzten) Suchfensters
	
	//_showMessage("WINID: " + winId + " -- Ort: " + search_ortArray[anzSuchfenster-1]);
	
	try {
		flgWinId = application.activateWindow(winId);  // Fenster aktivieren (zur Sicherheit)	
	} catch (e) {
		// Fehlerzweig zum Bereinigen/Reduzieren der Array.
		// Ursache: Haendisches Schliessen eine Suchfensters.
		
		//application.messageBox("", "Fehler mit WinID: " +winId +" " +search_ortArray[anzSuchfenster-1], "error_icon");
		
		if (search_winIdArray.length > 0) {
			search_winIdArray.pop();  // Array-Elemente entfernen
			search_ortArray.pop();
		}

		//_showMessage("Anz. Such-WinIDs (nachher 1): " +search_winIdArray.length, "vollenden_fortsetzen()");
				
		// Selbstaufruf, sofern noch Array-Elemente vorhanden sind
		if (search_winIdArray.length > 0) {
			tf_vollenden_fortsetzen();  // >>>>> Selbstaufruf der Funktion
		}
		
		return;  // >>>>> Funktion beenden (..sollte erfolgen)
	}

	

	//-- Start PPN auslesen --------------------
	//
	// Die PPN wird dem Suchfenster entnommen. Das ist soweit problemlos. Im Fall
	// von zwei Orten gibt es eine Unleidlichkeit, wenn im zweiten Suchfenster der
	// Cursor nicht bewegt wird, also der Auswahlbalken auf dem ersten Eintrag bleibt.
	// Dabei kommt es eben nicht zur Auswahl des ersten Eintrags, sondern es eird die
	// im ersten Suchfenster ausgewaehlte PPN herangezogen.
	// Deshalb wird ein Vergleich mit dem Merker 'alt_ppn' gemacht. Tritt nun der
	// oben beschriebene Fall ein, so wird per Enter-Kommando 'FR' ein Fenster ge-
	// oeffnet, das nur den einzelnen Eintrag enthaelt. Hier laesst sich die PPN nun
	// sauber auslesen.
	// Die generelle Anwendung des Enter-Kommandos (Fensteroeffnung zur alleinigen
	// Anzeige eines Treffers) ist allerdings auch keine Loesung, da dies vom Nutzer
	// selbst ausgeloest werden kann. Folgt dann noch ein Enter-Kommando vom Programm
	// her, so wird der naechste Eintrag des Suchfensters gewaehlt (-> Fehlerfall).

	// PPN des gewaehlten Eintrags aus dem aktiven Suchfenster auslesen
	ppn = application.activeWindow.getVariable("P3GPP");
		
	//_showMessage(ppn + "\nCursor Position: " + application.activeWindow.getVariable("P3G!P") );	
	
xx = ppn;
	// Erst fuer das zweite Suchfenster verwenden
	if ((alt_ppn != 0) && (ppn == alt_ppn)) {
		//_showMessage("Im IF-Zweig -- alt_ppn: " + alt_ppn);
		// Enter-Befehl absetzen.
		// (Dies oeffnet ein Fenster, das nur den gewaehlten Eintrag anzeigt.)
		application.activeWindow.simulateIBWKey("FR");
		// Nochmals die PPN auslesen
		ppn = application.activeWindow.getVariable("P3GPP");
	}

//_showMessage("alt_ppn: " + alt_ppn + "\n\n"   + "XX: " + xx + " -- PPN: " + ppn);
//_showMessage("XX: " + xx + " -- PPN: " + ppn);
	
	alt_ppn = ppn;  // Merker belegen (alt_ppn ist eine glob. Variable)
	
	//-- Ende PPN auslesen --------------------------
	
	
	
	// Aktives Suchfenster schliessen
	application.activeWindow.closeWindow();  						
	
		
	//-- Zum Edit-Fenster wechseln, prophylaktischen Eintrag suchen u. ersetzen
	application.activateWindow(edit_winId);

	application.activeWindow.title.startOfBuffer(false);  // Ganz oba na ganna
	suchZeile = "551 " + search_ortArray[anzSuchfenster-1] + "$4ortv";  // Suchzeile
		// Suche ausfuehren
	flg = application.activeWindow.title.find(suchZeile,false,false,false);

	if (flg) {
		//_showMessage("gefunden");
		application.activeWindow.title.deleteLine(1);  // Zeile loeschen
		//application.activeWindow.title.lineUp(1,false);
		
		//application.activeWindow.title.endOfBuffer(false);
		application.activeWindow.title.insertText("551 !" + ppn + "!$4ortv\n");
	}
	else {
		_showMessage("Fehler Ortsnamenvorage: Keine Uebereinstimmung Array-Editfenster" + suchZeile);
	}

	
	// Letzte Array-Eintraege entfernen
	// (Darf erst an dieser Programmstelle vorgenommen werden).
	search_winIdArray.pop();
	search_ortArray.pop();
	
		
	// Wechsel zum naechsten Suchfenster (sofern vorhanden).
	// Das letzte wurde abgearbeitet und geschlossen. Nun wird das neue letzte
	// Suchfenster zur Abarbeitung aktiviert.
	if (search_winIdArray.length > 0) {
		//_showMessage("Anz. Such-WinIDs (nachher 2): " + search_winIdArray.length, "vollenden_fortsetzen()");
		winId = search_winIdArray[ search_winIdArray.length-1 ];
		
		// Die Try-Struktur wird benoetigt, wenn bei zwei Suchfenstern das
		// erst-geoeffnete haendich geschlossen wurde.
		try {
			flgWinId = application.activateWindow(winId);    // Suchfenster aktivieren	
		
			// Im FEHLERFALL abarbeiten
			if (! flgWinId) {
				_showMessage("Fehler mit WinID (Restfenster): " + winId , "vollenden_fortsetzen");
				search_winIdArray.pop();  // WinID aus dem Array entfernen
				search_ortArray.pop();
			}		
		} catch (e) {
			//_showMessage("Fehler mit WinID (Restfenster): " + winId , "vollenden_fortsetzen");
		}
	}
	
	return;	
}

//--------------------------------------------------------------------------------------------------------
//name:		zdb_Parallelausgabe()
//description:	same as zdb_Digitalisierung but for Obx records
//calls:		
//user:	  	all users
//input: 		none
//return:		void
//author: 		Carsten Klee
//date:		2012-11-06
//version:		0.1
//status:		testing
//--------------------------------------------------------------------------------------------------------
function zdb_Parallelausgabe () {

	// Prüfen ob Bildschirm = Trefferliste oder Vollanzeige
	var strScreen = application.activeWindow.getVariable("scr");
	if (strScreen != "7A" && strScreen != "8A") {
			application.messageBox("Parallelausgabe", "Die Funktion muss aus der Trefferliste oder der Vollanzeige aufgerufen werden.", "alert-icon");
			return;
	}

	// Prüfen, ob Titeldatensatz mit bibliographischer Gattung "A" aufgerufen, bei "T" oder "O" Fehlermeldung ausgeben
	var matCode = application.activeWindow.materialCode.charAt(0);
	if(matCode == "T" || matCode == "O") {
		application.messageBox("Digitalisierung", "Die Funktion kann nur für Titelsätze des Satztyps \"A\" verwendet werden.", "alert-icon");
		return true;
	}
	
	/*
	//-- open title
	application.activeWindow.command("k p", false);
	
	//--- vars we need
	var feld4244 = new Array();
	var subfield = "";
	var code = "";
	var x = 0;
	
	
	//-- analyse and convert field 4244
	while(application.activeWindow.title.findTag("039E", x, false, true, false) !== ""){
			feld4244[x] = application.activeWindow.title.findTag("039E", x, false, true, false);
			code = feld4244[x].match(/\$b./)[0][2];
			//---switch the subfields
			switch(feld4244[x].match(/\$b.\$./)[0][4]){
				case "r" : feld4244[x] = "4244 " + code +"#{" + feld4244[x].match(/\$b.\$r(.*)/)[1] + "}";
				break;
				case "a" : feld4244[x] = "4244 " + code +"#{" + feld4244[x].match(/\$b.\$a(.*)\$9/)[1] + " ---> " + feld4244[x].match(/\$8--[A-Za-z]{4}--(.*)/)[1] + "}";
				break;
				default : feld4244[x] = "4244 " + code +"#{" + __zdbSwitchCode4244(code) + " ---> " + feld4244[x].match(/\$8--[A-Za-z]{4}--(.*)/)[1] + "}";
				break;
			}
			x++;
	}
	
	//-- close title and go back
	zdb_Back();
	*/
	
	// Titelkopie auf zdb_titeldatenkopie_digi.ttl setzen
	var titlecopyfileStandard = application.getProfileString("winibw.filelocation", "titlecopy", "");
	application.activeWindow.titleCopyFile = "resource:/ttlcopy/zdb_titeldatenkopie_parallel.ttl";
	application.overwriteMode = false;
	var idn = application.activeWindow.getVariable("P3GPP");
	application.activeWindow.command("show d", false);

	// Titelaufnahme kopieren und neue Titelaufnahme anlegen
	application.activeWindow.copyTitle();
	application.activeWindow.command("ein t", false);
	application.activeWindow.title.insertText(" *** Titeldatenkopie Parallelausgabe *** \n");
	application.activeWindow.pasteTitle();
    //Wiederherstellen des ursprünglichen Pfades der Titelkopie-Datei:
    application.activeWindow.titleCopyFile = titlecopyfileStandard;
	
	// Kategorie 0500: Bibliographische Gattung/Status ändern
	var f0500 = application.activeWindow.title.findTag("0500", 0, false, true, true);
	f0500 = f0500.replace("A","O");
	f0500 = f0500.replace("v","x");
	application.activeWindow.title.insertText(f0500);


	// Kategorie 1101: individuell gefüllt oder leer ausgeben
	application.activeWindow.title.endOfBuffer(false);
	application.activeWindow.title.insertText("1101 cr\n");

	// Kategorie 1109: individuell gefüllt oder leer ausgeben
	application.activeWindow.title.endOfBuffer(false);
	application.activeWindow.title.insertText("1109 \n");

	// Kategorie 2010: Inhalt in 2013 ausgeben und löschen
	var f2010 = application.activeWindow.title.findTag("2010", 0, false, true, true);
	if (f2010 != "") {
		application.activeWindow.title.deleteLine(1);
		application.activeWindow.title.insertText("2013 |p|" + f2010 + "\n");
	}	
	
	// Kategorie 2050: individuell gefüllt oder leer ausgeben
	application.activeWindow.title.endOfBuffer(false);
	application.activeWindow.title.insertText("2050 \n");	
	
	// Kategorie 2051: individuell gefüllt oder leer ausgeben
	application.activeWindow.title.endOfBuffer(false);
	application.activeWindow.title.insertText("2051 \n");

	// Kategorie 4048: individuell gefüllt oder leer ausgeben
	application.activeWindow.title.endOfBuffer(false);
	application.activeWindow.title.insertText("4048 \n");

	// Kategorie 4085: individuell gefüllt oder leer ausgeben
	application.activeWindow.title.endOfBuffer(false);
	application.activeWindow.title.insertText("4085 =u \n");

	// Kategorie 4119: individuell gefüllt oder leer ausgeben
	application.activeWindow.title.endOfBuffer(false);
	application.activeWindow.title.insertText("4119 \n");

	// Kategorie 4233: individuell gefüllt oder leer ausgeben
	application.activeWindow.title.endOfBuffer(false);
	application.activeWindow.title.insertText("4233 \n");

	// Kategorie 4237: individuell gefüllt oder leer ausgeben
	application.activeWindow.title.endOfBuffer(false);
	application.activeWindow.title.insertText("4237 \n");	

	// Kategorie 4234: anlegen und mit Text "4243 Druckausg.![...IDN...]!" befüllen
	application.activeWindow.title.endOfBuffer(false);
	application.activeWindow.title.insertText("\n4243 Druckausg.!" + idn + "!\n");
	
	// Kategorie 4237: individuell gefüllt oder leer ausgeben
	application.activeWindow.title.endOfBuffer(false);
	application.activeWindow.title.insertText("4244 f#Druckausg. u. Vorg.!...! \n");
	application.activeWindow.title.insertText("4244 f#Vorg. als Druckausg.!...!\n");

	// Kategorie 4251: individuell gefüllt oder leer ausgeben
	application.activeWindow.title.endOfBuffer(false);
	application.activeWindow.title.insertText("4251 \n");

	__zdbEResource();
	
	// Kategorie 5080 bereinigen: nur DDC
	__zdb5080();
	
	// Kategorie 4213: individuell gefüllt oder leer ausgeben
	application.activeWindow.title.endOfBuffer(false);
	application.activeWindow.title.insertText("4213 %Gesehen am ++");
	application.activeWindow.title.charLeft(1,false);
}
//--------------------------------------------------------------------------------------------------------
//name:		zdbGNDSkripte
//description:	öffnet die GND-Skript-Übersicht im Browser
//user:	  	all users
//input: 		none
//author: 		Carsten Klee
//date:		2012-11-12
//--------------------------------------------------------------------------------------------------------
function zdbGNDSkripte()
{
	application.shellExecute ("https://wiki.d-nb.de/display/ILTIS/GND-WinIBW-Skripte+und+-Datenmasken", 5, "open", "");
}