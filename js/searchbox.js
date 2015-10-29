var changeRequest;
$("#searchInput").keyup(function(e){
	clearTimeout(changeRequest);
	if (e.keyCode == '13') {
        e.preventDefault();
        getObservationsCount();
		getObservations();
    }else{
		changeRequest = setTimeout(function(){
			getObservationsCount();
			getObservations();
		}, 500);
	}

});