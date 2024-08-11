import { Service, PlatformAccessory /*ServiceEventTypes*/ } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { EcowittAccessory } from './../EcowittAccessory';

import { WindSensor } from './../sensors/WindSensor';
import { RainSensor } from './../sensors/RainSensor';

//------------------------------------------------------------------------------

export class WS85 extends EcowittAccessory {
  protected battery: Service;

  protected windDirection: WindSensor | undefined;
  protected windSpeed: WindSensor | undefined;
  protected windGust: WindSensor | undefined;
  protected maxDailyGust: WindSensor | undefined;

  protected rainRate: RainSensor | undefined;
  protected eventRain: RainSensor | undefined;
  protected hourlyRain: RainSensor | undefined;
  protected dailyRain: RainSensor | undefined;
  protected weeklyRain: RainSensor | undefined;
  protected monthlyRain: RainSensor | undefined;
  protected yearlyRain: RainSensor | undefined;
  //protected totalRain: RainSensor | undefined;

  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
  ) {
    super(platform, accessory, 'WS85', 'Ecowitt WS-85');

    // Battery

    this.battery = this.addBattery(this.model, false);

    // Wind

    const windHide = this.platform.config?.ws?.wind?.hide || [];

    if (!windHide.includes('Direction')) {
      this.windDirection = new WindSensor(
        platform,
        accessory,
        'Wind Direction',
      );
    }

    if (!windHide.includes('Speed')) {
      this.windSpeed = new WindSensor(platform, accessory, 'Wind Speed');
    }

    if (!windHide.includes('Gust')) {
      this.windGust = new WindSensor(platform, accessory, 'Wind Gust');
    }

    if (!windHide.includes('MaxDailyGust')) {
      this.maxDailyGust = new WindSensor(platform, accessory, 'Max Daily Gust');
    }

    // Rain

    const rainHide = this.platform.config?.ws?.rain?.hide || [];

    if (!rainHide.includes('Rate')) {
      this.rainRate = new RainSensor(platform, accessory, 'Rain Rate');
    }

    if (!rainHide.includes('Event')) {
      this.eventRain = new RainSensor(platform, accessory, 'Event Rain');
    }

    if (!rainHide.includes('Hourly')) {
      this.hourlyRain = new RainSensor(platform, accessory, 'Hourly Rain');
    }

    if (!rainHide.includes('Daily')) {
      this.dailyRain = new RainSensor(platform, accessory, 'Daily Rain');
    }

    if (!rainHide.includes('Weekly')) {
      this.weeklyRain = new RainSensor(platform, accessory, 'Weekly Rain');
    }

    if (!rainHide.includes('Monthly')) {
      this.monthlyRain = new RainSensor(platform, accessory, 'Monthly Rain');
    }

    if (!rainHide.includes('Yearly')) {
      this.yearlyRain = new RainSensor(platform, accessory, 'Yearly Rain');
    }
  }

  update(dataReport) {
    this.platform.log.debug(`${this.model} Update`);
    this.platform.log.debug('  wh85batt:', dataReport.wh85batt);
    this.platform.log.debug('  ws85batt:', dataReport.ws85batt);

    const winddir = parseFloat(dataReport.winddir);
    const windspeedmph = parseFloat(dataReport.windspeedmph);
    const windgustmph = parseFloat(dataReport.windgustmph);
    const maxdailygust = parseFloat(dataReport.maxdailygust);

    this.platform.log.debug('  winddir:', winddir);
    this.platform.log.debug('  windspeedmph:', windspeedmph);
    this.platform.log.debug('  windgustmph:', windgustmph);
    this.platform.log.debug('  maxdailygust:', maxdailygust);

    this.platform.log.debug('  rrain_piezo:', dataReport.rrain_piezo);
    this.platform.log.debug('  erain_piezo:', dataReport.erain_piezo);
    this.platform.log.debug('  hrain_piezo:', dataReport.hrain_piezo);
    this.platform.log.debug('  drain_piezo:', dataReport.drain_piezo);
    this.platform.log.debug('  wrain_piezo:', dataReport.wrain_piezo);
    this.platform.log.debug('  mrain_piezo:', dataReport.mrain_piezo);
    this.platform.log.debug('  yrain_piezo:', dataReport.yrain_piezo);

    // Battery

    const batt = parseFloat(dataReport.wh85batt || dataReport.ws85batt) / 5;
    const lowBattery = batt <= 0.25;

    this.updateBatteryLevel(
      this.battery,
      Math.max(0, Math.min(100, batt * 100)),
    );
    this.updateStatusLowBattery(this.battery, lowBattery);

    // Wind

    this.windDirection?.updateDirection(winddir);
    this.windSpeed?.updateSpeed(
      windspeedmph,
      this.platform.config.ws.wind.speedThreshold,
    );
    this.windGust?.updateSpeed(
      windgustmph,
      this.platform.config.ws.wind.gustThreshold,
    );
    this.maxDailyGust?.updateSpeed(
      maxdailygust,
      this.platform.config.ws.wind.maxDailyGustThreshold,
    );

    // Rain

    this.rainRate?.updateRate(
      parseFloat(dataReport.rrain_piezo),
      this.platform.config.ws?.rain?.rateThreshold,
      dataReport.dateutc
    );
    this.eventRain?.updateTotal(
      parseFloat(dataReport.erain_piezo),
      this.platform.config.ws?.rain?.eventThreshold,
      dataReport.dateutc
    );
    this.hourlyRain?.updateTotal(
      parseFloat(dataReport.hrain_piezo),
      this.platform.config.ws?.rain?.hourlyThreshold,
      dataReport.dateutc
    );
    this.dailyRain?.updateTotal(
      parseFloat(dataReport.drain_piezo),
      this.platform.config.ws?.rain?.dailyThreshold,
      dataReport.dateutc
    );
    this.weeklyRain?.updateTotal(
      parseFloat(dataReport.wrain_piezo),
      this.platform.config.ws?.rain?.weeklyThreshold,
      dataReport.dateutc
    );
    this.monthlyRain?.updateTotal(
      parseFloat(dataReport.mrain_piezo),
      this.platform.config.ws?.rain?.monthlyThreshold,
      dataReport.dateutc
    );
    this.yearlyRain?.updateTotal(
      parseFloat(dataReport.yrain_piezo),
      this.platform.config.ws?.rain?.yearlyThreshold,
      dataReport.dateutc
    );
  }
}
