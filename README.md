# snanny-portal
## web portal for sensor nanny

Explore and edit systems and observations

## Demo (unfinished) web forms for JERICO/SeaDataNet mooring
Edit, save and export in sensorML

To create a new platform go to :

    http://localhost/snanny-portal/editor/#/mooredPlatform/new

Update a platform with id cc4a17de-d614-b03b-5f0b-414e7b0e9483 (beware information are not read from couchbase back-end or SOS service, To Be Done):

    http://localhost/snanny-portal/editor/#/mooredPlatform/edit/cc4a17de-d614-b03b-5f0b-414e7b0e9483


## Demo graphical editor for observtories
Draw, save and export in sensorML

![alt tag](https://raw.githubusercontent.com/ifremer/snanny-portal/master/doc/snanny-draw.png)

Done with Rappid (http://jointjs.com/about-rappid)

Go to:

    http://localhost/snanny-portal/webgraphiceditorDemo/webgraphiceditor/
    

# deployment
In the directory pubilshed with Apache:

    git clone https://github.com/ifremer/snanny-portal.git
   
Update configuration in following files:
The link on the SNANNY REST FULL API (snanny-api) server:

    js/configuration.js
   
The link to owncloud service (for record storage), and birt (for report generation):

    webgraphiceditorDemo/javascript/configuration.js


