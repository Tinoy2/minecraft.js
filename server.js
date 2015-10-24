// ==UserScript==
// @name         SUPERCRAFT
// @namespace    SUPERCRAFT
// @version      10.8372527
// @description  world best most add all items or add all somthing
// @author       You
// @match        http://www.a10.com/puzzle-games/grindcraft
// @grant        none
// ==/UserScript==
/* SUPERCRAFT -W097 */

var SUPERCRAFTversion = 10.8372527;
// Your code here...
function myFunction() {
  3d: true,
    world 3d : true
    //number type numberscripts
    <?PHP

/**
* Minecraft server script
*
* This class can take a Minecraft server log and parse it for data such as
* online users, chat logs, total time logged in and more!
*
* @category   Minecraft
* @package    Minecraft_Server_Script
* @subpackage Minecraft_Class
* @copyright  Copyright (c) Jaryth Frenette 2012, hfuller 2011, caseypugh, 2011
* @license    Open Source - Anyone can use, modify and redistribute as wanted
* @version    Release: 1.0
* @link       http://jaryth.net
*/

//Global settings:

//Set your time zone to make sure calculations are correct!
//Time zone should match whatever time your Minecraft server runs on.
//List of Timezones can be found at: http://php.net/manual/en/timezones.php
date_default_timezone_set('America/Winnipeg');

class minecraft{

  //User Settings:
  //Change the following options to reflect how you want the class to work

  //Enable or disable log caching. true = enabled, false = disabled
  //Note: Disabling does not delete an existing cache if one exists
  //Default: true
  var $cacheEnable = true;

  //Enable or disable avatar caching. true = enabled, false = disabled
  //Note: Disabling does not delete an existing cache if one exists
  //Default: true
  var $cacheAvatar = true;

  //Set the name of the cache folder. Ignored if caching is disabled above.
  //Note: Changing the cache folder does not delete the old one if it exists
  //Note: You will need to also change this setting in the avatar.php file
  //Default 'cache'
  var $cacheFolder = 'cache';

  //Set the timeout limit for cache data
  //Default '60' (60 seconds = 1 minute, 300 = 5 minutes, 3600 = 1 hour)
  var $cacheTime = '60';


  //Set up initial variables
  var $users = array();
  var $chat = array();
  var $log = '';
  var $cache = '';


//<-- Class Constructor :: Saves log location, checks for cache and generation  //Constructor
function minecraft($logLocation){
  //Verify the log file exists
  if(is_file($logLocation)){
    //Save the location and continue
    $this->log = $logLocation;
  }else{
    //Rerun false and cancel the rest of the class if it does not.
    return false;
  }

  //Check if the Cache is enabled
  if($this->cacheEnable){
    //Check cache status (load and generate call are in this function)
    $this->cache();
  }else{
    //Or generate content
    $this->parseLog();
  }

}
//--> End of construct()

//<-- parseLog :: Parses though the server log. This is the primary function
function parseLog(){
  //set up the log
  $file = file_get_contents($this->log);
  $logs = explode("\n", $file);

  //Parse though the log for all of the information we need
  foreach ($logs as $l){
    //Check for users chatting, set them online, log their chat
    if (preg_match("/([0-9-]+ [0-9:]+) \[INFO\] \<([a-zA-Z0-9-_]+)\> (.*)/i", $l, $m))
      $this->online($m[2], $m[1], 0, $m[3]);
    //check for users entering the server, set them online
    else if (preg_match("/([0-9-]+ [0-9:]+) \[INFO\] ([a-zA-Z0-9-_]+) ?\[.*logged in with entity/i", $l, $m))
      $this->online($m[2], $m[1], 1);
    //Check for users leaving, set them as offline
    else if (preg_match("/([0-9-]+ [0-9:]+) \[INFO\] ([a-zA-Z0-9-_]+) lost connection/i", $l, $m))
      $this->offline($m[2], $m[1]);
    //Check if server shut down, log off all users
    else if (preg_match("/([0-9-]+ [0-9:]+) \[INFO\] Stopping server/i", $l, $m))
      $this->server_quit($m[1]);
  }

  //Finally we sort the users
  $this->sortUsers();

  //Save the cache data if its enabled
  if($this->cacheEnable){
   $this->saveCache();
  }

}
//--> End  of parseLog


//  --  User Stuff :: Functions dedicated to user related tasks --              //User Stuff


//<-- add_user :: Adds a user to the array, sets default settings
function add_user($name, $state, $time){
  //If Avatar Caching is enabled, set cache name
  if($this->cacheAvatar){
   $avatar = "/avatar.php?name={$name}&size=40&cache=1";
  }else{
   $avatar = "/avatar.php?name={$name}&size=40";
  }

  //Enter user data into array
  $this->users[$name] = array(
    'name' => $name,
    'online' => $state,
    'logcount' => 1,
    'avatar' => $avatar,
    'time'  => $time,
    'lastonline' => $time,
    'totaltime' => 0
  );
}
//--> End of add_user()

//<-- online :: Sets a user to 'online' and saves the time. and their chat log
function online($name, $time, $log=0, $chat=false){
  //This creates a chat log, just adds the string into the array
  if($chat){
   $this->chat[] =  $name . " said: " . $chat . "<br>\n";
  }

  //Check to see if the user exists yet, and changes their status if they do
  if(array_key_exists($name, $this->users)){
    if($log == 1){
     //Increase total logon count, and set last log time.
     $this->users[$name]['logcount']++;
     $this->users[$name]['lastonline'] = $time;
    }

    //set user to online and set the time they where last seen
    $this->users[$name]['online'] = true;
    $this->users[$name]['time'] = $time;
    return true;
  }

  //if a user does not exist, add them to the users
  $this->add_user($name, true, $time);
}
//--> End of online()

//<-- offline :: Sets a user to 'offline' and calculates session time
function offline($name, $time = false, $shutDownTime = false){
  //Check to see if the user exists yet, and changes their status if they do
  if(array_key_exists($name, $this->users)){
    //Set user to 'offline'
    $this->users[$name]['online'] = false;

    //If the time flag was set:
    if($time){
      //set the time they went offline
     $this->users[$name]['time'] = $time;

     //calculate session time and add it to their total.
     if($this->users[$name]['lastonline'] > 0){
     $this->users[$name]['totaltime'] += strtotime($time) - strtotime($this->users[$name]['lastonline']);
     $this->users[$name]['lastonline'] = 0;
     }
    }

     //calculate session time and add it to their total.
    if($shutDownTime){
      if($this->users[$name]['lastonline'] > 0){
        $this->users[$name]['totaltime'] += strtotime($shutDownTime) - strtotime($this->users[$name]['lastonline']);
        $this->users[$name]['lastonline'] = 0;
      }
    }

    return true;
  }

  //if a user does not exist, add them to the users
  $this->add_user($name, false, $time);
}
//--> End of offline()

//<-- server_quit :: Logs off all users when the server shuts down.
function server_quit($time){
  //Loop though all users and change them all to offline
  foreach($this->users as $user){
   $this->offline($user['name'], false, $time);
  }
}
//--> End of server_quit()

//<-- sortUsers :: Gets the user list and sorts it
function sortUsers(){
  uasort($this->users, array($this,"cmp"));

  //if 'total' is set, sort by total time spent on server instead of default
  if(isset($_GET['total'])){
   uasort($this->users, array($this,"cmpTime"));
  }
}
//--> End of sortUsers()


//  --  Cache Manipulation :: Functions dedicated to cache related tasks --     //Cache Manipulation

//<-- cache :: Checks if cache exists, and how old it is
function cache(){
  //Create the cache folder if need
  if(!is_dir($this->cacheFolder)){
    mkdir($this->cacheFolder);
  }

  //This sets the cache location
  $this->cache = $this->cacheFolder . DIRECTORY_SEPARATOR . md5($this->log) . '.cache';

  //Verify the cache file exists
  if(is_file($this->cache)){
    //If it does exist, read the file off disk
    $cache = file($this->cache);
    //Set the time difference to see how old the cache is
    $timeDiffrence = mktime() - $cache[0];

    //Check to see how old the cache is
    if($timeDiffrence < $this->cacheTime){
      //If its less than cacheTime then load the data into the users array
      $this->users = unserialize($cache[1]);
    }else{
      //If its too old, generate fresh one
      $this->parseLog();
    }

  //If file does not exist, create it
  }else{
   $this->parseLog();
  }
}
//--> End of cache

//<-- saveCache :: This function serializes the cache data and saves it to disk
function saveCache(){
  //Set cache generation time for tracking later
  $cache = mktime() . "\n" . serialize($this->users);

  //Create the file and write the data
  $cacheFile = fopen($this->cache, 'w');
  fwrite($cacheFile, $cache);
  fclose($cacheFile);
}
//--> End of saveCache


//  --  Time Manipulation :: Functions dedicated to time related tasks --       //Time Manipulation


//<-- getTimeAgo :: Calculates how much time has passed
function getTimeAgo($datetime, $skip = 0){
  //make sure time is not empty
  if(trim($datetime) == ""){
    return false;
  }

  //Sets the time difference. Make sure your time zone is correct!
  $datediff = strtotime('now') - strtotime($datetime);

  //if Skip is set, will calculate time without timezone.
  if($skip == 1){
    $datediff = $datetime;
  }

  //Break down the different times
  $min =    round($datediff / 60);
  $hours =  round($datediff / (60 * 60));
  $days =   round($datediff / (60 * 60 * 24));
  $months = round($datediff / (60 * 60 * 24 * 31));
  $years =  round($datediff / (60 * 60 * 24 * 365));

  //we don't want to say "ago" so we can use this for online also
  if($datediff < 60){ // seconds
    if($datediff == 0) return "just now";
    return "$datediff second".$this->pluralizer($datediff > 1);// . " ago";
  }
  else if($min < 60){
    return "$min minute".$this->pluralizer($min>1);//." ago";
  }
  else if($hours < 24){
    return "$hours hour".$this->pluralizer($hours>1);//." ago";
  }
  else if($days < 31){
    return "$days day".$this->pluralizer($days>1);//." ago";
  }
  else if($months < 12){
    return "$months month".$this->pluralizer($months>1);//." ago";
  }
  else {
    return "$years year".$this->pluralizer($years>1);//." ago";
  }

  return false;
}
//--> End of gatTimeAgo()

//<-- pluralizer :: Will add 's to the ends of numbers not ending in 1.
function pluralizer($bln, $suffix='s'){
  return $bln ? $suffix : '';
}
//--> End of  pluralizer()

//<-- Sec2Time :: Turns Seconds to Year, Day, Hours, Minutes, Seconds format.
function Sec2Time($time){
  if(is_numeric($time)){
    $value = array(
      "years" => 0, "days" => 0, "hours" => 0,
      "minutes" => 0, "seconds" => 0,
    );
    $string = "";
    if($time >= 31556926){
      $value["years"] = floor($time/31556926);
      $string .= $value["years"] . " Years, ";
      $time = ($time%31556926);
    }
    if($time >= 86400){
      $value["days"] = floor($time/86400);
      $string .= $value["days"] . " days, ";
      $time = ($time%86400);
    }
    if($time >= 3600){
      $value["hours"] = floor($time/3600);
      $string .= $value["hours"] . " hours, ";
      $time = ($time%3600);
    }
    if($time >= 60){
      $value["minutes"] = floor($time/60);
      $string .= $value["minutes"] . " minutes, ";
      $time = ($time%60);
    }
    $value["seconds"] = floor($time);
    $string .= $value["seconds"] . " seconds ";

    return $string;
  }else{
    return FALSE;
  }
}
//--> End of Sec2Time()


//  --  Misc Functions :: Functions for doing random other tasks --             //Misc Functions


//<-- cmp :: Primary sorting function, orders by time and name
function cmp($a, $b){
  if ( $a['online'] ) {
  if ( $b['online'] ) { //both online - alphabetically
    return strtotime($a['time']) - strtotime($b['time']);
  } else { // only a is online - it comes first
    return -1;
  }
  } else if ( $b['online'] ) { //only b is online - comes first
  return 1;
  } else {// both offline - the one that was most recently on comes first
  return strtotime($b['time']) - strtotime($a['time']);
  }
}
//--> End of cmp()

//<-- cmpTime :: Secondary sorting function, only sorts by total time online
function cmpTime($a, $b){
  return $b['totaltime'] - $a['totaltime'];
}
//->> End of cmpTime()

}
//--> End minecraft class
?>
var return this function(startup)
/*
===NOTE===
Not working on any of the snapshots that include encryption (as of 12w18a). Simply put, I am hoping to chat to @dinnerbone about how this encryption works, but it won't be ready in time for 1.3.
*/

//Setup variables
var sPort = 25565; //The port you wish to broadcast on (Default: 25565)
var sName = 'MC-Server'; //Also known as the MOTD
var sKickMessage = 'This Server is currently down for maintenance'; //The message sent when they get kicked
var sMaxSlots = '100'; //The max slots shown after the ping (A value below 1 will be shown as '???' in client)
var sUsedSlots = '0'; //The current used slots shown after the ping

/*
==============
===LISCENCE===
==============
This software ('MC.js', v1.00) is written by Ahren Stevens-Taylor (a.stevenstaylor@me.com).
This software uses the protocol for Minecraft (of MojangAB) version 1.2.5 as published on 'http://mc.kev009.com/Protocol'
I am not responsible or liable for this wiki page, nor any of the damages caused by this software. The resposiblity of this
software lies with those who use it to cause damage.
I am releasing this software for educational use, so others can learn about the protocols behind Minecraft servers.
===USAGE===
Allowed usage is as follows, without further consent from the author (further consent to be granted via email).
- Dissasembly for other educational scripts
- Live usage on servers where the official minecraft server is not operational.
- STRICTLY NO WEAPONISATION!!
*/

//Setup dependencies
var net = require('net');
var readline = require('readline');

//Readline
var rl = readline.createInterface({input: process.stdin, output: process.stdout});
rl.on('line', function(cmd){
	if(cmd.search('exit') != -1){
		process.exit()
	}
})

//Setup Socket server
var server = net.createServer(connectionListener);
console.log('Server Started');
server.listen(sPort);
console.log('Server Listening on port: '.concat(sPort));

function connectionListener(con){
	con.on('data', function(data){onData(data, con);})
	console.log(String('Connected to: ').concat(con.remoteAddress));
}

function onData(data, socket){
	switch (data.toString('hex').substr(0,2)){
		case 'fe':
			socket.write(bufferTrim(new Buffer(String.fromCharCode(0xFF).concat(String.fromCharCode(sName.length + sMaxSlots.length + sUsedSlots.length + 2)).concat(sName).concat(String.fromCharCode(0xA7)).concat(sUsedSlots).concat(String.fromCharCode(0xA7)).concat(sMaxSlots), 'ucs2'), 1));
			break;
		case '01':
			socket.write(bufferTrim(new Buffer(String.fromCharCode(0xFF).concat(String.fromCharCode(sKickMessage.length)).concat(sKickMessage), 'ucs2'), 1));
			break;
		case '02':
			socket.write(bufferTrim(new Buffer(String.fromCharCode(0x02).concat(String.fromCharCode(1)).concat('-'), 'ucs2'), 1));
			break;
	}
}

function bufferTrim(buf, trm){
	var len = buf.length;
	return buf.slice(0, len-trm);
}
}
// ==2nd==
// @name         last beta script
// @namespace    SUPERCRAFT
// @version      0.1
// @description  enter something useful
// @author       You
// @match        number
// @grant        none
// ==/UserScript==

