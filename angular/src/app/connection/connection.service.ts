import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})

export class ConnectionService {

  constructor(private httpClient: HttpClient) {
  }

  getConfig() {
    return this.httpClient.get(`config`)
  }
}
