/********************************************************************
 **** Menu Search and autocompleate *********************************
 ********************************************************************/

/****
 * this is a module that is inside a closure (javascript the good parts p. 37 and p.40)
 * all the fields are private and can be accessed with the methods in the returnd object
 */

function _mod_search() {
	"use strict";
	// private section - following fields and functions are private and need to be accessed by methods provided in the public section
	var _inputId;
	var autoComplete = {};

	autoComplete.suggestion = {};
	autoComplete.suggestion.tags = [];
	autoComplete.suggestion.id = [];
	autoComplete.dictionaryTags = [];

	/****
	 * create a completely new tag
	 * @param id of the corresponding html list element
	 * @param tag to be linked to the id
	 * @return {Object}
	 */
	function newIdTagPair(id, tag) {
		var liElem = {};
		liElem.id = id;
		liElem.tags = [];
		liElem.tags.push(tag);
		return liElem;
	}

	/****
	 * filters a list while typing text into an input field and hides all
	 * list items that don't match to the search string.
	 * @param searchStr string that is currently in the search field (others would be possible to, but mostly senseless)
	 * @param listRootId list to be filterd
	 */
	function searchFilter(searchStr, listRootId) {
		var match;
		var searchIndex;
		var i, j;
		var nodeJQ;
		var visibleNodes = [];

		// show all
		if (!searchStr || searchStr === "") {
			jQuery("#" + listRootId).find("li").andSelf().show();
		}

		searchStr = searchStr.toLowerCase();


		// hide all nodes while traversing
		// not to nice implemented ;)
		for (i = autoComplete.dictionaryTags.length - 1; i >= 0; i--) {
			nodeJQ = jQuery("#" + autoComplete.dictionaryTags[i].id);
			//console.log(autoComplete.dictionaryTags[i].tags[0])
			match = null;
			for (j = 0; j < autoComplete.dictionaryTags[i].tags.length; j++) {
				searchIndex = autoComplete.dictionaryTags[i].tags[j].toLowerCase().match(searchStr);
				if (searchIndex) {
					match = nodeJQ;
					//select node in tree to highlight
					if (searchIndex === 0 && autoComplete.dictionaryTags[i].tags[j].length === searchStr.length) {
						MYAPP.tree.select_node(jQuery("#" + autoComplete.dictionaryTags[i].id));
					}
					break;
				}
			}

			nodeJQ.hide();

			if (match) {
				visibleNodes.push(match);
			}
		}

		// show matching nodes and all their parents
		// !!! todo: the method parents gos up to the html root but it should stop at the top of the list
		for (i = visibleNodes.length - 1; i >= 0; i--) {
			visibleNodes[i].parents("#treeList li").andSelf().show();
		}
	}

	// private section END


	// public section
	// all methods that give access to the private fields and allow to process the menu
	return {
		/****
		 * @param treeRootId
		 * id of the root of the list that should be filtered
		 * @param inputId
		 * id of the input field in witch should get the autocompleate function
		 * @param dictionaryTags
		 * an array that looks as followed:
		 * [ { id: ... , tags: [..., ...]}, { id: ... , tags: [..., ...]} ]
		 * the id is the id of the li element that should be processed,
		 * the tag is an array with corresponding strings (if the search string matches
		 * any of the tag string or tag substring in any position the li element is displayed.
		 * if there is no match at all the li element will be hidden.
		 *
		 */
		initSearch : function (treeRootId, inputId, dictionaryTags) {
			var i, j;

			dictionaryTags = dictionaryTags || [];
			_inputId = inputId;
			autoComplete.dictionaryTags = dictionaryTags;

			for (i = 0; i < dictionaryTags.length; i++) {
				for (j = 0; j < dictionaryTags[i].tags.length; j++) {
					autoComplete.suggestion.tags.push(dictionaryTags[i].tags[j]);
					autoComplete.suggestion.id.push(dictionaryTags[i].id);
				}
			}

			jQuery("#" + inputId).autocomplete({
				source : autoComplete.suggestion.tags,
				select : function (event, ui) {
					if (ui.item) {
						var i = jQuery.inArray(ui.item.value, autoComplete.suggestion.tags);
						var node = jQuery("#" + autoComplete.suggestion.id[i]);
						MYAPP.tree.select_node(node);
					}
					else {
						alert("Dieses Element ist im Objekt nicht enthalten.");
					}
					//alert(ui.item ? ui.item.value: "Nothing selected, input was " + this.value );
				}
			});

			jQuery("#" + inputId).keyup(function () {
				//alert("")
				searchFilter(jQuery("#" + inputId).val(), treeRootId);
			});
			// filter when x is pressed
			jQuery("#" + inputId).parent().children(".ui-input-clear").mouseup(function () {
				searchFilter("", treeRootId);
			});

		},
		/****
		 * push a new tag to the data set that is used to filter the html list
		 * and to the data set that is the base for the autoComplete suggestions
		 * @param id of the corresponding list element
		 * @param tag that is being linked to the tag
		 */
		pushTag : function (id, tag) {
			var i;
			var index = -1;

			//console.log(" id " + id + " tag " + tag + " _inputId " + _inputId)
			if (typeof id !== "string" || typeof tag !== "string") {
				console.error("data to push are not valid (mod_search->method pushTag(id, tag)");
				return;
			}

			for (i = 0; i < autoComplete.dictionaryTags.length; i++) {
				if (autoComplete.dictionaryTags[i].id.match(id)) {
					index = i;
				}
			}

			if (-1 < index) {     // element with the submitted id already exists
				autoComplete.dictionaryTags[index].tags.push(tag);
				/*
				 console.log(
				 autoComplete.dictionaryTags[index].id[0] + " --- " +
				 autoComplete.dictionaryTags[index].tags[0] + " --- " +
				 autoComplete.dictionaryTags[index].id[1] + " --- " +
				 autoComplete.dictionaryTags[index].tags[1]
				 )
				 */
			}
			else {               // create new entry
				autoComplete.dictionaryTags.push(newIdTagPair(id, tag));
				//console.log(newIdTagPair(id, tag).id + " --- " +  autoComplete.dictionaryTags[testI].id + " --- " + autoComplete.dictionaryTags[testI].tags[0] )
			}

			autoComplete.suggestion.tags.push(tag);
			autoComplete.suggestion.id.push(id);

			//console.log( autoComplete.suggestion.id[testI] + " --- " + autoComplete.suggestion.tags[testI] ) ;
			//console.log( id + " --- " + tag ) ;

			jQuery("#" + _inputId).autocomplete('option', 'source', autoComplete.suggestion.tags);
		}
	};
	// public section END   (return end)
}
// Search Module End

