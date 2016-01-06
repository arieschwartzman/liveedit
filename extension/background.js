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

function publish(msgName) {
    pubnub.publish({
        channel: "theme_update",
        message: { "goto": msgName }
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

function parentsOnClick(info, tab) {
    if (tab) {
        chrome.tabs.sendMessage(tab.id, { action: "getParents" }, function (response) { });
    }
}

function setActive() {
    var liveEditItem  = chrome.contextMenus.create({
        "title": "LiveEdit", "onclick": function (info, tab) {
            console.log('LiveEdit');
        }
    });

    var gotoItem = chrome.contextMenus.create(
      {"title": "Goto", "parentId": liveEditItem, "onclick": gotoOnClick});

    var getParentsItem = chrome.contextMenus.create(
  { "title": "getParents", "parentId": liveEditItem, "onclick": parentsOnClick });

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
	    publish(msg.msgName);
	}
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
	checkActive();
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	checkActive();
});

checkActive();