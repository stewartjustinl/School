// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var _gParam;  //final parameter is loaded in to variable from local store . this will be used for url redirection.
var isLocalStorecreated;
var unInstallSurveyURL="https://security.symantec.com/pfb/pFeedback_form.aspx?products=chrome%20norton%20safe%20search&uninstall=y";
var _gBrowserLanguage = navigator.languages ? navigator.languages[0] : (navigator.language || navigator.userLanguage);

var winIdCollections = winIdCollections || {};
var port = port || null;
var isNewlyConnected = true;
var gGuid="";
var nKeepChangeShowFailedCount;
var KEEPCHANAGE_MAX_ATTEMPT =5;
var GUID_LENGTH =42;
var GUID_STARTING_OFFSET=6;

//Update guid
function updateGuid(){

  var str =_gParam;
  var bdindex = str.indexOf("&guid=");
  if(bdindex== -1)
    return;
  if(str.length<bdindex+GUID_LENGTH)
    return;
  gGuid= str.substring(bdindex+GUID_STARTING_OFFSET, bdindex+GUID_LENGTH);
  

}

//Retrive KeepChange Show attempt  failed count
function getKeepChangeInstalled(){
	chrome.storage.local.get('KeepChangeShowFailedCount', function (obj) {
 		if(!obj.KeepChangeShowFailedCount){
			nKeepChangeShowFailedCount=0;
		}
		else{
			nKeepChangeShowFailedCount=obj.KeepChangeShowFailedCount;
		}
    });
}



//Store the Url Parameter in to local store.
function storeUserPrefs(UrlPrefs) {
        chrome.storage.local.set({'SymQueryUrl': UrlPrefs}, function() {
			_gParam=UrlPrefs;
			updateGuid();
			});
};


function storeExtensionFeedbackParams(extnFeedbackParams) {    
        chrome.storage.local.set({'ExtensionFeedbackParamsDSP': extnFeedbackParams}, 
		function() {
			//console.log('Saved', 'ExtensionFeedbackParamsDSP', extnFeedbackParams);
		});
};


//To set  the uninstall url - launch the survey  page
function setUninstallURLForDSP  ( ) {
	chrome.storage.local.get("ExtensionFeedbackParamsDSP", function (obj) {		
		if(chrome.runtime.setUninstallURL) {
			var extnFeedbackInfo;
			if(obj.ExtensionFeedbackParamsDSP) {
				extnFeedbackInfo = obj.ExtensionFeedbackParamsDSP;
				var finalUrl = unInstallSurveyURL;
				//Add some more params
				if(extnFeedbackInfo) {
					finalUrl +=  extnFeedbackInfo;
				}
				//2 - Add source as "remove" for uninstall the extn
				finalUrl += "&source=remove";
				chrome.runtime.setUninstallURL(finalUrl);	
			} else {
				//console.log('ExtensionFeedbackParamsDSP not saved')
			}
		}
	});	
}

//Retrieve local parameter from local store and assign this value in to global variable _gParam.
function getUserPrefs() {
    chrome.storage.local.get('SymQueryUrl', function (obj) {
		isLocalStorecreated=false;
		if(!obj.SymQueryUrl)
		{
		  _gParam='&chn=Default';
		}
		else
		{
			_gParam = obj.SymQueryUrl;
      updateGuid();
			isLocalStorecreated= true;
		}
	});
};

function setUninstallURLWithFeedbackSurvey() {
	//for Non english browser language - 
	if (_gBrowserLanguage == "en-US")
	{
		setUninstallURLForDSP();
	}
}

var getGuid = function ()
{
	 var guid = [
    new Date().getTime().toString(16).slice(3, 11),
    Math.random().toString(16).slice(2, 6),
 
    (Math.random() * .0625  + .25 ).toString(16).slice(2, 6),
    (Math.random() * .25 + .5 ).toString(16).slice(2, 6),
    Math.random().toString(16).slice(2, 14)].join('-');
  
  return guid;
	
};

//selfExecuting method  to load final parameter in to variable from local store.  
var DSP = (function () {
    "use strict";
   getUserPrefs();
   setUninstallURLWithFeedbackSurvey();
   getKeepChangeInstalled();
}());

// parase the parameter and create json object list
var parseQueryString = function( queryString ) {
    var params = {}, queries, keyVal,tempUrl,i, l;

	tempUrl =  queryString.split("?");
	if(tempUrl.length<2)
		return 'Default';
	queryString= tempUrl[1];
	
    // Split into key/value pairs
    queries = queryString.split("&");

    // Convert the array of strings into an object
    for ( i = 0, l = queries.length; i < l; i++ ) {
        keyVal = queries[i].split('=');
        params[keyVal[0].toLowerCase()] = keyVal[1];
    }
    return params;
};

