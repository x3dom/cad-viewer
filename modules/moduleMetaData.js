/***
 * this module shows metadata
 *
 * it is almost compleatly equal to moduleAnnotations.js
 * the only difference is that some functionality is missing in this module and
 * some variables and functions are named differently
 *
 * it would make more sens to delete this module and just use moduleAnnotations.js.
 * there would not be many changed necessary
 *
 * I didn't coment this module -> see moduleAnnotations.js
 */
function _mod_metaData() {
	"use strict";

	// private section
	var isInit = false;
	var callbacksOnInit = [];
	var htmlTargetId = MYAPP.metaDataContainerID;
	var data;
	var isPopUpOnTap = false;

	function runCallbacksInit() {
		var i;
		for (i = 0; i < callbacksOnInit.length; i++) {
			callbacksOnInit[i]();
		}
	}

	function initStyleJQM() {
		jQuery('div[data-role=collapsible]').collapsible();
	}

	function createMetaDataList() {
		var element;
		var i;

		for (i = 0; i < data.length; i++) {
			element = createMetaDataItem(data[i].id, data[i].title, data[i].text);
			jQuery('#' + htmlTargetId).append(element);
		}

		initStyleJQM();
	}

	function createMetaDataItem(id, title, text) {
		var group;
		var header;
		var headerText;
		var p;

		/*
		 <div data-role="collapsible" data-collapsed="false" data-mini="true" class="menuGroupHide">
		 <h3>I'm a header</h3>
		 <p>I'm the collapsible content. By default I'm closed, but you can click the header to open me.</p>
		 </div>
		 */

		// create div for group
		group = jQuery('<div/>').attr({
			"data-role" : "collapsible",
			"data-collapsed" : "true",
			"data-mini" : "true",
			"data-iconpos" : "right",
			"data-theme" : "d",
			"class" : "metaDateSet",
			"id" : "metaData_" + id
		});

		// create header
		header = jQuery('<h3/>');
		headerText = jQuery('<span/>').text(title);
		header.append(headerText);
		group.append(header);

		p = jQuery('<p >' + text + '</p>');
		group.append(p);

		return group;
	}

	function getMetaById(id) {
		var res = [];
		var i;

		for (i = 0; i < data.length; i++) {
			//console.log("inline__" + data[i].id + " - " + id)
			if ("inline__" + data[i].id === id) {
				res.push(data[i]);
			}
		}
		return res;
	}

	// private section END


	// public section
	return {
		getPopUpOnTap : function () {
			return isPopUpOnTap;
		},
		setPopUpOnTap : function (val) {
			isPopUpOnTap = val === true || val === "true";
		},
		init : function (jsonData) {
			data = jsonData;
			//console.log(data.toString())
			createMetaDataList();
			isInit = true;
			runCallbacksInit();

		},
		isInit : function () {
			return isInit;
		},
		setCallbackOnInit : function (func) {
			callbacksOnInit.push(func);
		},
		togglePopUpOnTap : function () {
			isPopUpOnTap = !isPopUpOnTap;
		},
		popUp : function (event) {
			var meta;
			var content = [];
			var i;
			var id = event.hitObject._x3domNode._xmlNode.getAttribute("id");
			if (isPopUpOnTap) {
				meta = getMetaById(id);

				for (i = 0; i < meta.length; i++) {
					content.push({
						"type" : "text",
						"title" : meta[i].title,
						"text" : meta[i].text
					});
					//console.log(meta[i].title);
				}

				jQuery().popUp("new", {
					"content" : content
				});

			}
		}
	};
	// public section END   (return end)
}




