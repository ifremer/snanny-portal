(function () {
  'use strict';

  angular.module('app.dashboard')
    .controller('SystemController', SystemController);


  /* @ngInject */
  function SystemController(system, x2js, params, $uibModalInstance) {
    var vm = this;

    vm.close = close;

    vm.resourceURL = params.resource;
    vm.identifiers = [];
    vm.classifiers = [];
    vm.outputs = [];
    vm.documents = [];
    vm.contacts = [];
    vm.events = [];
    vm.references = [];

    init();

    function init() {
      var json = x2js.xml_str2json(system);
      if (angular.isDefined(json.PhysicalSystem)) {
        vm.entity = json.PhysicalSystem;
        vm.name = vm.entity.name.toString();
        vm.description = angular.isDefined(vm.entity.description._text) ? vm.entity.description.toString() : null;
        fetchIdentifiers();
        fetchClassifiers();
        fetchOutputs();
        fetchDocuments();
        fetchImage();
        fetchPosition();
        fetchContacts();
        fetchEvents();
        fetchReferences();
        fetchValidTime();
      }
    }

    function fetchImage() {
      var image = './images/grey_seal.png';
      var quicklook = vm.documents.find(function (e) {
        return e.code === 'quicklook';
      });

      if (angular.isDefined(quicklook)) {
        image = quicklook.href;
      } else {
        var other = vm.documents.find(function (e) {
          return checkImageUrl(e.href);
        });
        if (angular.isDefined(other)) {
          image = other.href;
        }
      }

      vm.image = image;
    }

    function fetchIdentifiers() {

      function fetchIdentifier(e) {
        vm.identifiers.push({
          name: e.label.toString(),
          value: e.value.toString(),
          href: e._definition
        });

        if (e.label.toString().toLowerCase() === 'uuid') {
          vm.uuid = e.value.toString();
        }
      }

      var identifiers = vm.entity.identification.IdentifierList.identifier;
      fetchData(identifiers, identifiers.Term, fetchIdentifier);
    }

    function fetchClassifiers() {

      function fetchClassifier(e) {
        vm.classifiers.push({
          name: e.label.toString(),
          value: e.value.toString(),
          nameHref: e._definition,
          valueHref: e.codeSpace._href
        });
      }

      if (angular.isDefined(vm.entity.classification)) {
        var classifiers = vm.entity.classification.ClassifierList.classifier;
        fetchData(classifiers, classifiers.Term, fetchClassifier);
      }
    }

    function fetchOutputs() {

      function fetchOutput(e) {
        vm.outputs.push({
          name: e._name,
          href: e['xlink:href']
        });
      }

      if (angular.isDefined(vm.entity.outputs)) {
        var outputs = vm.entity.outputs.OutputList.output;
        fetchData(outputs, outputs, fetchOutput);
      }
    }

    function fetchDocuments() {

      function fetchDocument(e) {
        vm.documents.push({
          name: e.name.CharacterString.toString(),
          href: e.linkage.URL.toString(),
          code: e.function.CI_OnLineFunctionCode._codeListValue
        });
      }

      if (angular.isDefined(vm.entity.documentation)) {
        var documents = vm.entity.documentation.DocumentList.document;
        fetchData(documents, documents.CI_OnlineResource, fetchDocument);
      }
    }

    function fetchPosition() {
      if (angular.isDefined(vm.entity.position)) {
        var pos = angular.isDefined(vm.entity.position.Point.pos) ?
          vm.entity.position.Point.pos.toString() : vm.entity.position.Point.coord.toString();
        var extract = pos.match(/(\d+\.?\d*) (\d+\.?\d*) (-?\d+\.?\d*)/g);
        if (extract) {
          vm.position = {
            lat: [1],
            lon: [2]
          };
        }
      }
    }

    function fetchContacts() {

      function fetchContact(e) {
        var contact = {
          organization: e.organisationName.CharacterString.toString(),
          role: {
            name: e.role.CI_RoleCode._codeListValue,
            href: e.role.CI_RoleCode._codeList
          }
        };
        if (angular.isDefined(e.individualName)) {
          contact.individual = e.individualName.CharacterString.toString();
        }
        if (angular.isDefined(e.contactInfo)) {
          contact.email = e.contactInfo.CI_Contact.address.CI_Address.electronicMailAddress.CharacterString.toString();
        }

        vm.contacts.push(contact);
      }

      if (angular.isDefined(vm.entity.contacts)) {
        var contacts = vm.entity.contacts.ContactList.contact;
        fetchData(contacts, contacts.CI_ResponsibleParty, fetchContact);
      }

    }

    function fetchEvents() {

      function fetchEvent(e) {
        vm.events.push({
          datetime: e.time.TimeInstant.timePosition.toString(),
          description: e.description.toString()
        });
      }

      if (angular.isDefined(vm.entity.history)) {
        var events = vm.entity.history.EventList.event;
        fetchData(events, events.Event, fetchEvent);
      }
    }

    function fetchReferences() {

      function fetchReference(e) {
        vm.references.push({
          name: e._name,
          href: e['_xlink:href']
        });
      }

      if (angular.isDefined(vm.entity.typeOf)) {
        var href = vm.entity.typeOf['_xlink:href'];
        var search = /.+\/(.+)\.xml$/g.exec(href);
        vm.model = {
          name: search[1],
          href: href
        };
      }

      if (angular.isDefined(vm.entity.components)) {
        var components = vm.entity.components.ComponentList.component;
        fetchData(components, components, fetchReference);
      }
    }

    function fetchValidTime() {
      if (angular.isDefined(vm.entity.validTime)) {
        vm.validTime = {
          start: vm.entity.validTime.TimePeriod.beginPosition.toString(),
          end: vm.entity.validTime.TimePeriod.endPosition.toString()
        };
      }
    }

    function fetchData(item, reference, callback) {
      if (angular.isArray(item)) {
        angular.forEach(item, function (data) {
          callback(data);
        });
      } else {
        callback(reference);
      }
    }

    function checkImageUrl(url) {
      return ( url.match(/\.(jpeg|jpg|gif|png)$/) !== null );
    }

    function close() {
      $uibModalInstance.close();
    }
  }

})();
