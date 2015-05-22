/***
 * this browser is to switch object dynamically
 *
 * it produces an list with the available objects, and the user can pick one that is being displayed
 * the module is basically functional, but not implemented to the end.
 *
 * the jquery mobile page that holds the list is "objBrowser"
 *
 * to make it work it would be necessary to check if all metadata, annotations etc are switched correctly
 * further more i had the problem that the inline element dosn't delete all the content from previous models
 * when changing the url. this is a big problem when building the three.
 * the left over elements are not visible but can be seen eg. with firefox's firebug
 *
 * the json file that has been used is objects.txt -> the models are not up to date any more
 */
function _mod_objectBrowser() {
	"use strict";

	// private section
	var data;
	var htmlTargetId = "objBrowserContainer";
	var cam = "";
	var curID;

	/****
	 * create a html ul li list to browse through objects
	 *
	 * !!! todo: #resultList is a static id to the result list parent container
	 */
	function createBrowseList() {
		var ele;
		var linkCnt = 0;

		for (var i in data) {
			ele = data[i];
			var element = jQuery('                                                              \
	            <li >                                                                           \
	                <a href="#view" id="x3DomLinkID_' + linkCnt + '">                           \
	                   <img src="data/' + ele.model + '/icon.png" alt="' + ele.title + '"/>     \
	                   <strong class="title">' + ele.title + '</strong><br/>                    \
	                   <span class="description">' + ele.description + '</span>                 \
	                </a>                                                                        \
	            </li>                                                                           \
	        ');

			jQuery('#resultList').append(element);
			ele.jqueryElement = element;

			jQuery("#x3DomLinkID_" + linkCnt).click(function (event) {
				switchX3DomModel(jQuery(this).attr("id"));
			});
			ele.jqueryId = "x3DomLinkID_" + linkCnt;

			linkCnt++;
		}

	}

	/****
	 * take care of switching a model in the view page
	 * at the moment objects are switched by changing the url attribute
	 * !!! todo if the bug mentioned at the top comment can not be fixed
	 * it might be an option to delete the entire inline tag and create an new one.
	 * this could be either equivalent or with a different id
	 * @param idStr id of the new object -> used to access the json structure and get the information for the new model
	 */
	function switchX3DomModel(idStr) {
		var model;

		// prevent from unnecessary reloading
		if (curID === idStr.replace('x3DomLinkID_', '')) {
			return;
		}

		curID = idStr.replace('x3DomLinkID_', '');
		model = data[curID].model;

		// init will be call when loading the new object automatically
		//jQuery("#scene").empty();
		//var inline = jQuery ('<Inline id="bla" nameSpaceName="inline" mapDEFToID="true" url="data/"' + model + '"/model-bg.x3d" onload="init();"></Inline>');
		//jQuery("#scene").append(inline);

		document.getElementById(MYAPP.modelRootId).setAttribute('url', "data/" + model + "/model.x3d");
		// this is important to set the new cam, else the model could be out of view
		// this just works if the model contains a cam.
		// !!! todo: else it would be useful to call the runtime showAll() function
		cam = "inline__cam_" + model;

		//switchMetaData();

	}

	/****
	 * not used at the moment and not correctly implemented
	 * but it gives an idea how to change metadata
	 */
	function switchMetaData() {
		var meta = data[curID].meta;
		var metaParent = jQuery("#metaData");
		metaParent.empty();

		for (var i in meta) {
			//metaParent.append(createMetaElement(i, meta[i]));    // should be provided by the metadata module
		}
	}

	/****
	 * set new active cam
	 */
	function setCamera() {
		//alert(cam);
		// cam should be set to the current model
		// also see todo in switchX3DomModel()
		document.getElementById(cam).setAttribute('set_bind', 'true');
	}

	// private section END


	// public section
	return {
		init : function (jsonData) {
			data = jsonData;
			createBrowseList();


			// to initially set an model
			//if (data.length > 0) {
			//switchX3DomModel("x3DomLinkID_5");  // normally use the first model of the list
			//}

		}
	};
	// public section END   (return end)
}





