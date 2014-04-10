// Datei:		zdb_scripte_perUser.js
// Autor:		
// Datei fuer nutzerspezifische Standarskripts

function zdbCsvTest()
{
    var csv = new CSV();
    csv.csvFilename = "BSB_test.csv";
    csv.startLine = 1;
    csv.delimiter = ";";
    csv.__csvBatchCSVToTest = function ()
    {
        application.activeWindow.command("show d", false);
        // edit record
        try{
            application.activeWindow.command("k", false);
        } catch(e) {
            csv.__csvLOG("\tDatensatz kann nicht geoeffnet werden.\nFehlermeldung: " + e);
            return;
        }
        if (application.activeWindow.status != "ERROR") {
            __zdbError(csv.line['zdb'] + " " + csv.line['1101'] + " " + csv.line['1109']);
            //	save buffer
            return csv.__csvSaveBuffer(true,"War nur ein Test");
        } else {
            //	return undone but write error to a log file
            return csv.__csvSaveBuffer(false,"\tDatensatz kann nicht geoeffnet werden. Status = ERROR.\n");
        }
    }
    csv.__csvSetProperties(csv.__csvBatchCSVToTest,["zdb","1101","1109"],'zdb','zdb',false,"Test_LOG.txt");
    try
    {	
        csv.__csvAPI();
        
    } 
    catch(e)
    {
        csv.__csvError(e);
    }	
}

