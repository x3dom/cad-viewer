Slim X3DOM CAD Viewer

![Teaser](/img/teaser.png)

Usage:

---- general ----
- in the header of 'main.js' in the section "global configuration".
  you will find the most  important configuration settings:

---- switch models ----
- the folder 'data' should contain a folder named as the model
- this folder needs to contain files 'model.x3d', 'metaData.txt' and 'annotation.txt'
  if the model.x3d references image or binary data it should be contained in the respective subfolders
- 'MYAPP.model' needs to be set to the folder name.

---- tree sorting ----
- if the tree should be sorted alphabetically, the flag 'MYAPP.sortTree' needs to be set to 'true'

---- enable/disable fly mode ----
- use 'MYAPP.isFlyToOnSelect' to set the default navigation mode

---- highlight color ----
- the color for highlighting object parts is set via 'MYAPP.x3dNodeHighlightColor'
