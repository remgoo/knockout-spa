define(['util/storage', 'app/shared/api/api', 'ko', 'sugar'], function (
  Storage, Api, ko) {

  var Config = ko.observable({});

  Config.storageKeys = {
    configChanged: 'configChanged',
    locale: 'locale'
  };

  Config.locales = ['en', 'zh-CN'];

  function notifyConfigChange() {
    Storage.set(Config.storageKeys.configChanged, Math.random());
  }

  Config.refresh = function () {
    return Api.call('config', 'get').then(function (config) {
      // TODO: change to your app's way of getting the locale
      config = Object.merge(
        { locale: Storage.get(Config.storageKeys.locale) || window.navigator.language || window.navigator.userLanguage },
        config,
        true
      );
      var _config = Config();
      Config(config);
      if (!Object.equal(_config, {}) && !Object.equal(_config, config)) {
        notifyConfigChange();
      }
      return config;
    });
  };

  Config.setLocale = function (locale) {
    if (Config.locales.indexOf(locale) > -1) {
      Storage.set(Config.storageKeys.locale, locale);
      notifyConfigChange();
      window.location.reload();
    } else {
      throw new Error('Unsupported locale: ' + locale);
    }
  };

  /* TODO: because the user may have multiple tabs open in the same browser, modify the following to handle app global state changes
   to make sure all tabs are in sync (e.g. logout). Using the localStorage on change event to notify app instances across tabs */

  Storage.addEventListener(function (event) {
    if (event.key == Config.storageKeys.configChanged) {
      window.location.reload();
    }
  });

  return Config;

});
