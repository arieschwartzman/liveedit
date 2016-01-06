/*
	CTRE v1.0.4
	by @blade_sk
*/

ctre = {
    hoveredElement: false,
    markedElement: false,
    contextMarkedElement: false,
    hideHistory: [],
    targetingMode: false,
    transpose: 0, // how far to travel up the line of ancestors

    clickCatcherTimeout: false,
    mouseHelper: false,
    helpWindow: false,
    
	
	highlightElement: function()
	{
		if (!ctre.hoveredElement) return;
		
		if (ctre.markedElement)
		{
			ctre.markedElement.style.outline = "";
			ctre.markedElement.style.outlineOffset = "";
		}
		
		ctre.markedElement = ctre.hoveredElement;
		
		var i = 0;
		for (i = 0; i < ctre.transpose; i++)
		{
			if (ctre.markedElement.parentNode != window.document)
				ctre.markedElement = ctre.markedElement.parentNode;
			else
				break;
		}
		
		ctre.transpose = i;
		document.getElementById("transpose").innerHTML = ctre.transpose;
		document.getElementById("transpose_plural").style.display = (i == 1 ? 'none' : 'inline');
			
		ctre.markedElement.style.outline = "solid 6px rgba(255,0,0,0.5)";
		ctre.markedElement.style.outlineOffset = "-4px";
	},
	
	mouseover: function(e)
	{
		if (e.target == ctre.mouseHelper) return false;
		if (e.target == ctre.helpWindow || e.target.parentNode == ctre.helpWindow) return false;
		
		if (ctre.hoveredElement != e.target)
		{
			ctre.transpose = 0;
			ctre.hoveredElement = e.target;
			ctre.highlightElement();
		}
	},
	
	mousemove: function(e)
	{
		if (ctre.clickCatcherTimeout) clearTimeout(ctre.clickCatcherTimeout);
		
		var body = document.querySelector("body");
		
		ctre.mouseHelper.style.display = "none";
		ctre.mouseHelper.style.left = - body.scrollLeft + e.pageX + "px";
		ctre.mouseHelper.style.top = - body.scrollTop + e.pageY + "px";
		
		ctre.clickCatcherTimeout = setTimeout(function() { ctre.mouseHelper.style.display = "block"; }, 10);
	},
	
	contextmenu:  function(e) {
	    if (ctre.markedElement) {
	        ctre.contextMarkedElement = ctre.markedElement;
	    } else {
	        ctre.contextMarkedElement = false;
	    }
	},

	keyDown: function(e)
	{
		if (e.ctrlKey && e.shiftKey && e.keyCode == 88)
		{
			if (ctre.targetingMode)
				ctre.deactivate();
			else
				ctre.activate();
				
			return false;
		}
		
		if (e.keyCode == 27)
		{
			if (ctre.targetingMode) ctre.deactivate();
		}
		
		
		if (ctre.targetingMode && e.keyCode == 81) // q
		{
			if (ctre.transpose > 0) ctre.transpose--;
			ctre.highlightElement();
			e.stopPropagation(); e.preventDefault();
			return false;
		}
		else if (ctre.targetingMode && e.keyCode == 87) // w
		{
			ctre.transpose++;
			ctre.highlightElement();
			e.stopPropagation(); e.preventDefault();
			return false;
		}
	},
	
	keyUp: function(e)
	{
		
		if (ctre.targetingMode && e.keyCode == 81) // q
		{
			e.stopPropagation(); e.preventDefault();
			return false;
		}
		
		if (ctre.targetingMode && e.keyCode == 87) // w
		{
			e.stopPropagation(); e.preventDefault();
			return false;
		}
	},
	
	
	
	onFirstActivation: function()
	{
		var div = document.createElement('div');
		div.setAttribute("id", "ctre_mouse_helper");
		document.body.appendChild(div);
		div.style.position = "fixed";
		div.style.marginLeft = "-20px";
		div.style.marginTop = "-20px";
		div.style.width = "40px";
		div.style.height = "40px";
		div.style.backgroundColor = "#ffffff";
		div.style.zIndex = 99999;
		div.style.opacity = 0.0001;
		div.style.cursor = "default";
		
//		div.addEventListener('click', ctre.hideTarget);
		ctre.mouseHelper = div;
		
		div = document.createElement('div');
		div.setAttribute("id", "ctre_help_window");
		document.body.appendChild(div);
		div.style.position = "fixed";
		div.style.left = "0px";
		div.style.top = "0px";
		div.style.width = "260px";
		div.style.padding = "12px";
		div.style.backgroundColor = "rgba(240, 238, 237, 0.9)";
		div.style.fontFamily = "Arial, sans-serif";
		div.style.fontSize = "10px";
		div.style.textAlign = "left";
		div.style.lineHeight = "1.2";
		div.style.borderRadius = "0 0 8px 0";
		div.style.borderBottom = "solid 1px rgba(200, 198, 197, 0.9)";
		div.style.borderRight = "solid 1px rgba(200, 198, 197, 0.9)";
		div.style.color = "#666666";
		div.style.zIndex = 100000;
		div.style.display = "none";
		div.innerHTML = '<b style="font-size: 12px;">Live Edit Element</b> &nbsp;&nbsp;&nbsp; <span style="color: #888; font-family:  monospace;">Ctrl+Shift+X</span>'
			+'<div style="margin-top: 6px;"></div><span style="font-family: monospace;">Ctrl+Z</span> undo, <span style="font-family: monospace;">ESC</span> exit<br>'
			+'<span style="font-family: monospace;">Q/W</span> go down/up one level. Currently up <span id="transpose" style="font-weight: bold;">0</span> level<span id="transpose_plural">s</span>'

		ctre.helpWindow = div;

	},
	
	activate: function()
	{
		if (!ctre.mouseHelper) ctre.onFirstActivation();
		
		ctre.targetingMode = true;
		document.addEventListener('mouseover', ctre.mouseover, true);
		document.addEventListener('mousemove', ctre.mousemove);
		document.oncontextmenu = ctre.contextmenu;

		ctre.mouseHelper.style.display = "block";
		ctre.helpWindow.style.display = "block";

		ctre.addOverlays();
		
		chrome.extension.sendMessage({action: 'status', active: true});
	},
	
	deactivate: function()
	{
		ctre.targetingMode = false;
		
		if (ctre.markedElement)
		{
			ctre.markedElement.style.outline = "";
			ctre.markedElement.style.outlineStyle = "";
		}
		ctre.markedElement = false;
		
		ctre.mouseHelper.style.display = "none";
		ctre.helpWindow.style.display = "none";
		
		document.removeEventListener('mouseover', ctre.mouseover, true);
		document.removeEventListener('mousemove', ctre.mousemove);
		document.removeEventListener('contextmenu', ctre.contextMenu);

		ctre.removeOverlays();
		
		chrome.extension.sendMessage({action: 'status', active: false});
	},
	
	toggle: function()
	{
		if (ctre.targetingMode) ctre.deactivate();
		else ctre.activate();
	},
	
	addOverlays: function()
	{
		// first we need to add position: relative to all the TDs
		// table based layouts return buggy offsetLeft/Top otherwise
		var elms = document.querySelectorAll("td");

		for (i = 0; i < elms.length; i++)
		{
			var e = elms[i];

			e.origPos = e.style.position;
			e.style.position = e.origPos || "relative";
		};
		
		// add overlay over each iframe / embed
		// this is needed for capturing mouseMove over the whole document
		var elms = document.querySelectorAll("iframe, embed");

		for (i = 0; i < elms.length; i++)
		{
			var e = elms[i];

			var new_node = document.createElement("div");
			new_node.className="ctre_overlay";
			//new_node.innerHTML = html;
			new_node.style.position = "absolute";
			new_node.style.left = e.offsetLeft - e.scrollLeft + "px";
			new_node.style.top = e.offsetTop - e.scrollTop + "px";
			new_node.style.width = e.offsetWidth + "px";
			new_node.style.height = e.offsetHeight + "px";
			new_node.style.background = "rgba(255,128,128,0.2)";
			new_node.style.zIndex = 99998;
			new_node.relatedElement = e;
			
			e.parentNode.insertBefore(new_node, e.nextSibling);
		};
	},
	
	removeOverlays: function()
	{
		var elms = document.querySelectorAll("td");
		for (i = 0; i < elms.length; i++)
		{
			var e = elms[i];
			e.style.position = e.origPos;
		};
		
		var elms = document.querySelectorAll(".ctre_overlay");
		for (i = 0; i < elms.length; i++)
		{
			var e = elms[i];
			e.parentNode.removeChild(e);
		};
	},
	

    // the function finds the highlight element class name and send it to admin through PubNub
	gotoAdmin: function() {
	    if (ctre.contextMarkedElement) {
	        console.log("gotoAdmin: function --> ClassName: " + ctre.contextMarkedElement.className);
	        chrome.extension.sendMessage({ action: 'gotoAdmin', msgName: ctre.contextMarkedElement.className });
	    }
	},

	gotoAdminSpecificClass: function (className) {
	    if (ctre.contextMarkedElement) {
	        console.log("gotoAdmin: function --> ClassName: " + className);
	        chrome.extension.sendMessage({ action: 'gotoSplit', msgName: className });
	    }
	},

    // the function finds the highlight element class name and send it to admin through PubNub
	changeBorder: function (borderSize) {
	    if (ctre.contextMarkedElement) {
	        chrome.extension.sendMessage({ action: 'changeBorder', msgData: ctre.contextMarkedElement.className, borderSize: borderSize });
	    }
	},

	createPopup: function()
	{
	    if (ctre.contextMarkedElement) {
	        var popup = open("", "Popup", "width=300,height=200");
	        var res = ctre.contextMarkedElement.className.split(" ");
	        for (var i = 0; i < res.length; i++) {
	            var element = popup.document.createElement("input");
	            element.type = "submit";
	            element.id = res[i];
	            element.value = res[i];
	            element.setAttribute("name", res[i]);
	            element.onclick = function () { // Note this is a function
	                ctre.gotoAdminSpecificClass(this.id);
	                popup.close();
	            };
	            popup.document.body.appendChild(element);
	        }
	    }
	},


	init: function()
	{
		document.addEventListener('keydown', ctre.keyDown);
		document.addEventListener('keyup', ctre.keyUp);

		chrome.extension.onMessage.addListener(function (msg, sender, responseFun) {
			if (msg.action == "toggle")
				ctre.toggle();
			else if (msg.action == "getStatus")
				responseFun(ctre.targetingMode);
		});
	}


}


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action == 'goto')  
    {
         ctre.gotoAdmin();
    }

    if (request.action == 'gotoSplit') {
        ctre.createPopup();
    }

    if (request.action == 'changeBorder') {
        ctre.changeBorder(request.borderSize);
    }

});


ctre.init();


