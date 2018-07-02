# ProjetFilRouge
Projet Fil Rouge pour le MS BGD Télécom ParisTech et Safran.

To launch the server go to the src directory and execute 
`python server.py path/to/your/data/directory/`

Before starting the server will read all the files in the folder allowing you to make selection on the data later on the web interface. This process can take some time (for information, reading a entire folder of 966.7 Mo and 2104 files took 25-30 s on a 5 years old laptop (>6 millions lines)).

It then create a dataFrame with all the data in the folder and an information object that it send to the interface to allow the user to make selection of files, sampling and selection of phases easily.

The information is then sent back to the server which create a temporal dataFrame for this navigation session. This means that if the server is not stopped you can come back to the web page and create a new selection of files, phases and sapmling rates without reading all the data again.

Then for the session, the webpage request data on the newly created dataFrame to get what it needs to create its visualizations.