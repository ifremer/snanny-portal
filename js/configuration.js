//// INDEX API ////
//// must be on same server as portal ////
// production
//var SNANNY_HOST = 
// validation
//var SNANNY_HOST = "http://isi.ifremer.fr/snanny-indexIO-api";
// development
var SNANNY_HOST = "http://ubisi54.ifremer.fr/snanny-indexIO-api";
// local
//var SNANNY_HOST = "http://localhost.ifremer.fr:8080/api";

var SNANNY_API = SNANNY_HOST+"/rest";


var MAP_RESOURCES = SNANNY_API+"/obs/synthetic/map";
var TIMELINE_RESOURCES = SNANNY_API+"/obs/synthetic/timeline";
var OBSERVATIONS_RESOURCES = SNANNY_API+"/obs";

//// OWNCLOUD /////
var OWNCLOUD_HOST = "http://visi-snanny-datacloud.ifremer.fr/owncloud"
//var OWNCLOUD_HOST = "localhost:8888/owncloud"

var DATA_ACCESS_URI = OWNCLOUD_HOST + "/index.php/apps/snannyowncloudapi/";

//// CAS Authentication ////
var CAS_URI = "https://auth.ifremer.fr/";

var RESOLUTION = 200;