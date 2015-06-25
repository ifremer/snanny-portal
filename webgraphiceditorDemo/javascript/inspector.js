
var CommonInspectorInputs = {

    size: {
        width: { type: 'number', min: 1, max: 500, group: 'geometry', label: 'width', index: 1 },
        height: { type: 'number', min: 1, max: 500, group: 'geometry', label: 'height', index: 2 }
    },
    position: {
        x: { type: 'number', min: 1, max: 2000, group: 'geometry', label: 'x', index: 3 },
        y: { type: 'number', min: 1, max: 2000, group: 'geometry', label: 'y', index: 4 }
    },
   
};

var CommonInspectorGroups = {

    text: { label: 'Text', index: 8 },
    presentation: { label: 'Presentation', index: 7 },
    geometry: { label: 'Geometry', index: 6 },
    data: { label: 'System description', index: 1 },
    identifier: { label: 'identifier', index: 2 },
    classifier: { label : 'other tags', index: 3},
    contact: { label : 'Contact', index: 4},
    position: { label : 'Position', index: 5},
    event: { label : 'event', index: 2}
   
    
};

var dataType = {
		
		 
		 description: { type: 'textarea', group: 'data',  label: 'Description', index: 1, attrs: { label: { 'data-tooltip': 'Description of the element' } } },  
	
		 custom: { 
			 
			 imported : { type : 'toggle', label :'Export' ,group :'data', index: 1 },
			 
			 output : { type :'list',item: {
                 type: 'object',
                 properties: {
                     name: { type: 'text', 'readOnly':true, label: 'name', index: 1, attrs: { label: { 'data-tooltip': 'label of the output channel' } } },                                   
                     URI: { type: 'text', inlined: true, label: 'URI', index: 2, attrs: { label: { 'data-tooltip': 'identifier' } } }
                         
                     
                 }
             },  group: 'data', index: 1, label: 'Output'} ,
             
			 
		
			 
			 			   	
                
                identifier : { type :'list',item: {
                    type: 'object',
                    properties: {
                        name: { type: 'text', label: 'name', readOnly: true,index: 1, attrs: { label: { 'data-tooltip': 'label of the unique identifier key' } } },                                   
                        URI: { type: 'text', inlined: true, label: 'value', index: 2, attrs: { label: { 'data-tooltip': 'value' } } }
                            
                        
                    }
                },  group: 'identifier', index: 1, label: 'Identifier'} ,
                event : { type :'list',item: {
                    type: 'object',
                    properties: {
                        date: { type: 'text', label: 'Date', index: 1, attrs: { label: { 'data-tooltip': 'Date' } } },                                   
                        description: { type: 'text',  label: 'Description', index: 2, attrs: { label: { 'data-tooltip': 'Event description' } } }
                            
                        
                    }
                },  group: 'event', index: 1, label: 'Event', attrs: { label: { 'data-tooltip': 'Events' } }} ,
                
                classifier : { type :'list',item: {
                    type: 'object',
                    properties: {
                        name: { type: 'text', label: 'name', index: 1, attrs: { label: { 'data-tooltip': 'label of the proprety' } } },                                   
                        URI: { type: 'text', inlined: true, label: 'value', index: 2, attrs: { label: { 'data-tooltip': 'value' } } }
                            
                        
                    }
                },  group: 'classifier', index: 1, label: 'Other tags', attrs: { label: { 'data-tooltip': 'classifier' } }} ,
                contact : { type :'list',item: {
                    type: 'object',
                    properties: {
                        role: { type: 'text', label: 'role', index: 1, attrs: { label: { 'data-tooltip': 'role' } } },                                   
                        email: { type: 'text', inlined: true, label: 'email', index: 2, attrs: { label: { 'data-tooltip': 'email' } } },
                        URI: { type: 'text', inlined: true, label: 'URI', index: 2, attrs: { label: { 'data-tooltip': 'URI' } } }
                            
                        
                    }
                },  group: 'contact', index: 1, label: 'Contact', attrs: { label: { 'data-tooltip': 'contact' } }} ,
               
                
                    latitude: { type: 'text', label: 'latitude', index: 1,group: 'position', attrs: { label: { 'data-tooltip': 'role' } } },                                   
                    longitude: { type: 'text', inlined: true, label: 'longitude',group: 'position', index: 2, attrs: { label: { 'data-tooltip': 'email' } } }                           
                        
                  
               
                
                
                               
					    	
		    },
		  	
		 
		
		
		
		
};





