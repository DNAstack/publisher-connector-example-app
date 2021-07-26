import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import { DataSource, PatchObject } from './datasource.model';

@Injectable({
  providedIn: 'root'
})

export class ConnectionService {

  constructor(private httpClient: HttpClient) {
  }

  getConfig() {
    return this.httpClient.get(`config`)
  }

  getConnection(connectionId: string) {
    return this.httpClient.get<DataSource>(`connections/${connectionId}?include=configuration`,
        {observe: 'response'});
  }

  createConnection(dataSourceConfig: DataSource) {
    return this.httpClient.post<DataSource>(`connections`, dataSourceConfig);
  }

  updateConnection(connectionId: string, dataSourceConfig: PatchObject[], eTag: string) {
    return this.httpClient.patch<DataSource>(`connections/${connectionId}`,
        dataSourceConfig,
        {
          headers: {
            'If-Match': eTag,
            'Content-Type': 'application/json-patch+json'
          }
        });
  }
}
