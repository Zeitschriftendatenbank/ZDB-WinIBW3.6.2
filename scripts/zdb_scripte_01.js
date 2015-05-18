// Datei:			zdb_scripte_01.js
// WinIBW-Version ab 3.6

var anfangsfenster;

function zdb_AutomatischeSuchBox(){

    anfangsfenster = application.activeWindow.windowID; // globale Variable, die vom Skript HoleIDN verwendet wird
    open_xul_dialog("chrome://ibw/content/xul/ZDB_AutomatischeSuchBox.xul", null);

}

function zdb_HoleIDN() {
    // Wurde vorab eine Suche mit dem Skript "Automatische Suchbox" ausgeführt?
    if (typeof anfangsfenster == "undefined") {
        application.messageBox("HoleIDN", "Vor Aufruf des Skriptes \"HoleIDN\" muss zunächst eine automatische Suche mit Hilfe des Skriptes \"AutomatischeSuchBox\" gestartet werden.", "alert-icon");
    } else {
        // Ist das aktive Fenster eine Trefferliste?
        var strScreen = application.activeWindow.getVariable("scr");
        if (strScreen != "7A" && strScreen != "8A") {
            application.messageBox("HoleIDN", "Die Funktion muss aus der Trefferliste aufgerufen werden.", "alert-icon");
        } else {
            //  IDN des markierten Titels aus der Trefferliste ermitteln
            var idn = application.activeWindow.getVariable("P3GPP");
            // ID des aktiven Fensters ermitteln
            var fenster = application.activeWindow.windowID;
            // Falls das Bearbeitungsfenster ( = anfangsfenster) geschlossen wurde, gibt das System einen "uncaught exception"-Fehler aus. Um diesen abzufangen, wird mit TRY CATCH gearbeitet.
            try {
                // Zurück zum Anfangsfenster gehen
                application.activateWindow(anfangsfenster);
                // War der Ausgangsbildschirm ein Vollanzeige im Bearbeitungsmodus?
                if (!application.activeWindow.title){
                    application.messageBox("HoleIDN", "Das Ausgangsfenster muss eine Vollanzeige im Bearbeitungsmodus sein.", "alert-icon");
                } else {
                    // IDN einfügen
                    application.activeWindow.title.insertText("!" + idn + "!");
                    // Trefferliste schließen
                    application.closeWindow(fenster);
                }
            } catch(e) {
                application.messageBox("HoleIDN", "Das Bearbeitungsfenster, in welches die IDN eingefügt werden soll, ist nicht mehr geöffnet.", "alert-icon");
            }
        }
    }

}

function zdb_MerkeIDN() {

    var idn = application.activeWindow.getVariable("P3GPP");
    var idn_formatiert = "!" + idn + "!";
    application.activeWindow.clipboard = idn_formatiert;

}
//--------------------------------------------------------------------------------------------------------
//name:		zdb_merkeZDB
//replaces:		MerkeIDN
//description:	storing a record's ZDB-ID to the clipboard
// calls		__zdbGetZDB; __zdbError
//user:	  	all users
//input: 		none
//return:		Clipboard contains ZDB-ID
//author: 		Carsten Klee
//date:		2010-09-10
//edited		2012-02-02
//--------------------------------------------------------------------------------------------------------

function zdb_merkeZDB() {
    var zdbid = __zdbGetZDB();
    if(zdbid == false)
    {
        __zdbError("Dieses Skript muss aus der Volldarstellung, dem Korrekturmodus oder der "
                    + "Kurztitelliste aufgreufen werden.");
        return false;	
    }
    application.activeWindow.clipboard = zdbid;
    return;
}


//========================================
// Start ****** ZDB-Titelkopien ******
//========================================
//--------------------------------------------------------------------------------------------------------
//name:		__zdbSwitchCode4244()
//description:	switch between codes f, s and z and return textual representations
//called by:		zdb_Digitalisierung ()
//user:	  	all users
//input: 		none
//return:		textual representations
//author: 		Carsten Klee
//date:		2010-09-28
//version:		1.0.0.0
//status:		stable
//--------------------------------------------------------------------------------------------------------
function __zdbSwitchCode4244(code) {
    var text = "";
    switch(code){
        case "f" : text = "Vorg.";
        break;
        case "s" : text = "Forts.";
        break;
        case "z" : text = "Vorg. u. Forts.";
        break;
    }
    return text;

}
//--------------------------------------------------------------------------------------------------------
//name:		__zdb5080()
//description:	clears field 5080 from zdb notation, leaves only ddc
//called by:		zdb_Digitalisierung (); __zdbTiteldatenKopie()
//user:	  	all users
//input: 		none
//return:		void
//author: 		Carsten Klee
//date:		2010-10-13
//version:		1.0.0.0
//status:		testing
//--------------------------------------------------------------------------------------------------------
function __zdb5080(){
    var cat5080 = application.activeWindow.title.findTag("5080", 0, false, true, false); // inhalt wird markiert
    var arr5080 = cat5080.split("%");
    // nur ddc wird ueber markierung geschrieben
    application.activeWindow.title.insertText(arr5080[0]);
}