var CommonInspectorTextInputs = {
    'text': { type: 'textarea', group: 'text', index: 1 },
    'font-size': { type: 'range', min: 5, max: 80, unit: 'px', group: 'text', index: 2 },
    'font-family': { type: 'select', options: ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Georgia', 'Garamond', 'Tahoma', 'Lucida Console', 'Comic Sans MS'], group: 'text', index: 3 },
    'font-weight': { type: 'range', min: 100, max: 900, step: 100, defaultValue: 400, group: 'text', index: 4 },
    'fill': { type: 'color', group: 'text', index: 5 },
    'stroke': { type: 'color', group: 'text', index: 6, defaultValue: '#000000' },
    'stroke-width': { type: 'range', min: 0, max: 5, step: .5, defaultValue: 0, unit: 'px', group: 'text', index: 7 },
    'ref-x': { type: 'range', min: 0, max: .9, step: .1, defaultValue: .5, group: 'text', index: 8 },
    'ref-y': { type: 'range', min: 0, max: .9, step: .1, defaultValue: .5, group: 'text', index: 9 }
};

var InputDefs = {
    text: { type: 'textarea', label: 'Text' },
    'font-size': { type: 'range', min: 5, max: 80, unit: 'px', label: 'Font size' },
    'font-family': { type: 'select', options: ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Georgia', 'Garamond', 'Tahoma', 'Lucida Console', 'Comic Sans MS'], label: 'Font family' },
    'font-weight': { type: 'range', min: 100, max: 900, step: 100, defaultValue: 400, label: 'Font weight' },
    'fill': { type: 'color', label: 'Fill color' },
    'stroke': { type: 'color', defaultValue: '#000000', label: 'Stroke' },
    'stroke-width': { type: 'range', min: 0, max: 5, step: .5, defaultValue: 0, unit: 'px', label: 'Stroke width' },
    'ref-x': { type: 'range', min: 0, max: .9, step: .1, defaultValue: .5, label: 'Horizontal alignment' },
    'ref-y': { type: 'range', min: 0, max: .9, step: .1, defaultValue: .5, label: 'Vertical alignment' },
    'ref-dx': { type: 'range', min: 0, max: 50, step: 1, defaultValue: 0, label: 'Horizontal offset' },
    'ref-dy': { type: 'range', min: 0, max: 50, step: 1, defaultValue: 0, label: 'Vertical offset' },
    'dx': { type: 'range', min: 0, max: 50, step: 1, defaultValue: 0, label: 'Horizontal distance' },
    'dy': { type: 'range', min: 0, max: 50, step: 1, defaultValue: 0, label: 'Vertical distance' },
    'stroke-dasharray': { type: 'select', options: ['0', '1', '5,5', '5,10', '10,5', '3,5', '5,1', '15,10,5,10,15'], label: 'Stroke dasharray' },
    rx: { type: 'range', min: 0, max: 30, defaultValue: 1, unit: 'px', label: 'X-axis radius' },
    ry: { type: 'range', min: 0, max: 30, defaultValue: 1, unit: 'px', label: 'Y-axis radius' },
    'xlink:href': { type: 'text', label: 'Image URL' }
};

function inp(defs) {
    var ret = {};
    _.each(defs, function(def, attr) {

        ret[attr] = _.extend({}, InputDefs[attr], def);
    });
    return ret;
}


var InspectorDefs = {

    'link': {

        inputs: {
            attrs: {
                '.connection': {
                    'stroke-width': { type: 'range', min: 0, max: 50, defaultValue: 1, unit: 'px', group: 'connection', label: 'stroke width', index: 2 },
                    'stroke': { type: 'color', group: 'connection', label: 'stroke color', index: 3 },
                     },
                '.marker-source': {
                    transform: { type: 'range', min: 1, max: 15, unit: 'x scale', defaultValue: 'scale(1)', valueRegExp: '(scale\\()(.*)(\\))', group: 'marker-source', label: 'source arrowhead size', index: 1 },
                    fill: { type: 'color', group: 'marker-source', label: 'soure arrowhead color', index: 5 }
                },
                '.marker-target': {
                    transform: { type: 'range', min: 1, max: 15, unit: 'x scale', defaultValue: 'scale(1)', valueRegExp: '(scale\\()(.*)(\\))', group: 'marker-target', label: 'target arrowhead size', index: 1 },
                    fill: { type: 'color', group: 'marker-target', label: 'target arrowhead color', index: 6 }
                }
            },
            smooth: { type: 'toggle', group: 'connection', index: 4},
            manhattan: { type: 'toggle', group: 'connection', index:7 },
            linkType: { type: 'select', options: ['wired', 'remote data transmission'], group: 'connection', defaultValue :'wired', label: 'type', index: 3 }
            

        },
        groups: {
            labels: { label: 'Labels', index: 1 },
            'connection': { label: 'Connection', index: 2 },
            'marker-source': { label: 'Source marker', index: 3 },
            'marker-target': { label: 'Target marker', index: 4 }
        }
    },

   
   
};


