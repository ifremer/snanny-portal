Web graphic editor demo for marine observations based on JointJS and Rappid toolkit

Documentation :

# Mettre à jour la palette de SensorNannyDraw
## Pour mettre à jour la palette depuis un JSON:

- Ouvrir /WebgraphiceditorDemo/javascript/stencil.js
- Ajouter cette ligne de code dans Stencil.shapes {}:

    - new joint.shapes.{type}(arg);

    - {Type}: tout les types des éléments de la palette sont listés dans JavaScript/types
    
    - arg: L'argument doit être un fichier JSON valide pour Rappid.

## Pour mettre à jour la palette depuis la base de donnée ESONET Yellow Pages:
- EmsoToSensorNannyDraw a besoin de JAVA 8 pour fonctionner .
- Lancer l'application JAVA /EmsoToSensorNannyDraw/MysqlToJSON.java pour générer les
fichiers JSON

    - DB_URL: l'URL pour accéder à la base de donnée esonet
        
    - USER: le nom d'utilisateur pour s'authentifier au serveur Mysql
        
    - PASS: Le mot de passe
        
    - Path: Le chemin du dossier de destination des fichiers JSON

- Lancer l'application /EmsoToSensorNannyDraw/JSTypeGeneration.JAVA pour générer les
Types en .js

    - Génère les Types .js et les placent dans un dossier spécifié dans la variable path
(webgraphiceditorDemo/javascript/types)

    - Génère StencilGroups.txt contient tout les groupes emso yellow pages à placer dans
/webgraphiceditorDemo/javascript/stencil.js dans la variable Stencil.groups = {}

    - Génère StencilShapes.txt contient les tableaux de tout les types d'emso yellow pages à
placer dans /webgraphiceditorDemo/javascript/stencil.js dans la variable
Stencil.shapes={}

- Lancer l'application /EmsoToSensorNannyDraw/JSONToSensorML.JAVA pour générer les
fichiers SensorML des types.

    - PathModels: chemin source des modèles ( .json )

    - PathSensorML: chemin destination des types SensorML (.xml)
