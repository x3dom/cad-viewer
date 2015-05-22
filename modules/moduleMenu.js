/********************************************************************
 **** Menu Module ***************************************************
 ********************************************************************/

/****
 * this Module greates a menue from a given json file
 * the returnd html structure need to be written in a html container with a id
 *      -> at the moment the id is static inside the field htmlTargetId
 *         and can be manipulated with its getter and setter methods
 *         initially it is set with the global MYAPP.menuContainerID
 * the functionallity is added inside the method initEventHandler
 *
 * this is a module that is inside a closure (javascript the good parts p. 37 and p.40)
 * all the fields are private and can be accessed with the methods in the returnd object
 */


function _mod_menu() {
	"use strict";

	// private section
	// following fields and functions are private and need to be accessed by methods provided in the public section
	var isDebug = false;
	var htmlTargetId = MYAPP.menuContainerID;
	var positions = ["pos_dropdown", "pos_leftPane"];
	var currentPosition = "pos_dropdown";
	var isMenuKeepOpen = false;
	var eventListener = [];
	var isInit = false;

	/****
	 * checks if a given position is valid => is the parameter pos somewhere in the positions array
	 * @param pos string that should be contained in the positions array
	 * @return {Boolean}  true if the array contains it, false if not
	 */
	function isPosValid(pos) {
		var i;
		for (i = 0; i < positions.length; i++) {
			if (positions[i] === pos) {
				return true;
			}
		}

		if (isDebug) {
			alert('position is not valid in function: moduleMain -> "switchPosition()"');
		}
		return false;
	}

	/****
	 * extracts the id of the quick-menu entry
	 * @param obj jquery object that represents one menu entry
	 * @return {*} id without the prefix "menu_quick_btn_"
	 */
	function getIdFromQuickLink(obj) {
		var id = obj.attr("id");
		return id.replace(/menu_quick_btn_/g, "");
	}

	/*****
	 * creates one group in the menu. a group is "tree", "Views", "Visibility", "Meta Info", "settings" ...
	 * this function processes just the frame and header, the entries are added by createListEntries
	 * @param headerTextStr string that is placed in the top of the section an stays visible when the section is collapsed
	 * @param headerIconFile string that holds the name of the used icon for the Quick link and the section header.
	 *                      the path is added by the global variable MYAPP.menuIconPath
	 * @param menuSectionJson Object that holds the single entries for the currently processed section
	 * @param sectionId used to identify the section
	 * @return {*} returns the compliantly build section
	 */
	function createMenuSection(headerTextStr, headerIconFile, menuSectionJson, sectionId) {
		var section;
		var header;
		var headerText;
		var headerIcon;
		var list;

		/* //example of produced section code
		 <div data-role="collapsible" data-collapsed="false" data-mini="true" class="menuGroupHide">
		 <h3><span>Annotations</span><img src="img/GlyphishIcons-Free/icons/179-notepad.png" data-shadow="true" /></h3>
		 <ul data-role="listview">
		 <li class="ui-btn-hover-a"><a href="#" onclick='jQuery("#tree").jstree("open_all");'>       open                </a></li>
		 </ul>
		 </div>
		 */
		// create div for group
		section = jQuery('<div/>').attr({
			"data-role" : "collapsible",
			"data-collapsed" : "true",
			"data-mini" : "true",
			"data-iconpos" : "right",
			"data-theme" : "d",
			"class" : "menuGroupHide",
			"id" : "section_" + sectionId
		});

		if (isDebug) {
			if (headerTextStr === "debug") {
				section.attr("data-collapsed", "false");
			}
		}

		// create header
		header = jQuery('<h3/>');
		headerIcon = jQuery('<img/>').attr({
			"src" : MYAPP.menuIconPath + headerIconFile,
			"class" : "ui-corner-all"
		});
		headerText = jQuery('<span/>').text(headerTextStr);
		header.append(headerIcon);
		header.append(headerText);
		section.append(header);

		list = jQuery('<ul/>').attr({
			"data-role" : "listview"
		});
		section.append(list);

		createListEntries(list, menuSectionJson);

		return section;
	}

	/****
	 * create all the entries for one section and appends them to list
	 *
	 * entries can be of different types. at the moment i implemented normal buttons and toggle slider
	 * @param list entries are added to this parent container
	 * @param menuGroupJson object that provides the entry information
	 */
	function createListEntries(list, menuGroupJson) {
		var o;
		var ele;
		var entry;
		// create list entries
		for (o in menuGroupJson) {
			if (menuGroupJson.hasOwnProperty(o)) {
				ele = menuGroupJson[o];

				entry = null;
				if (!ele.stateCnt) {                      // normal button
					entry = createNormalEntry(ele);
				}
				else if (ele.stateCnt === "2") {            // toggle
					entry = createToggleEntry(ele);
				}
				else {
					alert("this menu type is currently not implemented or wrong. see: moduleMenu.createListEntries()")
				}

				if (entry) {
					list.append(entry);
				}
			}
		}
	}

	/****
	 * creates a normal link entry for the menu
	 * eg. { "text": "...", "id":   "...", "icon":	"..." }
	 * !!! todo:
	 * icons are not implemented jet.
	 * @param ele object that holds the necessary information
	 * @return {*} returns the list entry containing the link
	 */
	function createNormalEntry(ele) {
		var li = jQuery('<li/>');
		var a = jQuery('<a/>').attr({
			"href" : "#",
			"id" : "menu_" + ele.id
		});
		a.text(ele.text);
		li.append(a);
		li.addClass("menu_type_link");
		return li;
	}

	/****
	 * creates a jquery mobile toggle slider entry for the menu
	 * eg. { "stateCnt": "2", "stateCurrent": "0", "text": "...",
	 * "lable": ["...", "..."], "val": ["false", "true"], "id": "...", "icon":    "" }
	 * !!! todo:
	 * icons are not implemented jet.
	 * stateCurrent is not implemented jet -> it would be good to set initially options via JSON when loeading the menu
	 * @param ele object that holds the necessary information
	 * @return {*}
	 */
	function createToggleEntry(ele) {
		return jQuery('                                                                                   \
		    <li class = "menu_type_toggleSlider ui-btn ui-btn-up-a ui-btn-icon-right ui-li-has-arrow ">                 \
			    <span>                                                                                          \
					<select name="slider" class="menu_slider" id="' + "menu_" + ele.id + '" data-role="slider" data-mini="true">    \
						<option value="' + ele.val[0] + '">' + ele.lable[0] + '</option>                        \
						<option value="' + ele.val[1] + '">' + ele.lable[1] + '</option>                        \
					</select>                                                                                   \
					<div class = "sliderText">' + ele.text + '</div>                                            \
				</span>	                                                                                        \
			</li>	                                                                                            \
		');
	}

	/****
	 * creates the small quick icons to open menu sections
	 * @param headerIconFile string with the icon name and extension.
	 *                       the path is stored in the global variable MYAPP.menuIconPath
	 * @param sectionId to recognise witch section should be opend
	 *                  -> to do so the prefix menu_quick_btn_ needs to be replaced
	 */
	function createMenuQuickLinks(headerIconFile, sectionId) {
		var headerIcon = jQuery('<img/>').attr({
			"src" : MYAPP.menuIconPath + headerIconFile
		});

		var a = jQuery('<a/>').attr({
			"href" : "#",
			"id" : "menu_quick_btn_" + sectionId,
			"data-role" : "button"
		});
		a.append(headerIcon);
		a.click(function () {
			var id = getIdFromQuickLink(jQuery(this));
			mod_menu.switchMenuSection(id);
			return false;
		});

		jQuery("#headerMenuQuickLinks").append(a);


		//<a id="menu_btn_home" href="#" data-role="button" data-iconpos="notext" data-icon="home"></a>
	}

	/****
	 * initialising all the event listener that where pushed in the eventListener array
	 */
	function initAllEventHandlers() {
		var i;
		var item;

		for (i = 0; i < eventListener.length; i++) {
			item = jQuery("#_" + eventListener[i].id + "_");

			registerEventHandler(item, eventListener[i].id, eventListener[i].func);
		}

		// close menu when clicking li element or keep it open if it is locked
		//jQuery("#menuContainer .ui-collapsible").each( function(){
		jQuery("#menuContainer li").each(function () {
			jQuery(this).click(function () {
				if (isMenuKeepOpen !== true) {
					//console.log(jQuery(this).attr("id"))
					jQuery("#" + htmlTargetId).fadeOut("600", function () {
						jQuery(".menuGroupShow").trigger('collapse');
						//jQuery("#section_" + id).attr("data-collapsed", true);
						jQuery(".menuGroupShow").removeClass("menuGroupShow").addClass("menuGroupHide");
					});
				}
			});
		});
	}

	/****
	 * register a single event listener to one menu entry
	 * @param item is the menu entry li element
	 * @param id to the menu entry a element
	 * @param func callback that is executed when activating
	 */
	function registerEventHandler(item, id, func){
		if (item.hasClass("menu_type_toggleSlider")) {         // type is toggle slider
			jQuery("#" + id).bind("change", func);
		}
		else {                                               // normal ancor links
			jQuery("#" + id).click(func);
		}
	}

	/****
	 * jquery mobile elements are initialised once when loading the js file
	 * all programly added elements need to be initialised manually.
	 * this function dose it.
	 */
	function initStyleJQM() {
		jQuery(".menu_slider").slider();
		jQuery("#headerMenuQuickLinks").trigger("create");
		//jQuery('div[data-role=collapsible-set]').collapsibleset();
		jQuery('div[data-role=collapsible]').collapsible();
		jQuery("#" + htmlTargetId + " div[data-role=collapsible] ul").listview();
		//jQuery('div[data-role=listview]').listview(); // dosnt work for some reason

		jQuery("#headerMenuQuickLinks").controlgroup();

	}

	/****
	 * the autoComplete functionality gives us the possibility to search in the menu.
	 * it gives suggestions at the right side and filters the list while typing
	 * the search field should just be shown when the menu is displayed at the left side an when all the
	 * sections are opened
	 * @param inputSearchId the input field needs to be already existent in the html code, pass it's id here
	 */
	function setUpAutoComplete(inputSearchId) {
		var id;
		var tag;
		var a;
		// init search module
		var mod_search = modules("search");
		mod_search.initSearch("menuContainer", inputSearchId);

		// find content to set up the module
		jQuery("#menuContainer").find("li").each(function () {
			a = jQuery(this).find("a");
			if (!a.attr("id")) {
				a = jQuery(this).find("select");
			}
			id = "_" + a.attr("id") + "_";
			jQuery(this).attr("id", id);
			tag = a.text();
			//console.log(tag);
			mod_search.pushTag(id, tag);
			mod_search.pushTag(id, id.replace(/_menu_/g, "").replace(/_/g, " "));
		});

	}

	// private section END


	// public section
	// all methods that give access to the private fields and allow to process the menu
	return {
		getHtmlTargetId : function () {
			return htmlTargetId;
		},
		setHtmlTargetId : function (id) {
			htmlTargetId = id;
		},
		getMenuKeepOpen : function () {
			return isMenuKeepOpen;
		},
		setMenuKeepOpen : function (val) {
			isMenuKeepOpen = val === true || val === "true";
		},
		/****
		 * initialisation of the module
		 * @param jsonData the entire module is based on this data
		 * Format:
		 *  [
		 {
		 "header":     "...",
		 "headerIconPath": "filename.png",
		 "sectionId":   "....",
		 "entries": [
		 {
		 "stateCnt": "2",
		 "stateCurrent": "0",
		 "text": "...",
		 "lable": [ "..", "..."],
		 "val": ["true", "false"],
		 "id":   "...",
		 "icon":    ""
		 },
		 {...},
		 {
		 "text": "points",
		 "id":   "visib_points",
		 "icon":    ""
		 },
		 {...}
		 ]
		 },
		 {...}
		 ]
		 * @return {Boolean} not really needed
		 */
		init : function (jsonData) {
			var i;
			var html;

			if (!jsGoodParts.isArray(jsonData) || jsonData.length <= 0) {
				console.error("json data for the menu are invalid")
				return false;
			}

			html = jQuery("#" + htmlTargetId);
			html.addClass(currentPosition);

			// create the sections and it's entries
			for (i = 0; i < jsonData.length; i++) {
				html.append(createMenuSection(jsonData[i].header, jsonData[i].headerIconPath, jsonData[i].entries, jsonData[i].sectionId));

				createMenuQuickLinks(jsonData[i].headerIconPath, jsonData[i].sectionId);
			}

			// more init stuff :)
			initStyleJQM();
			setUpAutoComplete("searchFieldMenu");
			initAllEventHandlers();
			jQuery("#" + htmlTargetId).hide();

			isInit = true;

			return true;
		},
		/****
		 * sets the next possible menu position. it cyclically iterates to the positions array
		 * at the moment there are just 2 positions, but it would be easy to add more
		 */
		setNextPosition : function () {
			var i = jQuery.inArray(currentPosition, positions);
			i = (i + 1) % positions.length;

			currentPosition = positions[i];
			this.switchPosition(currentPosition);
		},
		/****
		 * switch the position of the menu
		 * currently there are just 2 states (left/ dropdown)
 		 */
		switchPosition : function (newPos) {
			if (!newPos || !isPosValid(newPos)) {
				return false;
			}
			if (newPos === "pos_dropdown") {
				jQuery("#" + htmlTargetId).fadeOut("500", function () {
					// deleat all existing positions and add current
					jQuery(".menuGroupShow").removeClass("menuGroupShow").addClass("menuGroupHide");
					// remove all possible previous positions
					jQuery("#" + htmlTargetId).removeClass(positions.toString().replace(/,/g, " ")).addClass(newPos);
					jQuery("#searchMenu").hide();
				});
			}
			else {
				jQuery("#" + htmlTargetId).fadeOut("100", function () {
					jQuery("#searchMenu").show();
					// deleat all existing positions and add current
					jQuery(".menuGroupHide").removeClass("menuGroupHide").addClass("menuGroupShow");
					jQuery("#menuContainer .ui-collapsible").trigger('expand');
					// remove all possible previous positions
					jQuery("#" + htmlTargetId).removeClass(positions.toString().replace(/,/g, " ")).addClass(newPos);
					jQuery("#" + htmlTargetId).fadeIn(300);
				});
			}
		},
		/****
		 * switch the menu section when clicking on the quick icons
		 * in this case there is always just one section at a time shown.
		 * open sections are closed when selecting the some section again
		 * @param id of the selected section
		 */
		switchMenuSection : function (id) {
			// if section was opened -> close it
			//console.log(jQuery("#section_" + id) + jQuery("#section_" + id).hasClass("menuGroupShow"));
			if (jQuery("#section_" + id).hasClass("menuGroupShow")) {
				jQuery("#" + htmlTargetId).fadeOut("600", function () {
					jQuery(".menuGroupShow").trigger('collapse');
					//jQuery("#section_" + id).attr("data-collapsed", true);
					jQuery(".menuGroupShow").removeClass("menuGroupShow").addClass("menuGroupHide");
				});
			}
			// else open the selected section and close all others
			else {
				jQuery(".menuGroupShow").trigger('collapse');
				jQuery(".menuGroupShow").removeClass("menuGroupShow").addClass("menuGroupHide");
				jQuery("#section_" + id).removeClass("menuGroupHide").addClass("menuGroupShow");
				jQuery("#section_" + id).trigger('expand');
				//jQuery("#section_" + id).attr("data-collapsed", false);
				//jQuery("#" + htmlTargetId).slideDown();
				jQuery("#" + htmlTargetId).fadeIn("600");
			}
		},
		/****
		 * push an callBack to the menu.
		 * registration is done in initEventHandler().
		 * @param id
		 * @param callBack
		 */
		pushEventListener : function (id, callBack) {
			var listener;
			if (typeof callBack !== 'function') {
				console.log("You didn't pass a function as a event listener!");
				throw "You didn't pass a function as a event listener!"
			}
			/*
			 var func = function () {
			 callBack();     // !!! todo: problem when parameters are passed but nice to have the return false
			 return false;
			 }
			 */
			// if the module is already init the event handler are registered right away
			if(isInit){
				registerEventHandler(jQuery("#_" + id + "_"), id, callBack)
			}
			else{   // else they are pushed to an array that is processed after initialisation
				listener = {
					"id" : "menu_" + id,
					"func" : callBack
				};
				eventListener.push(listener);
			}

		}
	};
	// public section END   (return end)
}

// Menu Module End