function __zdbNormdatenKopie() {

    application.overwriteMode = false;
    var idn = application.activeWindow.getVariable("P3GPP");
    var typ = application.activeWindow.getVariable("P3VMC");
    application.activeWindow.command("show d", false);
    application.activeWindow.copyTitle();
    application.activeWindow.command("ein n", false);
    application.activeWindow.title.insertText(" *** Normdatenkopie *** \n");
    application.activeWindow.pasteTitle();
    application.activeWindow.title.endOfBuffer(false);
    if (typ == "Tb") {
        application.activeWindow.title.insertText("??? ||!" + idn + "!");
    }
    //application.activeWindow.title.startOfBuffer(false);
    application.activeWindow.title.findTag("005", 0, false, true, true);
    application.activeWindow.title.endOfField(false);
}

function __zdbTiteldatenKopie() {
    // Überschrift und IDN einfügen
    application.overwriteMode = false;
    var idn = application.activeWindow.getVariable("P3GPP");
    application.activeWindow.command("show d", false);
    application.activeWindow.copyTitle();
    application.activeWindow.command("ein t", false);
    application.activeWindow.title.insertText(" *** Titeldatenkopie *** \n");
    application.activeWindow.pasteTitle();
    application.activeWindow.title.endOfBuffer(false);
    application.activeWindow.title.insertText("???? !" + idn + "!");
    application.activeWindow.clipboard = idn;

    // Ersetzungen in Kategorie 0600
    var codes0600 = application.activeWindow.title.findTag("0600", 0, false, true, true);
    if (codes0600 != "") {
        deletecodes = new Array("ee", "mg", "nw", "vt", "ra", "rb", "ru", "rg");
        for (var i = 0; i < deletecodes.length; i++) {
            if (codes0600.match(deletecodes[i])) {
                var pos_deletecodes = codes0600.indexOf(deletecodes[i]) + deletecodes[i].length;
                if (codes0600.charAt(pos_deletecodes) == ";") {
                    deletecodes[i] = deletecodes[i] + ";";
                }
                codes0600 = codes0600.replace(deletecodes[i],"");
            }
        }
        if (codes0600 != "") application.activeWindow.title.insertText(codes0600);
        else application.activeWindow.title.deleteLine(1);
        }

    //application.activeWindow.title.startOfBuffer(false);
    application.activeWindow.title.findTag("0500", 0, false, true, true);
    application.activeWindow.title.endOfField(false);
    application.activeWindow.title.insertText("xz");
    
    // Kategorie 5080 bereinigen: nur DDC
    __zdb5080();
}

function zdb_Datensatzkopie() {
    if (application.activeWindow.getVariable("scr") != "8A"){
        application.messageBox("Datensatzkopie","Der Datensatz muss sich in der Vollanzeige befinden!", "alert-icon");
        return;
    }
    //Persönliche Einstellung des Titelkopie-Pfades ermitteln
    var titlecopyfileStandard = application.getProfileString("winibw.filelocation", "titlecopy", "");
    // Titelkopie auf zdb_titeldatenkopie.ttl setzen
    application.activeWindow.titleCopyFile = "resource:/ttlcopy/zdb_titeldatenkopie.ttl";

    if (application.activeWindow.materialCode.charAt(0) == "T") {
        __zdbNormdatenKopie();
        } else {
        __zdbTiteldatenKopie();
    }

    //Wiederherstellen des ursprünglichen Pfades der Titelkopie-Datei:
    application.activeWindow.titleCopyFile = titlecopyfileStandard;
}

function zdb_DigiConfig() {

    // Die mittels "zdb_DigiConfig" gespeicherten Inhalte werden automatisch von der Funktion "zdb_Digitalisierung" übernommen
    open_xul_dialog("chrome://ibw/content/xul/ZDB_DigitalisierungConfig.xul", null);

}

function zdb_Digitalisierung () {
    __digitalisierung(false,true,"resource:/ttlcopy/zdb_titeldatenkopie_digi.ttl");
}

