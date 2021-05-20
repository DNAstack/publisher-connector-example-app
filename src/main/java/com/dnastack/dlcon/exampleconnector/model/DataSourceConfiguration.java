package com.dnastack.dlcon.exampleconnector.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder(toBuilder = true)
public class DataSourceConfiguration {
     @NotBlank(message = "Username is required.")
     private String username;

     @NotBlank(message = "Password is required.")
     private String password;
}
