// Type Platform

joint.shapes.basic.Platform = joint.shapes.basic.Generic.extend({

	  markup: '<g class="rotatable"><g class="scalable"><image/></g><text/></g>',

    defaults: joint.util.deepSupplement({

        type: 'basic.Platform',
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