function __expansionUF(expansion)
{
    while(expansion.match(/\$\$/))
    {
        expansion = expansion.replace(/\$\$/, "\$");
    }
    expansion = expansion.replace(/\$b/, " / ");
    if(expansion.match(/\u0192/))
    {
        re = new RegExp("(.*)"+delimiterReg+"[gcn]([^:]*)(.*)")
    }
    else
    {
         re = new RegExp("(.*)\$[gcn]([^:]*)(.*)")
    }
    
    expansion = expansion.replace(re, "$1 <$2>$3");
    return expansion;
}
function __digitalisierung(digiConfig,showComment,copyFile) {
    digiConfig = typeof digiConfig !== 'undefined' ? digiConfig : false;
    // Prüfen ob Bildschirm = Trefferliste oder Vollanzeige
    var strScreen = application.activeWindow.getVariable("scr");
    if (strScreen != "7A" && strScreen != "8A") {
            application.messageBox("Digitalisierung", "Die Funktion muss aus der Trefferliste oder der Vollanzeige aufgerufen werden.", "alert-icon");
            return;
    }

    // Prüfen, ob Titeldatensatz mit bibliographischer Gattung "A" aufgerufen, bei "T" oder "O" Fehlermeldung ausgeben
    var matCode = application.activeWindow.materialCode.charAt(0);
    if(matCode == "T" || matCode == "O") {
        application.messageBox("Digitalisierung", "Die Funktion kann nur für Titelsätze des Satztyps \"A\" verwendet werden.", "alert-icon");
        return true;
    }
    
    //-- open title
    //application.activeWindow.command("k p", false);
    application.activeWindow.command("k p", false);
    
    //--- vars we need
    var feld4244 = new Array();
    //var subfield = "";
    var code = "";
    var x = 0;
    var current;
    var verbal;
    var matches;
    
    //-- analyse and convert field 4244
    while(application.activeWindow.title.findTag("039E", x, false, true, false) !== ""){
        current = application.activeWindow.title.currentField;
        feld4244[x] = current.substr(4);
        re = new RegExp(delimiterReg+"b.");
        code = feld4244[x].match(re)[0][2];
        re = new RegExp(delimiterReg+"b."+delimiterReg+".");
        //---switch the subfields
        switch(feld4244[x].match(re)[0][4]){
        
            case "r" : 
                re = new RegExp(delimiterReg+"b."+delimiterReg+"r(.*)");
                feld4244[x] = "4244 " + code +"#{" + feld4244[x].match(re)[1] + "}";
            break;
            case "a" : 
                re = new RegExp(delimiterReg+"b."+delimiterReg+"a(.*)"+delimiterReg+"9");
                re2 = new RegExp(delimiterReg+"8\s?(?:--T..--\s)?\s?(?:.*)--[A-Za-z0-9]{4}--\s?:?\s?(.*)");
                feld4244[x] = "4244 " + code +"#{" + feld4244[x].match(re)[1] + " ---> " + __expansionUF(feld4244[x].match(re2)[1]) + "}";
            break;
            default : 
                re = new RegExp(delimiterReg+"8\s?(?:--T..--\s)?\s?(?:.*)--[A-Za-z0-9]{4}--\s?:?\s?(.*)");
                feld4244[x] = "4244 " + code +"#{" + __zdbSwitchCode4244(code) + " ---> " + __expansionUF(feld4244[x].match(re)[1]) + "}";
            break;
        }
                
        x++;
    }

    var felder424X = new Object();
    felder424X[4241] = {p:"039B",kat:"4241",verbal:"",cont:""};
    felder424X[4242] = {p:"039C",kat:"4242",verbal:"",cont:""};
    felder424X[4243] = {p:"039D",kat:"4243",verbal:"",cont:""};
    felder424X[4245] = {p:"039S",kat:"4245",verbal:"",cont:""};
    for(var x in felder424X)
    {
        var i = 0;
        while( application.activeWindow.title.findTag(felder424X[x].p, i, false, true, false) !== "")
        {
            current = application.activeWindow.title.currentField;
            felder424X[x].cont = current.substr(4);
            
            verbal = false;
            matches = false;
            re = new RegExp(delimiterReg+"r(.*)"+delimiterReg);
            if(verbal = felder424X[x].cont.match(re))
            {
                felder424X[x].verbal = felder424X[x].kat + " " + verbal[1];
            }
            else
            {
                
                re = new RegExp(delimiterReg+"a(.*)"+delimiterReg+"9.*"+delimiterReg+"8\s?--A[A-Za-z]{3}--\s?:?\s?(?:--T..--\s)?(.*)");
                if(matches = felder424X[x].cont.match(re))
                {
                    if("039S" == felder424X[x].p)
                    {
                        felder424X[x].verbal =  felder424X[x].kat + " {" + matches[1] + " \"" + __expansionUF(matches[2]) + "\"}";
                    }
                    else
                    {
                        felder424X[x].verbal =  felder424X[x].kat + " {" + matches[1] + " ---> " + __expansionUF(matches[2]) + "}";
                    }
                }
                
            }
            i++;
        }
    }
    //-- close title and go back
    zdb_Back();
    

    // Titelkopie auf zdb_titeldatenkopie_digi.ttl setzen
    var titlecopyfileStandard = application.getProfileString("winibw.filelocation", "titlecopy", "");
    application.activeWindow.titleCopyFile = copyFile;
    application.overwriteMode = false;
    var idn = application.activeWindow.getVariable("P3GPP");
    application.activeWindow.command("show d", false);

    // Gespeicherte individuelle Angaben aus Datei DigiConfig.txt (sofern vorhanden) übernehmen
    if(digiConfig == false)
    {
        var digiConfig = new Object();
        var fileInput = Components.classes["@oclcpica.nl/scriptinputfile;1"].createInstance(Components.interfaces.IInputTextFile);
        if(fileInput.openSpecial("ProfD", "DigiConfig.txt")) {
            var aLine = "";
            while((aLine = fileInput.readLine()) != null) {
                partOfLine = aLine.match(/([0-9]*)\s(.*)/);

                if (partOfLine[1] == "1101" && partOfLine[2] == "") {
                    digiConfig[partOfLine[1]] = {kat:partOfLine[1],cont:"cr"};
                }
                else if(partOfLine[1] == "4085")
                {
                    digiConfig[partOfLine[1]] = {kat:partOfLine[1]+" =u ",cont:partOfLine[2]};
                }
                else
                {
                    digiConfig[partOfLine[1]] = {kat:partOfLine[1], cont:partOfLine[2]};
                }
                
            }
            fileInput.close();
        } else {
            digiConfig[1101] = {kat:"1101 ",cont:"cr"};
            digiConfig[1109] = {kat:"1109 ",cont:""};
            digiConfig[2050] = {kat:"2050 ",cont:""};
            digiConfig[4048] = {kat:"4048 ",cont:""};
            digiConfig[4085] = {kat:"4085 =u ",cont:""};
            digiConfig[4119] = {kat:"4119 ",cont:""};
            digiConfig[4233] = {kat:"4233 ",cont:""};
            digiConfig[4237] = {kat:"4237 ",cont:""};
            digiConfig[4251] = {kat:"4251 ",cont:""};
        }
    }

    // Titelaufnahme kopieren und neue Titelaufnahme anlegen
    application.activeWindow.copyTitle();
    application.activeWindow.command("ein t", false);
    if(showComment != false) application.activeWindow.title.insertText(" *** Titeldatenkopie Digitalisierung *** \n");
    application.activeWindow.pasteTitle();
    //Wiederherstellen des ursprünglichen Pfades der Titelkopie-Datei:
    application.activeWindow.titleCopyFile = titlecopyfileStandard;
    
    // Kategorie 0500: Bibliographische Gattung/Status ändern
    var f0500 = application.activeWindow.title.findTag("0500", 0, false, true, true);
    f0500 = f0500.replace("A","O");
    f0500 = f0500.replace("v","x");
    application.activeWindow.title.insertText(f0500);

    // Kategorie 0600: Ersetzungen und Ergänzungen
    var codes0600 = application.activeWindow.title.findTag("0600", 0, false, true, true);
    if (codes0600 != "") {
        deletecodes = new Array("es", "ks", "sf", "sm", "mg", "mm", "nw", "ra", "rb", "rc", "rg", "ru", "ee", "vt");
        for (var i = 0; i < deletecodes.length; i++) {
            if (codes0600.match(deletecodes[i])) {
                var pos_deletecodes = codes0600.indexOf(deletecodes[i]) + deletecodes[i].length;
                //application.messageBox("", deletecodes[i], "");
                if (codes0600.charAt(pos_deletecodes) == ";") {
                    deletecodes[i] = deletecodes[i] + ";";
                }
                codes0600 = codes0600.replace(deletecodes[i],"");
            }
        }
        if (codes0600 != "") {
            if(codes0600.charAt(codes0600.length-1) == ";") {
                application.activeWindow.title.insertText(codes0600);
                application.activeWindow.title.insertText("ld;dm");
            } else {
                application.activeWindow.title.insertText(codes0600);
                application.activeWindow.title.insertText(";ld;dm");
            }
        } else {
            application.activeWindow.title.insertText("ld;dm");
        }
    } else {
        application.activeWindow.title.insertText("\n0600 ld;dm");
    }

    for(var x in digiConfig)
    {
        application.activeWindow.title.endOfBuffer(false);
        application.activeWindow.title.insertText(digiConfig[x].kat + digiConfig[x].cont + "\n");
    }
    // Kategorie 2010: Inhalt in 2013 ausgeben und löschen
    var y = 0;
    var f2010;
    while( (f2010 = application.activeWindow.title.findTag("2010", y, false, true, true)) !="")
    {
        application.activeWindow.title.deleteLine(1);
        application.activeWindow.title.insertText("2013 |p|" + f2010 + "\n");
    }

    __zdbEResource();
    
    // Merke das Loeschen der Felder ist überflüssig, wenn in der Titelkopiedatei die Felder nicht mitkopiert werden.
    // Kategorie 4244: löschen und neu ausgeben
    while(application.activeWindow.title.findTag("4244", 0, false, true, false) !== ""){
        application.activeWindow.title.deleteLine(1);
    }
    application.activeWindow.title.endOfBuffer(false);
    for(var num = 0; num < feld4244.length; num++){
        application.activeWindow.title.insertText(feld4244[num] + "\n");
    }
    
    for(var rel in felder424X){
        // Kategorien 424X: löschen und neu ausgeben
        while(application.activeWindow.title.findTag(felder424X[rel].kat, 0, false, true, false) !== ""){
            application.activeWindow.title.deleteLine(1);
        }
        if(felder424X[rel].verbal != "") application.activeWindow.title.insertText("\n" + felder424X[rel].verbal + "\n");
    }
    
    // Kategorie 4234: anlegen und mit Text "4243 Druckausg.![...IDN...]!" befüllen
    application.activeWindow.title.endOfBuffer(false);
    application.activeWindow.title.insertText("\n4243 Druckausg.!" + idn + "!");
    
    // Kategorie 5080 bereinigen: nur DDC
    __zdb5080();
}
//========================================
// Ende ****** ZDB-Titelkopien ******
//========================================