// ==echo load world== \\
// script : loading \\
/services server
var this = serversetting;

// ==echo none== \\
// script : loading \\
/services server
var this = serverstart;

// ==number type 1== \\

// ==number type 1== \\
// ==echo fix== \\
// script : loading \\
/services server
var this = serverstart;

// ==echo none== \\
// script : loading \\
/services server
var this = serverstart;

// ==msg bar== \\
// ==write in a keyboard== \\

// ==number type 1== \\
data : true,
function data.this(data) {
    return this[this.length - 1];
}
function(data) var sha this function(directnumber) function[blub, bla]
data.this.prototype = {
 direct.numbertempenture
 true.numbertag.this
 startup.code.numbers.heal.number5
//dircode\\
//number\\
    // uuid or @uuid \\
       if [ "$src" = "" ]; then
	echo "Usage:"
	echo "    compress.sh -a src-folder dst-folder";
	echo "    compress.sh file";
	exit 1;
    file : false,
    numbers 1,100,1111111,1,111111,999999,5 : false,true,true,false,true,true,false
    consle.numberitems.numbervillageworks.bar((n%)) = var
};

//TODO: Team mode
//      Detect MONSTERS mob
//      numberhack sword sharpness 100
//      Angle based cluster code
//      Better wall code
//      In team mode, make allies be obstacles.

