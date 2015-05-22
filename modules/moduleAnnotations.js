
/****
 * this is a module that is inside a closure (javascript the good parts p. 37 and p.40)
 * all the fields are private and can be accessed with the methods in the returnd object
 */


/***
 * this module is used to manage all annotations in a x3d scene.
 *
 * usage:
 *      mod_annotations = _mod_annotations();
 *      jQuery.get("path/to/json.txt", mod_annotations.init, "json");
 *
 * it requiers an empty Group in the x3d scene with the id="annotationMarker"
 * <Group id="annotationMarker" render="true"></Group>
 *
 * the annotations are stored in a JSON file with the following structure:
 * [
	 {
		 "id":   "idFromX3dModel",
		 "title":"some random title",
		 "text": "some random text",
		 "date": "15.1.2012",
		 "user": "user",
		 "link": "http://de.wikipedia.org/",
		 "posX": "4",
		 "posY": "4",
		 "posZ": "4",
		 "dirX": "",
		 "dirY": "0",
		 "dirZ": "0"
	 },
     {},...
     {}
   ]
 * note: - the field id is requited and needs to be equal to the id of the corresponding x3d element
 *       - all the other fields can be left empty
 *       - dirX, dirY, dirZ are not used at the moment.
 *
 * Fields:
 * htmlTargetId: is used to specify the target element to write the collapsible list of all annotations.
 * isPopUpOnTap: default = true, true -> when tapping a x3d element a popup with an annotations is created
 *                               false -> no popups appear when tapping on a x3d element
 * isShowAnnotationMarker: default = true, true -> shows annotation marker (green spheres) in the model
 *                                         false -> no marker are rendered
 *
 * !!! todo: when creating a new annotaion marker it dosn't add an onclick event to the model part itself.
 *           the result is that the annotation pops up when clicking on the marker but not when clicking the object part
 *
 * the events in the x3d scene are added by the file SceneGraph.js in the function addClickEvents();
 * -> x3dNode.addEventListener('click', mod_annotations.popUp, false);
 *
 */