function zdb_ILTISseiten() {

    application.shellExecute ("http://support.ddb.de/iltis/inhalt.htm", 5, "open", "");

}


function zdb_BibliothekDefinieren() {

    open_xul_dialog("chrome://ibw/content/xul/ZDB_BibliothekDefinieren.xul", null);

}


function zdb_KennungWechseln() {

    var wert;
    if ((wert = application.activeWindow.caption) == "") {
        wert = "ZDB-Hauptbestand";
    }
    if (wert.indexOf("ZDB-Hauptbestand") >= 0 || wert.indexOf("ZDB-UEbungsbestand") >= 0) {
        open_xul_dialog("chrome://ibw/content/xul/ZDB_KennungWechseln.xul", null);
    } else {
        application.messageBox("KennungWechseln", "Die Funktion \"KennungWechseln\" kann nur im ZDB-Hauptbestand oder ZDB-Übungsbestand aufgerufen werden", "alert-icon");
        return;
    }

}

function zdb_ExemplarErfassen() {

    var strScreen = application.activeWindow.getVariable("scr");
    if (strScreen == "8A" || strScreen == "7A" || strScreen == "MT") {
        var eigene_bibliothek =  application.getProfileString("zdb.userdata", "eigeneBibliothek", "");
        application.activeWindow.command("show d", false);
        // Sichert Inhalt des Zwischenspeichers, da dieser sonst durch copyTitle() überschrieben würde

        try{
            var clipboard = application.activeWindow.clipboard;
        } catch(e){
            // do nothing
        }
        // Kopiert Titel
        var kopie = application.activeWindow.copyTitle();
        application.activeWindow.clipboard = clipboard;
        //Schleife von 1 bis 99, da max. 99 Exemplare pro Bibliothek erfasst werden können
        for (var i = 1; i <= 99; i++) {
            var vergleich = 7000 + i;
            if (kopie.indexOf(vergleich) == -1) {
                var eingabe = vergleich + " x\n4800 " + eigene_bibliothek + "\n7100 \n7109 \n8031 \n8032 \n";
                // Definiert, wo Cursor im Titelbildschirm plaziert wird
                var zeile = 1;
                if (eigene_bibliothek) {
                    zeile = 2;
                }
                // Exemplarsatz anlegen und befüllen
                application.activeWindow.command("e e" + i, false);
                if (application.activeWindow.status != "ERROR") {
                    application.activeWindow.title.startOfBuffer(false);
                    application.activeWindow.title.insertText(eingabe);
                    application.activeWindow.title.startOfBuffer(false);
                    application.activeWindow.title.lineDown(zeile, false);
                    application.activeWindow.title.charRight(5, false);
                    return;
                } else {
                    return;
                }
            }
        }
    } else {
            application.messageBox("ExemplarErfassen", "Die Funktion kann nur aus der Trefferliste oder der Vollanzeige aufgerufen werden.",  "alert-icon");
    }

}

