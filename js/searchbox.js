var changeRequest;
$("#searchInput").keyup(function(e){
	clearTimeout(changeRequest);
	if (e.keyCode == '13') {
        e.preventDefault();
        getObservationsCount();
		getObservationsAndSystems();
    }else{
		changeRequest = setTimeout(function(){
			getObservationsCount();
			getObservationsAndSystems();
		}, 500);
	}

});