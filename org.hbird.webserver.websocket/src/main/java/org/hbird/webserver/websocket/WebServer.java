package org.hbird.webserver.websocket;


import org.apache.camel.Endpoint;
import org.apache.camel.builder.RouteBuilder;
import org.apache.camel.component.websocket.WebsocketComponent;
import org.apache.camel.component.websocket.WebsocketConstants;
import org.apache.camel.spring.Main;
import org.hbird.business.heartbeat.Heart;
import org.hbird.exchange.core.Named;
import org.hbird.webserver.websocket.processor.NamedCache;
import org.hbird.webserver.websocket.processor.Splitter;
import org.hbird.webserver.websocket.processor.ToJsonProcessor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;


public class WebServer extends RouteBuilder {

    private static final Logger LOG = LoggerFactory.getLogger(WebServer.class);

    private int heartBeatInterval = 3000;
    
    @Value("${component.name}")
    private String componentName; // WebServer
    
    @Value("${webSocket.port}")
    private int webSocketPort; // 9292;

    @Value("${staticResources}")
    private String staticResources; // ../org.hbird.webui/src/public

    private Heart heart;
    
    @Autowired
    private ToJsonProcessor toJson;
    
    // @Autowired - can't auto wire two different objects of same type =( 
    private NamedCache parameterCache = new NamedCache();
    
    // @Autowired - can't auto wire two different objects of same type =( 
    private NamedCache systemCache = new NamedCache();
    
    /** @{inheritDoc}. */
    @Override
    public void configure() throws Exception {
        
        WebsocketComponent websocketComponent = (WebsocketComponent) getContext().getComponent("websocket");

        websocketComponent.setPort(webSocketPort);
        websocketComponent.setStaticResources(staticResources);

        Endpoint webSocketForParameters = websocketComponent.createEndpoint("websocket://parameters");
        Endpoint webSocketForSystem  = websocketComponent.createEndpoint("websocket://system");
        Endpoint webSocketForLog = websocketComponent.createEndpoint("websocket://log");

        from("activemq:topic:parameters")
            .bean(parameterCache, "updateCache")
            .bean(toJson)
            .setHeader(WebsocketConstants.SEND_TO_ALL, constant(true))
            .to(webSocketForParameters);
        
        from("activemq:topic:system")
            .choice() // cache only Named objects
                .when(body().isInstanceOf(Named.class))
                    .bean(systemCache, "updateCache")
            .end()
            .bean(toJson)
            .setHeader(WebsocketConstants.SEND_TO_ALL, constant(true))
            .to(webSocketForSystem);
        
        from("activemq:topic:log")
            .bean(toJson)
            .setHeader(WebsocketConstants.SEND_TO_ALL, constant(true))
            .to(webSocketForLog);
        
        from(webSocketForParameters)
            .transform(body().append("")) // XXX in message body is null. Appending empty string will fix this for now
            .bean(parameterCache, "getCache")
            .split()
                .method(Splitter.class, "doSplit")
            .bean(toJson)
            .to(webSocketForParameters);
        
        from(webSocketForSystem)
            .transform(body().append("")) // XXX in message body is null. Appending empty string will fix this for now
            .bean(systemCache, "getCache")
            .split()
                .method(Splitter.class, "doSplit")
            .bean(toJson)
            .to(webSocketForSystem);
        
        heart = new Heart(componentName, heartBeatInterval);
        from("timer:heartbeat?fixedRate=true&period=" + heartBeatInterval)
            .bean(heart)
            .to("activemq:topic:system");
    }
    
    /**
     * @param args
     */
    public static void main(String[] args) {
        LOG.info("Starting {}", WebServer.class.getName());
        try {
            new Main().run(args);
        } catch (Exception e) {
            LOG.error("Failed to start " + WebServer.class.getName(), e);
        }
    }
}