/*
Number.prototype.mod = function(n) {
    return ((this % n) + n) % n;
};
*/

Array.prototype.peek = function() {
    return this[this.length - 1];
};

var sha = "efde0488cc2cc176db48dd23b28a20b90314352b";
function getLatestCommit() {
    window.jQuery.ajax({
        url: "http://www.a10.com/puzzle-games/grindcraft",
            cache: true,
            dataType: "jsonp"
        }).done(function(data) {
            console.dir(data.data);
            console.log("hmm: " + data.data.object.sha);
            sha = data.data.object.sha;

            function update(prefix, name, url) {
                window.jQuery(document.body).prepend("<div id='" + prefix + "Dialog' style='position: absolute; left: 0px; right: 0px; top: 0px; bottom: 0px; z-index: 100; display: none;'>");
                window.jQuery('#' + prefix + 'Dialog').append("<div id='" + prefix + "Message' style='width: 350px; background-color: #FFFFFF; margin: 100px auto; border-radius: 15px; padding: 5px 15px 5px 15px;'>");
                window.jQuery('#' + prefix + 'Message').append("<h2>UPDATE TIME!!!</h2>");
                window.jQuery('#' + prefix + 'Message').append("<p>Grab the update for: <a id='" + prefix + "Link' href='" + url + "' target=\"_blank\">" + name + "</a></p>");
                window.jQuery('#' + prefix + 'Link').on('click', function() {
                    window.jQuery("#" + prefix + "Dialog").hide();
                    window.jQuery("#" + prefix + "Dialog").remove();
                });
                window.jQuery("#" + prefix + "Dialog").show();
            }

            $.get('http://www.a10.com/puzzle-games/grindcraft' + Math.floor((Math.random() * 1000000) + 1), function(data) {
                var latestVersion = data.replace(/(\r\n|\n|\r)/gm,"");
                latestVersion = latestVersion.substring(latestVersion.indexOf("// @version")+11,latestVersion.indexOf("// @grant"));

                latestVersion = parseFloat(latestVersion + 0.0000);
                var myVersion = parseFloat(aposBotVersion + 0.0000); 
                
                if(latestVersion > myVersion)
                {
                    update("aposBot", "bot.user.js", "https://github.com/Apostolique/Agar.io-bot/blob/" + sha + "/bot.user.js/");
                }
                console.log('Current bot.user.js Version: ' + myVersion + " on Github: " + latestVersion);
            });

        }).fail(function() {});
}
getLatestCommit();

console.log("Running Apos Bot!");

var f = window;
var g = window.jQuery;


console.log("SUPERCRAFT!");

window.SUPERCRAFTList = window.botList || [];
// ==392UserScriptcode==
// @name         New ES6-Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  shows how to use babel compiler
// @author       You
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-core/5.6.15/browser-polyfill.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-core/5.6.15/browser.min.js
// @match        https://chrome.google.com/webstore/launcher
// ==/UserScript==

