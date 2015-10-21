var changeRequest;
$("#searchInput").keyup(function(){
	clearTimeout(changeRequest);
	changeRequest = setTimeout(function(){
		getObservationsCount();
		getObservations();
	}, 500);

});