function sendEPNToLBS()
{
   	const XMLHttpRequest = Components.Constructor("@mozilla.org/xmlextras/xmlhttprequest;1");   
	var request = XMLHttpRequest();  
    var sIdLBS = application.getSIdLBS();
    var ePN = __Trim(application.activeWindow.findTagContent("7800", 0, false));
    var url = sIdLBS + "&EPN=" + ePN;
 //   application.messageBox("url", url, "");    
  	request.open("GET", url, false);  
 	request.send("");
	application.setSIdLBS("");
}

function __sendEPNToLBS()
{
	return __areBothEPNAndSIDLBSAvailable();
}

function __isSIdLBSAvailable()
{
 	if (application.getSIdLBS()  != "") return true;                
	return false;	
}

function __isEPNAvailable()
{
    if (application.activeWindow.getVariable("scr") == "8A") {    
        if (application.activeWindow.findTagContent("7800", 0, false) != "") return true; 
        return false;      
    } else {
		return false;
    }    
}

function __areBothEPNAndSIDLBSAvailable()
{
    if ((__isEPNAvailable() && __isSIdLBSAvailable()) == true) return true;  
		return false;	
}
 		
function __Trim(sInString) {
	if (sInString == 0) return "";
	sInString = sInString.replace( /^\s+/g, "" );// strip leading
	return sInString.replace( /\s+$/g, "" );// strip trailing
}