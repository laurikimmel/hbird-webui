hbird-webui
===========

Web UI for [Hummingbird] (http://www.hbird.de/).

## Web UI

Web based user interface written in Javascript. 

Based on [Dojo toolkit] (http://dojotoolkit.org/).

## Web server

[Apache Camel] (http://camel.apache.org) based web server for serving static content and delivering dynamic data.

## How to run

 1. Install [Maven] (http://maven.apache.org/).
 1. Install [ActiveMQ] (http://activemq.apache.org/).
 1. Check [Hummingbird] (http://www.hbird.de/) site how to setup other system components. 
 1. Checkout [hbird-webui project] (https://github.com/laurikimmel/hbird-webui) from github.
 1. Run command `mvn exec:java` in dir `hbird-webui/org.hbird.webserver.websocket`.
 1. Open page [http://localhost:9292](http://localhost:9292)
