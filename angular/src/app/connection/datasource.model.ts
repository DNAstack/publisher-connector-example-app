export interface DataSource {
  id: string;
  name: string;
  configuration: DataSourceConfigData
  type: string;
  eTag?: string;
}

export interface DataSourceConfigData {
  // Add form fields for configuration
  // The fields should match those declared in DataSourceConfiguration.java
  username: string;
  password: string;
}

export interface PatchObject {
  path: string,
  op: string,
  value: string
}
