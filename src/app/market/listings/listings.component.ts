import { Component, OnInit, OnDestroy } from '@angular/core';
import { Log } from 'ng2-logger';

import { Category } from 'app/core/market/api/category/category.model';
import { Listing } from '../../core/market/api/listing/listing.model';

import { CategoryService } from 'app/core/market/api/category/category.service';
import { ListingService } from 'app/core/market/api/listing/listing.service';
import { CountryListService } from 'app/core/market/api/countrylist/countrylist.service';
import { FavoritesService } from '../../core/market/api/favorites/favorites.service';
import { Country } from 'app/core/market/api/countrylist/country.model';

import { SettingStateService } from 'app/core/settings/setting-state/setting-state.service';
import { MarketSettings } from 'app/wallet/settings/models/market.settings.model';

interface ISorting {
  value: string;
  viewValue: string;
}

interface IPage {
  pageNumber: number,
  listings: Array<any>;
}

@Component({
  selector: 'app-listing',
  templateUrl: './listings.component.html',
  styleUrls: ['./listings.component.scss']
})

export class ListingsComponent implements OnInit, OnDestroy {
  // general
  log: any = Log.create('listing-item.component');
  private destroyed: boolean = false;

  // loading
  public isLoading: boolean = false; // small progress bars
  public isLoadingBig: boolean = true; // big animation

  // filters
  // countries: FormControl = new FormControl();
  search: string;

  listingServiceSubcription: any;
  // categories: FormControl = new FormControl();

  _rootCategoryList: Category = new Category({});

  // sorting
  sortings: Array<ISorting> = [
    {value: 'newest', viewValue: 'Newest'},
    {value: 'popular', viewValue: 'Popular'},
    {value: 'price-asc', viewValue: 'Cheapest'},
    {value: 'price-des', viewValue: 'Most expensive'}
  ];

  pages: Array<IPage> = [];
  noMoreListings: boolean = false;

  // pagination
  pagination: any = {
    maxPages: 3,
    maxPerPage: 24,
    // hooks into the scroll bar of the main page..
    infinityScrollSelector: '.mat-drawer-content' // .mat-drawer-content
  };

  filters: any = {
    category: undefined,
    search: undefined,
    country: undefined
  };

  selectedCountry: Country;

  constructor(
    private category: CategoryService,
    private listingService: ListingService,
    private favoritesService: FavoritesService,
    private countryList: CountryListService,
    private settingStateService: SettingStateService
  ) {
    this.log.d('overview created');
    if (this.listingService.cache.selectedCountry) {
      this.selectedCountry = this.listingService.cache.selectedCountry
    }

    this.settingStateService.observe('currentGUISettings', 'market')
      .takeWhile(() => !this.destroyed)
      .subscribe((market: MarketSettings) => {
        this.listingService.cache.selectedCountry = market.defaultCountry;
        this.selectedCountry = market.defaultCountry;
        this.pagination.maxPerPage = market.listingsPerPage;
      });
  }

  ngOnInit() {
    this.log.d('overview created');
    this.loadCategories();
    this.loadPage(1);
  }

  loadCategories() {
    this.category.list()
    .takeWhile(() => !this.destroyed)
    .subscribe(
      list => {
        this._rootCategoryList = list;
      });
  }

  loadPage(pageNumber: number, clear?: boolean) {
    // set loading aninmation
    this.isLoading = true;

    // params
    const max = this.pagination.maxPerPage;
    const search = this.filters.search;
    const category = this.filters.category;
    const country = this.filters.country;

    /*
      We store the subscription each time, due to API delays.
      A search might not resolve synchronically, so a previous search
      may overwrite a search that was initiated later on.
      So store the subscription, then stop listening if a new search
      or page load is triggered.
    */
    if (this.listingServiceSubcription) {
      this.listingServiceSubcription.unsubscribe();
    }

    this.listingServiceSubcription = this.listingService.search(pageNumber, max, null, search, category, country)
      .take(1).subscribe((listings: Array<Listing>) => {
      this.isLoading = false;
      this.isLoadingBig = false;

      // new page
      const page = {
        pageNumber: pageNumber,
        listings: listings
      };

      // should we clear all existing pages? e.g search
      if (clear === true) {
        this.pages = [page];
        this.noMoreListings = false;
      } else { // infinite scroll
        if (listings.length > 0) {
          this.pushNewPage(page);
        } else {
          this.noMoreListings = true;
        }
      }
    })
  }

  pushNewPage(page: IPage) {
    const newPageNumber = page.pageNumber;
    let goingDown = true; // direction

    // previous page
    if (this.pages[0] && this.pages[0].pageNumber > newPageNumber) {
      this.log.d('adding page to top');
      this.pages.unshift(page);
      goingDown = false;
    } else { // next page
      this.log.d('adding page to bottom');
      this.pages.push(page);
    }

    // if exceeding max length, delete a page of the other direction
    if (this.pages.length > this.pagination.maxPages) {
      if (goingDown) {
        this.pages.shift(); // delete first page
      } else {
        this.pages.pop(); // going up, delete last page
      }
    }
  }

  clearAndLoadPage() {
    this.loadPage(1, true);
  }

  // TODO: fix scroll up!
  loadPreviousPage() {
    this.log.d('prev page trigered');
    let previousPage = this.getFirstPageCurrentlyLoaded();
    previousPage--;
    this.log.d('loading prev page' + previousPage);
    if (previousPage > 0) {
      this.loadPage(previousPage);
    }
  }

  loadNextPage() {
    let nextPage = this.getLastPageCurrentlyLoaded(); nextPage++;
    this.log.d('loading next page: ' + nextPage);
    this.loadPage(nextPage);
  }

  // Returns the pageNumber of the last page that is currently visible
  getLastPageCurrentlyLoaded() {
    return this.pages[this.pages.length - 1].pageNumber;
  }

  // Returns the pageNumber if the first page that is currently visible
  getFirstPageCurrentlyLoaded() {
    return this.pages[0].pageNumber;
  }


  changeLocation(country: Country) {
    this.listingService.cache.selectedCountry = country || undefined;
  }

  onCountryChange(country: Country): void {
    this.filters.country = country ? country.iso : undefined;
    this.clearAndLoadPage();
  }

  onCategoryChange(category: any): void {
    this.filters.category = category ? category.id : undefined;
    this.clearAndLoadPage();

  }

  ngOnDestroy() {
    this.destroyed = true;
  }
}
