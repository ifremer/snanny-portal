(function() {
	/**
	 * @namespace
	 */
	CasManager = {
		/**Is logged */
		_logged: false,

		/**User name*/
		_userName:undefined,

		_popuMenuVisible:false,

		/**
		* Initialisation function
		*/
		initialize:function(){
			this.$btn = $("#loginBtn");
			this.$user = $("#signedUser");
			this.$userContainer = $("#signedUserContainer");
			this.$logoutMenu = $("#expanddiv");
			this.getStatus();
		},

		/**
		* Call CAS login form
		*/
		login: function(){
			var returnService = SNANNY_HOST+"/register.jsp?bf="+encodeURIComponent(window.location.href);
			window.location.replace(returnService);
		},

		/**
		* Call Cas logout form
		*/
		logout: function(){
			var returnService = SNANNY_HOST+"/unregister.jsp?bf="+encodeURIComponent(window.location.href);
			window.location.replace(returnService);
		},

		/**
		* Retrieve log status 
		*/
		getStatus: function(){
			var _this = this;
			$.ajax({
				type: 'GET',
				url: SNANNY_API+"/user",
				dataType: 'json',
				success: function(response) {
					_this.updateView(response);
				},
			});		
		},

		/**
		* Update the view to present login status 
		*/
		updateView: function(data){
			this._logged = data.logged;
			this._userName = data.user;
			this.$user.html(" "+data.user);		
			this.$userContainer.toggleClass("hidden", !data.logged);
			this.$btn.toggleClass("hidden", data.logged);


		},

		toggleLogoutBtn: function(event){
			var that = CasManager;
			if(event === true || event === false){
				that._popuMenuVisible = event;
			}else{
				that._popuMenuVisible = !that._popuMenuVisible;
				event.stopPropagation();
			}
		
			if(that._popuMenuVisible){
			    //now set up an event listener so that clicking anywhere outside will close the menu
			    $('html').click(function(event) {
			        //check up the tree of the click target to check whether user has clicked outside of menu
			        if ($(event.target).parents('#expanddiv').length==0) {
			            // your code to hide menu
						that.$logoutMenu.toggleClass("hidden", true);
			            //this event listener has done its job so we can unbind it.
			            $(this).unbind(event);
			        }

			    });

			}

			that.$logoutMenu.toggleClass("hidden", !that._popuMenuVisible);
		},

		/**
		* ToggleLogin to ensure login/logout feature
		*/
		toggleLogin: function(){
			that = CasManager;
			if(that._logged){
				that.logout();
			}else{
				that.login();
			}
		}
	};
})();

$(function(){
	//Update status
	CasManager.initialize();
	//Add binding on click button
	$("#loginBtn").bind("click", CasManager.toggleLogin);
	$("#logoutBtn").bind("click", CasManager.logout);
	$("#signedUserContainer").bind("click", CasManager.toggleLogoutBtn);

});