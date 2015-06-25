// Type

joint.shapes.basic.FLOAT = joint.shapes.basic.Generic.extend({

	  markup: '<g class="rotatable"><g class="scalable"><image/></g><text/></g>',

    defaults: joint.util.deepSupplement({

        type: 'basic.FLOAT',
        size: { width: 60, height: 60 },
        attrs: {
        	'text': { 'font-size': 14, text: '',   'text-anchor': 'middle', 'ref-x': .5, 'ref-dy': 20, ref: 'image', 'y-alignment': 'middle', fill: 'black', 'font-family': 'Arial, helvetica, sans-serif' }
        
        },
        "custom":{  
            "identifier":[  
             
            ],
            "classifier":[  
              
            ],
            "output":[  
               
            ]
           
         },
        ref :[],
        
        uuid :[]
    }, joint.shapes.basic.Generic.prototype.defaults)
});


InspectorDefs['basic.FLOAT']=  {

    inputs: _.extend({
        attrs: {
            text: inp({
                text: { group: 'data', index: 1 },
                'font-size': { group: 'text', index: 2 },
                'font-family': { group: 'text', index: 3 },
                'font-weight': { group: 'text', index: 4 },
                fill: { group: 'text', index: 5 },
                stroke: { group: 'text', index: 6 },
                'stroke-width': { group: 'text', index: 7 },
                'ref-x': { group: 'text', index: 8 },
                'ref-dy': { group: 'text', index: 9 }
            }),
            image: inp({
                'xlink:href': { group: 'presentation', index: 1 }
            })
        }
    }, CommonInspectorInputs,dataType),
    groups: CommonInspectorGroups
}