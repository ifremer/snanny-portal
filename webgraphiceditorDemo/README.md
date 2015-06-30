Web graphic editor demo for marine observations based on JointJS and Rappid toolkit

#Documentation :
# How to Update SensorNannyDraw's Stencil:
## Update Stencil from a JSON:

- Edit /WebgraphiceditorDemo/javascript/stencil.js
- Add this code line in Stencil.shapes {}:

  - new joint.shapes.{type}(param);

  - {Type}: Valid Types are listed in JavaScript/types
    
  - param: Parametre need to be a valid JSON object for Rappid-JointJS.

## Update Stencil from EMSO Yellow Pages Database:
- Move Models.JSON generated with Snanny-Yellow-Pages/MysqlToJSON.Java in /WebgraphiceditorDemo/models

- Move Types.JS generated with Snanny-Yellow-Pages/JSTypeGeneration in /WebgraphiceditorDemo/Types

   - Copy the content of StencilGroups.txt which contains all emso yellow pages groups in
/webgraphiceditorDemo/javascript/stencil.js Stencil.groups = {}

   - Copy the content of StencilShapes.txt which contains array definition of all emso yellow pages types in /webgraphiceditorDemo/javascript/stencil.js Stencil.shapes={}



    
