'use strict';

app.service("editorService", function($http) {
  
  this.system = {};
  
  this.guid = (function() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return function() {
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    };
  })();
  
  this.getTemplate = function(template) {
    return $http.get(template)
      .then(function(result) {
        return result.data;
      })
    ;
  };
  
  this.getSystem = function(uuid, template) {
    
    var $scope = this;
    
    // TODO: call SOS server to retrieve system instead of 'stub/test.xml'
    return $http.get('stub/test.xml')
      .then(function(result) {
        $scope.system = result.data;
        return template;
      })
      .then(this.getTemplate)
      .then(function(template) {
        // TODO: retrieve model from template and data ($scope.system)
        console.log("TODO: retrieve model");
        console.log($scope.system);
        console.log(template);
        
        // TODO: remove this stub
        return {"uuid": uuid, "observatoryName":"test","observatoryPicture":"test","wmoPlatformNumber":61278,"position":{"latitude":"1","longitude":"2","verticalReference":"local reference plane"},"bottomDepth":"1234","principalInvestigator":{"name":"test","email":"test@test.com"},"events":[{"date":"test","description":"test"},{"date":"test2","description":"test2"},{"date":"test3","description":"test3"},{"date":"test4","description":"test4"}]};
      })
    ;
  };
  
  this.generatePlatform = function(template, model) {
    return this.getTemplate(template)
      .then(function(template) {
        var render = Handlebars.compile(template);
        return render(model);
        // return Mustache.render(template, model);
      }
    );
  };
  
  this.makeArchive = function(archiveName, platformName, platformContent) {
    var zip = new JSZip();
    zip.file(platformName, platformContent);
    
    // TODO: save instruments
    var instruments = zip.folder("instruments");
    instruments.file("test.txt", "Content");
    instruments.file("test2.txt", "Content");
    
    var content = zip.generate({type:"blob"});
    saveAs(content, archiveName);
  };
  
});