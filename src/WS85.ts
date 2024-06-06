import { Service, PlatformAccessory /*ServiceEventTypes*/ } from "homebridge";
import { EcowittPlatform } from "./EcowittPlatform";
import { EcowittAccessory } from "./EcowittAccessory";

import { WindSensor } from "./WindSensor";
import { RainSensor } from "./RainSensor";

//------------------------------------------------------------------------------

export class WS85 extends EcowittAccessory {
  protected name: string;
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
  protected totalRain: RainSensor | undefined;

  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory
  ) {
    super(platform, accessory);

    this.setModel("WS85", "Ecowitt WS-85");
    this.name = "WS-85";

    // Battery

    this.battery = this.addBattery(this.name, false);

    // Wind

    const windHide = this.platform.config?.ws?.wind?.hide || [];

    if (!windHide.includes("Direction")) {
      this.windDirection = new WindSensor(
        platform,
        accessory,
        "Wind Direction"
      );
    }

    if (!windHide.includes("Speed")) {
      this.windSpeed = new WindSensor(platform, accessory, "Wind Speed");
    }

    if (!windHide.includes("Gust")) {
      this.windGust = new WindSensor(platform, accessory, "Wind Gust");
    }

    if (!windHide.includes("MaxDailyGust")) {
      this.maxDailyGust = new WindSensor(platform, accessory, "Max Daily Gust");
    }

    // Rain

    const rainHide = this.platform.config?.ws?.rain?.hide || [];

    if (!rainHide.includes("Rate")) {
      this.rainRate = new RainSensor(platform, accessory, "Rain Rate");
    }

    if (!rainHide.includes("Event")) {
      this.eventRain = new RainSensor(platform, accessory, "Event Rain");
    }

    if (!rainHide.includes("Hourly")) {
      this.hourlyRain = new RainSensor(platform, accessory, "Hourly Rain");
    }

    if (!rainHide.includes("Daily")) {
      this.dailyRain = new RainSensor(platform, accessory, "Daily Rain");
    }

    if (!rainHide.includes("Weekly")) {
      this.weeklyRain = new RainSensor(platform, accessory, "Weekly Rain");
    }

    if (!rainHide.includes("Monthly")) {
      this.monthlyRain = new RainSensor(platform, accessory, "Monthly Rain");
    }

    if (!rainHide.includes("Yearly")) {
      this.yearlyRain = new RainSensor(platform, accessory, "Yearly Rain");
    }
  }

  update(dataReport) {
    this.platform.log.info("WS85 Update");
    this.platform.log.info("  wh85batt:", dataReport.wh85batt);
    this.platform.log.info("  ws85batt:", dataReport.ws85batt);

    const winddir = parseFloat(dataReport.winddir);
    const windspeedmph = parseFloat(dataReport.windspeedmph);
    const windgustmph = parseFloat(dataReport.windgustmph);
    const maxdailygust = parseFloat(dataReport.maxdailygust);

    this.platform.log.info("  winddir:", winddir);
    this.platform.log.info("  windspeedmph:", windspeedmph);
    this.platform.log.info("  windgustmph:", windgustmph);
    this.platform.log.info("  maxdailygust:", maxdailygust);

    this.platform.log.info("  rrain_piezo:", dataReport.rrain_piezo);
    this.platform.log.info("  erain_piezo:", dataReport.erain_piezo);
    this.platform.log.info("  hrain_piezo:", dataReport.hrain_piezo);
    this.platform.log.info("  drain_piezo:", dataReport.drain_piezo);
    this.platform.log.info("  wrain_piezo:", dataReport.wrain_piezo);
    this.platform.log.info("  mrain_piezo:", dataReport.mrain_piezo);
    this.platform.log.info("  yrain_piezo:", dataReport.yrain_piezo);

    // Battery

    const batt = parseFloat(dataReport.wh85batt || dataReport.ws85batt) / 5;
    const lowBattery = batt <= 0.2;

    this.updateBatteryLevel(
      this.battery,
      Math.min(0, Math.max(100, batt * 100))
    );
    this.updateStatusLowBattery(this.battery, lowBattery);

    // Wind

    this.windDirection?.updateDirection(winddir);
    this.windSpeed?.updateSpeed(
      windspeedmph,
      this.platform.config.ws.wind.speedThresold
    );
    this.windGust?.updateSpeed(
      windgustmph,
      this.platform.config.ws.wind.gustThresold
    );
    this.maxDailyGust?.updateSpeed(
      maxdailygust,
      this.platform.config.ws.wind.maxDailyGustThresold
    );

    // Rain

    this.rainRate?.updateRate(
      parseFloat(dataReport.rrain_piezo),
      this.platform.config.ws?.rain?.rateThreshold
    );
    this.eventRain?.updateTotal(
      parseFloat(dataReport.erain_piezo),
      this.platform.config.ws?.rain?.eventThreshold
    );
    this.hourlyRain?.updateTotal(
      parseFloat(dataReport.hrain_piezo),
      this.platform.config.ws?.rain?.hourlyThreshold
    );
    this.dailyRain?.updateTotal(
      parseFloat(dataReport.drain_piezo),
      this.platform.config.ws?.rain?.dailyThreshold
    );
    this.weeklyRain?.updateTotal(
      parseFloat(dataReport.wrain_piezo),
      this.platform.config.ws?.rain?.weeklyThreshold
    );
    this.monthlyRain?.updateTotal(
      parseFloat(dataReport.mrain_piezo),
      this.platform.config.ws?.rain?.monthlyThreshold
    );
    this.yearlyRain?.updateTotal(
      parseFloat(dataReport.yrain_piezo),
      this.platform.config.ws?.rain?.yearlyThreshold
    );
  }
}
