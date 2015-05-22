######## how to use ########
---- allgemein ----
- in der datei main.js ist im Kopf bereich ein block "global configuration". 
  in desem werden die ganz groben konfig einstellungen gemacht. 
  folgende configurationen werden in diesem block gemacht. 

---- modelle austauschen ----
- einen ordner in data/ anlegen und ihn mit dem modellnamen benennen. 
- in dem ordner sollten die dateien model.x3d, metaData.txt und annotation.txt liegen. 
  wenn zum model.x3d ein ordner mit image oder binary daten gehört kommt dieser ordner ebenfalls in das neue verzeichnis.
  metaData.txt und annotation.txt kann fehlen, das führt jedoch zu einem haufen fehlern. 
  wenn die datei vorhanden ist muss auf jeden fall das Format richtig sein!
- in MYAPP.model den ordnernamen eintragen.  

---- baum sortieren ----
- wenn der baum alphabetisch sortiert sein soll dann muss das flag MYAPP.sortTree auf true gesetzt werden

---- fly to ein- / ausschalten ----
- der standardwert steht in MYAPP.isFlyToOnSelect

---- highlight farbe ----
- die farbe für highlighted objekt teile wird in MYAPP.x3dNodeHighlightColor gesetzt



######## TODO ##############

   

---- annotation meta ----
- wenn beide toggle slider (popup annotation und popup metadat) im menü auf on stehen 
  dann verschwinden die metadaten zu schnell wieder


---- usability ----
- wenn man auf einen aktuell gewählten knoten im accordeon tree clickt dann passiert nichts
	-> schöner wäre wenn sich dann die aktuelle kategorie wieder schließt
- wenn man die koordinaten pfeile dreht dreht sich nicht das object
- brotkrum navi verdeckt teilweise einträge, besser wäre sowas 
  -> http://www.comparenetworks.com/developers/jqueryplugins/jbreadcrumb.html

---- menu ----
- menu defaults festlegen -> wenn ein toggel schalter verwendet wird sollte dieser 
  automatisch seinen start wert an die entsprechende variable bei der initialisierung geben. 
