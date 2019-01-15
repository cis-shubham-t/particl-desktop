import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Responses } from 'app/_test/core-test/market-test/proposal-test/mock-data/mock-market.responses';

/*
  This is a fake mock service used for the MarketService.
  so we have to override it in all tests that use the Services/ Components.
*/

@Injectable()
export class MockMarketService {

  call(method: string, params?: Array<any> | null): Observable<any> {
    let response = {}

    switch (method) {
      case 'proposal':

        response = Responses[method][params[0]] || Responses[method][404];
        break;

      case 'vote':

        response = Responses[method][params[0]];
        break;

      default:
        response = []
    }
    return Observable.of(response);
  }
};
