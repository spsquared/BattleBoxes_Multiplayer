# BattleBoxes_Multiplayer
BattleBoxes, but it's multiplayer! Large maps and free-for-all playing!

***

### Installation
I cannot distribute node.js as I do not own any rights to it, but visiting [their website](https://nodejs.org/) you can download the latest (not LTS) and install it, **checking the box "Automatically install necessary tools"**. Wait for the installation to finish, then [download the code](https://github.com/definitely-nobody-is-here/BattleBoxes_Multiplayer/archive/master.zip) and unzip it into any folder. Run Config.bat or Config.sh (depending on system).Then simply double-click on Start.bat or Start.sh and the server is running!
Or, you can run the .pkg file included. However, I have no idea how to use it so you'll have to figure it out for yourself.

To stop the server, type "stop" into the server console.

### Joining the Game
Once the server is started, you can find your computer's name (available in Windows>System>About as "Device name"), or simply search [what's my ip](http://google.com/search?q=whats+my+ip) or click the link. The server console will tell you what port to visit and you can type either the ip address or computer name on the client side **connected to the same network as the host** and then followed by a ":" and then the port number. Example: 111.22.33.444:2000 or hostcomputer:1100

***

## Changelog

| Version | Changes                      |
| ------- | ---------------------------- |
| 0.1.0   | <ul><li>Added menu with Start, Settings, Achievements, and Exit buttons</li><li>Added basic code for server to get the ID of a player</li><li>Implemented a login form, no accounts yet</li></ul> |
| 0.1.1   | <ul><li>Implemented a pixel font</li><li>Added exit button when entering Settings/Achievements menu</li><li>Moved menu script to menu.js</li><li>Moved styling to style.css</li></ul> |
| 0.2.0   | <ul><li>Added multiplayer aspect to game</li><li>Added player input and movement</li><li>Added multiplayer display functionality</li><li>Added entity.js for player functions</li></ul> |
| 0.2.1   | <ul><li>Added start files</li><li>Replaced the old port setting system with automatic port setting system</li><li>Updated SECURITY.md with the correct link</li></ul> |
| 0.3.0   | <ul><li>Added bullets</li><li>Merged server and client code</li><li>Added background music files</li><li>Added map and collision map files</li><li>Updated README.md</li><li>Fixed PORTS.txt</li><li>Other small tweaks</li></ul> |
| 0.3.1   | <ul><li>Fixed bug that prevented the server from sending information to clients</li><li>Fixed Favicon.ico</li><li>Added colors to Players and Bullets</li><li>Limited player count to 16</li></ul> |
| 0.3.2   | <ul><li>Fixed README.md and SECURITY.md</li><li>Fixed server version reporting</li><li>Fixed PORTS.txt</li></ul> |
| 0.4.0   | <ul><li>Added map collisions to player</li><li>Made camera scroll to keep player on screen</li><li>Added maps</li><li>Fixed a lot of version labels</li><li>Added Config.bat and Config.sh to help setup</li><li>Added debug screen</li><li>Added framework for ingame menu</li><li>Cleaned up code</li><li>Many other tiny tweaks</li></ul> |
| 0.4.1   | <ul><li>Fixed bullet collisions and added player damage</li><li>Fixed most player color dupes(leaving would cause new players to have duplicated colors)</li><li>Updated maps</li><li>Added community submission forms</li><li>Fixed README.md</li><li>Some changes to code formatting</li></ul> |
| 0.4.2   | <ul><li>Fixed player color dupe bug</li><li>Patched major security vulnerability that allowed clients to see all other client socket ids</li><li><a href="https://github.com/definitely-nobody-is-here/BattleBoxes_Multiplayer/issues/14" target="_blank">Partially fixed collision glitching</a></li><li>Added friction to walls</li><li>Added announcements</li><li>Increased bullet visibility</li><li>Updated maps again</li><li>Updated debug screen</li><li>Updated JavaScriptDisabled text</li><li>Optimized some code (collisions were left unoptimized)</li><li>Fixed some other bugs</li></ul> |
| 0.5.0   | <ul><li>Added a fade effect</li><li>Created a round system</li><li>Added a lobby</li><li>Updated maps (fixed SUBSCRIBE floating bug)</li><li>Added a lot of spawnpoints</li><li>Added ingame music</li><li><a href="https://github.com/definitely-nobody-is-here/BattleBoxes_Multiplayer/issues/21" target="_blank">Added arrowkey support (and fixed CAPSLOCK bug) (Issue #21)</a></li><li>Added volume sliders (kind of)</li><li>Created index.js for general functions/handlers</li><li>Added a LOT of semicolons</li></ul> |
| 0.5.1   | <ul><li>Added credits/license pages</li><li>Fixed header shifting on debug</li><li>Fixed map randomization</li><li>Added another map</li><li><a href="https://github.com/definitely-nobody-is-here/BattleBoxes_Multiplayer/issues/26" target="_blank">Partially fixed canvas blurring</a></li><li>Other small changes</li></ul> |
| 0.5.2   | <ul><li>Gave player ability to leave game</li><li>Sort of added game endings when a player reached 10 points</li><li>Clamped camera to edges of map</li><li>Formatted settings</li><li>Replaced the earpain start sound with a much less painful one</li><li><a href="https://github.com/definitely-nobody-is-here/BattleBoxes_Multiplayer/issues/20" target="_blank">Fixed announcements double-posting</a></li><li>Fixed spawnpoints</li><li>Removed a bunch of useless semicolons</li></ul> |
| 0.5.3   | <ul><li><a href="https://github.com/definitely-nobody-is-here/BattleBoxes_Multiplayer/security/dependabot/package-lock.json/xmlhttprequest-ssl/closed" target="_blank">Patched severe security vulnerability allowing code injection.</a></li><li><a href="https://github.com/definitely-nobody-is-here/BattleBoxes_Multiplayer/issues/28" target="_blank">Fixed infinite one-player round loop bug (Issue #28)</a></li><li><a href="https://github.com/definitely-nobody-is-here/BattleBoxes_Multiplayer/issues/25" target="_blank">Mostly fixed invisible map issues (Pages are only slow to load now) (Issue #25)</a></li><li>Fixed shooting during countdown</li><li>Fixed waiting for server message</li><li>Prevented whitespaces in names</li><li><a href="https://github.com/definitely-nobody-is-here/BattleBoxes_Multiplayer/issues/31" target="_blank">Fixed crashes from running out of spawnpoints by adding more spawnpoints (Issue #31)</a></li><li><a href="https://github.com/definitely-nobody-is-here/BattleBoxes_Multiplayer/issues/15" target="_blank">Improved corner collisions (Issue #15)</a></li><li>Fixed multiple other mini-issues</li></ul> |
| 0.5.4   | <ul><li><a href="https://github.com/definitely-nobody-is-here/BattleBoxes_Multiplayer/issues/15" target="_blank">Improved corner collisions again and reduced chances of glitching out of the lobby (Issue #15)</a></li><li>Improved wall jumping (you no longer wall jump by walking into walls)</li></ul>

***

## License

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a copy of the GNU General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.

Full license can be found in the LICENSE file.

***

## Credits

##### Contributors:
- [Radioactive64](https://github.com/definitely-nobody-is-here) (hey look me!)
- [The-God-Coder](https://github.com/The-God-coder)
- [Maitian-352](https://github.com/maitian352)

##### Resources:
- Various articles on the internet
- [ScriptersWar](https://www.youtube.com/channel/UC8Yp-YagXZ4C5vOduEhcjRw) [tutorial series](https://www.youtube.com/playlist?list=PLcIaPHraYF7k4FbeGIDY-1mZZdjTu9QyL)

***

## Want to Contribute?

If you would like to contribute to this game, visit the [Github](https://github.com/definitely-nobody-is-here/BattleBoxes_Multiplayer) where you can send a pull request with an application request stating your reason to create a pull request in the "comments" section along with it. If you would like to submit a suggestion then submit it via [this form](https://docs.google.com/forms/d/e/1FAIpQLSfrTWNBDoC5KjXk1TJwQa4oJEZdpiSp0fxqmbCReMZqhdLkqQ/viewform?usp=sf_link).