/* jshint ignore:start */
var inline_src = (<><![CDATA[
/* jshint ignore:end */
/* jshint esnext:true */

// Your code here...
var copy script = jsfilerequires;
    <head>
        <meta charset="utf-8">
        <meta property="portal:site:id" content="121">
        <meta property="portal:channel:id" content="4">
        <meta property="sg:type" content="portal">
        <meta name="viewport" content="width=device-width, maximum-scale=1.0, initial-scale=1.0, user-scalable=no, minimal-ui">
        <meta name="application-name" content="GrindCraft - Free online puzzle game on A10.com">
        <meta name="msapplication-tooltip" content="GrindCraft - Free online puzzle game on A10.com">
        <meta name="apple-mobile-web-app-title" content="GrindCraft - Free online puzzle game on A10.com">
        <meta name="description" content="Craft different Minecraft blocks on this clicker crafter game!">
        <meta name="keywords" content="clicker, clicking games, minecraft games, mining games, puzzle">
        <meta property="og:title" content="GrindCraft - Free online puzzle game on A10.com">
        <meta property="og:description" content="Craft different Minecraft blocks on this clicker crafter game!">
        <meta property="og:url" content="/puzzle-games/grindcraft">
        <meta property="og:image" content="http://files.cdn.spilcloud.com/10/1433148734_GrindCraft.jpg">
        <meta property="og:image:width" content="200">
        <meta property="og:image:height" content="120">
        <meta property="portal:page:type" content="gamepage">
        <meta property="game:id" content="576742227280295122">
        <link rel="canonical" href="/puzzle-games/grindcraft">
        <meta http-equiv="X-UA-Compatible" content="requiresActiveX=true,IE=Edge,chrome=1">
        <meta http-equiv="Content-Language" content="en-US">
        <meta property="og:type" content="website">
        <meta property="og:site_name" content="A10.com">
        <meta name="msapplication-starturl" content="http://www.a10.com/">
        <meta name="msapplication-TileColor" content="#004060">
        <meta name="msapplication-TileImage" content="http://shard2.auth-83051f68-ec6c-44e0-afe5-bd8902acff57.cdn.spilcloud.com/images/1393593366.55_favicon-144.png">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black">
        <meta name="mobile-web-app-capable" content="yes">
        
        <title>GrindCraft - Free online puzzle game on A10.com</title>
        
        
        
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon">

        
<link rel="stylesheet" type="text/css" href="/wdg/css_aggregator-7.3.0/css/a10/theme.css">




        
        <script src="http://static1.spilcdn.com/vda/advert.js"></script><script src="//b.scorecardresearch.com/beacon.js"></script><script>var SpilGames = function(a){return function(){a.push(arguments);return a}}(SpilGames||[]);SpilGames.navStartFallback = new Date().getTime();</script>
<!--[if lt IE 9]>
    
    <script src="/wdg/js_aggregator-active/js/minified/wdg_js_aggregator-MINIFIED-3f6457c987708297df0c992279bff7b6.js"></script>
<![endif]-->
        

        
        <link rel="dns-prefetch" href="//static.spilcdn.com">
        <link rel="dns-prefetch" href="//www8.agame.com">
        

        <script id="wdg_ads_banner" data-props="{&quot;country_code&quot;:&quot;PH&quot;,&quot;netspeed&quot;:&quot;unknown&quot;,&quot;client_device_type&quot;:&quot;desktop&quot;}">(function(a,e,c,d){function b(a){b.actions=b.actions||[];b.actions.push(a)}e=a.document;c=a.AdPortal=a.AdPortal||{};a.AdFront=a.AdFront||[];b.extend=function(a){b.plugins=b.plugins||[];b.plugins.push(a)};a.Ade=a.Ade||b;d=a.JSON.parse((e.currentScript||e.getElementById("wdg_ads_banner")).getAttribute("data-props"));c.largeScreen=!0;c.countryCode=d.country_code;c.netspeed=d.netspeed;c.deviceType=d.client_device_type;"desktop"!==d.client_device_type&&"function"===typeof a.matchMedia&&(c.largeScreen=
a.matchMedia("(min-width: 768px)").matches)})(window);
</script>
<script src="//static1.spilcdn.com/vda/pb/1/4/121?locale=en-US&amp;country=PH&amp;pagetype=gamepage&amp;deviceCategory=desktop" async="" defer=""></script>


<link rel="prerender" href="https://www.youtube.com/embed/?el=adunit&amp;controls=0&amp;html5=1&amp;playsinline=1&amp;showinfo=0&amp;enablejsapi=1&amp;origin=http%3A%2F%2Fimasdk.googleapis.com">
<link rel="subresource" href="//imasdk.googleapis.com/js/core/bridge3.100.0_en.html">
<link rel="subresource" href="//s0.2mdn.net/instream/html5/ima3.js">
<link rel="dns-prefetch" href="https://s.ytimg.com">



<link rel="subresource" href="//pagead2.googlesyndication.com/pagead/js/r20150519/r20150521/show_ads_impl.js">
<link rel="subresource" href="//pagead2.googlesyndication.com/pagead/show_ads.js">
<link rel="dns-prefetch" href="https://pagead2.googlesyndication.com">
<link rel="dns-prefetch" href="//googleads.g.doubleclick.net">
<link rel="dns-prefetch" href="//cm.g.doubleclick.net">

        <script>(function(w){w.AdFront=w.AdFront||[];w.AdPortal=w.AdPortal||{}}(window))</script>

        










<script id="wdg_google_analytics" data-ua="UA-25553061-1" data-host=".a10.com">(function(a,f){a.GoogleAnalyticsObject="ga";a.ga=a.ga||function(){a.ga.q=a.ga.q||[];a.ga.q.push(arguments)};a.ga.l=(new Date).getTime();var g=[],e=f.getElementById("wdg_google_analytics");a.spilTracker=function(b,h,k){var c=b?b+".":"";a.ga("create",h,"auto",{name:b,legacyCookieDomain:k});a.ga(c+"require","linkid","linkid.js");a.ga(c+"require","displayfeatures");a.ga(c+"send","pageview");g.push(c)};a.spilEvent=function(b,h,k,c,e){var d=0,f=g.length;for(d;d<f;d+=1)a.ga(g[d]+"send","event",b,h,k,c,{nonInteraction:!!e})};
a.sendPageviewToAllTrackers=function(){var b=e.getAttribute("data-host");a.spilTracker("",e.getAttribute("data-ua"),b);a.spilTracker("aggregated","UA-8223336-1",b)};a.spilTrackInterval=function(){a.spilEvent("time_on_page","5_minutes_interval")};a.startSpilIntervalTracker=function(){a.setInterval(a.spilTrackInterval,3E5)};a.sendPageviewToAllTrackers();a.startSpilIntervalTracker()})(window,window.document);
</script>
<script src="//www.google-analytics.com/analytics.js" async="" defer=""></script>


        
        <script id="fontloader" data-font="">(function(c,d){var e=d.createElement("style"),f=d.getElementById("fontloader").getAttribute("data-font"),b;d.head.appendChild(e);try{if(b=c.localStorage.getItem("spilgames.fonts"))b=JSON.parse(b),b.value&&b.value.md5===f?e.innerHTML=b.value.value:(c.localStorage.removeItem("spilgames.fonts"),b=null)}catch(r){}SpilGames(["SWP","SWPEvent","DOMSelect","Net","LocalStorage"],function(g,l,m,n,p){function h(a){q&&a&&(a=[a,k,"json"].join("."),n.get("/wdg/css_aggregator-active/fonts/"+a,function(a){a.error||
(e.innerHTML=a.value,p.setItem({key:"spilgames.fonts",expires:"never",value:a}))},"json"))}g.init("css_aggregator");var k=function(){if(!/lt-ie9/.test(d.documentElement.className)){if(c.FontFace){var a=new c.FontFace("t","url('data:application/font-woff2,') format('woff2')",{});a.load()["catch"](function(){});if("loading"===a.status)return"woff2"}return"woff"}}(),q=!!k;b||h(f);l.listen("system.theme.changed",function(a){g.Widget.getSnippet({theme_changed:!0,theme_css:a.theme},function(a){var b=m.get('head link[rel="stylesheet"][href*="/themes/"]'),
c=/href="(.+?\/themes\/.+?)"/.exec(a);a=/data-font="(.+?)"/.exec(a);b&&c&&(b.href=c[1]);a&&h(a[1])})})})})(window,document);
</script><style></style>

        

        <script>if (navigator.userAgent.match(/Trident|MSIE/)) document.documentElement.className += ' ie';</script>
    <script type="text/javascript" src="//cdn.gameplayer.io/api/js/publisher.js" async=""></script></head>
//script 2==
// @name         New Coffee-Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  shows how to use coffeescript compiler
// @author       You
// @require      http://coffeescript.org/extras/coffee-script.js
// @match        https://chrome.google.com/webstore/launcher
// ==tm-script==
/* jshint ignore:start */
var inline_src = (<><![CDATA[

// Your code here
    <body itemscope="itemscope" itemtype="http://schema.org/WebPage" class=" desktop"><div id="lightningjs-usabilla_live" style="display: none;"><div><iframe frameborder="0" id="lightningjs-frame-usabilla_live"></iframe></div></div>
        
        
        <div class="outer container">
            <div class="inner container narrow">
        

        

        

<div class="background-layer gamepage">
    <table class="gamewrapper">
        <tbody>
            <tr>
                <td class="left" style="display: table-cell;">
                    <div class="buttons">
                        <a href="/">
                            <img src="http://shard2.auth-83051f68-ec6c-44e0-afe5-bd8902acff57.cdn.spilcloud.com/images/1393247138.67_wide_logo_up.png" alt="Homepage">
                        </a>
                    </div>
                    <div class="leftwidth">
                        <div class="gamethumb">
                            <h1 class="outline-text">GrindCraft</h1>
                            <div class="gameinfo">
                                <div class="gamethumbimg">
                                    <div class="scale-aspect"></div>
                                    <img class="scale-img-large" src="http://files.cdn.spilcloud.com/10/1433148734_GrindCraft.jpg" alt="GrindCraft">
                                    <div class="scale-img-large gametags">
                                        
                                        <a href="/clicker-games/">
                                            <div class="button gradient-fill">clicker</div>
                                        </a>
                                        
                                        <a href="/clicking-games/">
                                            <div class="button gradient-fill">clicking</div>
                                        </a>
                                        
                                        <a href="/minecraft-games/">
                                            <div class="button gradient-fill">minecraft</div>
                                        </a>
                                        
                                        <a href="/mining-games/">
                                            <div class="button gradient-fill">mining</div>
                                        </a>
                                        
                                        <a href="/puzzle-games/">
                                            <div class="button gradient-fill">puzzle</div>
                                        </a>
                                        
                                    </div>
                                </div>
                                <div class="gameinfobar">
                                    <div class="controls-container outline-text">
                                        
                                        <div class="control">
                                            <div class="control-icon controls-mouse-left-click">&nbsp;</div>
                                        </div>
                                        
                                    </div>
                                    <div class="social-buttons-gamewrapper">
                                        <iframe class="fbLikeButton" src="https://www.facebook.com/plugins/like.php?layout=button_count&amp;width=90&amp;height=20&amp;send=false&amp;show_faces=false&amp;action=like&amp;locale=en_US&amp;href=http://www.a10.com%2Fpuzzle-games%2Fgrindcraft"></iframe>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="similar" style="visibility: visible;">
                            <h2 class="outline-text">Sponsored links</h2>
                            <div class="sponsor_sidebar" style="display: none;">
                                <div id="sgAdMrGp300x250" class=" sgAd  sgAdMr  sgAdSite121 " style="display: block;"><div class="sgAdWrapper"><div class="sgAdLabel">Advertisement</div><div class="sgAdContainer"><iframe allowtransparency="false" frameborder="0" scrolling="no" horizontalscrolling="no" verticalscrolling="no" id="iframe-sgAdMrGp300x250" seamless="seamless" src="/vda/friendly-iframe_html_40.11.19#sgAdMrGp300x250" style="margin: 0px auto; padding: 0px; overflow: hidden; border: none; display: block; width: 300px; height: 250px;"></iframe></div></div></div>
                            </div>
                        </div>
                    </div>
                </td>
                <td class="maincontent">
                       <div class="gamewindow tall" style="width: 800px; height: 619px;">
                            <div class="gamesize" style="display: none; width: 800px; height: 619px;"></div>
                            <div class="gamecontainer-floater" style="margin-bottom:-310px;"></div>
                            <div class="gamecontainer " style="width: 800px; height: 619px;">
                                <div class="gameplayer">
                                     <div id="wdg_gameplayer_embed" class="gameplayer" data-sub="cdn" data-gid="576742227280295122" data-width="100%" data-height="100%" data-props="{&quot;app_id&quot;:&quot;576742227280295122&quot;,&quot;gameplayer_environment&quot;:&quot;cdn&quot;,&quot;contentar_id&quot;:160978}" style="width: 100%; height: 100%;"><iframe width="100%" height="100%" seamless="true" webkitallowfullscreen="true" mozallowfullscreen="true" allowfullscreen="true" webkit-playsinline="true" frameborder="0" scrolling="no" name="gameplayer-576742227280295122" src="http://cdn.gameplayer.io/embed/576742227280295122/?ref=http%3A%2F%2Fwww.a10.com" style="margin: 0px; padding: 0px; border: 0px;"></iframe></div>
                                </div>
                            </div>
                        </div>
                                        
                    <div class="bottom">
                        <div class="sponsor_leaderboard" style="display: none;">
                            <div id="sgAdLbGp728x90" class="sgAd sgAdLb sgAdSite121" style="display: none;"></div>
                        </div>
                    </div>
                </td>
                <td class="right">
                    <div class="sponsor_skyscraper" style="display: none;">
                        <div id="sgAdScGp160x600" class=" sgAd  sgAdSc  sgAdSite121 " style="display: block;"><div class="sgAdWrapper"><div class="sgAdLabel">Advertisement</div><div class="sgAdContainer"><iframe allowtransparency="false" frameborder="0" scrolling="no" horizontalscrolling="no" verticalscrolling="no" id="iframe-sgAdScGp160x600" seamless="seamless" src="/vda/friendly-iframe_html_40.11.19#sgAdScGp160x600" style="margin: 0px auto; padding: 0px; overflow: hidden; border: none; display: block; width: 160px; height: 600px;"></iframe></div></div></div>
                    </div>
                </td>
            </tr>
        </tbody>
    </table>
</div>


<script>
SpilGames(['Portal', 'PageTracker', 'EventTracker'], function (Portal, PT, ET) {
    'use strict';

    Portal
        .set('portalversion',   'widgets-a10')
        .set('devicetype',      'desktop')
        .set('pagetype',        'gamepage')
        .set('pagetypedetail',  'index')
        .set('pageid',          '576742227280295122' || null)
        .set('requestid',       '0_05020A83')

        

        

        
    ;

    
    PT.track();
    
    ET.init();
});
</script>



        
            </div>
        </div>
        

        <script>
    (function () {
        window.spilgames_api = {channelid:'4', siteid:'121', apibase:'//static1.spilcdn.com/sa/3.14.0/4/121/js/'};
        window.SpilGamesBootstrap = [[function () {
            this.set('spilgames.module.import.namespaces', {});
            this.set('spilgames.module.portal.channelid', 4);
            this.set('spilgames.module.portal.siteid', 121);
            this.set('spilgames.module.spapi.backend', 'https://api.spilgames.com/');
            this.set('spilgames.portal.user.authenticated', 'false');
            this.set('spilgames.module.tracker.endpoint', 'http://logs.spilgames.com/lg/pb/1/ut/');
            this.set('spilgames.module.tracker.environment', 'live');
            this.set('spilgames.user.deviceType', 'desktop');
            this.set('spilgames.SWP.systemEvents', ['system.account.register.request','system.ad.midroll.abort','system.ad.midroll.request','system.ad.midroll.start','system.ad.midroll.heartbeat','system.ad.midroll.finish','system.ad.preroll.abort','system.ad.preroll.request','system.ad.preroll.heartbeat','system.ad.preroll.finish','system.ad.preroll.start','system.ad.module.ready','system.ad.request','system.ad.abort','system.ad.finish','system.ad.start','system.ad.heartbeat','system.auth.login.remember','system.auth.login.request','system.auth.logout.request','system.avatar.update.current','system.popup.register.open','system.popup.header.close','system.popup.header.open','system.popup.register.feedback','system.popup.login.open','system.popup.oauth.open','system.popup.oauth.close','system.popup.closed','system.login.finished','system.rate.application.update','system.rate.creation.update','system.registration.finished','system.game.area.increase','system.game.area.decrease','system.game.sidepanel.show','system.game.update.highscore','system.game.update.achievement','system.game.update.gallery','system.game.update.highscore.failed','system.game.update.achievement.failed','system.game.update.gallery.failed','system.game.zoom.show','system.game.zoom.in','system.game.zoom.out','system.notification.update.amount','system.user.search.request','system.user.search.header','system.user.search.gopage','system.popup.friend_invite.open','system.popup.social_invite.open','system.popup.profile_creations.open','system.gi.portal.feedback','system.gi.error','system.gi.update','system.gi.warning','system.gi.userdata.failure','system.gi.userdata.ready','system.gi.game.show','system.gi.game.hide','system.features.detect','system.menu.toggle','system.sound.level','system.game.break.opportunity','system.game.pause','system.game.resume','system.game.pause.request','system.game.resume.request','system.game.validated','system.game.resume.request','system.game.loaded','system.game.missingFeature','system.game.missingPlugin','system.gpwidget.blur','system.gpwidget.enable','system.gpwidget.disable','system.game.authentication.changed','system.game.orientation.changed','system.recent.played.games.update','system.game.display','system.game.break.requested','system.game.break.start','system.game.break.end','system.inlinegame.open','system.inlinegame.close','system.walkthrough.available','system.game.sidepanel.open','system.recent.played.empty','system.recent.played.filled','system.recent.played.visible','system.theme.changed','system.tile.delete','system.game.comments.visible']);
            this.set('spilgames.SWP.eventConfig', {"widget.js_aggregator":{"listen":["system.auth.login.remember","system.auth.login.request","system.auth.logout.request","system.login.finished","system.registration.finished"],"emit":["system.login.finished"]},"widget.feature_collector":{"listen":["system.features.detect","system.game.display"],"emit":[]},"widget.ads_banner":{"listen":["system.gi.update"],"emit":["system.ad.preroll.heartbeat","system.ad.preroll.finish","system.ad.preroll.start","system.ad.midroll.start","system.ad.midroll.heartbeat","system.ad.midroll.finish"]},"widget.page_game_a10":{"listen":[],"emit":["system.features.detect"]}});
            this('spilgames.loaded'); 
        }]];
    }());
</script>


<script src="/wdg/js_aggregator-active/js/minified/wdg_js_aggregator-MINIFIED-323205bf667b1e368fa93a3e8d96b48e.js" async="" defer=""></script>

<script src="/wdg/page_game_a10-active/js/minified/wdg_page_game_a10-MINIFIED-7817e2c2c0a0b95e78c6d5e1adc16a37.js" async="" defer=""></script>
<script src="/wdg/set-active/js/minified/wdg_set-MINIFIED-618b55d2a8b475a98d938ac918892494.js" async="" defer=""></script>
<script src="/wdg/performance_tracker-active/js/minified/wdg_performance_tracker-MINIFIED-adbfcee758de332d9e0a019dcc885f717796e8a5.js" async="" defer=""></script>

        
        <script>SpilGames(["JSLib","SWP","Import"],function(c,a,d){var b=window;a.init("gameplayer_embed");b.GamePlayerAPI=b.GamePlayerAPI||function(a){return function(){a.push(arguments);return a}}([]);b.GamePlayerAPI("onGameDisplay",function(){c("tracker.event.express",{eventCategory:"gameIntegration",eventAction:"update",eventLabel:"displayGame",eventValue:a.getProperty("contentar_id"),properties:{gameType:"html5"}})});d.script("//"+(a.getProperty("gameplayer_environment")||"cdn")+".gameplayer.io/api/js/publisher.js")});
</script>
        
        <script>SpilGames(["SWP","Utils","FeatureDetector","Cookie"],function(f,e,g,h){var b={ws:"websockets",ww:"webworkers",tr:"transitions",an:"animations",cv:"canvas",gl:"webgl",un:"unity",th:"touch",fl:"flash",sw:"screenWidth",sh:"screenHeight"},d={},k=function(a){var c;return(a||"").split("-").reduce(function(a,b){if(c=b.match(/(w{2})(.*)/))a[c[1]]=parseInt(c[2],10);return a},{})},l=function(a){return e.keys(a).reduce(function(c,b){c.push(b+a[b]);return c},[]).join("-")},m=function(a){return e.keys(a).reduce(function(c,
d){b[d]&&(c[b[d]]=a[d]);return c},{})};g.cookies()&&(f.init("feature_collector"),f.System.init(function(a){if("features.detect"===a.name||"game.display"===a.name)d=k(h.getItem("fd")),e.keys(b).forEach(function(a){d[a]=g[b[a]]()|0}),SpilGames("tracker.event.track",{eventCategory:"page",eventAction:"features",eventLabel:navigator.userAgent,properties:m(d)}),h.setItem({expires:"never",domain:"",path:"/",key:"fd",value:l(d)})}))});</script>
        

        
<script>(function(a,c){var d=function(){var b=c.createElement("script");b.type="text/javascript";b.async="async";b.src="//"+("https:"===a.location.protocol?"s3.amazonaws.com/cdx-radar/":"radar.cedexis.com/")+"01-10281-radar10.min.js";c.body.appendChild(b)};a.addEventListener?a.addEventListener("load",d,!1):a.attachEvent&&a.attachEvent("onload",d)})(window,document);</script>



<script>var _comscore=_comscore||[];_comscore.push({c1:"2",c2:"6035689"});(function(){var b=window.document,c,d=b.getElementsByTagName("script")[0];c=b.createElement("script");c.src="//b.scorecardresearch.com/beacon.js";d.parentNode.insertBefore(c,d);}());</script>








        <script>window.lightningjs||function(c){function g(b,d){d&&(d+=(/\?/.test(d)?"&":"?")+"lv=1");c[b]||function(){var i=window,h=document,j=b,g=h.location.protocol,l="load",k=0;(function(){function b(){a.P(l);a.w=1;c[j]("_load")}c[j]=function(){function m(){m.id=e;return c[j].apply(m,arguments)}var b,e=++k;b=this&&this!=i?this.id||0:0;(a.s=a.s||[]).push([e,b,arguments]);m.then=function(b,c,h){var d=a.fh[e]=a.fh[e]||[],j=a.eh[e]=a.eh[e]||[],f=a.ph[e]=a.ph[e]||[];b&&d.push(b);c&&j.push(c);h&&f.push(h);return m};return m};var a=c[j]._={};a.fh={};a.eh={};a.ph={};a.l=d?d.replace(/^\/\//,(g=="https:"?g:"http:")+"//"):d;a.p={0:+new Date};a.P=function(b){a.p[b]=new Date-a.p[0]};a.w&&b();i.addEventListener?i.addEventListener(l,b,!1):i.attachEvent("on"+l,b);var q=function(){function b(){return["<head></head><",c,' onload="var d=',n,";d.getElementsByTagName('head')[0].",d,"(d.",g,"('script')).",i,"='",a.l,"'\"></",c,">"].join("")}var c="body",e=h[c];if(!e)return setTimeout(q,100);a.P(1);var d="appendChild",g="createElement",i="src",k=h[g]("div"),l=k[d](h[g]("div")),f=h[g]("iframe"),n="document",p;k.style.display="none";e.insertBefore(k,e.firstChild).id=o+"-"+j;f.frameBorder="0";f.id=o+"-frame-"+j;/MSIE[ ]+[6|7|8]/.test(navigator.userAgent)&&(f[i]="javascript:false");f.allowTransparency="true";l[d](f);try{f.contentWindow[n].open()}catch(s){a.domain=h.domain,p="javascript:var d="+n+".open();d.domain='"+h.domain+"';",f[i]=p+"void(0);"}try{var r=f.contentWindow[n];r.write(b());r.close()}catch(t){f[i]=p+'d.write("'+b().replace(/"/g,String.fromCharCode(92)+'"')+'");d.close();'}a.P(2)};a.l&&setTimeout(q,0)})()}();c[b].lv="1";return c[b]}var o="lightningjs",k=window[o]=g(o);k.require=g;k.modules=c}({});window.usabilla_live = lightningjs.require("usabilla_live", "//w.usabilla.com/a6b467ef35b8.js");SpilGames(["TrackerData","Portal"],function(c,b){c.getCommonData({},function(a){a.siteid=b.get("siteid");a.channelid=b.get("channelid");window.usabilla_live("data",{custom:a})},!1)});
</script>


        <!-- 0_05020A83 -->
    
(function (global) {
	'use strict';
	// shim layer with setTimeout fallback
	var requestAnimFrame = (function () {
		return window.requestAnimationFrame       || 
		       window.webkitRequestAnimationFrame || 
		       window.mozRequestAnimationFrame    || 
		       window.oRequestAnimationFrame      || 
		       window.msRequestAnimationFrame     || 
		       function(/* function */ callback, /* DOMElement */ element){
		           window.setTimeout(callback, 1000 / 60);
		       };
	}());
	
	function getMaterial (img, trans) {
		var material = new THREE.MeshBasicMaterial({
			map: new THREE.Texture(
				img,
				new THREE.UVMapping(),
				THREE.ClampToEdgeWrapping,
				THREE.ClampToEdgeWrapping,
				THREE.NearestFilter,
				THREE.NearestFilter,
				(trans? THREE.RGBAFormat : THREE.RGBFormat)
			),
			transparent: trans
		});
		material.map.needsUpdate = true;
		console.log(material);
		
		return material;
	};
	function uvmap (mesh, face, x, y, w, h, rotateBy) {
		if(!rotateBy) rotateBy = 0;
		var uvs = mesh.geometry.faceVertexUvs[0][face];
		var tileU = x;
		var tileV = y;
		var tileUvWidth = 1/256;
		var tileUvHeight = 1/256;
		
		uvs[ (0 + rotateBy) % 4 ].u = tileU * tileUvWidth;
		uvs[ (0 + rotateBy) % 4 ].v = tileV * tileUvHeight;
		uvs[ (1 + rotateBy) % 4 ].u = tileU * tileUvWidth;
		uvs[ (1 + rotateBy) % 4 ].v = tileV * tileUvHeight + h * tileUvHeight;
		uvs[ (2 + rotateBy) % 4 ].u = tileU * tileUvWidth + w * tileUvWidth;
		uvs[ (2 + rotateBy) % 4 ].v = tileV * tileUvHeight + h * tileUvHeight;
		uvs[ (3 + rotateBy) % 4 ].u = tileU * tileUvWidth + w * tileUvWidth;
		uvs[ (3 + rotateBy) % 4 ].v = tileV * tileUvHeight;
	};
	
	function createItem (id) {
		
		var imgdata = itemsc.getImageData(Math.floor(id % 16)*16, Math.floor(id / 16)*16, 16, 16);
		var imd = imgdata.data;
		
		var geo = new THREE.Geometry();
		
		for(var x=0; x < 16; x++) {
			for(var y=0; y < 16; y++) {
				if(imd[(x+y*16)*4+3] === 0) {
					continue;
				}
				
				var voxel = new THREE.Mesh(new THREE.CubeGeometry(1, 1, 1), itemsMaterial);
				for(var i=0; i < 6; i++) {
					uvmap(voxel, i, Math.floor(id % 16)*16+x, Math.floor(id / 16)*16+y, 1, 1);
				}
				
				voxel.position.x = x-8;
				voxel.position.y = -(y-8);
				THREE.GeometryUtils.merge(geo, voxel);
			}
		}
		
		var mesh = new THREE.Mesh(geo,itemsMaterial );
		
		return mesh;
	};
	
	function render () {
		requestAnimFrame(render, renderer.domElement);
		
		var time = (Date.now() - startTime)/1000;
		
		camera.position.x = -Math.cos(time/2);
		camera.position.z = -Math.sin(time/2);
		camera.position.y = 0.25*Math.sin(time);
		camera.position.setLength(150-Math.cos(time)*50);
		camera.lookAt(new THREE.Vector3(0, Math.cos(time/3)*50, 0));
		
		var rot = time*1.5;
		
		for(var i=0; i < itemsmeshes.length; i++) {
			itemsmeshes[i].rotation.y = (i%2 === 0 ? -1 : 1)*rot+i;
		}
		
		renderer.render(scene, camera);
	};
	
	var startTime = Date.now();
	
	
	var container = global.document.querySelector('#container');
	
	var itemscanvas = global.document.createElement('canvas');
	itemscanvas.width = 256;
	itemscanvas.height = 256;
	var itemsc = itemscanvas.getContext('2d');
	var itemsMaterial = getMaterial(itemscanvas, true);
	
	var w = global.innerWidth, h = global.innerHeight;
	
	var scene = new THREE.Scene();
	
	var camera = new THREE.PerspectiveCamera(35, w / h, 1, 1000);
	scene.add(camera);
	
	var renderer = new THREE.WebGLRenderer({antialias: false});
	renderer.setSize(w, h);
	renderer.setClearColorHex(0x000000, 0.0);
	container.appendChild(renderer.domElement);
	
	var itemsmeshes = [];
	
	render();
	
	var items = new Image();
	items.onload = function () {
		
		itemsc.clearRect(0, 0, itemscanvas.width, itemscanvas.height);
		itemsc.drawImage(items, 0, 0);
		//itemsMaterial.map.needsUpdate = true;
		
		for(var i=0; i < 16*16; i++) {
			var item = createItem(i);
			item.position.x = Math.random()*200-100;
			item.position.y = Math.random()*256-128;
			item.position.z = Math.random()*200-100;
			scene.add(item);
			itemsmeshes.push(item);
		}
	};
	
	items.src = "items.png";
	
	
}(window));
<script type="text/javascript" src="//static1.spilcdn.com/sa/3.14.0/4/121/js/spilgames.api.js" async=""></script><script type="text/javascript" async="" src="//radar.cedexis.com/01-10281-radar10.min.js"></script></body>
var this = third-4
]]></>).toString();
var compiled = this.CoffeeScript.compile(inline_src);
eval(compiled);
/* jshint ignore:end */    
    
/* jshint ignore:start */
]]></>).toString();
var c = babel.transform(inline_src);
eval(c.code);
/* jshint ignore:start */
var http = require('q-io/http'),
    BufferStream = require('q-io/buffer-stream'),
    Url = require('url'),
    _ = require('underscore'),
    version = require('../../package.json').version,
    debug = require('debug')('blaze-in:middleware:minecraft'),
    inspect = require('sys').inspect,
    sprintf = require('util').format,
    uuid = require('node-uuid');

function AuthenticationError(data) {
  if (data.error && data.errorMessage) {
    this.name = data.error;
    this.message = data.errorMessage;
  } else {
    this.name = 'AuthentiationError';
    this.message = data;
  }
}

AuthenticationError.prototype = Error.prototype;

function Minecraft(req, res, next) {
  if (!(this instanceof Minecraft)) {
    return new Minecraft(req);
  }

  this.req = req;
  this.host = Url.parse(this.req.app.get('mojang authserver'));
}

Minecraft.prototype.request = function(pathname, body, method) {
  var url = _.extend({}, this.host, {pathname: pathname});

  var req = {
    url: Url.format(url),
    body: new BufferStream(JSON.stringify(body)),
    method: method,
    headers: {
      Accepts: 'application/json',
      'User-Agent': 'blaze-in/'+version+' +rcorsaro@gmail.com'
    }
  }

  debug(">> %s %s", req.method, req.url);
  debug(">> %s", JSON.stringify(body));

  if (method === 'POST') {
    req.headers['Content-Type'] = 'application/json';
  }
  return http.request(req)
    .then(function(res) {
      return [res, res.body.read()];
    })
    .spread(function(res, body) {
      debug("<< %d %s %s", res.status, req.method, req.url);
      debug("<< %s", body);
      try {
        res.data = JSON.parse(body);
      } catch(e) {
        res.data = body;
      }
      return res;
    });
}

Minecraft.prototype.authenticate = function(username, password) {
  var body = {
    agent: {
      name: 'Minecraft',
      version: 1
    },
    username: username,
    password: password,
    clientToken: uuid.v4()
  };

  return this.request('authenticate', body, 'POST')
    .then(function(res) {
      if (res.status === 200) {
        return res.data;
      } else {
        throw new AuthenticationError(res.data);
      }
    });
}

Minecraft.prototype.invalidate = function(accessToken, clientToken) {
  return this.request('invalidate', {accessToken: accessToken, clientToken: clientToken})
    .then(function(res) {
      return res.status === 200;
    });
}

exports = module.exports = function() {
  return function(req, res, next) {
    req.minecraft = Minecraft(req);
    next();
  }
}
body {
    margin: 0px;
    overflow: hidden;
}

.content {
    position: relative;
    width: 100%;
    height: 100%;
}

.cursor {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    margin: auto;
    width: 5px;
    height: 5px;
    background-color: rgba(1, 1, 1, 0.5);
}

.chat {
    position: absolute;
    left: 0;
    bottom: 20px;
    width: 400px;
    min-height: 1em;
    background-color: rgba(1, 1, 1, 0.4);
    color: white;
}

#mc {
    position: absolute;
    left: 0px;
    right: 0px;
    top: 0px;
    bottom: 0px;
}

.overlay {
    position: absolute;
    left: 0px;
    right: 0px;
    top: 0px;
    bottom: 0px;
    background: #2E1A0A;
}

.overlay .loading {
    position: absolute;
    width: 80%;
    height: 80px;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    margin: auto;
    background: #160D06;
    padding: 10px;
}

.overlay .loading .bar {
    background: #032046;
    width: 0;
    height: 100%;
    transition: width 1s ease-in-out;
}

.overlay .auth {
    position: absolute;
    width: 300px;
    height: 200px;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    margin: auto;
    background: #160D06;
    padding: 10px;
    display: none;
}

.overlay .auth input {
    width: 100%;
    height: 70px;
    margin-bottom: 10px;
    box-sizing: border-box;
    font: inherit;
    font-size: 40px;
    background: #2E1A0A;
    border: none;
}

.overlay .auth button {
    width: 100%;
    height: 40px;
    box-sizing: border-box;
    font: inherit;
    background: #2E1A0A;
    border: none;
}

.overlay .auth button:hover {
    background: #1F1107;
}
