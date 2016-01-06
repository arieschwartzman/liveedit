/*
	CTRE v1.0.3
	by @blade_sk
*/

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
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
	checkActive();
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	checkActive();
});

checkActive();