var parseProduct = function( productname ) {
    var params ="Default";
	
	if( productname.indexOf('nsbackup')!=-1)  // To handle more cases , this need to move to switch case
		params='NSBU';
	
    return params;
};

//convert the date formate into MMDDYYYY
var getFormattedDate = function (date) {
  var year = date.getFullYear();
  var month = (1 + date.getMonth()).toString();
  month = month.length > 1 ? month : '0' + month;
  var day = date.getDate().toString();
  day = day.length > 1 ? day : '0' + day;
  return year +"-"+ month +"-"+  day ;
};

chrome.browserAction.onClicked.addListener(function(tab) {
	var newURL = "https://search.norton.com/?o=APN11908"+_gParam;
        chrome.tabs.create({ url: newURL });
});

chrome.tabs.query({'url':['https://identitysafe.norton.com/*', 'chrome://extensions/*','https://chrome.google.com/webstore/detail/*'],currentWindow: true, active: true }, function (tabs) {
	var urlParamObj;
	var paraml;  //final param loaded int to variable from local store
	var extnFeedbackSurveyParams="";
	if(tabs.length>0)
	{
		if(isLocalStorecreated == true && tabs[0].url.indexOf('identitysafe.norton.com')==-1)// in case of extention enabled and disabled we need to update the date only.
		{
			chrome.storage.sync.get("DspVersion", function (obj) {
				if(obj.DspVersion&& obj.DspVersion!=chrome.app.getDetails().version)
					return; // this is auto upgrade , we should not update the born date.
				});
				
			chrome.storage.sync.set({"DspVersion": chrome.app.getDetails().version},
				function() {console.log('DspVersion Saved');});			
			
			var str =_gParam;
			var bd = new Date();	
			var bdindex = str.indexOf("&doi=");
			if(bdindex== -1)
				return;
			if(str.length<bdindex+15)
				return;
			var oldbd = str.substring(bdindex+5, bdindex+15);
			 _gParam =str.replace(oldbd,getFormattedDate(bd));
			storeUserPrefs(_gParam);
			return;		
		}
		
		//persist the portal url for feature purpose
		chrome.storage.sync.set({"PortalUrlDsp": tabs[0].url},
				function() {console.log('PortalUrlDsp Saved');});	
		
		urlParamObj = parseQueryString(tabs[0].url);
		if(!urlParamObj)
			return;
		
		// if the key name doesn't follow the rules of how to write key name, use urlParamObj["key_name"]
		if(urlParamObj.partnerid) {
			paraml="&chn="+urlParamObj.partnerid;
			extnFeedbackSurveyParams = extnFeedbackSurveyParams + "&partnerId=" + urlParamObj.partnerid;
		}
		else
			paraml="&chn=Default";//This dummy 'chn' parameter appended to addressress double redirection issue.
		
		if(urlParamObj.guid) {
			paraml=paraml+"&guid="+urlParamObj.guid;
			extnFeedbackSurveyParams = extnFeedbackSurveyParams + "&mid=" + urlParamObj.guid;
		}
		else
			paraml=paraml+"&guid="+ getGuid();
		
		if(urlParamObj.doi) {
			paraml=paraml+"&doi="+urlParamObj.doi;
			extnFeedbackSurveyParams = extnFeedbackSurveyParams + "&doi=" + urlParamObj.doi;
		}
		else{
			var bd = new Date();
			paraml=paraml+"&doi="+getFormattedDate(bd);			
		}
		
		if(urlParamObj.version) {
			paraml=paraml+"&ver="+urlParamObj.version;
			extnFeedbackSurveyParams = extnFeedbackSurveyParams + "&productVersion=" + urlParamObj.version;
		}
		
		if(urlParamObj.product) {
			paraml=paraml+"&prt="+parseProduct(urlParamObj.product);
			extnFeedbackSurveyParams = extnFeedbackSurveyParams + "&productId=" + urlParamObj.product;
		}
		
		if(urlParamObj.geo)
			paraml = paraml+"&geo="+urlParamObj.geo;
		if(urlParamObj.locale)
			paraml = paraml+"&locale="+urlParamObj.locale;		
		if(urlParamObj.source)
			paraml = paraml+"&trackId="+urlParamObj.source;
		
		storeUserPrefs(paraml);
		getUserPrefs();
		
		//for  english browser language - pls check for ShowUninstallSurvey key in the url. if its 1, save the uninstallurl
		if (_gBrowserLanguage == "en-US")
		{
			if(urlParamObj.showuninstallsurvey && (urlParamObj.showuninstallsurvey == '1') )
			{
				storeExtensionFeedbackParams(extnFeedbackSurveyParams);
				setUninstallURLWithFeedbackSurvey();
			}			 
		}
	}
});

