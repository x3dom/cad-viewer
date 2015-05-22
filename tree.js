/*global MYAPP, jQuery */  /* for jsLint */

var mod_tree = (function () {
	var publicRet = {};

	/************************** private section ********************************/
	/****
	 * init part for jquery mobile -> mainly style / css stuff and event stuff
	 */
	function jstreeJqmInit() {
		"use strict";

		//http://jquerymobile.com/test/docs/lists/lists-count.html
		// ui-li-count
		jQuery("#treeList").addClass("ui-listview ui-listview-inset ui-corner-all");
		jQuery("#treeList li:first").addClass("first");
		jQuery("#tree li").each(function () {
			jQuery(this).addClass("ui-btn ui-btn-icon-right ui-li-has-arrow ui-li ui-li-has-count ui-corner-all ui-li ui-btn-up-c");
			jQuery(this).find("a").addClass("ui-corner-all");

			// hover for li elements
			jQuery(this).hover(
				function () {   // mouse in
					jQuery(this).removeClass("ui-btn-up-c ui-btn-down-c").addClass("ui-btn-hover-c");
				},
				function () {   // mouse out
					jQuery(this).removeClass("ui-btn-hover-c ui-btn-down-c").addClass("ui-btn-up-c");
				}
			);
			// hover for links
			jQuery(this).find("a").hover(
				function () {   // mouse in
					jQuery(this).addClass("ui-focus");
				},
				function () {   // mouse out
					jQuery(this).removeClass("ui-focus");
				}
			);

			/*
			 jQuery(this).find("a").mousedown(
			 function () {
			 //jQuery(this).removeClass("ui-btn-up-c ui-btn-hover-c").addClass("ui-btn-down-c");
			 }
			 );
			 jQuery(this).find("a").mouseup(
			 function () {
			 //jQuery(this).removeClass("ui-btn-up-c ui-btn-hover-c").addClass("ui-btn-down-c");
			 }
			 );
			 */

			if (!jQuery(this).hasClass("jstree-leaf")) {
				//alert(jQuery(this).children("ul").children("li").size()); //.addClass("arrow");  // .find("li") -> gibt alle li kinder

				var childCnt = jQuery(this).children("ul").children("li").size();
				var counter = document.createElement("span");
				counter.setAttribute("class", "ui-li-count ui-btn-up-c ui-btn-corner-all ");
				counter.appendChild(document.createTextNode(childCnt));
				jQuery(this).children("a").append(counter);
			}
		});
	}


	/****
	 * create the HTML List from the x3d model -> this list is used to create the jsTree
	 * the List is created recursively starting at the first x3dNodeJQ node.
	 *
	 * @param x3dNodeJQ x3d node that supplies the id to create the new element in the tree (submitted as a jQuery element)
	 * @param parentJQ element in the tree that becomes the parent of the new node (submitted as a jQuery element)
	 */
	function initHTML_List(x3dNodeJQ, parentJQ) {
		// console.log(x3dNodeJQ.children().length + " - " + x3dNodeJQ.attr("id"))
		var isLeaf;
		if (x3dNodeJQ.children().size() > 0) { // inner node
			if (mod_sceneGraph.isx3dNodeGoodForTree(x3dNodeJQ[0])) {
				isLeaf = mod_sceneGraph.isX3dNodeLeaf(x3dNodeJQ[0]);

				parentJQ = addNodeToTree(parentJQ, x3dNodeJQ, isLeaf);
			}
			x3dNodeJQ.children().each(function () {        // recursive colling of the function to add the nodes to the tree
				initHTML_List(jQuery(this), parentJQ);		// kid and new node (as new parentJQ)
			});
		}
	}

	/****
	 * add a node to the tree
	 *
	 * @param parentJQ element in the tree that becomes the parent of the new node (submitted as a jQuery element)
	 * @param x3dNodeJQ x3d node that supplies the id to create the new element in the tree (submitted as a jQuery element)
	 * @param isLeaf boolean -> to set the icons correct and if false create a child list to add more children
	 * @return {*} new node or the list for more children
	 */
	function addNodeToTree(parentJQ, x3dNodeJQ, isLeaf) {
		//console.log(x3dNodeJQ.attr("id"))
		// check if the id of the x3d node is usable as a title for the tree node
		var key = x3dNodeJQ.attr("id");
		if (key === "") {
			alert("Wrong Format -> no ID set for Element " + x3dNodeJQ);
		}
		var title = key;
		// check if the node is an textnode, if yes take the text as the node name
		if (x3dNodeJQ.prop("nodeName") === "#text") {
			title = x3dNodeJQ.prop("nodeValue") + " ** ID: " + title;
		}
		title = title.replace("inline__", "");


		/* add node as HTML */
		var d = document;
		var node = d.createElement("li");
		node.setAttribute("id", "tree_" + key);

		var a = d.createElement("a");
		a.setAttribute("href", "#");
		var t = d.createTextNode(title);

		a.appendChild(t);
		node.appendChild(a);

		parentJQ.append(node);


		if (isLeaf) {               // if leaf set icon
			node.setAttribute("rel", "shapeLeaf");
		}
		else {                      // else create a new list for more children
			var ul = d.createElement("ul");
			node.appendChild(ul);
			parentJQ = jQuery(ul);
		}


		return parentJQ;
	}

	/*******************************************************************
	 ******* tree modes (accordion behavior) ****************************
	 ********************************************************************/
	/****
	 * set up the modes for the tree
	 * 1. mode: normal explorer tree view
	 * 2. mode: accordion navigation
	 */
	function initTreeModes() {
		"use strict";
		MYAPP.treeMode = {};
		MYAPP.treeMode.accordion = {};		// "accordion"
		MYAPP.treeMode.tree = {};		    // "tree"

		// set tree view mode to the value of the toggle slider
		MYAPP.currentTreeMode = jQuery("#switchViewTreeSlider").val();

		/******* manipulate tree behavier and apperance (MODES) ****************
		 * there are 3 restrictions for the whanted behavieor
		 *
		 * when node x is clicked:
		 * 1.) node is opend (== childs visible) and all childs have to be closed (== childs childs are hidden)
		 * 2.) all siblings need to be opend
		 * 3.) all direct parents need to be opend but cant have any other brunches opend
		 *
		 ****************************************************************/

		MYAPP.treeMode.accordion.onSelect = function (node) {
			// 1. and 2. restirction
			MYAPP.tree.open_node(node);
			if (!MYAPP.tree.is_leaf(node)) {
				switchTreeModeChildren(node, effects.show);
				switchTreeModeSiblings(node, effects.hide);
			}
			// 3.) restirction
			switchTreeModeParents(node);
		};
		MYAPP.treeMode.tree.onSelect = function (node) {
			MYAPP.tree.toggle_node(node);
		};
		mod_tree.switchTreeMode(MYAPP.currentTreeMode);
	}

	/****
	 * shows child nodes and closes them === hides the children (of current node current)
	 *
	 * @param node jsTree node
	 * @param effect function that is stored in effects
	 */
	function switchTreeModeChildren(node, effect) {
		"use strict";

		if (node && effect) {
			var children = MYAPP.tree._get_children(node);
			jQuery(children).each(function () {
				effect(jQuery(this));
				MYAPP.tree.close_node(jQuery(this));
			});
		}
	}

	/****
	 * hides and shows sibbling nodes (of current node current)
	 *
	 * @param node jsTree node
	 * @param effect function that is stored in effects
	 */
	function switchTreeModeSiblings(node, effect) {
		"use strict";

		if (node && effect) {
			var prev = MYAPP.tree._get_prev(node, true);
			while (prev) {
				effect(prev);
				prev = MYAPP.tree._get_prev(prev, true);
			}
			var next = MYAPP.tree._get_next(node, true);
			while (next) {
				effect(next);
				next = MYAPP.tree._get_next(next, true);
			}
		}
	}

	/*****
	 * shows all parents and hides their siblings
	 * @param node jsTree node
	 */
	function switchTreeModeParents(node) {
		"use strict";

		if (node) {
			var parent = MYAPP.tree._get_parent(node);
			while (parent && parent !== -1) {
				effects.show(parent);
				switchTreeModeSiblings(parent, effects.hide);
				parent = MYAPP.tree._get_parent(parent);
			}
		}
	}

	// holds different effects to show and hide elements such as li items
	var effects = {
		hide : function (node) {
			"use strict";
			//node.stop().slideUp();
			node.stop().hide();
		},
		show : function (node) {
			"use strict";
			//node.stop().slideDown();
			node.stop().show();
		},
		toggle : function (node) {
			"use strict";
			if (node.is(':hidden')) {
				effects.show(node);
			}
			else {
				effects.hide(node);		// warum geht hier this nicht??????????????????
			}
		}
	};

	/*******************************************************************
	 ******* END tree modes (accordion behavior) ***********************
	 *******************************************************************/


	/*******************************************************************
	 ******* manipulate tree *******************************************
	 *******************************************************************/

	/****
	 * toggles the check status of jstree nodes (checkboxes == eye)
	 * @param nodeJQ jstree nodeJQ to be toggled
	 */
	function checkboxToggleNode(nodeJQ) {
		"use strict";
		if (MYAPP.tree.is_checked(nodeJQ)) {
			MYAPP.tree.uncheck_node(nodeJQ);
		}
		else {
			MYAPP.tree.check_node(nodeJQ);
		}
	}

	function getX3dIdFromTreeId(nodeJQ) {
		return nodeJQ.attr("id").replace("tree_", "");
	}


	/****
	 * hide a node in the x3d scene graph by setting its render flag to false
	 * @param nodeJQ node in the jstree (must be a jquery element)
	 */
	function hideX3dNode(nodeJQ) {
		// if just turn off the node xy
		var id = getX3dIdFromTreeId(nodeJQ);
		//mod_sceneGraph.setX3dRender(false, id);
		mod_sceneGraph.setX3dRenderHide(document.getElementById(id));
	}
	function showX3dNode(nodeJQ) {
		var id = getX3dIdFromTreeId(nodeJQ);
		mod_sceneGraph.setX3dRenderShow(document.getElementById(id));
	}

	/****
	 * show a node in the x3d scene graph by setting its render flag to true
	 *
	 * !!! todo: this method is to slow!!! it would be better not to do all the jquery filtering
	 *          -> maybe use a lastCheckState and direct links between jstree and the x3d sceneGraph
	 *             to avoid the id passing and selecting with an id
	 *
	 * @param nodeJQ node in the jstree (must be a jquery element)
	 */
	function showX3dNode2(nodeJQ) {

		//console.log("showX3dNode checked: " + tree.is_checked());
		var id = getX3dIdFromTreeId(nodeJQ);
		var nodeLi;
		var nodeList;
		//process children
		showX3dNodeChildren(nodeJQ);

		// process parents and node itself
		while (nodeJQ && nodeJQ.attr("id") !== "tree_" + MYAPP.modelRootId) {
			if (nodeJQ.attr("id")) {
				console.log("self  - id: " + " - " + nodeJQ.attr("id"));
				id = getX3dIdFromTreeId(nodeJQ);
				mod_sceneGraph.setX3dRender(true, id);

				nodeList = nodeJQ.siblings();
				nodeList = nodeList.filter("li");

				nodeList.each(function () {
					id = getX3dIdFromTreeId(jQuery(this));
					nodeLi = jQuery("#" + jQuery(this).attr("id"));
					mod_sceneGraph.setX3dRender(MYAPP.tree.is_checked(nodeLi), id);
					console.log("sibli - id: " + id + " - " + MYAPP.tree.is_checked(nodeLi));
					console.log(nodeLi);
				});
			}

			nodeJQ = nodeJQ.parent();
		}

		mod_sceneGraph.setX3dRender(true, MYAPP.modelRootId);

	}

	/****
	 * to make sure that all the children are shown as well (they could be turned off form previous selections)
	 * @param nodeJQ node in the jstree (must be a jquery element)
	 */
	function showX3dNodeChildren(nodeJQ) {
		var id;
		var nodeLi;
		var nodeList = nodeJQ.children();
		nodeList = nodeList.filter("ul");
		nodeList = nodeList.children();
		nodeList = nodeList.filter("li");

		nodeList.each(function () {
			id = getX3dIdFromTreeId(jQuery(this));
			nodeLi = jQuery("#" + jQuery(this).attr("id"));

			//console.log("child - id: " + id + " - " + isChecked);
			mod_sceneGraph.setX3dRender(MYAPP.tree.is_checked(nodeLi), id);   // better to work with direct pointers here

			showX3dNodeChildren(jQuery(this));
		});

	}


	/********************************************************************
	 ******************* Autocompleate **********************************
	 ********************************************************************/

	function setUpAutoComplete() {
		var mod_search = modules("search");
		mod_search.initSearch("tree_" + MYAPP.modelRootId, "searchFieldGraph");

		jQuery("#tree").find("li").each(function () {
			mod_search.pushTag(jQuery(this).attr("id"), getX3dIdFromTreeId(jQuery(this)).toLowerCase());
		});
	}

	/********************************************************************
	 ******************* Breadcrumbs **********************************
	 ********************************************************************/

	/****
	 * delete the old bread crumb list
	 * build the new bread crumb list
	 *
	 * @param nodeJQ node in the jstree (must be a jquery element)
	 */
	function updateBreadCrumbs(nodeJQ) {
		var stack = [];
		var i;

		//delete the old bread crumb list
		jQuery("#breadCrumbs").empty();

		// collect new bread crumbs
		stack.push(createBreadCrumb(nodeJQ, true));

		if (nodeJQ) {
			nodeJQ = MYAPP.tree._get_parent(nodeJQ);
			while (nodeJQ && nodeJQ !== -1) {
				stack.push(createBreadCrumb(nodeJQ, false));
				nodeJQ = MYAPP.tree._get_parent(nodeJQ);
			}
		}

		// print bread crumbs
		for (i = stack.length - 1; i >= 0; i--) {
			jQuery("#breadCrumbs").append(stack[i]);
		}
		//console.log(jQuery("#breadCrumbs").text());
	}

	/****
	 * create single bread crumbs
	 *
	 * @param nodeJQ node in the jstree (must be a jquery element)
	 * @param isLeaf boolean if crumb is the last one in the list
	 * @return {*}: breadcrumb
	 */
	function createBreadCrumb(nodeJQ, isLeaf) {
		var cssClass = "";
		var icon = "";
		if (isLeaf) {
			cssClass = ' class = "breadCrumbLeaf" ';
		}
		else {
			cssClass = ' class = "breadCrumbInnerNode" ';
			icon = '<img src="img/GlyphishIcons-Free/icons/193a-arrow-right.png" />';
		}
		return jQuery('<span ' + cssClass + '>' + nodeJQ.children("a").justtext() + icon + '</span> ');
	}

	/********************************************************************
	 ****************** set Metadata Links on tree nodes ****************
	 ********************************************************************/

	function setTreeMetaDataLinks() {
		var meta;
		if (mod_metaData.isInit) {
			meta = jQuery(".metaDateSet");
			meta.each(function () {
				//console.log(jQuery(this).attr("id"));
				insertMetaDataLink(jQuery(this));
			});

		}
		else {
			// if metadata is not available at the time all 3d data is loaded
			// this function is executed after loading all the metadata
			mod_metaData.setCallbackOnInit(setTreeMetaDataLinks);
		}
	}

	function insertMetaDataLink(nodeJQ) {
		var dataStack;
		var id;
		if (!nodeJQ.attr("id") && nodeJQ.attr("id") === "") {
			console.log("invalid or empty node ID in Metadata");
			return;
		}

		id = nodeJQ.attr("id");
		id = id.replace("metaData_", "");
		id = "tree_inline__" + id;

		dataStack = jQuery("#" + id).data("metaData");
		if (!dataStack) {
			dataStack = [];
		}
		dataStack.push(nodeJQ);
		jQuery("#" + id).data("metaData", dataStack);

		//console.log(jQuery("#" + id).attr("id") + " - " + jQuery("#" + id).data("metaData")[0].attr("id"));
		//console.log("#" + id);

		//nodeJQ = MYAPP.tree._get_parent(nodeJQ);
		// !!! todo: with this call it would be possible to store links also in all parents
		// this would help to show ALL metaData in sub trees and not just the ones for a single selected node
		//insertMetaDataLink(nodeJQ);

	}


	/************************** END private section ********************************/

	/********* public section ********/
	/****
	 * init the tree
	 * create the html list, init jsTree and set up events and settings
	 */
	publicRet.initTree = function () {
		"use strict";
		var tree = jQuery("#tree");

		//var plugins = [ "cookies" ];  // good if the state of the tree (opened and closed leafs should be saved)
		var plugins = [ "themes", "html_data", "checkbox", "ui", "types" ];
		if (MYAPP.sortTree) {
			plugins.push("sort");
		}

		// create HTML List that is used to create the jsTree
		initHTML_List(jQuery("#" + MYAPP.modelRootId), jQuery("#treeList"));

		// init the jsTree
		tree.jstree({
			"core" : { "initially_open" : [ "root" ] },
			"themes" : {
				"theme" : "default", // !!! todo: i modefied this because i was not able to set up a new theme :(
				"dots" : true,
				"icons" : true
			},
			"types" : {
				"valid_children" : [ "shapeLeaf" ],
				"types" : {
					"shapeLeaf" : {
						"icon" : {
							//"image" : "/img/menu/icons.gif",
							"position" : "-74px -36px"
						},
						"valid_children" : [ "none" ]
					},
					"default" : {
						"icon" : {
							//"image" : "/img/menu/icons.gif",
							"position" : "-56px -36px"
						},
						"valid_children" : [ "default" ]
					}
				}
			},
			"plugins" : plugins
		});


		MYAPP.tree = jQuery.jstree._reference("#tree");

		initTreeModes();

		// add a custom array to data for every node to store additional information
		// this might be sensless???
		jQuery(MYAPP.tree).each(function () {
			jQuery(this).data("metaData", []);
		});

		// add events
		/*
		 // click and double click dont provide the fields data.rslt.obj, data.inst. thatfore it is more difficult to
		 // get the clicked node
		 tree.bind("click.jstree", function (event, data) {
		 //console.log("Bind Result: " + event.type);
		 var node = jQuery(event.target).closest("li");
		 });
		 */

		tree.bind("dblclick.jstree", function (event) {
			//console.log("Bind Result: " + event.type);
			var node = jQuery(event.target).closest("li");
			//$.jstree._reference("#tree").check_node(node);
			checkboxToggleNode(node);
		});

		/*
		 * is called every time one clicks on a list entry
		 * it has to process the selection function and execute the deselect function
		 *
		 * for some reason the deselect event is called, but dosnt show the whanted effect.
		 * it would be perfect if the behavieor would be like:
		 * - click on a link -> entry is selected
		 *                   -> AND last selected entry is deselected
		 *                   -> AND deselected event for it is executed
		 * I "fake" the behavier by using the selected event as usally
		 * and also remember the last selection. this enables me to call the deactivate function
		 * which is equal to the deselect event callback (as it should be).
		 */
		tree.bind("select_node.jstree", function (event, data) {
			//console.log("Bind Result: SELECTED ");
			var node = data.rslt.obj;
			//var tree = data.inst;
			//console.log(tree.get_text(data.rslt.obj) + " - " + data.rslt.obj.attr("id")); // ID - Text

			// make shure that the last node is deselected
			MYAPP.tree.deselect_node(MYAPP.lastNodeSelection); // fire deselect event
			deactivate(MYAPP.lastNodeSelection);
			MYAPP.lastNodeSelection = node;

			jQuery(node).addClass("activeNode");

			MYAPP.treeMode[MYAPP.currentTreeMode].onSelect(node);

			//highlight x3d element
			var id = getX3dIdFromTreeId(node);
			//alert(id);
			document.getElementById(id).highlight(true, MYAPP.x3dNodeHighlightColor);
			if (MYAPP.isFlyToOnSelect) {
				document.getElementById('x3dElement').runtime.showObject(document.getElementById(id));
			}

			updateBreadCrumbs(data.rslt.obj);
		});

		tree.bind("deselect_node.jstree", function (event, data) {
			//console.log("Bind Result: DE - SELECTED ");
			var node = data.rslt.obj;
			//var tree = data.inst;
			deactivate(node);
		});
		function deactivate(node) {
			if (node) {
				// de-highlight x3d element
				document.getElementById(getX3dIdFromTreeId(node)).highlight(false, MYAPP.x3dNodeHighlightColor);
				jQuery(node).removeClass("activeNode");
			}
		}

		tree.bind("check_node.jstree", function (event, data) {
			//console.log("Bind Result: " + event.type + " - checked: " + data.inst.is_checked(data.rslt.obj));
			showX3dNode(data.rslt.obj);
		});

		tree.bind("uncheck_node.jstree", function (event, data) {
			//console.log("Bind Result: " + event.type + " - unchecked: " + data.inst.is_checked(data.rslt.obj));

			hideX3dNode(data.rslt.obj);
		});

		jQuery("#switchViewTreeSlider").bind("change", function () {
			mod_tree.switchTreeMode(jQuery(this).val());
		});


		tree.bind("loaded.jstree", function () {
			jQuery('#tree ul:first').attr("id", "treeList");
			MYAPP.tree.check_all();
			jstreeJqmInit();

			setUpAutoComplete();

			setTreeMetaDataLinks();
		});

	};

	/****
	 * switch the tree view between accordion and tree
	 * @param mode string that holds the mode -> at the moment "tree" or "accordion"
	 */
	publicRet.switchTreeMode = function (mode) {
		"use strict";

		if (mode === "accordion") {
			MYAPP.currentTreeMode = "accordion";
			jQuery("#tree").removeClass("treeContainer").addClass("accordionView");
			MYAPP.treeMode.accordion.onSelect(MYAPP.lastNodeSelection);
		}
		else if (mode === "tree") {
			MYAPP.currentTreeMode = "tree";
			jQuery("#tree").removeClass("accordionView").addClass("treeContainer");
			// make shure that all nodes are visible (accordionView hides some)
			jQuery("#tree").find("li").show();
		}
	};

	/****
	 * select a node in the tree when clicking an x3d node in the scene graph.
	 * the selected jstree node will be highlighted
	 * @param event click event from x3DOM
	 */
	publicRet.highlightTree = function (event) {
		"use strict";
		var id = event.hitObject._x3domNode._xmlNode.getAttribute("id");
		var node = document.getElementById("tree_" + id);
		//console.log("highlightTree  " + id)
		MYAPP.tree.select_node(node);
	};

	/****
	 * destroy the jstree
	 * !!! attention: at the moment the x3d inline element is not destroyed correctly
	 *          -> there are old elements in the sceneGraph that are not rendered
	 */
	publicRet.destroyTree = function () {
		jQuery("#treeList").empty();

		try {
			jQuery.jstree._reference("#tree").destroy();
			$("#tree").jstree('destroy');
			//$("#tree").jstree("destroy");
			//$("#treeList").remove();
			console.log("tree is destroyed.")
		}
		catch (e) {
			console.log("tree could not be destroyed.")
		}
	};
	return publicRet;
})();