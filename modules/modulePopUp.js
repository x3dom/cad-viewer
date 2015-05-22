/********************************************************************
 **** pop up module *********************************
 ********************************************************************/

/****
 * jQuery plugin to show popups
 * it is possible to create popups that just show text or html (forms etc.) can be submitted
 * !!! todo: chainability is not given at the moment :(
 */
(function ($) {
	// private section - following fields and functions are private and need to be accessed by methods provided in the public section
	var lastPopUp;

	/**
	 * creates an single entry (paragraph) for a popup. On popup can contain many entries
	 * @param popUp parent popup
	 * @param title Title (Bold Text) of the paragraph
	 * @param text text below the title (normal weight)
	 */
	function createPopUpEntryText(popUp, title, text, link) {
		var popUpTitle = jQuery("<h3>" + title + "</h3>");
		var anchor;
		var p = jQuery("<p>" + text + "</p>");

		if(link && link.url !== "" && link.title !== ""){
			anchor = jQuery('<br /><a href="' + link.url + '" target="_blank">' + link.title + "</a>");
			p.append(anchor);
		}

		popUp.append(popUpTitle);
		popUp.append(p);
	}

	/**
	 * creates an single entry (paragraph) for a popup. On popup can contain many entries
	 * @param popUp parent popup
	 * @param html this entry is filled with plane html -> make sure it is valid!
	 */
	function createPopUpEntryHTML(popUp, html) {
		if (!html || html === "") {      // !!! todo: validate html
			console.log("html string submitted to createPopUpEntryHTML is not valid")
		}

		popUp.append(jQuery(html));

	}
	// private section END


	// public section - methods give access to the private fields
	var methods = {
		/**
		 * creates new popups
		 * @param options parameters that can be submitted
		 *      type: text -> content: fields "title" and "text" can be submitted in content
		 *            html -> content: field "html" can be submitted in content as a string
		 *
		 *      isClosedOnClick: default -> true
		 *                       true -> when one clicks into the popup it closes
		 *                       false -> programmer needs to take care of closing the popup (method close)
		 *      top, right, left, bottom: sets the dimensions and position of the popup
		 *
		 */
		new : function (options) {
			// Create some defaults, extending them with any options that were provided
			var settings = jQuery.extend({
				'isCloseOnClick' : true,
				//top : $(window).scrollTop() + 100;
				'top' : "2.6em",
				'right' : "200px",
				'left' : "350px"
			}, options);
			var popUp = jQuery("<div class='ui-loader ui-overlay-shadow ui-body-a ui-corner-all'></div>")
				.addClass("popUp")
				.css({ "top" : settings.top, "right" : settings.right, "bottom" : settings.bottom, "left" : settings.left })
				.fadeIn(400);
			var i;

			// destroy last popup
			if (lastPopUp) {
				jQuery().popUp("close");
			}
			lastPopUp = popUp;

			// create array if single line popup is submitted
			if (!jsGoodParts.isArray(settings.content)) {
				settings.content = [settings.content];
			}

			// create multi line popup form array (also from single line created arrays)
			if (jsGoodParts.isArray(settings.content)) {
				if (settings.content.length === 0) {
					console.log("no Content for popUp submitted");
					return;
				}
				for (i = 0; i < settings.content.length; i++) {
					if (settings.content[i].type === "text") {
						createPopUpEntryText(popUp, settings.content[i].title, settings.content[i].text, settings.content[i].link);
					}
					if (settings.content[i].type === "html") {
						createPopUpEntryHTML(popUp, settings.content[i].html);
					}
				}
			}
			else {  // error
				console.log("parameters title and text are incorrect");
				return;
			}


			if (settings.isCloseOnClick === true) {
				popUp.click(function () {
					jQuery().popUp("close", jQuery(this));
				});
			}
			// create new popup
			popUp.appendTo($.mobile.pageContainer);

		},
		/**
		 * takes care of closing popups
		 * @param popUp popup to be removed, default: last popup
		 */
		close : function (popUp) {
			if (lastPopUp === undefined) {
				return;
			}
			popUp = popUp || lastPopUp;

			popUp.fadeOut(400, function () {
				popUp.remove();
			});
			//console.log("close popup")

		}

	};
	// public section END   (return end)

	/**
	 * register plugin
	 */
	$.fn.popUp = function (method) {
		// Method calling logic
		if (methods[method]) {
			return methods[ method ].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.tooltip');
		}
	};
})(jQuery);


/**** !!! todo: jquery plugin should be written in the correct way!!!
 * see the example jqm.autoComplete-1.3.js in the project root folder
 * see also http://docs.jquery.com/Plugins/Authoring
 * chainability is not given!!! */
/*
 (function( $ ){

 var methods = {
 setData : function( options ) {
 return this.each(function(){
 var $this = $(this),
 data = $this.data('testData'),
 testData = "bla bla bla";

 // If the plugin hasn't been initialized yet
 if ( ! data ) {
 /* Do more setup stuff here * /

 $(this).data('testData', {
 target : $this,
 testData : testData
 });
 }
 });
 },
 getData : function (){
 return this.each(function(){
 //alert("sdfg")

 var $this = $(this),
 data = $this.data('tooltip');

 alert(data.testData)


 })
 }
 };

 $.fn.myTest = function( method ) {
 // Method calling logic
 if ( methods[method] ) {
 return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
 } else if ( typeof method === 'object' || ! method ) {
 return methods.init.apply( this, arguments );
 } else {
 $.error( 'Method ' +  method + ' does not exist on jQuery.tooltip' );
 }
 };

 })( jQuery );
 */