function callback_sendmessage_keepchanges_wrap (detail)
{
var details = detail;
var callback_sendmessage_keepchanges = function (cWND) {
				var tabID = details.tabId;
				if (chrome.runtime.lastError) {
					return;
				}
				if (undefined !== cWND) {
					if (cWND.id in winIdCollections) {
						// check what to handle here
					}
					else {
						var windID = cWND.id;
						winIdCollections[cWND.id] = 1;
            if(nKeepChangeShowFailedCount<5){
						        sendTrackMessage(windID, tabID); // Send Msg to NMH to track the keep changes window.
                  }
					}

				}        

				}
return callback_sendmessage_keepchanges
}
var callback_keepchanges = function (details) {
		if( (details.url.indexOf("APN11908") != -1)&&(details.url.indexOf("chn") == -1) ) {
      if(nKeepChangeShowFailedCount==KEEPCHANAGE_MAX_ATTEMPT){
        sendTelemetryForChromeDSPKeepChangeAccepted("1");
        nKeepChangeShowFailedCount++; //increment the count so that next time we will not sent telemetry
        chrome.storage.local.set({'KeepChangeShowFailedCount': nKeepChangeShowFailedCount},function() {/*console.log( "Current Count==> " +nKeepChangeShowFailedCount);*/});
      }
			chrome.windows.getCurrent(callback_sendmessage_keepchanges_wrap(details));
		}
	}

chrome.webRequest.onBeforeRequest.addListener(
    function (details) {	
	 if( (details.url.indexOf("APN11908") != -1)&&(details.url.indexOf("chn") == -1) ) 
		return { redirectUrl : details.url+_gParam };
		}  , { urls: ["<all_urls>"], types: ["main_frame"]}, ["blocking"]);

// Send info to NMH to track 'Keep Changes' window [for first time DSP seacrh from a window]
chrome.webRequest.onBeforeRequest.addListener(
callback_keepchanges, { urls: ["<all_urls>"], types: ["main_frame"]});
	
chrome.windows.onRemoved.addListener(function (winId) {
	if (chrome.runtime.lastError) {
					return;
	}
	if (undefined !== winId) {
        OnWindowClosed(winId);
	}
});

function getNativePort() {
	if (!port) {
		port = chrome.runtime.connectNative('com.nco.namsghst');
		isNewlyConnected = true;
	}
	if (port && isNewlyConnected) {
		isNewlyConnected = false;
		port.onMessage.addListener(function (msg) {
			NativeMessageHostHandler(msg);
		});

		port.onDisconnect.addListener(function () {
			port = null;
			isNewlyConnected = true;
		});

	}
	return port;
}

function disconnectFromNativeHost() {
    var p = getNativePort();
    if (p) {
        p.disconnect();
        port = null;      
    }
}

function disconnectNMHIfNoMoreWindows(){
    chrome.windows.getAll(function (windows) {
        if (0 === windows.length){
            disconnectFromNativeHost();    
        }        
    });
}
	
function OnWindowClosed(winId) {
	if (winId in winIdCollections) {
		delete winIdCollections[winId];
	}
	disconnectNMHIfNoMoreWindows();
}

// Send NMH message to track the Keep changes window.
function sendTrackMessage(windID, tabID) {
	var message = new Object();
	message.messageName = 'ShowKeepChangeDlg';
	message.windowId = windID;
    message.tabId = tabID;
	message.dlgType = 2;
	postNativeMessage(message);
}

function postNativeMessage(message) {
	var nativePort = getNativePort();
	if (nativePort) {
		/*console.log("Send NMH Msg to track DSP window"+JSON.stringify(message));*/
		nativePort.postMessage(message);
	}
}
// NMH Message Handler
function NativeMessageHostHandler(msg){
 if (msg !== undefined) 
     {
        var callerId = msg.messageName;
        if (callerId == 'ShowKeepChangeDlg') 
        {
          if(msg.status=="true"){
            sendTelemetryForChromeDSPKeepChangeDetected("1");
            nKeepChangeShowFailedCount=0;
    			}
          else{
            	nKeepChangeShowFailedCount=nKeepChangeShowFailedCount+1;
          }
          chrome.storage.local.set({'KeepChangeShowFailedCount': nKeepChangeShowFailedCount},function() {/*console.log( "Current Count==> " +nKeepChangeShowFailedCount+" ShowKeepChangeDlg "+msg.messageName);*/});
        }
		else
			;
	   /*console.log("ShowKeepChangeDlg "+msg.messageName);*/
	 }

}


