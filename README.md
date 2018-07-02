# ProjetFilRouge
Projet Fil Rouge pour le MS BGD Télécom ParisTech et Safran.

To launch the server go to the src directory and execute 
`python server.py path/to/your/data/directory/ path/to/log/file`

## Processing of the data by the server

Before starting, the server will read all the files in the folder allowing you to make selection on the data later on the web interface. This process can take some time (for information, reading a entire folder of 966.7 Mo and 2104 files took 25-30 s on a 5 years old laptop (>6 millions lines)).

It then create a dataFrame with all the data in the folder and an information object that it send to the interface to allow the user to make selection of files, sampling and selection of phases easily.

## Data selection from the interface

On the interface you can see on the left, all the files successfuly loaded by the server.
You can :
- click on one file to add it to group 1
- alt + click on one file to add it to group 2
- shift + click on one file to add it to both groups

Then you can see the list of files in both groups updated on the right. In these lists you can click on the files to remove it from the selection and to put them back on the left.

When files are selected you can see informations on the number of lines being updated in the format `numberOfLinesAfterSampling/numberOfLinesInSelectedPhases/totalNumberOfLines`. You can interact with the sliders and the selection of phase to update the number of lines. You can also directly enter a fixed number of lines in the input to update the sampling rate accordingly.

Then you can click on the last button to send this information to the server.

You can redo this step of selection at any stage, without needing to read the folder entirely again if you don't stop the server.

For example without changing anything, you can ask for a new sampling by simply clicking the button again.

## Actual data selection on the server

The server get the information on the selected files, the selected phases and the number of samples to draw and then execute a filtering on the data to create the dataFrames used for visualization. This doesn't take more than 1 second. 

Then you can navigate between the views. Be careful when requesting huge amount of data for visualization (for example by asking a parallel coordinates view without much sampling beforehand on a huge number of files) it can take some time because the (sampled) data which is on the server is passed to the interface and the interface needs to process this data to produce the visualization.

Authors: Xavier Charef, Rémi Sanchez, Thai-An Than Trong, Christophe Thibault