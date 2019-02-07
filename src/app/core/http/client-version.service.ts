import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { Log } from 'ng2-logger';

import { ClientVersionRelease } from './client-version.model';
import { environment } from '../../../environments/environment.prod';

@Injectable()
export class ClientVersionService {

  private log: any = Log.create('ClientVersionService');

  public releasesUrl: string = environment.releasesUrl;

  constructor(private http: HttpClient) { }


  getCurrentVersion(): Observable<ClientVersionRelease> {
    return this.http.get(this.releasesUrl).pipe(
      map(response => response as ClientVersionRelease)
    );
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation: string = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      this.log.er(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