//Adding GA

var telemetryConstants = {};
telemetryConstants.TELEMETRY_CATEGORY =
{
    HP: 'HP',
    DSP: 'DSP'
};

telemetryConstants.ACTION_TYPE =
{
    CHROME_DSP_KEEP_CHANGE_DETECTED: 'Chrome DSP Keep Change detected',
    CHROME_DSP_KEEP_CHANGE_ACCEPTED: 'Chrome DSP Keep Change Accepted'
};

telemetryConstants.parameters = {
    EVENT: "t",
    CATEGORY: "ec",
    ACTION: "ea",
    LABEL: "el"
};

telemetryConstants.HIT_TYPE = {
    PAGE_VIEW: 'pageview',
    SCREEN_VIEW: 'screenview',
    EVENT: 'event',
    EXCEPTION: 'exception'
};

telemetryConstants.GA_INIT = {
	TRACKING_ID: 'UA-96896032-1',
    VERSION: '1',          // The protocol version. This value should be 1.
    HOST: 'https://www.google-analytics.com/collect',
    POST: 'POST'
};


telemetryConstants.defaultParameters = {
    VERSION: 'v',
    TRACKING_ID: 'tid',
    CLIENT_ID: 'cid',
};

var telemetry = {};
telemetry.defaultParameters = null;
telemetry.initialised = false;

var telemetryWrapper = {};
telemetryWrapper.initGAParameters = function (tracking_id) {

    if (!tracking_id)
        return false;

    if (!gGuid)
        return false;

    var defaultParameterList = {};

    defaultParameterList[telemetryConstants.defaultParameters.VERSION] = telemetryConstants.GA_INIT.VERSION;
    defaultParameterList[telemetryConstants.defaultParameters.TRACKING_ID] = tracking_id;
    defaultParameterList[telemetryConstants.defaultParameters.CLIENT_ID] = gGuid;

    var defaultParameterMsgBody = telemetryWrapper.constructMessageBody(defaultParameterList);
    if (null === defaultParameterMsgBody)
        return false;

    telemetry.defaultParameters = defaultParameterMsgBody;
    telemetry.initialised = true;

    return true;

}

telemetryWrapper.send = function (category, action, label) {

    if (!category)
        return false;

    if (!action)
        return false;

    if (!label)
        return false;

    if (!telemetry.defaultParameters)
        return false;

    var parameterList = {};

    parameterList[telemetryConstants.parameters.EVENT] = telemetryConstants.HIT_TYPE.EVENT;
    parameterList[telemetryConstants.parameters.CATEGORY] = category;
    parameterList[telemetryConstants.parameters.ACTION] = action;
    parameterList[telemetryConstants.parameters.LABEL] = label;

    var request = new XMLHttpRequest();
    if (null === request)
        return false;
    request.open(telemetryConstants.GA_INIT.POST,
                 telemetryConstants.GA_INIT.HOST, true);

    var msgBody = telemetryWrapper.constructMessageBody(parameterList);
    if (null === msgBody)
        return false;

    msgBody += "&" + telemetry.defaultParameters;
    request.send(msgBody);

    return true;

}

telemetryWrapper.constructMessageBody = function (parameters) {

    if (!parameters) {
        return null;
    }

    if (Object.keys(parameters).length === 0) {
        return null;
    }

    var messageBody = "";
    for (var prop in parameters) {
        messageBody += prop + "=" + parameters[prop] + "&";
    }

    if (messageBody.length < 0)
        return null;

    messageBody = messageBody.substring(0, messageBody.length - 1);

    return messageBody;
};


function sendTelemetryForChromeDSPKeepChangeDetected(telemetryData) {

    if (!telemetry.initialised) {
              if (!telemetryWrapper.initGAParameters(telemetryConstants.GA_INIT.TRACKING_ID)){
                return;
              }
    }
	telemetryWrapper.send(telemetryConstants.TELEMETRY_CATEGORY.DSP,
                          telemetryConstants.ACTION_TYPE.CHROME_DSP_KEEP_CHANGE_DETECTED,
						                            telemetryData)
}


function sendTelemetryForChromeDSPKeepChangeAccepted(telemetryData) {

    if (!telemetry.initialised) {
              if (!telemetryWrapper.initGAParameters(telemetryConstants.GA_INIT.TRACKING_ID)){
                return;
              }
    }
	telemetryWrapper.send(telemetryConstants.TELEMETRY_CATEGORY.DSP,
                          telemetryConstants.ACTION_TYPE.CHROME_DSP_KEEP_CHANGE_ACCEPTED,
						                            telemetryData)
}

//end telemetry
