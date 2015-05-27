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
               {  
                  "name":"Name1",
                  "URI":"Value1",
                  "Ref":"PlatformType"
               }
            ],
            "classifier":[  
               {  
                  "name":"Name2",
                  "URI":"Value2",
                  "Ref":"PlatformType"
               }
            ],
            "output":[  
               {  
                  "name":"Name3",
                  "URI":"Value3",
                  "Ref":"PlatformType"
               }
            ]
           
         },
        ref :[],
        
        uuid :[]
    }, joint.shapes.basic.Generic.prototype.defaults)
});