function zdb_TitelErfassen() {

    application.overwriteMode = false;
    application.activeWindow.command("ein t", false);
    if (application.activeWindow.status != "OK") {
        application.messageBox("Titelerfassung", "Sie haben nicht die nötigen Berechtigungen, um einen Titel zu erfassen.", "alert-icon");
        return false;
    }
    application.activeWindow.title.insertText(
                "0500 Abxz\n"
            + "1100 \n"
            + "4000 \n"
            + "4025 \n"
            + "4030 \n"
            + "5080 \n");
    application.activeWindow.title.startOfBuffer(false);
    application.activeWindow.title.lineDown(1, false);
    application.activeWindow.title.charRight(5, false);

}


function zdb_MailboxsatzAnlegen() {

    var ppn;

    application.overwriteMode = false;
    ppn = application.activeWindow.getVariable("P3GPP");
    application.activeWindow.command("ein t", false);
    if (application.activeWindow.status != "OK") {
        application.messageBox("MailboxsatzAnlegen", "Sie haben nicht die nötigen Berechtigungen, um einen Mailboxsatz anzulegen.", "alert-icon");
        return false;
    }
    application.activeWindow.title.insertText (
                "0500 am\n"
            + "8900 !" + ppn + "!\n"
            + "8901 \n"
            + "8902 ");
    application.activeWindow.title.startOfBuffer(false);
    application.activeWindow.title.lineDown(2, false);
    application.activeWindow.title.charRight(5, false);

}

function zdb_LinkUrl() {
    // Ermittelt URLs aus den Feldern 4085 =u, 4085 =g, 485 =u, 485  =g, 750 =e, 750 =g
    // Ausgangsbildschirm ermitteln
    var strScreen = application.activeWindow.getVariable("scr");
    if (strScreen == "8A") {
        application.activeWindow.command("show d", false);
        open_xul_dialog("chrome://ibw/content/xul/ZDB_LinkUrl.xul", null);
    } else {
        application.messageBox("LinkURL", "Das Skript muss aus der Vollanzeige aufgerufen werden.", "alert-icon");
        return;
    }

}


function zdb_LokUrl() {
    // Ermittelt URLs aus den Feldern 7135 =u, 7135 =g
    // Ausgangsbildschirm ermitteln
    var strScreen = application.activeWindow.getVariable("scr");
    if (strScreen == "8A") {
        open_xul_dialog("chrome://ibw/content/xul/ZDB_LokUrl.xul", null);
    } else {
        application.messageBox("LokURL", "Das Skript muss aus der Vollanzeige aufgerufen werden.", "alert-icon");
        return;
    }

}

