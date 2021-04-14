# BattleBoxes_Multiplayer
BattleBoxes, but it's multiplayer! Large maps and free-for-all playing!

***

### Installation
I cannot distribute node.js as I do not own any rights to it, but visiting [their website](https://nodejs.org/) you can download the latest (not LTS) and install it with the default settings. From there [download the code](https://github.com/definitely-nobody-is-here/BattleBoxes_Multiplayer/archive/master.zip) and unzip it into any folder. Then simply double-click on the Start file (Start.bat or Start.sh) and the server is running!
Or, you can run the .pkg file included. However, I have no idea how to use it so you'll have to figure it out for yourself.

To stop the server, type "stop" into the server console.

### Joining the Game
Once the server is started, you can find your computer's name (available in Windows>System>About as "Device name"), or simply search [what's my ip](http://google.com/search?q=whats+my+ip) or click the link. The server console will tell you what port to visit and you can type either the ip address or computer name on the client side **connected to the same network as the host** and then followed by a ":" and then the port number. Example: 111.22.33.444:2000 or hostcomputer:1100

----Changelog----
| Version | Changes                      |
| ------- | ---------------------------- |
| 0.1.0   | <ul><li>Added menu with Start, Settings, Achievements, and Exit buttons</li><li>Added basic code for server to get the ID of a player</li><li>Implemented a login form, no accounts yet</li></ul> |
| 0.1.1   | <ul><li>Implemented a pixel font</li><li>Added exit button when entering Settings/Achievements menu</li><li>Moved menu script to menu.js</li><li>Moved styling to style.css</li></ul> |
| 0.2.0   | <ul><li>Added multiplayer aspect to game</li><li>Added player input and movement</li><li>Added multiplayer display functionality</li><li>Added entity.js for player functions</li></ul> |
| 0.2.1   | <ul><li>Added start files</li><li>Replaced the old port setting system with automatic port setting system</li><li>Updated SECURITY.md with the correct link</li></ul> |
| 0.3.0   | <ul><li>Added bullets</li><li>Merged server and client code</li><li>Added background music files</li><li>Added map and collision map files</li><li>Updated README.md</li><li>Fixed PORTS.txt</li><li>Other small tweaks</li></ul> |