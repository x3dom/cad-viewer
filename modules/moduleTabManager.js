/***
 * Module Tab manager
 * this module switches the tabs in the left pane.
 */
function _mod_TabManager() {
	// private section

	// holds the links between the button id in the tab bar and the container id that is to be displayed
	var tabsDictionary = {
		"buttonId" : [
			"leftPane_tab_blank",
			"leftPane_tab_sceneGraph",
			"leftPane_tab_metaData",
			"leftPane_tab_annotation",
			"leftPane_tab_menu"
		],
		"containerId" : [
			"blank",
			"sceneGraphContainer",
			"metaDataContainer",
			"annotationsContainer",
			"menuContainer"
		]
	};
	var currentTab = "";

	/****
	 * "translate" the tab button id to the corresponding container id
	 * @param tabId id of the button in the tab bar
	 * @return {*}
	 */
	function getContainerId(tabId) {
		var i = jQuery.inArray(tabId, tabsDictionary.buttonId);
		if (i < 0 || tabsDictionary.containerId.length < i) {
			return false;
		}
		return tabsDictionary.containerId[i];
	}

	/****
	 * "translate" the container id to the corresponding tab button id
	 * @param containerId id that is the base to get the tab id
	 * @return {*}
	 */
	function getMenuId(containerId) {
		var i = jQuery.inArray(containerId, tabsDictionary.containerId);
		if (i < 0 || tabsDictionary.buttonId.length < i) {
			return false;
		}
		return tabsDictionary.buttonId[i];
	}

	/****
	 * highlight the tab button with the currently activated content container
	 * @param containerId id of the container that is the base for activating the button
	 */
	function activateButton(containerId) {
		jQuery("#tabs .ui-btn-active").removeClass("ui-btn-active");
		jQuery("#" + getMenuId(containerId)).addClass("ui-btn-active");
	}

	/****
	 * init the event handlers for the case one clicks on a button in the tab bar
	 * !!! todo: this is not very dynamic ;) better would be a loop
	 */
	function initEventHandler() {
		/***** Buttons QuickLinks topNavi ***********************************/
		jQuery("#leftPane_tab_blank").click(function () {
			activateButton("blank");
			jQuery(".pos_leftPane").fadeOut();
			return false;
		});
		jQuery("#leftPane_tab_sceneGraph").click(function () {
			var id = getContainerId(jQuery(this).attr("id"));
			mod_TabManager.switchTab(id);
			return false;
		});
		jQuery("#leftPane_tab_metaData").click(function () {
			var id = getContainerId(jQuery(this).attr("id"));
			mod_TabManager.switchTab(id);
			return false;
		});
		jQuery("#leftPane_tab_annotation").click(function () {
			var id = getContainerId(jQuery(this).attr("id"));
			mod_TabManager.switchTab(id);
			return false;
		});
		jQuery("#leftPane_tab_menu").click(function () {
			var id = getContainerId(jQuery(this).attr("id"));
			mod_TabManager.switchTab(id);
			return false;
		});
	}

	// private section END


	// public section
	return {
		init : function () {
			this.switchTab("sceneGraphContainer");
			initEventHandler();
		},
		/****
		 * switch a tab in the tab bar.
		 * @param containerId
		 */
		switchTab : function (containerId) {
			// if the selected tab is the menu it is necessary to switch it's position first to the left side
			if (containerId === "menuContainer" || currentTab === "menuContainer") {
				mod_menu.setNextPosition();
			}

			if (containerId !== currentTab) {
				jQuery("#" + currentTab).fadeOut();
			}
			jQuery("#" + containerId).fadeIn();
			//alert("#" + id);
			activateButton(containerId);

			currentTab = containerId;
		}
	};
	// public section END   (return end)
}
// Tab Manager Module End