// =======================================================================
// START ***** EZB *****
// =======================================================================
function __druckausgabe( dppn, ld ) {

    var arr = new Array();
    var eppn = application.activeWindow.getVariable("P3GPP");
    var regexp;
    var satz;

    application.activeWindow.command("f idn " + dppn, true);

    if (application.activeWindow.status != "OK") {
        __zdbError("Die über 4243 verlinkte Druckausgabe existiert nicht.");
        return null;
    }

//	DocType = 1. Zeichen im Feld 0500
    if (application.activeWindow.materialCode.charAt(0) != "A") {
        __zdbMsg("Record der 'Druckausgabe' hat Materialcode "
                    + application.activeWindow.materialCode);
        return "";
    }

    satz = __zdbGetRecord("D",false);
    if (satz == null)			return null;

    regexp = new RegExp("!" + eppn + "!","gm");
    arr = satz.match(regexp);
    if (arr == null) {
        application.activeWindow.command("k",false);
        if (application.activeWindow.status != "OK") {
            __zdbMSG("Sie sind nicht berechtigt, den Datensatz zu ändern.");
            return "";
        }
        var insText = (ld == true) ? "Digital. Ausg." : "Online-Ausg.";
        application.activeWindow.title.endOfBuffer(false);
        application.activeWindow.title.insertText("4243 "+insText+"!" + eppn + "!\n"); // cs 23.07.2010
        //application.messageBox("EPPN", eppn, "alert-icon");
            application.activeWindow.simulateIBWKey("FR");
        //	Korrektur ausgeführt, dann ist der Titel im diagn. Format
        //	sonst im Korrekturformat
        //application.messageBox("SCR", application.activeWindow.getVariable("scr"), "alert-icon");
        if (application.activeWindow.getVariable("scr") != "8A") {
            __zdbMsg("Die Korrektur des Titel ist fehlgeschlagen. Bitte holen"
                    + "Sie dies direkt über die WinIBW nach.");
            return "";
        }
    } else {
        application.messageBox("Test","Die Verknüpfung zur Internetausgabe im Feld 4243 ist schon vorhanden.", "alert-icon");
    }

//---Feld "2010" , zurückgeben
    arr = satz.match(/^2010 .*/gm);
    if (arr == null)			return "";

    arr[0] = arr[0].replace(/^2010 (.*)/,"$1");
    return arr[0].replace(/\*/,"");

}


function __EZBNota(maske) {

    var DDC_EZB = {
        "000"  :["AK-AL","SQ-SU"],
        "004"  :["SQ-SU"],
        "010"  :["A"],
        "020"  :["AN"],
        "030"  :[""],
        "050"  :["A"],
        "060"  :["AK-AL"],
        "070"  :["AP"],
        "080"  :[""],
        "090"  :[""],
        "100"  :["CA-CI"],
        "130"  :["A"],
        "150"  :["CL-CZ"],
        "200"  :["B"],
        "220"  :["B"],
        "230"  :["B"],
        "290"  :["B"],
        "300"  :["Q","MN-MS"],
        "310"  :["Q"],
        "320"  :["MA-MM"],
        "330"  :["Q"],
        "333.7":["ZP"],
        "340"  :["P"],
        "350"  :["P"],
        "355"  :["MA-MM"],
        "360"  :["MN-MS","Q","A"],
        "370"  :["AK-AL","D"],
        "380"  :["Q","ZG"],
        "390"  :["LA-LC"],
        "400"  :["E"],
        "420"  :["H"],
        "430"  :["G"],
        "439"  :["G"],
        "440"  :["I"],
        "450"  :["I"],
        "460"  :["I"],
        "470"  :["F"],
        "480"  :["F"],
        "490"  :["E"],
        "491.8":["K"],
        "500"  :["TA-TD"],
        "510"  :["SA-SP"],
        "520"  :["U"],
        "530"  :["U"],
        "540"  :["V"],
        "550"  :["TE-TZ"],
        "560"  :["TE-TZ"],
        "570"  :["W"],
        "580"  :["W"],
        "590"  :["W"],
        "600"  :["ZG"],
        "610"  :["V","WW-YZ"],
        "620"  :["ZL","ZN","ZP"],
        "621.3":["ZN"],
        "624"  :["ZG","ZP"],
        "630"  :["ZA-ZE","WW-YZ"],
        "640"  :["ZA-ZE"],
        "650"  :["Q"],
        "660"  :["V","ZL"],
        "670"  :["ZL"],
        "690"  :["ZH-ZI"],
        "700"  :["LH-LO"],
        "710"  :["ZH-ZI"],
        "720"  :["ZH-ZI"],
        "730"  :["N"],
        "740"  :["LH-LO"],
        "741.5":["A"],
        "750"  :["LH-LO"],
        "760"  :["LH-LO"],
        "770"  :["LH-LO"],
        "780"  :["LP-LZ"],
        "790"  :["A"],
        "791"  :["LH-LO"],
        "792"  :["A"],
        "793"  :["ZX-ZY"],
        "796"  :["ZX-ZY"],
        "800"  :["E"],
        "810"  :["H"],
        "820"  :["H"],
        "830"  :["G"],
        "839"  :["G"],
        "840"  :["I"],
        "850"  :["I"],
        "860"  :["I"],
        "870"  :["F"],
        "880"  :["F"],
        "890"  :["K","E"],
        "891.8":["K"],
        "900"  :["N"],
        "910"  :["N","R"],
        "914.3":["N"],
        "920"  :["A","N"],
        "930"  :["LD-LG"],
        "940"  :["N"],
        "943"  :["N"],
        "950"  :["N"],
        "960"  :["N"],
        "970"  :["N"],
        "980"  :["N"],
        "990"  :["N"],
        "B"    :[""],
        "K"    :["A"],
        "S"    :[""]
    };
    if (maske == "")		return ""; // brauchen wir das noch?

    return DDC_EZB[maske];

}


