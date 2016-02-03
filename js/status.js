(function() {
	/**
	 * @namespace
	 */
	StatusManager = {
		/**Is status up */
		_up: false,

		_template : '<div id="barwrap">'
  					+'<div class="bar">'
  					+'<span id="head-image"><img src="images/error.png" alt=""></span>'
  					+'<span id="text">Unable to access to observation, please contact your administrator.</span>'
  					+'<span id="otherimg"></span>'
  					+'<span id="ok"><a href="#"></a></span>'+'</div></div>',

		/**
		* Initialisation function
		*/
		initialize:function(){
			this.$body = $('body');
			this.getStatus();
		},

		/**
		* Retrieve log status 
		*/
		getStatus: function(){
			var _this = this;
			$.ajax({
				type: 'GET',
				url: SNANNY_API+"/info",
				dataType: 'json',
				success: function(response) {
					if(response.status === 'failure'){
						_this.showError();
					}
				},
				error:_this._showError
			});		
		},

		/**
		* Update the view to present login status 
		*/
		_showError: function(){
			var result = StatusManager.$body.append(StatusManager._template);

  			setTimeout(function() {
			    return $(".bar").animate({
			      height: "toggle"
			    }, "slow")
			  }, 450);
			  return $("#ok").on("click", function() {
			    $("#barwrap").css("margin-bottom", "0px");
			    $(".bar").animate({
			      height: "toggle"
			    }, "slow");
			    return !1
			  })		
		}

	};
})();

$(function(){
	//Update status
	StatusManager.initialize();
});