/**
 * Dashboard modal.
 * Enables the display of fetched XML data in  a bootstrap modal.
 * @author Elgan ROLLAND (Elgan.Rolland@partenaire-exterieur.ifremer.fr)
 */

/**
 * This file contains the following sections:
 * 1. Modal attributes & objects: contains the data that is proper to the modal.
 * 2. Utils: mostly string analysis and parse functions.
 * 3. Processes: the main functions of the modal load (data fetching, templating and so on).
 * 4. Events: the series of events to attach to the modal.
 * 5. Load: Functions and events called on loading new content into the modal.
 * 6. Init: Actions undertaken as soon this script is loaded.
 * (Go to a section by looking for \section{name_of_section})
 */

$( function () {

	/*
	 * \section{Modal attributes & objects}
	 */

	 var DEFAULT_IMAGE_URL = './images/grey_seal.png';							// The link to the default quicklook image.
 	 var DESCRIPTION_MAX_LENGTH = 40;																// The maximum length of the descriptive text.
	 var COMPONENTS_MAX_AMOUNT = 15;																// The maximum amount of sub-components.

	 // The Mustache template data.

	var templateSelector = "#systemDescriptionModal",								// The CSS selector of the modal's template.
			template = "";																							// The HTML code for the template.

	// The spinner's data.

	var spinnerSelector = "#modalSpinner";													// The CSS selector to the template.

	// The data in current use.
	// These variables will vary when going from modal to modal.
	// (See function switchModals below).

	var resourceUrl = "";																						// The URL to the API feeding the modal.

	// Tweaks and cheats.
	// The following variables are used in order to fix issues
	// stemming from Bootstrap, OpenLayers, etc...

	var finalActions = [];																					// The series of actions to be launched after the opening of the modal.

	/**
	 * A history object, which contains a chain of states and the functions to navigate through them.
	 */
	var ModalHistory = function () {

		var self = this;

		var history = null;

		/**
	   * A history state object, used to indicate the previous and next modals.
		 */
		var	ModalHistoryState = function () {
				this.prev = null; 													// The previous history state.
				this.resourceUrl = null;										// The url of the resource for this state.
				this.next = null; 													// The next history state (left unused for now).
		};

		/**
		 * Adds a state at the end of the history chain.
		 * @param {string} url - the url to the resource of the current state.
		 */
		self.add = function ( url ) {

				var historyState = new ModalHistoryState();

				// Checks whether it is absolute or relative.
				url = /^(https?|ftp):\/\/.*/.test( url ) ? url : openingResourceBase + url;

				// Sets the current resource URL in the current history state.
				historyState.resourceUrl = url;

				// Sets the link with the previous state (if there is one).
				if ( history !== null ) {
						history.next = historyState;
						historyState.prev = history;
				}

				// Sets the new state and the current history.
				history = historyState;

		};

		/**
		 * Goes backwards in the state chain.
		 */
		self.back = function () {

				// Secures the backing.
				if ( history === null ) {
						throw new Error("The modal's history is inexistent.")
				}
				if ( history.prev === null ) {
						throw new Error("The modal's history cannot go back.")
				}

				// Sets the previous state as the current one.
				history = history.prev;

		};

		/**
		 * Goes forward in the state chain.
		 */
		self.forward = function () {

				// Secures the forwarding.
				if ( history === null ) {
						throw new Error("The modal's history is inexistent.")
				}
				if ( history.next === null ) {
						throw new Error("The modal's history cannot go forward.")
				}

				// Sets the next state as the current one.
				history = history.next;

		};

		/**
		 * Returns the current state's resource URL.
		 * @param {string} the URL to the resource of the current state.
		 */
		self.getResource = function () {
				return history.resourceUrl;
		};

		self.hasPrev = function () { return history.prev !== null; }
		self.hasNext = function () { return history.next !== null; }

	};

	var modalHistory = new ModalHistory();										// A linked list using history objects to navigate between modals.

	/*
	 * \section{Utils}
	 */

	/**
	 * Inserts a character or a string in another string.
	 * @param {string} string - the string in which to insert.
	 * @param {string} insert - the character or string to insert.
	 * @param {number} position - the index where to put the previous value.
	 * @return {string} the new string.
	 */
	var insertString = function ( string, insert, position ) {
		return string.slice( 0, position ) + insert + string.slice( position );
	};

	/**
	 * Provides the list of indexes for a given character or string.
	 * @param {string} string - the string to parse.
	 * @param {string} search - the string or character to search.
	 * @return {array} the list of all indexes.
	 */
	var indexesOf = function ( string, search ) {
		var indexes = [];
		for( var i = 0; i < string.length; i++ ) {
			if ( string[i] === search ) indexes.push(i);
		}
		return indexes;
	};

	/**
	 * Renders dates in human readable format.
	 * @param {string} datetimeString - the string to format.
	 * @return {string} the formatted string.
	 */
	var prettifyDatetime = function ( datetimeString ) {

		var MIN_YEAR = 1950;			// The minimum possible year for dates.

		var prettyDatetime = "",		// The formatted date to return.
			numericYear = -1;			// The year of the given date, in int type.

		// If it is an ISO Date, transforms it...
		if ( Date.parse( datetimeString ) ) {

			var date = new Date( datetimeString ),
				dateString = date.toLocaleDateString(),
				timeString = date.toLocaleTimeString();

			prettyDatetime = dateString;
			if ( timeString !== '00:00:00' ) {
				prettyDatetime += ' ' + timeString;
			}
		}
		// ... Otherwise, if it is a year, in the acceptable range, returns it as such...
		else if ( !isNaN( numericYear = parseInt( datetimeString ) ) && MIN_YEAR <= numericYear ) {
			prettyDatetime = datetimeString;
		}
		// ... If it is none of the above, does nothing.
		else {
			//@TODO: Throw error?
			console.log('The date "' + datetimeString + '" is not valid.');
		}

		return prettyDatetime;

	}

	/**
	 * Transforms long words, URLs, email addresses and such, as to make them breakable.
	 * @param {string} longString - the string to make breakable.
	 * @param {string|array} [separators] - one or a list of separators BEFORE the break.
	 * @return {string} the breakable string.
	 */
	var breakifyString = function ( longString, separators ) {

		var breakableString = longString,			// The string with the breaking characters.
			breakingChar = '\u200B';				// The character that indicates a word-break (no-width space, ASCII is &#8203;.

		// Spreads breakers evenly if no separator is given.
		if ( !separators || !separators.length ) {
			//@TODO
		}
		// Inserts breakers after the given characters.
		else {

			/**
			 * Inserts a breaker accordingly.
			 * @param {string} breaker - either a character after which to break, or a string for a preset break.
			 */
			var breakFrom = function ( breaker ) {

				var index,				// The index of the breaking character.
					indexes = [];		// The list of indexes of breaking characters.

				switch ( breaker ) {
				// If the string to break is a URL, break at the @ and the /.
				case 'url' :
					if ( index = breakableString.indexOf( '@' ) ) {
						breakableString = insertString( breakableString, breakingChar, index );
					}
					for ( var i = 0; i < breakableString.length; i++ ) {
						if ( breakableString[i] === '/' ) {
								breakableString = insertString( breakableString, breakingChar, i );
								i++;
						}
					}
					break;
				// ... Otherwise, breaks after every occurence of the character.
				default :
					//@TODO
					break;
				}

			};

			// Apply the separation rules to the string.
			switch ( typeof separators ) {
			case 'string' :
				breakFrom( separators );
				break;
			case 'array' :
				separators.map( breakFrom );
				break;
			default :
				throw TypeError('');
				break;
			}

		}

		return breakableString;

	};

	/**
	 * Detects whether a string is an image file name or address.
	 * @param {string} url - the URL to the image.
	 * @return {boolean} whether the URL points to an image or not.
	 */
	 function checkImageUrl( url ) {
	     return ( url.match( /\.(jpeg|jpg|gif|png)$/ ) !== null );
	 }

	/**
	 * Checks whether the string is empty or not.
	 * @param {string} str - the string to test for emptiness.
	 * @return {boolean} whether the string is empty or not.
	 */
	var testExistingString = function ( str ) {
			return str && str.length && /\S/.test( str );
	}

	/*
	 * \section{Processes}
	 */

	/**
	 * Shows a spinner while the data is being processed - and hides it afterwards.
	 * @param {string} action - indicates whether to 'show' or 'hide' the spinner.
	 */
	var spin = function ( action ) {

		// Ensures the parameter is either 'show' or 'hide'.
		var toShow = ( action === 'show' ? true : ( action === 'hide' ? false : null ) );
		if ( toShow === null ) { throw new TypeError("Parameter for function spin is invalid."); }

		var $spinnerDiv = $( spinnerSelector );				// The spinner's div.

		// Shows or hides the the spinner...
		$spinnerDiv.toggle( toShow );

		// ... And, inversely, hides or shows the content.
		//@FIXME: The selectors are terrible but it was the best working ones I could find...
		$('.modal-header h4').toggle( !toShow );
		$spinnerDiv.siblings().toggle( !toShow );
		$('.modal-footer p').toggle( !toShow );

	};

	/**
	 * Gets the XML data from the API.
	 * @param {function} callback - the function to execute after getting the data.
	 */
	var getApiData = function ( callback ) {

		var xmlData = "";		// The XML data to return.

		// Queries the server.
		$.ajax({
			type : 'GET',
			url : resourceUrl,
			data : {},
			dataType : 'xml',
			success : function ( response ) {
				// Gets the data and sends it to the callback.
				xmlData = response;
				callback( xmlData );
			},
			error : function ( response ) {
				// Signals the error.
				throw new Error("No data could be retrieved from the server at " + resourceUrl + ", cause is: " + response.responseText);
			}
		});

	};

	/**
	 * Transforms XML data into usable JSON data.
	 * @param {XMLDocument} xmlData - a XML document full of data to parse.
	 * @return {object} the data in JSON format.
	 */
	var parseXmlStringToJson = function ( xmlData ) {

		var jsonData = {},		// The JSON data to return.
			$xmlData = null;	// The jQuery element use to navigate through the Xml data's DOM.

		if ( xmlData ) {

			// Parses the XML into a jQuery object.
			$xmlData = $( xmlData );

			/**
			 * Shortcuts selection in the XML DOM object.
			 * @param {string} selector - a valid CSS selector (as in usual jQuery).
			 * @param {object} [$context] - the jQuery element on which to use the selector.
			 * @return{object} a jQuery object.
			 */
			var $xmlShortener = function ( selector, $context ) {

				var $elem = null,										// The returned jQuery element.
					modifiedSelector = selector,						// The selector used to find the element (with compatible namespace, and without namespace).
					namespaceColonPosition = selector.indexOf(':');		// The position of the namespace colon.

				if ( namespaceColonPosition > -1 ) {
					// Inserts a double anti-slash before the namespace colon if there is one.
					// (otherwise, the element name is interpreted as a CSS pseudo-element, like :first-child, etc...)
					modifiedSelector = insertString( modifiedSelector, '\\', namespaceColonPosition );

					// Retrieves and appends the name of the element only (Google Chrome tweak).
					//@NOTE: Google Chrome cannot process namespaces before an element's name - therefore only the name is given.
					//@FIXME: Be wary for two elements with same name but different namespaces in the data.
					// This will cause Google Chrome to select all elements.
					modifiedSelector += ', ' + modifiedSelector.slice( modifiedSelector.indexOf( ':' ) + 1 );
				}

				// Retrieves the corresponding XML element.
				$elem = ( $context || $xmlData ).find( modifiedSelector );

				return $elem;
			};

			// Extracts and transforms the XML data.
			jsonData = function ( $xml ) {

				return {

					// Gets the system's UUID from the identifiers.
					uuid : $xml('sml:value', $xml('sml:identifier').filter( function () {
						var labelText = $xml('sml:label', $(this) ).text();
						return labelText === 'uuid' || labelText === 'UUID';
					} ) ).text(),

					// Gets its name.
					name : $xml('gml:name').text(),

					// Gets its description.
					description : $xml('gml:description').text(),

					// Gets its quicklook picture.
					quicklook : function () {
							var quicklookUrl = null;
							$xml('sml:document').each( function () {
									var $document = $(this),
											isQuicklook = $xml('gmd:CI_OnLineFunctionCode', $document ).attr('codeListValue') === 'quicklook';

									if ( isQuicklook ) {
											quicklookUrl = $xml('gmd:URL', $xml('gmd:linkage', $document ) ).text();
											return false;
									}
							} );
							return quicklookUrl;
					}(),

					// Gets its period of validity.
					validTime : function () {
						var $timePeriod = $xml('gml:TimePeriod');
						return {
							start : $xml('gml:beginPosition', $timePeriod ).text(),
							stop : $xml('gml:endPosition', $timePeriod ).text()
						}
					}(),

					// Gets its identifiers.
					identifiers : $xml('sml:identifier').map( function () {
						var $identifier = $(this);
						return {
							name : $xml('sml:label', $identifier ).text(),
							value : $xml('sml:value', $identifier ).text(),
							href : $xml('sml:Term', $identifier ).attr('definition')
						};
					} ).get(),

					// Gets its classifiers.
					classifiers : $xml('sml:classifier').map( function () {
						var $classifier = $(this);
						return {
							name : $xml('sml:label', $classifier ).text(),
							nameHref : $xml('sml:Term', $classifier ).attr('definition'),
							value : $xml('sml:value', $classifier ).text(),
							valueHref : $xml('sml:codeSpace', $classifier ).attr('xlink:href')
						}
					} ).get(),

					// Gets its outputs.
					outputs : $xml('sml:output').map( function () {
						var $output = $(this);
						return {
							name : $output.attr('name'),
							href : $output.attr('xlink:href')
						};
					} ).get(),

					// Gets its latitude and longitude.
					location : function () {

						var $coordinates = $xml('gml:coordinates', $xml('sml:position') );
						if ( !$coordinates.length || !$coordinates.text().replace(/\s/, '').length ) { return null; }

						// Retrieves the separate coordinates (they are given in a single string).
						var coordinates = $coordinates.text(),
							latLng = coordinates.split(' ');

						return { lat : parseFloat( latLng[0] ), lng : parseFloat( latLng[1] ) };

					}(),

					// Gets its contacts.
					contacts : $xml('sml:contact').map( function () {
						var $contact = $(this);
						return {
							individual : $xml('gco:CharacterString', $xml('gmd:individualName', $contact ) ).text(),
							organization : $xml('gco:CharacterString', $xml('gmd:organisationName', $contact ) ).text(),
							email : $xml('gco:CharacterString', $xml('gmd:electronicMailAddress', $contact ) ).text(),
							role : {
								name : $xml('gmd:CI_RoleCode', $xml('gmd:role', $contact ) ).attr('codeListValue'),
								href : $xml('gmd:CI_RoleCode', $xml('gmd:role', $contact ) ).attr('codeList')
							}
						}
					} ).get(),

					// Gets its documents.
					documents : $xml('sml:document').map( function () {
						var $document = $(this);
						return {
							name : $xml('gco:CharacterString', $xml('gmd:name', $document ) ).text(),
							href : $xml('gmd:URL', $xml('gmd:linkage', $document ) ).text()
						};
					} ).get(),

					// Gets its components.
					components : $xml('sml:component').map( function () {
						var $component = $(this);
						return {
							name : $component.attr('name'),
							href : $component.attr('xlink:href')
						}
					} ).get(),

					// Gets its events.
					//@FIXME: A sml:Event element in a sml:event??
					events : $xml('sml:Event', $xml('sml:event') ).map( function () {
						var $event = $(this);
						return {
							description : $xml('swe:description', $event ).text(),
							href : $event.attr('definition'),
							datetime : $xml('gml:timePosition', $event ).text()
						}
					} ).get(),

					// Gets its model name.
					model : $xml('sml:typeOf').attr('xlink:href')

				};

			}( $xmlShortener );

		}

		return jsonData;

	};

	/**
	 * Transforms the templated areas according to the given data.
	 * @param {object} data - the data used to fill the template.
	 */
	var parseTemplate = function ( data ) {

		var templateData = "";		// The data to render, which should contain display enhancements.

		// Renders the data accordingly to the current modal.
		templateData = function ( data ) {

			var renderedData = $.extend( true, {}, data );		// The data to render, which should contain display enhancements.

			// Prints the title of the modal.
			renderedData.displayName = 'System: ' + data.name;

			// Adds the URL to the current resource's XML.
			renderedData.resourceUrl = resourceUrl;

			// Renders whether the data has a validity period or not.
			renderedData.validTime = function () {

				var undefinedTime = 'to be defined',
					hasStart = ( data.validTime.start !== undefinedTime && data.validTime.start.length ),
					hasStop = ( data.validTime.stop !== undefinedTime && data.validTime.stop.length );

				// Returns nothing if no limit is given...
				if ( !hasStart && !hasStop ) {
					return null;
				}

				// ... Otherwise, returns one or both limits (accordingly rendered).
				var validTime = {};
				if ( hasStart ) {
					validTime.start = prettifyDatetime( data.validTime.start );
				}
				if ( hasStop ) {
					validTime.stop = prettifyDatetime( data.validTime.stop );
				}
				return validTime;

			}();

			// Transforms the remaining ISO Format dates.
			renderedData.events.map( function ( event ) {
				if ( event.datetime.length ) {
					event.datetime = prettifyDatetime( event.datetime );
				}
			} );

			// "Word-breaks" URLs and removes empty contact data fields.
			renderedData.contacts.map( function ( contact ) {

				// Breaks the role if it is a URL.
				if ( /^(https?|ftp):\/\/.*/.test( contact.role.name ) ) {
					contact.role.name = breakifyString( contact.role.name, 'url' );
				}

				// Sanitizes the contact's name.
				if ( !testExistingString( contact.individual ) ) { contact.individual = null; }

				// Sanitizes the contact's organization's name.
				if ( !testExistingString( contact.organization ) ) { contact.organization = null; }

				// Sanitizes the contact's email address.
				if ( !testExistingString( contact.email ) ) {
					 contact.email = null;
				} else {
					contact.email = breakifyString( contact.email, 'url' );
				}

			} );

			// Displays the model's file's name.
			renderedData.model = function () {

					// Ensures display only if the model is actually given.
					if ( !data.model || !data.model.length ){ return null; }

					var displayedModel = {};

					// Retrieves the URL...
					displayedModel.href = data.model;

					// And retrieves the file's name from said URL.
					displayedModel.name = data.model.split('/').pop();
					displayedModel.name = displayedModel.name.slice( 0, displayedModel.name.lastIndexOf( '.' ) );

					return displayedModel;

			}();

			// Uses an attached image as main image if there is any.
			renderedData.image = function () {

					var imageUrl = null;					// The URL to the image.

					// Gets the quicklook image if defined...
					if ( data.quicklook ) {
							imageUrl = data.quicklook;
					}
					// Otherwise, gets one from the documents.
					else if ( data.documents.length ) {

							// Retrieves the documents that are images...
							var imageDocuments = data.documents.filter( function ( document ) {
									return checkImageUrl( document.href );
							} );

							// And gets the URL from the first one, or the default.
							if ( imageDocuments.length ) {
								imageUrl = imageDocuments.shift().href;
							} else {
								imageUrl = DEFAULT_IMAGE_URL;
							}

					}
					// Otherwise, uses the default image.
					else {
							imageUrl = DEFAULT_IMAGE_URL;
					}

					return imageUrl;

			}();

			return renderedData;

		}( data );

		// Gets the templated HTML...
		if ( !template.length ) {

				template = $( templateSelector ).html();
				Mustache.parse( template );

		}
		// ... Or clears the existing parsed template.
		else {
				$( templateSelector ).html('');
		}

		// Gets the template, then treats and renders it.
		var rendered = Mustache.render( template, templateData );

		$( templateSelector ).html( rendered );

		// Manages the map's display.
		var buildMap = function () {

				var $locationMap = $('#locationMap'),							// The map's element.
						$substituteMap = $('#substituteMap'),					// The element to display in case of no location.
						hasLocation = ( data.location !== null );			// Whether the data has location data or not.

				// Displays a map if any coordinates were given.
				if ( hasLocation ) {

						// Creates a map canvas.
						var locationMap = new ol.Map( {
								maxResolution : 1000,
								controls: [],
								interactions: [],
								layers: [ new ol.layer.Tile( {
									source: new ol.source.TileWMS( {
										url: 'http://www.ifremer.fr/services/wms1',
										params: {
											'LAYERS': 'continent,ETOPO1_BATHY_R'
										}
									} )
								} ) ],
								target: 'locationMap',
								view: new ol.View( {
									projection: 'EPSG:4326',
									center: [ data.location.lng , data.location.lat ],
									zoom: 2.5,
								} )
						} );

						// Resizes the canvas to match the container's girth.
						//@NOTE: This size update has to be done once the modal's content is
						// displayed, otherwise it will only show after a user resize.
						// See the foolowings for details:
						// http://stackoverflow.com/questions/22902288/map-displaying-properly-only-on-window-change
						// http://stackoverflow.com/questions/17599180/google-map-does-not-display-properly
						finalActions.push( function () { locationMap.updateSize(); } );

				}

				// Hides the map or the substitute image, and shows the other one.
				$locationMap.toggle( hasLocation );
				$substituteMap.toggle( !hasLocation );

		}();

		/**
		 * Displays a 'More...' link at the bottom of the description if it is too long.
		 */
		var extendDescription = function () {

			var fullDescriptionShown = data.description.length < DESCRIPTION_MAX_LENGTH,	// Whether the full text should be shown or not.
					$extend = $("#descriptionExtend"),																				// The 'More/Less' element.
					$text = $("#descriptionText");																						// The description's text.

			// Only works if the description is long enough.
			if ( !fullDescriptionShown ) {

					/**
					 * Cuts the description.
					 * @param {string} description - the description to shorten.
					 * @return {string} the shorter description.
					 */
					var cutDescription = function ( description ) {

							var newDescription = description;				// The modified description.

							// Gets the closest previous separator and cuts at its position.
							var separatorPosition = indexesOf( newDescription, ' ' ).filter( function ( index ) {
									return index < DESCRIPTION_MAX_LENGTH;
							} ).pop();

							newDescription = newDescription.slice( 0, separatorPosition );

							// Adds a ... at the end.
							newDescription += '...';

							return newDescription;

					};

					/**
					 * Switches the description.
					 */
					var fillOrCut = function (){

						// Gets the current status of the
						var extended = $extend.data('extended');

						// Switches the text.
						$extend.text( extended ? 'Less' : 'More' );

						// Fills or cuts the description.
						$text.text( extended ? templateData.description : cutDescription( templateData.description ) );
					};
					fillOrCut();

					/**
					 * Attaches the full display event to the 'More' link.
					 */
					$extend.on('click', function ( event ) {

						event.preventDefault();

						// Switches the status of the description.
						$extend.data('extended', !$extend.data( 'extended' ) );

						fillOrCut();

						// Readjusts the modal's backdrop height. @FIXME: Should work but does not...
						$('.modal').data('bs.modal').handleUpdate();

					} );

			}

			// Hides or show the extend link.
			$extend.toggle( !fullDescriptionShown );

		}();

		/**
		 * Displays a 'More...' link at the bottom of the subcomponents if there are too many.
		 */
		var extendComponents = function () {

			var allComponentsShown = data.components.length < COMPONENTS_MAX_AMOUNT,	// Whether the full list should be shown or not.
					$extend = $("#componentsExtend");																			// The 'More/Less' element.

			// Only works if the description is long enough.
			if ( !allComponentsShown ) {

					// The components to hide: all nth above the maximum amount.
					var $components = $("#components > li:nth-child(n+"+ ( COMPONENTS_MAX_AMOUNT + 1 ) + ")");

					/**
					 * Switches the components.
					 */
					var fillOrCut = function (){

						// Gets the current status of the components list.
						var extended = $extend.data('extended');

						// Switches the list.
						$extend.text( extended ? 'Less' : 'More' );

						// Fills or cuts the list.
						$components.toggle( extended );

						// Adds a small correction to the list's design.
						$("#components")
							.toggleClass( 'reduced', !extended )
							.find('li:nth-child(' + ( COMPONENTS_MAX_AMOUNT ) + ')')
							.toggleClass( 'last-displayed', !extended );

					};
					fillOrCut();

					/**
					 * Attaches the full display event to the 'More' link.
					 */
					$extend.on('click', function ( event ) {

						event.preventDefault();

						// Switches the status of the description.
						$extend.data('extended', !$extend.data( 'extended' ) );

						fillOrCut();

						// Readjusts the modal's backdrop height. @FIXME: Should work but does not...
						$('.modal').data('bs.modal').handleUpdate();

					} );

			}

			// Hides or show the extend link.
			$extend.toggle( !allComponentsShown );

		}();

	};

	/**
	 * Activates or deactivates the header controls.
	 */
	var activateControls = function () {

			// Activates / deactivates the history buttons.
			$('#backBtn').toggle( modalHistory.hasPrev() );
			$('#forwardBtn').toggle( modalHistory.hasNext() );

	};

	/*
	 * \section{Events}
	 */

	/**
	 * Attaches various events to the modal.
	 */
	var attachEvents = function () {

		/**
		 * Displays a modal with the model's or sub-component's data.
		 */
		$('.modal-link').on('click', function ( event ) {

			// Stops the opening of a new window.
			event.preventDefault();

			// Retrieves the resource's data and 'opens' the right modal.
			switchModals( $(this).attr('href') );

		} );

		/**
		 * Enables the "Back" button from the modal.
		 */
		$('#backBtn').on('click', function ( event ) {
				// 'Backs' to the right modal.
				switchModals( 'back' );
		} );

		/**
		 * Enables the "Back" button from the modal.
		 */
		$('#forwardBtn').on('click', function ( event ) {
				// 'Forwards' to the right modal.
				switchModals( 'forward' );
		} );

		/**
		 * Enables the "Print" button from the modal.
		 */
		$('#printBtn').on('click', function ( event ) {
				//@TODO: Print!.
		} );

	};

	/**
	 * Launches all functions that are supposed to be done only once the modal is open.
	 */
	var finalize = function () {
			while ( finalActions.length ) {
					finalActions.shift()();
			}
	};


	/*
	 * \section{Load}
	 */

	/**
	 * Activates the modal.
	 */
	var main = function () {

		try {
			// Displays the spinner...
			spin('show');

			// ... Gets the API XML data...
			getApiData( function ( apiData ) {
				// ... Transforms it in JSON (Mustache uses JSON only)...
				var jsonData = parseXmlStringToJson( apiData );

				// ... Fills the modal...
				parseTemplate( jsonData );

				// ... Activates controls...
				activateControls();

				// ... Attaches events.
				attachEvents();

				// ... And hides the spinner.
				spin('hide');

				// Activates any additional treatment added in the process.
				finalize();
			} );
		}
		// Errors may come from the server, or the XML or JSON parsing.
		catch ( error ) {
			console.log( error.name + ": " + error.message );

			// Hides spinner no matter what.
			spin('hide');
		}

	};

	/**
	 * Deactivates the modal.
	 */
	var reset = function () {

			// Clears the history.
			modalHistory = new ModalHistory();

			// Clears the resource origin.
			resourceUrl = "";

			// Reinstalls the template.
			$(templateSelector).html(template);

			// Initiates the spinner.
			spin('show');

	};

	/**
	 * Switches data according to which modal is being opened.
	 * @param {string} instruction - either: the URL to the resource of the modal that is being activated, or: 'back' or 'forward' the history.
	 */
	var switchModals = function ( instruction ) {

		// Sets the history's new state.
		switch ( instruction ) {
		case 'back' :
			modalHistory.back();
			break;
		case 'forward' :
			modalHistory.forward();
			break;
		default :
			modalHistory.add( instruction );
			break;
		}

		// Gets the resource's URL.
		resourceUrl = modalHistory.getResource();

		// Reactivates the templating.
		main();

	};

	// Activated when opening the modals.
	$('#systemDescriptionModal')
			// Activates the modal on open.
			.on('shown.bs.modal', function () {

					// Gets the resource.
					resourceUrl = openingResourceUrl;

					// Sets the new history.
					modalHistory.add( resourceUrl );

					// Parses the template.
					main();

			} )
			// Resets the modal on close.
			.on('hidden.bs.modal', function () {
					reset();
			} );

	/**
	 * Sets at zero before first use.
	 */
	var init = function () {

			// Sets the spinner turning.
			spin('show');

	};
	init();

} );

/*
 * \section{Init}
 */

// Defines the base URLs.

var openingResourceBase = DATA_ACCESS_URI + "sml/",						// The URL base for the resources.
		openingResourceUrl = "";																	// The first loaded resource's URL.

/**
 * Opens the modal.
 * @param {string} systemUUID - the UUID of the system, used for getting the corresponding resource.
 */
var showSystem = function ( systemUUID ) {

	// Builds the resource URL.
	openingResourceUrl = openingResourceBase + systemUUID + '?pretty=true';

	// Opens the modal.
	$('#systemDescriptionModal').modal('show');

};
