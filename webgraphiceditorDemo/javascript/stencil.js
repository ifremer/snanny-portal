
var Stencil = {};


Stencil.groups = {
    
    basicSensors: { index: 2, label: 'Sensors' },
    basicPlatforms: { index: 1, label: 'Platforms' },
    Imported: { index: 3, label: 'Imported' },

    ADCP: { index: 4, label: 'EMSO_ADCP' },
    CO2_ANALYSER: { index: 5, label: 'EMSO_CO2_ANALYSER' },
    CONDUCTIVITY: { index: 6, label: 'EMSO_CONDUCTIVITY' },
    CTD: { index: 7, label: 'EMSO_CTD' },
    CURRENT_METER: { index: 8, label: 'EMSO_CURRENT_METER' },
    DEPTH: { index: 9, label: 'EMSO_DEPTH' },
    DO_SENSOR: { index: 10, label: 'EMSO_DO_SENSOR' },
    FLOW_METER: { index: 11, label: 'EMSO_FLOW_METER' },
    FLUOROMETER: { index: 12, label: 'EMSO_FLUOROMETER' },
    GEOPHONE: { index: 13, label: 'EMSO_GEOPHONE' },
    HYDROPHONE: { index: 14, label: 'EMSO_HYDROPHONE' },
    MAGNETOMETER: { index: 15, label: 'EMSO_MAGNETOMETER' },
    MULTIPARAMETER: { index: 16, label: 'EMSO_MULTIPARAMETER' },
    PAH: { index: 17, label: 'EMSO_PAH' },
    PAR_SENSOR: { index: 18, label: 'EMSO_PAR_SENSOR' },
    PARTICLE_SIZER: { index: 19, label: 'EMSO_PARTICLE_SIZER' },
    PH_SENSOR: { index: 20, label: 'EMSO_PH_SENSOR' },
    PRESSURE_SENSOR: { index: 21, label: 'EMSO_PRESSURE_SENSOR' },
    REDOX: { index: 22, label: 'EMSO_REDOX' },
    SALINOMETER: { index: 23, label: 'EMSO_SALINOMETER' },
    SEDIMENT_TRAP: { index: 24, label: 'EMSO_SEDIMENT_TRAP' },
    TEMPERATURE: { index: 25, label: 'EMSO_TEMPERATURE' },
    TILTMETER: { index: 26, label: 'EMSO_TILTMETER' },
    TURBIDITY: { index: 27, label: 'EMSO_TURBIDITY' },
    WATER_SAMPLER: { index: 28, label: 'EMSO_WATER_SAMPLER' },
    ACOUSTIC_MODEM: { index: 29, label: 'EMSO_ACOUSTIC_MODEM' },
    ACOUSTIC_RELEASE: { index: 30, label: 'EMSO_ACOUSTIC_RELEASE' },
    CAMERA: { index: 31, label: 'EMSO_CAMERA' },
    CONNECTOR: { index: 32, label: 'EMSO_CONNECTOR' },
    LOGGER: { index: 33, label: 'EMSO_LOGGER' },
    FLOAT: { index: 34, label: 'EMSO_FLOAT' },
    HOUSING: { index: 35, label: 'EMSO_HOUSING' },
    LASER: { index: 36, label: 'EMSO_LASER' },
    LIGHT: { index: 37, label: 'EMSO_LIGHT' },
    MOORING_SYSTEM: { index: 38, label: 'EMSO_MOORING_SYSTEM' },
    POSITIONING_EQUIPMENT: { index: 39, label: 'EMSO_POSITIONING_EQUIPMENT' },
    UNDERWATER_BATTERY: { index: 40, label: 'EMSO_UNDERWATER_BATTERY' },
    UNDERWATER_CABLE: { index: 41, label: 'EMSO_UNDERWATER_CABLE' },
    UNDERWATER_SWITCH: { index: 42, label: 'EMSO_UNDERWATER_SWITCH' },
    IFREMER_RVESSEL: { index: 43, label: 'IFREMER_RV' },

   
};

var dir = "models";


