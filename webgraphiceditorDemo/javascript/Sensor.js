/**
 * 
 */
joint.shapes.basic.Sensor = joint.shapes.basic.Generic.extend({

	  markup: '<g class="rotatable"><g class="scalable"><image/></g><text/></g>',

    defaults: joint.util.deepSupplement({

        type: 'basic.Sensor',
        size: { width: 60, height: 60 },
        attrs: {
        	'text': { 'font-size': 14, text: '', 'text-anchor': 'middle', 'ref-x': .5, 'ref-dy': 20, ref: 'image', 'y-alignment': 'middle', fill: 'black', 'font-family': 'Arial, helvetica, sans-serif' }
        
        },
        ref :[]  ,
        "custom":{  
            "identifier":[  
               {  
                  "name":"Name1",
                  "URI":"Value1",
                  "Ref":"SensorType"
               },
               {  
                   "name":"Name4",
                   "URI":"Value4",
                   "Ref":"SensorType"
                }
            ],
            "classifier":[  
               {  
                  "name":"Name2",
                  "URI":"Value2",
                  "Ref":"SensorType"
               }
            ],
            "output":[  
               {  
                  "name":"Name3",
                  "URI":"Value3",
                  "Ref":"SensorType"
               }
            ]
           
         },
        uuid :[]
        
        
            
        

    }, joint.shapes.basic.Generic.prototype.defaults)
});