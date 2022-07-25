package com.dnastack.dlcon.exampleconnector.transformer;

import com.dnastack.dlcon.exampleconnector.model.DataSourceConfiguration;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.Map;

import static com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES;

@Service
public class ConfigurationTransformer {
    private static final TypeReference<Map<String, Object>> JSON_TYPE_REFERENCE = new TypeReference<>() {};
    private static final ObjectMapper MAPPER = new ObjectMapper()
        .configure(FAIL_ON_UNKNOWN_PROPERTIES, false);

    public DataSourceConfiguration toConfiguration(Map<String, Object> data) {
        return MAPPER.convertValue(data, DataSourceConfiguration.class);
    }

    public Map<String, Object> toMap(DataSourceConfiguration configuration) {
        return MAPPER.convertValue(configuration, JSON_TYPE_REFERENCE);
    }
}