Stencil.shapes = {

	
		basicSensors: [
		               
          
		           new joint.shapes.basic.Sensor(
		        		   
		        		   {
			        		 "documentation":{"link":imageHost+"/sensor.png","name":"sensor.png"},

		                   attrs: {
		                       image: { width: 50, height: 50, 'xlink:href': 'images/models/sensor.png' },
		                       text: { text: '', 'font-size': 9, display: '', stroke: '#000000', 'stroke-width': 0 }
		                   }
		               }),
           new joint.shapes.basic.Sensor({
    		   "documentation":{"link":imageHost+"/infrared_sensor.png","name":"infrared_sensor.png"},

            attrs: {
                image: { width: 50, height: 50, 'xlink:href': 'images/models/infrared_sensor.png' },
                text: { text: '', 'font-size': 9, display: '', stroke: '#000000', 'stroke-width': 0 }
            }
        }),
        new joint.shapes.basic.Sensor({
 		   "documentation":{"link":imageHost+"/gps.png","name":"gps.png"},

            attrs: {
                image: { width: 50, height: 50, 'xlink:href': 'images/models/gps.png' },
                text: { text: '', 'font-size': 9, display: '', stroke: '#000000', 'stroke-width': 0 }
            }
        }),
        new joint.shapes.basic.Sensor({
 		   "documentation":{"link":imageHost+"/sensor3.png","name":"sensor3.png"},

            attrs: {
                image: { width: 50, height: 50, 'xlink:href': 'images/models/sensor3.png' },
                text: { text: '', 'font-size': 9, display: '', stroke: '#000000', 'stroke-width': 0 }
            }
        }),
        new joint.shapes.basic.Sensor({
 		   "documentation":{"link":imageHost+"/pressure_sensor.png","name":"pressure_sensor.png"},

            attrs: {
                image: { width: 50, height: 50, 'xlink:href': 'images/models/pressure_sensor.png' },
                text: { text: '', 'font-size': 9, display: '', stroke: '#000000', 'stroke-width': 0 }
            }
        }),
        new joint.shapes.basic.Sensor({
 		   "documentation":{"link":imageHost+"/weather_station.png","name":"weather_station.png"},

            attrs: {
                image: { width: 50, height: 50, 'xlink:href': 'images/models/weather_station.png' },
                text: { text: '', 'font-size': 9, display: '', stroke: '#000000', 'stroke-width': 0 }
            }
        }),
        new joint.shapes.basic.Sensor({
 		   "documentation":{"link":imageHost+"/camera.png","name":"camera.png"},

            attrs: {
                image: { width: 50, height: 50, 'xlink:href': 'images/models/camera.png' },
                text: { text: '', 'font-size': 9, display: '', stroke: '#000000', 'stroke-width': 0 }
            }
        }),
        new joint.shapes.basic.Sensor({
 		   "documentation":{"link":imageHost+"/sensor_seamon_west.png","name":"sensor_seamon_west.png"},

            attrs: {
                image: { width: 50, height: 50, 'xlink:href': 'images/models/sensor_seamon_west.png' },
                text: { text: '', 'font-size': 9, display: '', stroke: '#000000', 'stroke-width': 0 }
            }
        }),
   	new joint.shapes.basic.Sensor(
                        {
	                   "documentation":{"link":imageHost+"/electronicBoard.png","name":"electronicBoard.png"},
                            attrs: {
                                image: { width: 50, height: 50, 'xlink:href': 'images/models/electronicBoard.png' },
                                text: {   text: '', 'font-size': 9, display: '', stroke: '#000000', 'stroke-width': 0 }
                                
                            }                   
                        }),

       
       
    ],
    
   basicPlatforms: [
        
       new joint.shapes.basic.Platform({
		   "documentation":{"link":imageHost+"/platform.png","name":"platform.png"},

           attrs: {
               image: { width: 50, height: 50, 'xlink:href': 'images/models/platform.png' },
               text: { text: '', 'font-size': 9, display: '', stroke: '#000000', 'stroke-width': 0 }
           }
       }),
       new joint.shapes.basic.Platform({
		   "documentation":{"link":imageHost+"/buoy.png","name":"buoy.png"},

           attrs: {
               image: { width: 50, height: 50, 'xlink:href': 'images/models/buoy.png' },
               text: { text: '', 'font-size': 9, display: '', stroke: '#000000', 'stroke-width': 0 }
           }
       }),
        
       new joint.shapes.basic.Platform({
		   "documentation":{"link":imageHost+"/platform_seamon.png","name":"platform_seamon.png"},

           attrs: {
               image: { width: 50, height: 50, 'xlink:href': 'images/models/platform_seamon.png' },
               text: { text: '', 'font-size': 9, display: '', stroke: '#000000', 'stroke-width': 0 }
           }
       }),
        
       new joint.shapes.basic.Platform({
		   "documentation":{"link":imageHost+"/deep_sea_platform.png","name":"deep_sea_platform.png"},

           attrs: {
               image: { width: 80, height: 80, 'xlink:href': 'images/models/deep_sea_platform.png' },
               text: { text: '', 'font-size': 9, display: '', stroke: '#000000', 'stroke-width': 0 }
           }
       }),
        
       new joint.shapes.basic.Platform({
		   "documentation":{"link":imageHost+"/ship.png","name":"ship.png"},

           attrs: {
               image: { width: 50, height: 50, 'xlink:href': 'images/models/ship.png' },
               text: { text: '', 'font-size': 9, display: '', stroke: '#000000', 'stroke-width': 0 }
           }
       }),
       new joint.shapes.basic.Platform({
		   "documentation":{"link":imageHost+"/submarine.png","name":"submarine.png"},

           attrs: {
               image: { width: 50, height: 30, 'xlink:href': 'images/models/submarine.png' },
               text: { text: '', 'font-size': 9, display: '', stroke: '#000000', 'stroke-width': 0 }
           }
       }),
        
      
    
    
        
        
    ],
    Imported: [],
    ADCP: [],
    CO2_ANALYSER: [],
    CONDUCTIVITY: [],
    CTD: [],
    CURRENT_METER: [],
    DEPTH: [],
    DO_SENSOR: [],
    FLOW_METER: [],
    FLUOROMETER: [],
    GEOPHONE: [],
    HYDROPHONE: [],
    MAGNETOMETER: [],
    MULTIPARAMETER: [],
    PAH: [],
    PAR_SENSOR: [],
    PARTICLE_SIZER: [],
    PH_SENSOR: [],
    PRESSURE_SENSOR: [],
    REDOX: [],
    SALINOMETER: [],
    SEDIMENT_TRAP: [],
    TEMPERATURE: [],
    TILTMETER: [],
    TURBIDITY: [],
    WATER_SAMPLER: [],
    ACOUSTIC_MODEM: [],
    ACOUSTIC_RELEASE: [],
    CAMERA: [],
    CONNECTOR: [],
    LOGGER: [],
    FLOAT: [],
    HOUSING: [],
    LASER: [],
    LIGHT: [],
    MOORING_SYSTEM: [],
    POSITIONING_EQUIPMENT: [],
    UNDERWATER_BATTERY: [],
    UNDERWATER_CABLE: [],
    UNDERWATER_SWITCH: [],
    IFREMER_RVESSEL: [
<<<<<<< HEAD
     /*   new joint.shapes.basic.IFREMER_RVESSEL(
=======
        new joint.shapes.basic.IFREMER_RVESSEL(
>>>>>>> origin/master
                        {
	                   "documentation":{"link":imageHost+"/ifremer_rv-thalassa.png","name":"ifremer_rv-thalassa.png"},
                            attrs: {
                                image: { width: 50, height: 50, 'xlink:href': 'images/models/ifremer_rv-thalassa.png' },
                                text: {   text: '', 'font-size': 9, display: '', stroke: '#000000', 'stroke-width': 0 }
                                
                            },
                           "custom":{  
                                "classifier":[  
                                         {  
                                    "name":"model",
                                    "URI":"Thalassa",
                                    "Ref":"modelData"
                                 },
                                {  
                                    "name":"manufacturer",
                                    "URI":"GENAVIR",
                                    "Ref":"modelData",
                                    "definition":"http://www.ifremer.fr/tematres/vocab/index.php?tema=52",
                                    "codespace":"http://www.ifremer.fr/tematres/vocab/xml.php?skosTema=40"
                                 }]}
<<<<<<< HEAD
                        }),*/
=======
                        }),
>>>>>>> origin/master
        ],

   
};