function checkEZBAccount()
{
    if(application.getProfileString("zdb", "ezb.account", "") == "")
    {
        open_xul_dialog("chrome://ibw/content/xul/ZDB_EZBAccountDefinieren.xul", null);
    }
    var bibid = application.getProfileString("zdb", "ezb.account", "");
    if(bibid != "")
    {
        return bibid;
    }
    else
    {
        return false;
    }
}
//
// ZDB-Funktionen > EZB
//
//=============
function zdb_EZB() {

    var arr      = new Array();
    var _ddcnota = new Array();
    var _ezbnota = new Array();
    var _ezb     = new Array();
    var satz;
    var title, publisher, eissn, pissn, zdb_id, url;
    var volume1;
    var kat5080;
    var idx, jdx;
    var winsnap;
    var EZB_satz;
    var bibid = checkEZBAccount();

    
    if(!bibid)
    {
        __zdbError("Sie müssen ein gültige EZB-bibid angeben.");
        return;
    }

//	url zur EZB
    var dbformUrl = "http://www.bibliothek.uni-regensburg.de/internal/ezeit/dbform.phtml?";
    var frontDoor = "http://www.bibliothek.uni-regensburg.de/ezeit/?";

//	Dokumenttyp  8A: Vollanzeige, 7A: Kurzliste, MT: Fehler
    var strScreen = application.activeWindow.getVariable("scr");
    if ( (strScreen !="7A") && (strScreen !="8A") ) {
        __zdbError("Script muss aus der Vollanzeige/Kurzliste aufgerufen werden"); // cs 15.07.10
        return false;
    }

    satz = __zdbGetRecord("D",false);

//---Feld "2110" , Inhalt nach zdb_id
    arr = satz.match(/^2110 .*/gm);
    if (arr == null) {
        __zdbError("Die ZDB-ID (2110) fehlt");
        return false;
    }
    zdb_id = arr[0].substr(5);

//---Feld "4000" , Inhalt nach title
    arr = satz.match(/^4000 .*/gm);
    if (arr == null) {
        __zdbError("Der Titel (4000) fehlt");
        return false;
    }

    title                 = arr[0].substr(5);
    idx                   = title.indexOf(" / ");
    if (idx >= 0)	title = title.substr(0,idx);
    idx                   = title.indexOf(" : ");
    if (idx >= 0)	title = title.substr(0,idx);
    idx                   = title.indexOf(" = ");
    if (idx >= 0)	title = title.substr(0,idx);
    title                 = title.replace("[[Elektronische Ressource]]","");
    title                 = title.replace("//","/");
    idx                   = title.indexOf(" @");
    if (idx == 0)	title = title.substr(2);
    else if (idx > 0) {
        title = title.substr(idx+2) + ", " + title.substr(0,idx);
    }

    //---Feld "4005" , Inhalt an title anhängen
    arr = satz.match(/^4005 .*/gm);
    if (arr != null) {
        arr[0] = arr[0].substr(5);
        arr[0] = arr[0].replace("{",". ");
        arr[0] = arr[0].replace("}","");
        title = title + arr[0];
    }

    //title = title.replace("%","%25");
    //title = title.replace("&","%26");
    //title = encodeURI(title);
//---Feld "4030" , Inhalt nach publisher
    arr = satz.match(/^4030 .*/gm);
    if (arr == null) {
        __zdbError("Verlagsort(e) und Verleger (4030) fehlen.");
        return false;
    }
    publisher                 = arr[0].substr(5);
    idx                       = publisher.indexOf(" : ");
    if (idx >= 0)	publisher = publisher.substr(idx+3,publisher.length);
    //publisher = publisher.replace("%","%25");
    //publisher = publisher.replace("&","%26");

//---Feld "2010" , Inhalt nach eissn
    eissn = "";
    arr = satz.match(/^2010 .*/gm);
    if (arr != null)
    {
        eissn = arr[0].substr(5);
        eissn = eissn.replace('*','');
    }
    idx = eissn.indexOf(" ");
    if (idx >= 0)
    {
        eissn = eissn.substr(idx);
        eissn = eissn.replace('*','');
    }
//---URL-Feld "4085" , Inhalt nach url, mehrere aneinander
    url = "";
    arr = satz.match(/^4085 .*=u .*/gm);
    if (arr != null) {
        for (idx=0; idx<arr.length; idx++) {
            jdx = arr[idx].indexOf("=u ");
            if (jdx < 0)					continue;
            arr[idx] = arr[idx].substr(jdx+3);
            jdx = arr[idx].indexOf("=x ");
            if (jdx >= 0)	arr[idx] = arr[idx].substr(0,jdx);
            if (arr[idx].substr(0,frontDoor.length) == frontDoor)		continue;
            url += "\n" + arr[idx];
        }
    }

    if (url == "") {
        __zdbError("Die URL (4085) fehlt.");
        return false;
    }
    url = url.substr(1);
    //url = url.replace("%","%25");
    //url = url.replace("&","%26");

//---Feld "4025" , Inhalt nach volume1
    volume1 = "";
    arr = satz.match(/^4025 .*/gm);
    if (arr != null) {
        volume1 = arr[0].substr(5);
        //volume1 = volume1.replace("%","%25");
        //volume1 = volume1.replace("&","%26");
    }

//---Feld "5080" , Inhalt nach notation
// geändert cs 2010-07-21

    // inhalt von 5080 ohne zdb-notation
    kat5080 = satz.match(/^5080 [\w ;]*/gm);
    // nur ddc notation
    _ddcnota = kat5080[0].substr(5).split(';');

    if (_ddcnota != null) {
        for(var i in _ddcnota){
            // ruft ddc-ezb konkordanz
            _ezb = __EZBNota(_ddcnota[i]);
            for(var x in _ezb) {
                _ezbnota.push(_ezb[x]);
            }
        }
    //--- nur unique ezb-notationen
    _ezbnota = __zdbArrayUnique(_ezbnota);
    }

//---Druckausgabe: reziproke Verknüpfung und Druck-ISSN
    arr = satz.match(/^4243 Druckausg.[:]*!.*/gm);
    if (arr != null) {
        winsnap = application.windows.getWindowSnapshot();
        arr[0]  = arr[0].replace(/^4243 Druckausg.[:]*!([^!]*)!/,"$1");
        var ld  = (satz.match(/^0600 .*?ld/gm) != null) ? true : false; // code fuer layoutgetreue Digitalisierung?
        pissn   = __druckausgabe(arr[0],ld);
        application.windows.restoreWindowSnapshot(winsnap);
    }

    if (pissn == "" ) {
        if (!__zdbYesNo("Eine reziproke Verknüpfung ist nicht möglich. Möchten Sie trotzdem fortfahren?")) {
            return false;
        }
    } else {
        pissn = (!pissn) ? '' : pissn.replace('*','');
    }


    EZB_satz =
        "title="     + escape(title)  + "&publisher="  + escape(publisher)
                     + "&eissn="      + eissn   + "&pissn="      + pissn
                     + "&zdb_id="     + zdb_id  + "&url="        + escape(url)
                     + "&volume1="    + escape(volume1);
    if(_ezbnota != null){
        for(var i in _ezbnota){
            EZB_satz += "&notation[]=" + _ezbnota[i];
        }
    }
    EZB_satz +=	"&charset=utf8";
    EZB_satz +=	"&bibid="+bibid;
    EZB_satz = EZB_satz.replace(/ /g,"%20");
    application.shellExecute(dbformUrl+EZB_satz,5,"open","");
//	4 bedeutet ja und nein; 6=ja 7=nein
    if (__zdbYesNo (
                "Falls nicht automatisch Ihr Browser mit der EZB-Darstellung\n"
            + "in den Vordergrund kommt, wechseln Sie bitte in den Browser\n"
            + "und kontrollieren die Übereinstimmung Ihrer Aufnahme mit dem\n"
            + "im Browser gezeigten Titel.\n\n"
            + "Ist die EZB-Aufnahme korrekt und soll die Frontdoor-url\n"
            + "eingetragen werden?") ) {
    //	Press the "Korrigieren" button
        application.activeWindow.command("k d", false);
        if (application.activeWindow.status != "OK") {
            __zdbMsg("Sie sind nicht berechtigt, den Datensatz zu ändern.");
            return false;
        }
    //	Go to end of buffer without expanding the selection
        application.activeWindow.title.endOfBuffer(false);
    //	EZB-Frontdoor einfügen
        application.activeWindow.title.insertText("4085 =u " + frontDoor);
        application.activeWindow.title.insertText(zdb_id.substr(0,zdb_id.length-2));
        application.activeWindow.title.insertText("=x F");
    //	Press the <ENTER> key
        application.activeWindow.simulateIBWKey("FR");

    //	Dokumenttyp  8A: korrekt, MT: Fehler
        if (application.activeWindow.getVariable("scr") != "8A") {
            __zdbMsg("Die Korrektur des Titel ist fehlgeschlagen. Bitte holen"
                    + "Sie dies direkt über die WInIBW nach.");
            return "";
        }

    }

}

// =======================================================================
// ENDE ***** EZB *****
// =======================================================================

function zdb_Back(){

    // Workaround für Button Zurück ( gedrehter Pfeil nach links)
    application.activeWindow.simulateIBWKey("FE");

}