package org.hbird.webserver.websocket.processor;


import org.apache.camel.Body;
import org.springframework.stereotype.Component;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

@Component
public class ToJsonProcessor {

    private final GsonBuilder builder = new GsonBuilder();
    
    public ToJsonProcessor() {
//        builder.registerTypeAdapter(Date.class, new JsonDateSerializer());
        builder.serializeSpecialFloatingPointValues();
    }
    
    /** @{inheritDoc}. */
    public String process(@Body Object body) throws Exception {
        Gson gson = builder.create();
        String json = gson.toJson(body);
        return json;
    }
}
