import { proposalList, proposalResult } from 'app/_test/core-test/market-test/proposal-test/mock-data/proposal';
import { voteGet } from 'app/_test/core-test/market-test/proposal-test/mock-data/vote';
import { postReport } from 'app/_test/core-test/market-test/report-test/mock-data';
import { listingSearch, listingGet } from 'app/_test/core-test/market-test/listing-test/mock-data';

const Responses = {
  proposal: {
    list: proposalList,
    result: proposalResult
  },
  vote: {
    get: voteGet
  },
  item: {
    flag: postReport,
    get: listingGet,
    search: listingSearch
  }
}
export {
  Responses
}
