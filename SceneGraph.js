/*global MYAPP, jQuery */  /* for jsLint */

/*********************************************************************
 **** modifikation of the X3DOM tree *********************************
 *********************************************************************
 *********************************************************************
 ********************************************************************/


var mod_sceneGraph = (function () {
	var publicRet = {};

	var renderOptionLast = "Point";

	/************************** private section ********************************/
	/****
	 * make sure that every x3d node (starting at the submitted node) has an valid and not empty id, else create one
	 *
	 * @param x3dNodeJQ recursion starts here
	 * @param id_text to cascade id's inside the tree
	 *                 -> child id is part of parent id with an additional number (if id is not given)
	 */
	function setIdForX3d(x3dNodeJQ, id_text) {
		var id = 0;
		var kid;
		//console.log("setIdForX3d");
		// if id or def is set, use it instad of the passed number
		if (x3dNodeJQ.attr("DEF")) {
			id_text = x3dNodeJQ.attr("DEF");
		}
		else if (x3dNodeJQ.attr("id")) {
			id_text = x3dNodeJQ.attr("id");
		}

		id_text = validateId(id_text);
		x3dNodeJQ.attr("id", id_text);

		x3dNodeJQ.children().each(function () {
			kid = jQuery(this);
			if (!(kid.nodeName === "#text" && jQuery.trim(kid.nodeValue) === "")) {     // is node an empty (whitespace only) node?
				id++;
				setIdForX3d(kid, id_text + "-" + (id));
			}
		});
	}

	/****
	 * make sure that a id is in the correct format
	 * this is a quick and dirty solution to process the id's given in some models. It is not compleate
	 * !!! todo: the validation should be done with a regex and should also check if the id dosn't start with numbers
	 *           it would also be useful to check if the id is already used
	 * @param id id to be checked
	 * @return {*} new id that is be corrected
	 */
	function validateId(id) {
		id = id.replace(";", "_");
		id = id.replace(":", "_");
		id = id.replace(",", "_");
		id = id.replace(".", "_");
		id = id.replace(" ", "_");
		return id;
	}


	/****
	 * here we start with the x3dRoot node -> events are added to the entire tree
	 */
	function addClickEventsToAll() {
		addClickEvents(document.getElementById(MYAPP.modelRootId));
	}

	/****
	 * add events to the 3d Model to make it possible to click on parts and communicate with the tree
	 * important to add events onload! else the nodes could not be available
	 * document.onload = addClickEventsToAll;
	 */
	function addClickEvents(x3dNode) {
		var o;

		if (x3dNode === undefined || x3dNode === null) {
			return;
		}
		if (x3dNode.nodeName === "#text" && jQuery.trim(x3dNode.nodeValue) === "") {    // is node an empty (whitespace only) node?
			//alert("type" + x3dNode.nodeName + " val: " + x3dNode.nodeValue);
			return;
		}

		try {
			if (mod_sceneGraph.isX3dNodeLeaf(x3dNode)) {
				x3dNode.addEventListener('click', mod_tree.highlightTree, false);
				x3dNode.addEventListener('click', mod_metaData.popUp, false);
				x3dNode.addEventListener('click', mod_annotations.popUp, false);
			}
		} catch (e) {
			//alert(e + x3dNode + " - node - " + x3dNode.nodeName + " - " + x3dNode.nodeType);
		}

		for (o in x3dNode.childNodes) {
			if (x3dNode.childNodes.hasOwnProperty(o)) {
				addClickEvents(x3dNode.childNodes[o]);
			}
		}

	}

	/***
	 * delegate the rotation of the object to the coordinate arrows
	 * @param evt the event that calls the function (connected to the viewpoint "ViewpointMain")
	 */
	var viewFunc = function (evt) {
		pos = evt.position;
		rot = evt.orientation;
		mat = evt.matrix;

		//document.getElementById('coordinateAxesViewpoint').setAttribute( 'position', pos.x+' '+pos.y+' '+pos.z);
		document.getElementById('CoordinateAxes__CoordinateAxes').setAttribute('position', 0 + ' ' + 0 + ' ' + 0);
		document.getElementById('CoordinateAxes__CoordinateAxes').setAttribute('rotation', rot[0].x + ' ' + rot[0].y + ' ' + rot[0].z + ' ' + rot[1]);

		//x3dom.debug.logInfo('position: ' + pos.x+' '+pos.y+' '+pos.z +'\n' + 'orientation: ' + rot[0].x+' '+rot[0].y+' '+rot[0].z+' '+rot[1]);
	};
	/************************** END private section ********************************/

	/********* public section ********/
	publicRet.initSceneGraph = function () {
		mod_tree.destroyTree();

		// make sure that every node has an id
		setIdForX3d(jQuery("#" + MYAPP.modelRootId), 0);

		MYAPP.x3dModelRoot = document.getElementById(MYAPP.modelRootId);                      // node to start the scene graph

		// delegate rotation of the viewpoint to the coordinate axis
		document.getElementById('ViewpointMain').addEventListener('viewpointChanged', viewFunc, false);

		mod_tree.initTree();

		// !!! todo:  Problem -> show all dosnt execute if there is no time delay -> i don't know why
		// show all scheint nicht sofort verfügbar zu sein nachdem das inline element geladen wurde. daher kurzes timeout
		setTimeout("document.getElementById('x3dElement').runtime.showAll()", 200);

		addClickEventsToAll();
	};

	/****
	 * sets the render Flag of a x3d node
	 * @param turnOnOff
	 * @param nodeID
	 */
	publicRet.setX3dRender = function (turnOnOff, nodeID) {
		//x3dNodeJQ.attr("render", turnOnOff);

		var elem = document.getElementById(nodeID);
		elem.setAttribute("render", turnOnOff.toString());
	};
	/****
	 * hides a scene graph node by setting the render Flag of a x3d node to false
	 *
	 * for speeding up later hiding and showing actions each node has an "hasHiddenChildren" field.
	 * all the parents till the root need to have this flag set to true to make it easy to find the
	 * hidden nodes later when showing nodes in other hierarchical layers.
	 *
	 * the method setX3dRenderShow() explains how the hidden nodes are found.
	 * @param x3dNode node to hide
	 */
	publicRet.setX3dRenderHide = function (x3dNode) {
		x3dNode.setAttribute("render", "false");

		while (x3dNode !== MYAPP.x3dModelRoot) {
			x3dNode = x3dNode.parentNode;
			// not necessary to go to to the root if a node is already marked with hidden child nodes
			if (x3dNode.hasHiddenChildren === true) {
				return;
			}
			x3dNode.hasHiddenChildren = true;
			//console.log("hide: " + x3dNode.getAttribute("id"))
		}
	};

	/****
	 * shows a scene graph node by setting the render Flag of a x3d node to true.
	 *
	 * if a node should be shown all the child nodes need to be rendered to. therefore it is necessary
	 * to find all child nodes that are not rendered in the subtree.
	 * to speed up the action each x3d node in the scene Graph has a flag "hasHiddenChildren".
	 * if it is set to true there are hidden nodes in the subtree below the node.
	 *
	 * when going deeper into the subtree it is only necessary to visit the child nodes of the nodes that
	 * have the flag set to true. then the render flag needs to be set to true and the
	 * hasHiddenChildren flag must be set to false.
	 *
	 * depending if the starting node (parameter: x3dNode) has hidden sibling or not it is necessary to
	 * reorganize the hasHiddenChildren flags of the siblings, parents and siblings of each parent.
	 * the line x3dRenderShowParentsAndSelf(x3dNode); dose so.
	 * @param x3dNode
	 */
	publicRet.setX3dRenderShow = function (x3dNode) {
		var children;
		var i;

		console.log(x3dNode.getAttribute("id") + " - " + x3dNode.hasHiddenChildren)

		//console.log(x3dNode.getAttribute("id"))
		// process children recursively
		if (x3dNode.hasHiddenChildren === true) {
			children = x3dNode.childNodes;
			for (i = 0; i < children.length; i++) {
				if (this.isx3dNodeGoodForTree(children[i])) {
					//console.log(children[i].nodeName)
					this.setX3dRenderShow(children[i]);
				}
			}
			x3dNode.hasHiddenChildren = false;
		}

		// !!! todo: I'm not sure if this method is called way to often when the recursion is done
		x3dRenderShowParentsAndSelf(x3dNode);
	};

	/****
	 * this private function is to process the parent and the node itself when showing a x3dNode
	 *
	 * basically all the x3d nodes till the root are visited. on the way the siblings are hidden ore shown
	 * depending on the render state of the nodes.
	 *
	 * example:
	 * 1.) hide a node in eg. level 5.
	 * 2.) then turn on a node in the deeper level 7.
	 *     since all the siblings should not be shown it is necessary to hide them
	 *     (in step one they were hidden by the node in level 5).
	 *
	 * the single steps are explained in the code below.
	 * @param x3dNode starting node
	 */
	function x3dRenderShowParentsAndSelf(x3dNode) {
		var stack = []; // all node on the path to the root
		var i;
		var stackIndexHiddenNode = -1;

		// collect path to root
		// 1. the function first collects all the parent nodes until the root is reached.
		//    they are pushed into a stack and set the render flag to true.
		//    to get a starting point the node, that is not rendered and highest up in the tree is remembered
	    //    with its index in the stack (array)
		while (x3dNode !== MYAPP.x3dModelRoot) {
			stack.push(x3dNode);
			//console.log(x3dNode)
			if (x3dNode.getAttribute("render") === "false" || x3dNode.getAttribute("render") === false) {
				stackIndexHiddenNode = stack.length - 1;
			}

			x3dNode.setAttribute("render", "true");

			x3dNode = x3dNode.parentNode;
		}


		// 1b. process the root element -> more elegant if this part would be inside the loop above
		stack.push(x3dNode);
		if (x3dNode.getAttribute("render") === "false" || x3dNode.getAttribute("render") === false) {
			stackIndexHiddenNode = stack.length - 1;
		}
		x3dNode.setAttribute("render", "true");


		// 2. start the node that is closest to to root (and had false in the render flag) - this is the remembered stating node
		//    and go down the path to the original node
		//    on the way hide all siblings
		for (i = stackIndexHiddenNode - 1; i >= 0; i--) {
			// hide all siblings at the left
			x3dNode = stack[i];
			x3dNode = x3dNode.nextSibling;
			while (x3dNode) {
				if (mod_sceneGraph.isx3dNodeGoodForTree(x3dNode)) {
					mod_sceneGraph.setX3dRenderHide(x3dNode);
				}
				x3dNode = x3dNode.nextSibling;
			}

			// hide all siblings at the right
			x3dNode = stack[i];
			x3dNode = x3dNode.previousSibling;
			while (x3dNode) {
				if (mod_sceneGraph.isx3dNodeGoodForTree(x3dNode)) {
					mod_sceneGraph.setX3dRenderHide(x3dNode);
				}
				x3dNode = x3dNode.previousSibling;
			}
		}
	}

	/****
	 * specify which types of Nodes should be used in the Graph
	 * others are ignored
	 *
	 * @param x3dNode node to be checked
	 * @return {Boolean} true -> node is usable, false -> node should be ignored
	 */
	publicRet.isx3dNodeGoodForTree = function (x3dNode) {
		//alert(x3dNodeTmp._x3domNode._xmlNode.getAttribute("id"));
		if (x3dNode._x3domNode === undefined || x3dNode._x3domNode._xmlNode === undefined) {
			//alert("invalid node");
			return false;
		}

		return x3dNode._x3domNode._xmlNode.getAttribute("id") === MYAPP.modelRootId ||
			document.getElementById('x3dElement').runtime.isA(x3dNode, 'X3DGroupingNode') ||
			document.getElementById('x3dElement').runtime.isA(x3dNode, 'X3DShapeNode');

	};

	/****
	 * check if a node is a leaf in the x3d scene graph (is it a shape?)
	 *
	 * @param x3dNode node to be checked
	 * @return {Boolean} true -> node is leaf, false -> node is no leaf
	 */
	publicRet.isX3dNodeLeaf = function (x3dNode) {
		if (x3dNode._x3domNode === undefined || x3dNode._x3domNode._xmlNode === undefined) {
			//alert("invalid node");
			return false;
		}
		return document.getElementById('x3dElement').runtime.isA(x3dNode, 'X3DShapeNode');

	};

	// render Points or Faces
	publicRet.renderVisibility = function (option) {
		if (option === "Point" && renderOptionLast !== "Point") {
			document.getElementById('x3dElement').runtime.togglePoints();
			renderOptionLast = "Point";
		}
		else if (option === "Face" && renderOptionLast !== "Face") {
			document.getElementById('x3dElement').runtime.togglePoints();
			renderOptionLast = "Face";
		}
		else {
			console.error("wrong render option passed to mod_sceneGraph.renderVisibility()")
		}
	};


	return publicRet;
})();


/* DEBUGGING
 function alertFullNodeInfo(x3dNodeJQ) {
 alert(
 mod_sceneGraph.isx3dNodeGoodForTree(x3dNodeJQ[0]) +
 "\n" + x3dNodeJQ.children().size() +
 "\n id - " + x3dNodeJQ[0]._x3domNode._xmlNode.getAttribute("id") +
 "\n" + x3dNodeJQ[0] +
 "\n node - " + x3dNodeJQ[0].nodeName +
 "\n Type - " + x3dNodeJQ[0].nodeType
 );
 }
 */