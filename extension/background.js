/*
	CTRE v1.0.3
	by @blade_sk
*/
console.log("in ext 1");
var pubnub = PUBNUB.init({
    subscribe_key: 'sub-c-ae38e384-b45b-11e5-a916-0619f8945a4f', // always required
    publish_key: 'pub-c-cc7ebb2a-df4f-433a-aae1-076955b3534d'    // only required if publishing
});

pubnub.subscribe({

    channel: "theme_update",
    message: function(m){

        console.log(m)
        if(m=='refresh'){
            chrome.tabs.query({"active": true}, function (tabs) {

				for (var i=0; i < tabs.length; i++) {
					chrome.tabs.sendMessage(tabs[i].id, 'reload_theme', function() {

					});
				}

            });
        }
    }
});

function publish(msgName, msgData) {
    pubnub.publish({
        channel: "theme_update",
        message: { msgName: msgName, msgData: msgData }
    });

}

function sendMsg(values)
{
	chrome.tabs.getSelected(null, function(tab) {
		chrome.tabs.sendMessage(tab.id, values);
	});
}

function gotoOnClick(info, tab) {
    if (tab)
    {
        chrome.tabs.sendMessage(tab.id, { action: "goto" }, function (response) { });
    }
}

function changeBorderOnClick(info, tab) {
    if (tab) {
        chrome.tabs.sendMessage(tab.id, { action: "changeBorder" }, function (response) { });
    }
}

function setActive() {

    chrome.browserAction.setIcon({ path: "icon_active.png" });
	chrome.browserAction.setTitle( { title: "Click to start spying on element [active]" });
}

function setInactive() {
	chrome.browserAction.setIcon( { path: "icon.png" } );
	chrome.browserAction.setTitle( { title: "Click to start spying on element" });
	chrome.contextMenus.RemoveAll();
}

function checkActive()
{
	chrome.tabs.getSelected(0, function(tab) {
		if (tab.url.substr(0,4) != 'http')
		{
			chrome.browserAction.setIcon( { path: "icon.png" } );
			chrome.browserAction.setTitle( { title: "Click to start spying on [inactive]" });
			chrome.browserAction.disable(tab.id);
			return;
		}
		else
		{
			chrome.browserAction.enable(tab.id);
		}
		
		chrome.tabs.sendMessage(tab.id, { action: 'getStatus' }, function(isActive) {
			if (isActive)
				setActive();
			else
				setInactive();
		});
	});
}


chrome.runtime.onInstalled.addListener(function() {
    var liveEditItem = chrome.contextMenus.create({
        "title": "LiveEdit", "onclick": function (info, tab) {
            console.log('LiveEdit');
        }
    });

    var gotoItem = chrome.contextMenus.create(
        { "title": "Goto", "parentId": liveEditItem, "onclick": gotoOnClick });

    var changeBorder = chrome.contextMenus.create(
        { "title": "Border", "parentId": liveEditItem });

    var NoneBorder = chrome.contextMenus.create(
        { "title": "None", "parentId": changeBorder, "onclick": changeBorderOnClick });

    var NoneBorder = chrome.contextMenus.create(
        { "title": "1 px", "parentId": changeBorder, "onclick": changeBorderOnClick });

    var NoneBorder = chrome.contextMenus.create(
        { "title": "2 px", "parentId": changeBorder, "onclick": changeBorderOnClick });

    var NoneBorder = chrome.contextMenus.create(
        { "title": "4 px", "parentId": changeBorder, "onclick": changeBorderOnClick });

});

chrome.browserAction.onClicked.addListener(function() {
	sendMsg( { 'action': 'toggle' } );
});

chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {
	if (msg.action == 'status' && msg.active == true)
		setActive();
	else if (msg.action == 'status' && msg.active == false)
	    setInactive()

    // Send class name through pubnub
	else if (msg.action == 'gotoAdmin') {
	    console.log("BackgroundMsg --> ClassName: " + msg.msgName);

	    publish("goto" ,msg.msgName);
	}

	    // Send border size through pubnub
	else if (msg.action == 'changeBorder') {
	    console.log("BackgroundMsg --> changeBorder");

	    publish("changeBorder", msg.msgName);
	}
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
	checkActive();
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	checkActive();
});

checkActive();