function zdbCsvGoogle()
{
    var csv = new CSV();
    var digiConfig;
    csv.csvFilename = "BSB_test.csv";
    //csv.csvFilename = "BSB_test2.csv";
    //csv.csvFilename = "BSB_2001-4000.csv";
    csv.startLine = 1;
    csv.delimiter = ";";
    csv.__makeConfig = function()
    {
        var digi = new Object();
        digi[1101] = {kat:"1101 ",cont:"cr"};
        if(csv.line['1109'] != "") digi[1109] = {kat:"1109 ",cont:csv.line['1109']};
        if(csv.line['2050'] != "") digi[2050] = {kat:"2050 ",cont:csv.line['2050']};
        if(csv.line['4025'] != "") digi[4025] = {kat:"4025 ",cont:csv.line['4025']};
        if(csv.line['4048'] != "") digi[4048] = {kat:"4048 ",cont:csv.line['4048']};
        if(csv.line['4085'] != "") digi[4085] = {kat:"4085 ",cont:"="+csv.line['4085']};
        if(csv.line['4119'] != "") digi[4119] = {kat:"4119 ",cont:csv.line['4119']};
        if(csv.line['4233'] != "") digi[4233] = {kat:"4233 ",cont:csv.line['4233']};
        if(csv.line['4237'] != "") digi[4237] = {kat:"4237 ",cont:csv.line['4237']};
        //if(csv.line['4251'] != "") digi[4251] = {kat:"4251 ",cont:csv.line['4251']};
        if(csv.line['4701'] != "") digi[4701] = {kat:"4701 ",cont:csv.line['4701']};
        return digi;
    },
    csv.__reziprok = function()
    {
        var tagcontent = application.activeWindow.title.currentField;
        // Prüfen, ob eine von Ausrufezeichen umschlossene IDN vorhanden ist
        var text = tagcontent.substring(tagcontent.indexOf("!"),tagcontent.lastIndexOf("!")+1); 
        var regExpPPN = /!(\d{8,9}[\d|x|X])!/;
        if (!regExpPPN.test(text)) {
            csv.__csvSaveBuffer(false,"Es ist keine ID-Nummer zum Verlinken gefunden worden.");
            return;
        }
        application.activeWindow.title.startOfField(false);
        var feldnr = tagcontent.match(/^\d{4,4}(\s[fsz]#)?/g);

       // Datensatz speichern, wenn Status != OK Abbruch.
        if (application.activeWindow.status == "OK") {
            csv.__csvSaveBuffer(true,"BSB Google Digitalisat erstellt");
        } else {
            csv.__csvSaveBuffer(false,"Datensatz konnte nicht gespeichert werden. Status = " + application.activeWindow.status);
            return;
        }
        var quellID = application.activeWindow.getVariable("P3GPP");
        if (application.activeWindow.status != "OK"){
            csv.__csvSaveBuffer(false,"Reziprok Link konnte nicht erstellt werden. Status = " + application.activeWindow.status);
            return;
        }
        zielID = regExpPPN.exec(text);
        // Kommando abschicken und Ergebnis in gleichen Fenster anzeigen
        application.activeWindow.command("f idn " + zielID[1], false); // <=== Kommando in demselben Fenster

        //Datensatz in der Vollanzeige prüfen. Wenn PPN noch nicht vorkommt, dann jetzt einfuegen:
        if (application.activeWindow.copyTitle().indexOf(quellID) == -1 ) 
        {
            // F7 (Korrektur" drücken)
            application.activeWindow.command("k d",false);
            application.activeWindow.title.endOfBuffer(false);
            application.activeWindow.title.insertText("4243 Digital. Ausg.!" + quellID + "!" + "\n");
            application.activeWindow.simulateIBWKey ("FR");
            if (application.activeWindow.status !== "OK")
            { 
                csv.__csvSaveBuffer(false,"Reziprok Link konnte nicht erstellt werden. Status = " + application.activeWindow.status);
                return;
            }
            else{
                csv.__csvSaveBuffer(true,"Reziprok Link erstellt " + zielID + " ---> " + quellID);
                return;
            }
        }
        else {
            csv.__csvSaveBuffer(false,"Der Link zu " + quellID + " ist schon vorhanden!");
            return;
        }
    },
    csv.__merge = function(feld4243) {
        var mergeId = feld4243.substring(feld4243.indexOf("!")+1,feld4243.lastIndexOf("!"));
        application.activeWindow.command("f idn " + mergeId, false);
        application.activeWindow.command("k d",false);
        
        if(application.activeWindow.title.findTag("0600",0,true,true,false) !== "")
        {
            if(!application.activeWindow.title.find("ld",0,false,true,false))
            {
                application.activeWindow.title.endOfField(false);
                application.activeWindow.title.insertText(";ld");
            }
            if(!application.activeWindow.title.find("la",0,false,true,false))
            {
                application.activeWindow.title.endOfField(false);
                application.activeWindow.title.insertText(";la");
            }
        }
        else
        {
            application.activeWindow.title.endOfBuffer(false);
            application.activeWindow.title.insertText("\n0600 ld;la\n");
        }
        if(csv.line['4025'] != "")
        {
            // pruef umfang von 4025
            var feld1100 = application.activeWindow.title.findTag("1100",0,false,true,false);
            var feld1100erstesJahr = feld1100.substr(0,4);
            
            
            var inhalt7120 = __feld7120(false,false,"4025 "+ csv.line['4025']);
            var matchJahr = inhalt7120.match(/\/b([0-9]{4,4})/);
        
        
            if(matchJahr[1] < feld1100erstesJahr) // 4025 nur uberschreiben wenn umfangreicher als vorh.
            {
                //var feld4025 = application.activeWindow.title.findTag("4025",0,false,true,false);
                application.activeWindow.title.findTag("4025",0,false,true,false);
                //if(feld4025.match(/mehr nicht digital/))
                //{
                    application.activeWindow.title.replace(csv.line['4025']);
                    if("" != application.activeWindow.title.findTag("4024",0,false,true,false))
                    {
                        application.activeWindow.title.deleteLine(1);
                    }
                    //application.activeWindow.title.findTag("4025",0,false,true,false);
                    __feld7120(false,true,false);
                //}
            }

        }
        // 4024 erzeugen
        if("" == application.activeWindow.title.findTag("4024",0,false,true,false))
        {
            application.activeWindow.title.findTag("4025",0,false,true,false);
            __feld7120(false,true,false);
        }
        if(csv.line['4237'] != "")
        {
            if( application.activeWindow.title.findTag("4237",0,false,true,false) !== "" )
            {
                application.activeWindow.title.endOfField(false);
                application.activeWindow.title.charLeft(1,true);
                if(application.activeWindow.title.selection == ".")
                {
                    application.activeWindow.title.endOfField(false);
                    application.activeWindow.title.insertText(" - ");
                }
                else
                {
                    application.activeWindow.title.endOfField(false);
                    application.activeWindow.title.insertText(". - ");
                }
                application.activeWindow.title.insertText(csv.line['4237']);
            }
            else
            {
                application.activeWindow.title.endOfBuffer(false);
                application.activeWindow.title.insertText("\n4237 " + csv.line['4237']+"\n");
            }
        }
        
        if(csv.line['4701'] != "")
        {
            if( application.activeWindow.title.findTag2("4701",0,false,true,false) !== "" )
            {
                application.activeWindow.title.insertText(csv.line['4701']+"###");
            }
            else
            {
                application.activeWindow.title.endOfBuffer(false);
                application.activeWindow.title.insertText("\n4701 " + csv.line['4701']+"\n");
            }
        }
        application.activeWindow.title.endOfBuffer(false);
        if(csv.line['1109'] != "") application.activeWindow.title.insertText("\n1109 " + csv.line['1109']+"\n");
        if(csv.line['4048'] != "")
        {
            // doppelte Einträge verhindern
            if(!application.activeWindow.title.find("4048 " + csv.line['4048'],false,false,true))
            {
                application.activeWindow.title.insertText("\n4048 " + csv.line['4048']+"\n");
            }
        }
        if(csv.line['4085'] != "") application.activeWindow.title.insertText("\n4085 =" + csv.line['4085']+"\n");
        if(csv.line['4233'] != "") application.activeWindow.title.insertText("\n4233 " + csv.line['4233']+"\n");
        if (application.activeWindow.status !== "OK")
        { 
            csv.__csvSaveBuffer(false,"Merge konnte nicht abgeschlossen werden. Status = " + application.activeWindow.status);
            return;
        }
        else{
            csv.__csvSaveBuffer(true,"Merge mit Google-Digitalisat abgeschlossen");
            return;
        }
        return;
    },
    
    csv.__bsbdigi = function ()
    {
        var feld4243;
        var x = 0;
        while((feld4243 = application.activeWindow.findTagContent("4243", x, false)) !== "")
        {
            if( feld4243.substr(1,7) == "Digital") {
                csv.__merge(feld4243);
                return;
            }
            x++;
        }
        digiConfig = csv.__makeConfig();
        __digitalisierung(digiConfig,false,"resource:/ttlcopy/zdb_titeldatenkopie_digi_bsb.ttl");
        
        if(application.activeWindow.title.findTag("0600",0,true,true,false) !== "")
        {
            if(!application.activeWindow.title.find("ld",0,false,true,false))
            {
                application.activeWindow.title.endOfField(false);
                application.activeWindow.title.insertText(";ld");
            }
            if(!application.activeWindow.title.find("la",0,false,true,false))
            {
                application.activeWindow.title.endOfField(false);
                application.activeWindow.title.insertText(";la");
            }
        }
        else
        {
            application.activeWindow.title.endOfBuffer(false);
            application.activeWindow.title.insertText("\n0600 ld;la\n");
        }
        if("" == application.activeWindow.title.findTag("4024",0,true,true,false))
        {
            application.activeWindow.title.findTag("4025",0,false,true,false);
            __feld7120(false);
        }
        application.activeWindow.title.find("4243 Druckausg",false,false,false);
        //csv.__reziprok();
        //return;
    }
    csv.__csvSetProperties(csv.__bsbdigi,["zdb","1101","1109","2050","4025","4048","4085","4119","4233","4237","4701"],'zdb','zdb',false,"BSB_Google_LOG.csv");
    try
    {
        csv.__csvAPI();
        
    } 
    catch(e)
    {
        csv.__csvError(e);
    }
}

function vd18(){
    var csv = new CSV();
    csv.csvFilename = "BSB_ZDBID_VD18.csv";
    csv.startLine = 1;
    csv.delimiter = ";";
    
    csv.__vd18 = function(){
        application.activeWindow.simulateIBWKey ("F7");
        application.activeWindow.title.endOfBuffer(false);
        application.activeWindow.title.insertText("\n2199 " + csv.line['vd18']+"\n");
        if (application.activeWindow.status != "ERROR") {
            return csv.__csvSaveBuffer(true,csv.line['vd18']);
        } else {
            //	return undone but write error to a log file
            return csv.__csvSaveBuffer(false,"\tDatensatz kann nicht gespeichert werden. Status = ERROR.\n");
        }
            
    }
    csv.__csvSetProperties(csv.__vd18,["zdb","vd18"],'zdb','zdb',false,"VD18_LOG.txt");
    try
    {
        csv.__csvAPI();
        
    } 
    catch(e)
    {
        csv.__csvError(e);
    }
}

function vd18_4260(){
    var csv = new CSV();
    csv.csvFilename = "erg_DE-16.csv";
    csv.startLine = 1;
    csv.delimiter = ";";
    
    csv.__vd18 = function(){
        application.activeWindow.simulateIBWKey ("F7");
        var x = 1;
        if(application.activeWindow.title.findTag("4260", 0, true, true, false) != "" ){
            application.activeWindow.title.replace("\n4260 "+csv.line['4260']+"\n");
        }
        else
        {
            application.activeWindow.title.replace("\n4260 "+csv.line['4260']+"\n");
        }
        while( application.activeWindow.title.findTag("4260", x, true, true, false) != "" )
        {
            application.activeWindow.title.replace("\n4260 "+csv.line['4260']+"\n");
            x++;
        }
        if (application.activeWindow.status != "ERROR") {
            return csv.__csvSaveBuffer(true,csv.line['4260']);
        } else {
            //	return undone but write error to a log file
            return csv.__csvSaveBuffer(false,"\tDatensatz kann nicht gespeichert werden. Status = ERROR.\n");
        }
            
    }
    csv.__csvSetProperties(csv.__vd18,["zdb","4260"],'zdb','zdb',false,"VD18_4260_LOG.txt");
    try
    {
        csv.__csvAPI();
        
    } 
    catch(e)
    {
        csv.__csvError(e);
    }
}

function kaun(){
var csv = new CSV();
csv.__csvSetLogFilename("LOG_kaun_Zsn_China_count_prod.csv");
var fileInput = utility.newFileInput();
var record = "";
var deletes = new Object();
var zdbid;
var orgkat;
var kat4000, kat4000split, kat4213new, verfasser;
//var feld4213Inhalt = "";
var feld4213 = "";
var input = false;
        if(fileInput.openSpecial("ProfD", "\\csv\\Zsn_China_count.txt")) {
            var aLine = "";
            //while(fileInput.isEOF != true) {
            while((aLine = fileInput.readLine()) != null) {
            //__zdbError(aLine);
            //__zdbError(record);
                if(aLine.substr(0,4) == "0500") input = true;
                
                if(aLine != "")
                {
                    if(aLine.substr(0,4) == "2110") {
                        zdbid = aLine.substr(5);
                    }
                    else if(input == true)
                    {
                        if(aLine.match( /^\d\d\d\d\s\$T\d\d\d?\$U/))
                        {
                            orgkat = aLine.substr(0,4);
                            deletes[orgkat] = orgkat;
                            record += "\n"+aLine;
                        }
                        if(aLine.substr(0,4) == "4213")
                        {
                            if(aLine.match(/4213 Abweichende Wortbildung d. Hauptsacht.:\s/))
                            {
                                feld4213 = aLine;
                        //       feld4213Inhalt = aLine.replace(/4213 Abweichende Wortbildung d. Hauptsacht.:\s/, "");
                        //        __zdbError("4213 "+ feld4213Inhalt);
                           }
                        }
                    }
                }
                else
                {
                    
                    application.activeWindow.command("f zdb " + zdbid,false);
                    application.activeWindow.command("k",false);
                    application.activeWindow.title.startOfBuffer(false);
                    
                    kat4000 = application.activeWindow.title.findTag("4000",0,false,false,false);
                    if(!kat4000.match(/^\$T\d\d\d?\$U/))
                    {
                        //if(feld4213Inhalt != ""){
                            kat4000split = kat4000.split(/\s[:=]\s/);
                            if(1 < kat4000split.length)
                            {
                                if(verfasser = kat4000split[kat4000split.length-1].match(/(\s\/\s.*)$/))
                                {
                                     kat4213new = kat4000split[0] + verfasser[0];
                                }
                                else
                                {
                                    kat4213new = kat4000split[0];
                                }
                            } 
                            else
                            {
                                kat4213new = kat4000split[0];
                            }
                        //}
                        
                        //if(feld4213Inhalt == kat4213new)
                        //{
                        //    __zdbError(feld4213Inhalt +" == "+ kat4213new);
                        //    record += "\n"+feld4213;
                        //}
                        //else
                        //{
                        //    __zdbError(feld4213Inhalt +" != "+ kat4213new);
                            record += "\n4213 Abweichende Wortbildung d. Hauptsacht.: " + kat4213new;
                        //}
                        
                        for(var i in deletes)
                        {
                            while(application.activeWindow.title.findTag(deletes[i], 0, false, true, false) != "")
                            {
                                application.activeWindow.title.deleteLine(1);
                            }
                        }
                        application.activeWindow.title.endOfBuffer(false);
                        application.activeWindow.title.insertText(record);
                    }
                    else
                    {
                        if(feld4213)
                        {
                            if("" == application.activeWindow.title.findTag("4213",0,false,false,false))
                            {
                                application.activeWindow.title.endOfBuffer(false);
                                application.activeWindow.title.insertText("\n"+feld4213);
                            }
                            
                        }
                    }
                    
                    

                    if (application.activeWindow.status != "ERROR") {
                        csv.__csvSaveBuffer(true,"Zsn_China_count von " + zdbid);
                    } else {
                    //	return undone but write error to a log file
                        csv.__csvSaveBuffer(false,"\tDatensatz kann nicht gespeichert werden. Status = ERROR.\n");
                    }
                    input = false;
                    record = "";
                    zdbid = "";
                    orgkat = "";
                    deletes = Object();
                    delete kat4000, kat4000split, kat4213new, verfasser;
                    //feld4213Inhalt = "";
                    feld4213 = "";
                }
            }
            
        }
        else
        {
            __zdbError("Error opening file");
        }
fileInput.close();
}

function kaun_save(){
var csv = new CSV();
csv.__csvSetLogFilename("LOG_kaun_Zsn_China_count.csv");
var fileInput = utility.newFileInput();
var record = "";
var zdbid;
var input = false;
        if(fileInput.openSpecial("ProfD", "\\csv\\Zsn_China_count_rest.txt")) {
            var aLine = "";
            //while(fileInput.isEOF != true) {
            while((aLine = fileInput.readLine()) != null) {
            //__zdbError(aLine);
            //__zdbError(record);
                if(aLine.substr(0,4) == "0500") input = true;
                
                if(aLine != "")
                {
                    if(aLine.substr(0,4) == "2110") {
                        zdbid = aLine.substr(5);
                    }
                    else if(aLine.substr(0,4).match(/2240|2115|2006|2198|4105|4276|4700|4711|4712|4713|4821|5330|5550/))
                    {
                    
                    }
                    else if(input == true)
                    {
                        record += "\n"+aLine;
                    }
                }
                else
                {
                    
                    application.activeWindow.command("f zdb " + zdbid,false);
                    application.activeWindow.command("k",false);
                    application.activeWindow.title.startOfBuffer(false);
                    application.activeWindow.title.endOfBuffer(true);
                    application.activeWindow.title.deleteSelection();
                    application.activeWindow.title.endOfBuffer(false);
                    application.activeWindow.title.insertText(record);
                    if (application.activeWindow.status != "ERROR") {
                        csv.__csvSaveBuffer(true,"Zsn_China_count_rest von " + zdbid);
                    } else {
                    //	return undone but write error to a log file
                        csv.__csvSaveBuffer(false,"\tDatensatz kann nicht gespeichert werden. Status = ERROR.\n");
                    }
                    input = false;
                    record = "";
                    zdbid = "";
                }
            }
            
        }
        else
        {
            __zdbError("Error opening file");
        }
fileInput.close();
}


function setBearbeiten()
{

	var csv = new CSV();
	//csv.__csvSetLogFilename("LOG_kat4244bsb.txt");
	//csv.__csvSetLogFilename("LOG_exloeschen00900467X.txt");
	csv.__csvSetLogFilename("LOG_ergERessource.txt");
	// IDN der eigenen Bibliothek
	//csv.__csvSetEigeneBibliothek("00900467X");
    
	var setSize = application.activeWindow.getVariable("P3GSZ");

    i = 1;
    do {

		//__kat4244bsb(i,csv);
        //__setBearbeitenLokaldatenLoeschen(i,csv);
        __setBearbeitenUnterfeldErg(i,csv,"p","021A","$nElektronische Ressource");
        i++;

    } while (i <= setSize)

}

function __setBearbeitenUnterfeldErg(iterator,csv,format,feld,unterfeld)
{
    // edit record
    try
    {
        application.activeWindow.command("k " + iterator + " " + format,false);
        var idn = application.activeWindow.getVariable("P3GPP");
    }
    catch(e) 
    {
        csv.__csvLOG("\tDatensatz kann nicht geoeffnet werden.\nFehlermeldung: " + e);
        return;
    }
    if (application.activeWindow.status != "ERROR")
    {
            var y = 0;
            var cont;
            var  ind, ind2;
            while((application.activeWindow.title.findTag2(feld, y, true, true, false) != "") ){
                cont = application.activeWindow.title.currentField;
                ind = cont.indexOf("$d");
                ind2 = cont.indexOf("$f");
                ind3 = cont.indexOf("$h");
                if(ind != -1)
                {
                    application.activeWindow.title.charRight(ind,false);
                }
                else if(ind2 != -1)
                {
                    application.activeWindow.title.charRight(ind2,false);
                }
                else if(ind3 != -1)
                {
                    application.activeWindow.title.charRight(ind3,false);
                }
                else
                {
                    application.activeWindow.title.endOfField(false);
                }
                // inert new field content
                application.activeWindow.title.insertText(unterfeld);
                y++;
            }

    //	save buffer
        return csv.__csvSaveBuffer(true,"Ergaenzungen: " + y);

    } else {
        //	return undone but write error to a log file
        return csv.__csvSaveBuffer(false,"\tDatensatz kann nicht geoeffnet werden. Status = ERROR.");
    }
} // end of method

function __kat4244bsb(iterator,csv){
    	// edit record
    try
    {
        application.activeWindow.command("k " + iterator + " p",false);
        var idn = application.activeWindow.getVariable("P3GPP");
    }
    catch(e) 
    {
        csv.__csvLOG("\tDatensatz kann nicht geoeffnet werden.\nFehlermeldung: " + e);
        return;
    }
    if (application.activeWindow.status != "ERROR")
    {
            //--- vars we need
        var feld4244 = new Array();
        //var subfield = "";
        var code = "";
        var x = 0;
        var y;
        var sav = Array("039B","039C","039E","039S");
        
        // save
        for(var u = 0; u < sav.length; u++)
        {
            y = 0;
            //__zdbError("find " + sav[u] + "["+y+"]");
            while((application.activeWindow.title.findTag(sav[u], y, false, true, false) != "") ){
                //__zdbError(application.activeWindow.title.currentField);
                //if(!application.activeWindow.title.find("$9",true,true,false))
                if(!application.activeWindow.title.currentField.match(/\$9/))
                {
                    feld4244[x] = application.activeWindow.title.currentField;
                    //__zdbError(feld4244[x]);
                    x++;
                    
                }
                //else if(application.activeWindow.title.find("$8--O",true,true,false)){
                else if(application.activeWindow.title.currentField.match(/\$8--O/)){
                    feld4244[x] = application.activeWindow.title.currentField.match(/(.*)\$8/)[1];
                    //__zdbError(feld4244[x]);
                    x++;
                    
                }
                y++;
                
            }
        }
        // delete
        for(u = 0; u < sav.length; u++)
        {        
            application.activeWindow.title.startOfBuffer(false);
            while(application.activeWindow.title.findTag(sav[u], 0, false, true, false) != ""){
                    application.activeWindow.title.deleteLine(1);
            }
        }
        
        // paste
        var expansion;
        application.activeWindow.title.endOfBuffer(false);
        for(var i = 0; i < feld4244.length; i++)
        {
            //__zdbError(feld4244[i]);
            while(feld4244[i].match(/\$\$/))
            {
                feld4244[i] = feld4244[i].replace(/\$\$/, "\$");
            }
            feld4244[i] = feld4244[i].replace(/</, " <");
            feld4244[i] = feld4244[i].replace(/(.*--->)(\s?:\s)(.*)/, "$1 $3");
            //feld4244[i] = feld4244[i].replace(/([^:]*)([^>]*)/, "$1"); // TODO check this
            while(feld4244[i].match(/\s\s/))
            {
                feld4244[i] = feld4244[i].replace(/\s\s/, " ");
            }
            if(expansion = feld4244[i].match(/\$r(.*)/))
            {
                expansion = __expansionUF(expansion[1]);
                //__zdbError(expansion);
                feld4244[i] = feld4244[i].replace(/(.*)\$r(.*)/,"$1\$r"+expansion);
                application.activeWindow.title.insertText(feld4244[i] + "\n");
            }
            else
            {
                application.activeWindow.title.insertText(feld4244[i] + "\n");
            }
            //__zdbError(expansion[1]);
            //expansion = __expansionUF(expansion[1]);
            //feld4244[i] = feld4244[i].replace(/(.*)\{(.*)}/,"$1{"+expansion[1]+"}");
            
            
        }
        
        //return csv.__csvSaveBuffer(true,"424X geandert.");
    }else {
        //	return undone but write error to a log file
        return csv.__csvSaveBuffer(false,"\tDatensatz kann nicht geoeffnet werden. Status = ERROR.");
    }
}


function __setBearbeitenLokaldatenLoeschen(iterator,csv)
{
    // edit record
    try
    {
        application.activeWindow.command("k " + iterator,false);
        var idn = application.activeWindow.getVariable("P3GPP");
    }
    catch(e) 
    {
        csv.__csvLOG("\tDatensatz kann nicht geoeffnet werden.\nFehlermeldung: " + e);
        return;
    }
    if (application.activeWindow.status != "ERROR")
    {

        // go to the end of the buffer
        application.activeWindow.title.endOfBuffer(false);
        var lastLineNumber = application.activeWindow.title.currentLineNumber;
        var currentField = "";
        var newfield = "";
        
        var iterator = 1;
        // go to the local records
        while(application.activeWindow.title.findTag("700"+iterator,0,false,true,false) == "" && iterator < 99)
        {
         iterator++;
        }

        // search returns array of line counts
        var hitLines = csv.__utilCsvBatchCSVSearch(csv.eigene_bibliothek,lastLineNumber);
        

        if(hitLines.length == 0)
        {
            return csv.__csvSaveBuffer(false,"String " + csv.eigene_bibliothek + " kann nicht gefunden werden.\n");
        }
        
        
        for(var i = 0; i < hitLines.length;i++)
        {
            
            // go to the local records
            iterator = 1;
            // go to the local records
            while(application.activeWindow.title.findTag("700"+iterator,0,false,true,false) == "" && iterator < 99)
            {
             iterator++;
            }

            // go to the current hit 
            application.activeWindow.title.lineDown(hitLines[i],false);
        
            // go one line up
            //application.activeWindow.title.lineUp(1,false);
            
            // as long as regex test is false
            var test = false;
            var count = 0;
            
            do
            {
                // write selection into variable
                currentField = application.activeWindow.title.currentField;
                test = csv.__utilCsvBatchCSVLineUpAndTest70XX(currentField);
                count++;
            } while(test != true && count < 10)
            
            // write selection into variable
            application.activeWindow.title.lineDown(1,false);
            currentField = application.activeWindow.title.currentField;
            //csv.__csvError(currentField);
            // replace x?? with l; {0,2} : zero or two letters after the x
            newfield = currentField.replace(/: [xau].{0,2}/,': l');
            // select current line
            application.activeWindow.title.startOfField(false);
            application.activeWindow.title.endOfField(true);
            // inert new field content
            application.activeWindow.title.insertText(newfield);
            csv.__csvLOG(idn + "\tErsetzt: "+ currentField + " gegen " + newfield + " in Zeile " + application.activeWindow.title.currentLineNumber);

        }

    //	save buffer
        return csv.__csvSaveBuffer(true,newfield);

    } else {
        //	return undone but write error to a log file
        return csv.__csvSaveBuffer(false,"\tDatensatz kann nicht geoeffnet werden. Status = ERROR.");
    }
} // end of method

function mailFernleih(){
    var csv = new CSV();
    csv.csvFilename = "Konfiguration.csv";
    csv.startLine = 1;
    csv.delimiter = ";";
    
    csv.__mailfernleih = function(){
        application.activeWindow.command("k d",false);
        application.activeWindow.title.endOfBuffer(false);
        if("" != csv.line['mailpass']) application.activeWindow.title.insertText("\n810 e$d" + csv.line['mailpass']+"\n");
        if("" != csv.line['mailact']) application.activeWindow.title.insertText("\n810 f$d" + csv.line['mailact']+"\n");
        if (application.activeWindow.status != "ERROR") {
            return csv.__csvSaveBuffer(true,csv.line['isi']);
        } else {
            //	return undone but write error to a log file
            return csv.__csvSaveBuffer(false,"\tDatensatz kann nicht gespeichert werden. Status = ERROR.\n");
        }
    }
    csv.__csvSetProperties(csv.__mailfernleih,["isi","mailact","mailpass"],'isi','isi',false,"LOG_mailFernleih.txt");
    try
    {
        csv.__csvAPI();
        
    } 
    catch(e)
    {
        csv.__csvError(e);
    }
}

function OSM(){
    if (application.activeWindow.getVariable("scr") != "MI") {
        __zdbError("Die Funktion kann nur im Korrekturmodus aufgerufen werden.");
        return;
    }
    var iterator = 0;
    var repl = false;
    var feld371;
    var prompter = utility.newPrompter();
    while((feld371 = application.activeWindow.title.findTag2("371",iterator,true,true,false)) == "")
    {
        if(feld371.match(/\$2S/)) break;
        iterator++;
    }
    if(feld371.match(/\$k|\$l/))
    {
        if(!prompter.confirm("OSM Koordinaten",
        "In diesem Datensatz gibt es bereits Koordinaten. Sollen diese überschrieben werden?")) {
            return false;
        }
        else{
            repl = true;
        }
    }

    var street = feld371.match(/371 ([^$]*)/);
    var city = feld371.match(/\$b([^$]*)/);
    var plz = feld371.match(/\$e([^$]*)/);
    var adr = street[1]+" "+plz[1]+" "+city[1];
	var msg,xmlrow,display_name,lat,lon;
    var url = "http://nominatim.openstreetmap.org/search.php?q="
    var format = "&format=xml";
    var selected = false;

    var xmlDoc = __zdbGetXML(url+encodeURIComponent(adr)+format);
    /*if(!xmlDoc || xmlDoc == false) {
        __zdbError("Keine OSM Daten für Adresse vorhanden");
        return false;
    }*/
    var xmlrows = xmlDoc.getElementsByTagName("place");
    if(xmlrows.length < 1)
    {
        while(xmlrows.length < 1)
        {
            if(prompter.prompt("OSM Koordinaten","Keine OSM-Daten für diese Adresse. Neuer Versuch mit geänderter Adresse?",adr,"",""))
            {
                adr = prompter.getEditValue();
                xmlDoc = __zdbGetXML(url+encodeURIComponent(adr)+format);
                xmlrows = xmlDoc.getElementsByTagName("place");
                
            }
            else
            {
                return;
            }
        }
    }
    else
    {
        application.shellExecute(url+adr,5,"open","");
    }
    var xmlRowsCount = xmlrows.length;
    var treffer = 0;
    var latfull,lonfull,ind;
    for(var r=0; r < xmlRowsCount; r++) {
        xmlrow = xmlrows[r];
        display_name = xmlrow.getAttribute("display_name");
        latfull = xmlrow.getAttribute("lat");
        ind = latfull.indexOf(".")+6;
        lat = latfull.substr(0,ind);
        lonfull = xmlrow.getAttribute("lon");
        ind = lonfull.indexOf(".")+6;
        lon = lonfull.substr(0,ind);
        treffer++;
        if(prompter.confirm("OSM Koordinaten",
        "Sollen diese Koordinaten übernommen werden?\nTreffer: "+treffer+" von "+xmlRowsCount+"\nTitel: "+display_name+"\nLAT: "+lat+"\nLon: "+lon+"\n"+url+adr)) {
            selected = true;
            break;
        }
    }
    if(!selected) return;
    if(repl)
    {
        var re = /\$k[^$]*\$l[^$]*/;
        var replacementpattern = "$k"+lon+"$l"+lat;
        var result = feld371.replace(re, replacementpattern);
        application.activeWindow.title.deleteLine(1);
        application.activeWindow.title.insertText("\n"+result+"\n");
    }
    else
    {
        var subfields = new Array("$n","$o","$p","$z","$2","$3");
        var ind;
        for(var i = 0;i<subfields.length;i++)
        {
            ind = application.activeWindow.title.currentField.indexOf(subfields[i]);
            if(ind != -1)
            {
                application.activeWindow.title.charRight(ind,false);
                application.activeWindow.title.insertText("$k"+lon+"$l"+lat);
                return;
            }
        }
    }
}


function __zdbGetXML(url)
{
    try {
        var req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance();
		req.open('GET', url, false);
        req.setRequestHeader("Content-Type", "application/xml");
		req.send(null);
        return req.responseXML;
    } catch(e) {
        __zdbError("Exception: " + e);
		return false;
	}
}