function _mod_annotations() {
	"use strict";

	// private section
	var isInit = false;
	var callbacksOnInit = [];
	var htmlTargetId = MYAPP.annotationsContainerID;
	var data;
	var isPopUpOnTap = true;
	var isCreateAnnotation = false;
	var newAnnotation;
	var isShowAnnotationMarker = false;

	// private section
	/**
	 * callback can be insert into a que if the module is not initialised at the time of adding them.
	 * the que is processed here after the module is init.
	 */
	function runCallbacksInit() {
		var i;
		for (i = 0; i < callbacksOnInit.length; i++) {
			callbacksOnInit[i]();
		}
	}

	/**
	 * this method needs to be called after editing a jquery mobile specific containers programmly.
	 * it dose the same as jquery mobile would do on initialisation
	 */
	function initStyleJQM() {
		// rebuild collapsible list
		// !!! todo: selector might be bad for performance if there are many large collapsible lists in the document
		jQuery('div[data-role=collapsible]').collapsible();
	}

	/**
	 * creates the collapsible list with all annotations
	 */
	function createList() {
		var element;
		var i;

		jQuery('#' + htmlTargetId).empty();    // delete all prev markers

		for (i = 0; i < data.length; i++) {
			element = createListItem(data[i].id, data[i].title, data[i].text);
			jQuery('#' + htmlTargetId).append(element);
		}

		initStyleJQM();
	}

	/**
	 * create single List items
	 * @param id
	 * @param title
	 * @param text
	 * @return {*}
	 */
	function createListItem(id, title, text) {
		var group;
		var header;
		var headerText;
		var p;

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

	/****
	 * collect all annotations that are linked to one object part.
	 * @param id this part is selected with the id
	 * @return {Array} all linked annotations are returned in an array
	 */
	function getDataSetById(id) {
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

	/****
	 * step 2 - create new Annotations
	 * callback that is executed when picking.
	 * creates a popUp that can be filled with the information that is stored in the annotation
	 * @param event x3DOM event that is fired when picking a 3D object
	 */
	function newAnnotationPopUp(event) {
		var d = new Date();
		var dat = d.getDate();
		var mon = d.getMonth();
		var year = d.getFullYear();
		var todayDate = dat + "/" + mon + "/" + year;

		//console.log("newAnnotationPopUp");

		if (isCreateAnnotation === true) {
			// remove hint
			jQuery("#pickAnnotationLocation").fadeOut(400, function () {
				jQuery("#pickAnnotationLocation").remove();
			});

			// prepare new annotation object
			newAnnotation = {};
			newAnnotation.id = event.target._x3domNode._xmlNode.getAttribute("id");
			newAnnotation.posX = event.worldX;
			newAnnotation.posY = event.worldY;
			newAnnotation.posZ = event.worldZ;

			// create popup
			jQuery().popUp("new", {
				"isCloseOnClick" : false,
				"content" : {
					"type" : "html",
					"html" : '                                                                                                                      \
						<form class="scroll">                                                                                                       \
							<p> <strong>Title:</strong><input type="text" name="title" id="createAnnotation_Title" />                       </p>    \
							<p> <strong>User:</strong><input type="text" name="user" id="createAnnotation_User" value="some user" />        </p>    \
							<p> <strong>Date:</strong><input type="text" name="date" id="createAnnotation_date" value="' + todayDate + '" /></p>    \
							<p> <strong>Text:</strong><textarea placeholder="Text" id="createAnnotation_text"></textarea>                   </p>    \
							<p> <strong>Link:</strong><input type="url" name="url" placeholder="Url" id="createAnnotation_link" />          </p>    \
						</form>                                                                                                                     \
						<a id="createAnnotation_submit" class="ui-btn ui-btn-up-a ui-shadow ui-btn-corner-all ui-btn-icon-left"                     \
								onclick="mod_annotations.newAnnotationCommit();">done</a>                                           \
						<a id="createAnnotation_cancel" class="ui-btn ui-btn-up-a ui-shadow ui-btn-corner-all ui-btn-icon-left"                     \
								onclick="mod_annotations.cancelNewAnnotation();">cancel</a>                                                         \
					'
				}
			});
		}
	}

	/****
	 * creates annotation marker for every annotation in the stack.
	 * and deletes old annotation marker.
	 * this is not very performance, but easy to implement ;)
	 * !!! todo: if there are many annotations it is better to keep old markers and add just the new ones
	 */
	function createAllAnnotationMarker() {
		var parent = document.getElementById('annotationMarker');
		jQuery("#annotationMarker").empty();    // delete all prev markers

		for (var i = 0; i < data.length; i++) {
			createAnnotationMarker(i, parent);
			//console.log(data[i].id)
		}
	}

	/****
	 * create a single marker and adds it to the x3d element parent
	 * in our case the element has the id annotationMarker
	 * @param id that is used for linking between the marker and the annotation
	 * @param parent element to add the marker to
	 */
	function createAnnotationMarker(id, parent) {
		var annot = data[id];
		var scale = MYAPP.scaleAnnotMarker;
		var px = annot.posX;
		var py = annot.posY;
		var pz = annot.posZ;
		//var dx = parseFloat(annot.dirX);
		//var dy = parseFloat(annot.dirY);
		//var dz = parseFloat(annot.dirZ);
		var t = document.createElement('Transform');
		t.setAttribute("translation", px + " " + py + " " + (pz));
		//t.setAttribute("rotation", dx + " " + dy + " " + dz + " 1.57" );
		var t2 = document.createElement('Transform');
		//t2.setAttribute("translation", "0 " + (-scale) + " 0" );  // needed for cons!!!!
		t2.setAttribute("scale", scale + " " + scale + " " + scale);

		var s = document.createElement('Shape');
		var marker = document.createElement('Sphere');
		var a = document.createElement('Appearance');
		var m = document.createElement('Material');
		m.setAttribute("diffuseColor", "0 1 0");
		m.setAttribute("transparency", "0.3");
		var d = document.createElement('DepthMode');
		d.setAttribute("readOnly", "true");


		t.appendChild(t2);
		t2.appendChild(s);
		s.appendChild(marker);
		s.appendChild(a);
		a.appendChild(m);
		a.appendChild(d);

		//console.log("px " + px + " - py " + py + " - scale" + scale + t)

		s.onclick = mod_annotations.popUp;
		s.setAttribute("id", "annotation_Marker_" + annot.id);

		parent.appendChild(t);
	}


	// private section END


	// public section
	return {
		/**
		 * get the boolean if popups appear when selecting x3d elements
		 * @return {Boolean}
		 */
		getPopUpOnTap : function () {
			return isPopUpOnTap;
		},
		/**
		 * set if popups appear when selecting x3d elements
		 * @param val boolean or true/ false as a string
		 */
		setPopUpOnTap : function (val) {
			isPopUpOnTap = val === true || val === "true";
		},
		/**
		 * initialise module
		 * @param jsonData json file that is the source for the annotations
		 */
		init : function (jsonData) {
			data = jsonData;
			//console.log(data.toString())
			createList();
			isInit = true;
			runCallbacksInit();

			createAllAnnotationMarker();
		},
		/**
		 * is module already initialized?
		 * @return {Boolean}: true -> is init, false -> not init jet
		 */
		isInit : function () {
			return isInit;
		},
		/**
		 * pushes a callback into a que to be added after initialisation.
		 * !!! warning: after initialisation this method has no longer effect -> this is bad design ;)
		 * !!! todo: change it and change the name of the method
		 * uses the private function runCallbacksInit() to process the que
		 * @param func function to be added to the que
		 */
		setCallbackOnInit : function (func) {
			callbacksOnInit.push(func);
		},
		/**
		 * turns the toggle bool on an off to either show or dont show popups when selecting x3d elements.
		 */
		togglePopUpOnTap : function () {
			isPopUpOnTap = !isPopUpOnTap;
		},
		/****
		 * shows or hides the annotation marker
		 * @param val boolean or string (if string it must be "true" or "false"
		 */
		setShowAnnotationMarker: function(val){
			if (val === true || val === "true") {
				isShowAnnotationMarker = true;
				document.getElementById("annotationMarker").setAttribute("render", "true");
			}
			else {
				isShowAnnotationMarker = false;
				document.getElementById("annotationMarker").setAttribute("render", "false");
			}
		},
		/****
		 * create a popup that displays the annotation
		 * @param event that is fired when an x3d element is clicked -> used to get the id of the clicked object part
		 */
		popUp : function (event) {

			var dataSet;
			var content = [];
			var i;
			var id = event.hitObject._x3domNode._xmlNode.getAttribute("id");

			// no normal popup but a create new Annotation form
			if (isCreateAnnotation === true) {
				//console.log("popup newAnnotationPopUp")
				newAnnotationPopUp(event);
				return;
			}

			if(id === null || !isPopUpOnTap){
				return;
			}
			//console.log("click: " + id);
			id = id.replace("annotation_Marker_", "inline__");
			//console.log(id)

			if (isCreateAnnotation !== true) {
				dataSet = getDataSetById(id);

				// collect data that is displayed in the popup
				for (i = 0; i < dataSet.length; i++) {
					content.push({
						"type" : "text",
						"title" : dataSet[i].title,
						"text" : dataSet[i].text,
						"link" : {"url": dataSet[i].link, "title": dataSet[i].link}
					});
					//console.log(dataSet[i].title);
				}

				jQuery().popUp("new", {
					"content" : content
				});
			}
		},

		/****
		 * step 1 - create new Annotations
		 * set status ready to pick a location for the new annotation
		 *
		 * note: step 2 is private
		 */
		newAnnotation : function () {
			isCreateAnnotation = true;
			jQuery("#view").append(jQuery('<div id="pickAnnotationLocation" onclick="mod_annotations.cancelNewAnnotation()">please pick Annotation location </div>'))
		},
		/****
		 * step 3 - create new Annotations
		 * when committing the popup by pushing the "OK" button this function is called
		 * and the already prepared annotation object is filled with the information
		 * from the form.
		 * then it is pushed to the already existing annotations.
		 * and the markers / list are updated
		 */
		newAnnotationCommit : function () {
			//console.log("commitNewAnnotation");
			newAnnotation.dirX = "0";
			newAnnotation.dirY = "0";
			newAnnotation.dirZ = "0";
			newAnnotation.title = jQuery("#createAnnotation_Title").val();
			newAnnotation.text = jQuery("#createAnnotation_text").val();
			newAnnotation.date = jQuery("#createAnnotation_date").val();
			newAnnotation.user = jQuery("#createAnnotation_User").val();
			newAnnotation.link = jQuery("#createAnnotation_link").val();

			data.push(newAnnotation);

			createAllAnnotationMarker();
			createList();

			console.log("commitNewAnnotation");

			newAnnotation = null;
			isCreateAnnotation = false;
			jQuery().popUp("close");
		},
		/****
		 * it is always possible to cancel the process of creating a new annotation.
		 * to do so, the state is set to false, the new annotation object is deleted
		 * and the popup is closed.
		 */
		cancelNewAnnotation : function () {
			isCreateAnnotation = false;
			newAnnotation = null;
			jQuery().popUp("close");
			jQuery("#pickAnnotationLocation").fadeOut(400, function () {
				jQuery("#pickAnnotationLocation").remove();
			});
		}
	};
	// public section END   (return end)
}
