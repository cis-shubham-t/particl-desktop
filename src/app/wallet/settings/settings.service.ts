import { Injectable } from '@angular/core';
import { MarketService } from 'app/core/market/market.service';
import { ProfileService } from 'app/core/market/api/profile/profile.service';
import { Profile } from 'app/core/market/api/profile/profile.model';
import { SettingsGuiService } from 'app/core/settings-gui/settings-gui.service';
import { Settings } from 'app/wallet/settings/models/settings.model';
import { RpcStateService } from 'app/core/rpc/rpc-state/rpc-state.service';
import { DEFAULT_GUI_SETTINGS } from 'app/core/util/utils';
import { SettingStateService } from 'app/core/settings/setting-state/setting-state.service';
import { Log } from 'ng2-logger';

@Injectable()
export class SettingsService {
  log: any = Log.create('settings.service');

  defaultSettings: Settings = new Settings(DEFAULT_GUI_SETTINGS);

  profileId: number;
  currentSettings: Settings;

  constructor(
    private settingStateService: SettingStateService,

    // @TODO user the marketService whenever market place cmd(s) are available.
    private marketService: MarketService,
    private profileService: ProfileService,
    private _settingsGUIService: SettingsGuiService
  ) {

    this.log.d('setting service initialized');

    // get default profile id.
    this.profileService.default().subscribe((profile: Profile) => {
      this.profileId = profile.id;
    });

    this.init();
  }

  init(): void {

    // @TODO change with the cmd calling and update settings after settings cmd response.

    const settings = this.loadSettings();
    if (settings) {

      // use existing settings.
      this.updateSettings(settings);
    } else {

      // use default settings.
      this.applyDefaultSettings();
    }

  }

  loadSettings(): Settings {
    return (JSON.parse(localStorage.getItem('gui-settings')));
  }

  applySettings(settings: Settings): void {
    const oldSettings: string = localStorage.getItem('gui-settings');
    const newSettings: string = JSON.stringify(settings);

    if (oldSettings !== newSettings) {
      this.updateSettings(settings);
    }
  }

  applyDefaultSettings(): void {
    this.updateSettings(this.defaultSettings);
  }


  /**
    * @param {Settings} settings
    * updateSettings responsible to update the settings where needed.
    */

  updateSettings(settings: Settings): void {

    // update settings in web storage.
    localStorage.setItem('gui-settings', JSON.stringify(settings));

    // update core settings.
    this._settingsGUIService.updateSettings(settings);

    // update current settings
    this.currentSettings = new Settings(settings);

    // set currentGUISettings state.
    this.settingStateService.set('currentGUISettings', new Settings(settings));
  }

  // list market setting.
  list(): any {
    const params = ['list', this.profileId];
    return this.marketService.call('setting', params);
  }

  // set market setting.
  set(key: string, value: any): any {
    const params = ['set', this.profileId, key, value]
    return this.marketService.call('setting', params);
  }

  // remove market setting.
  remove(key: string): any {
    const params = ['remove', this.profileId, key]
    return this.marketService.call('setting', params);
  }

  // get market setting.
  get(key: string): any {
    const params = ['get', this.profileId, key]
    return this.marketService.call('setting', params);
  }
}
