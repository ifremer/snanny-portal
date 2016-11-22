$(function(){
	//Update menu URLs	
	$("#owncloud").attr("href", OWNCLOUD_HOST);
});

var withData;
var withGeo;

function getSettings() {
    var data = localStorage.getItem('withoutData');
    var geo = localStorage.getItem('withoutGeo');
    
    if(data === "undefined"){
        document.getElementById("checkboxWithoutData").checked = false;
    }

    if(geo === "undefined") {
        document.getElementById("checkboxWithoutGeo").checked = false;
    }

    var withoutData = $('.checkboxWithoutData:checked').val();
    var withoutGeo = $('.checkboxWithoutGeo:checked').val();
    localStorage.setItem('withoutData', withoutData);
    localStorage.setItem('withoutGeo', withoutGeo);
}


function updateSettings() {
    var withoutData = $('.checkboxWithoutData:checked').val();
    var withoutGeo = $('.checkboxWithoutGeo:checked').val();
    
    if(withoutData === undefined){
        document.getElementById("checkboxWithoutData").checked = false;
    } else {
        document.getElementById("checkboxWithoutData").checked = true;
    }

    if(withoutGeo === undefined) {
        document.getElementById("checkboxWithoutGeo").checked = false;
    } else {
        document.getElementById("checkboxWithoutGeo").checked = true;
    }
    
    localStorage.setItem('withoutData', withoutData);
    localStorage.setItem('withoutGeo', withoutGeo);
}