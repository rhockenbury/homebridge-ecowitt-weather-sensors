import { PlatformAccessory, Service } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { EcowittAccessory } from './../EcowittAccessory';
import { AirQualitySensor } from './../sensors/AirQualitySensor';
import * as utils from './../Utils';

//------------------------------------------------------------------------------

export class WH41 extends EcowittAccessory {
  static readonly properties: string[] = ['airQualityPM25', 'airQualityPM25Avg'];

  protected battery: Service;
  protected airQualityPM25: AirQualitySensor | undefined;
  protected airQualityPM25Avg: AirQualitySensor | undefined;

  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
    protected channel: number,
  ) {
    super(platform, accessory, 'WH41', 'WH41 PM2.5 Air Quality Sensor', channel);

    this.requiredData = [`pm25batt${this.channel}`, `pm25_ch${this.channel}`, `pm25_avg_24h_ch${this.channel}`];

    this.battery = this.addBattery('', true);

    const hideConfig = this.platform.config?.hidden || {};
    const hidden = Object.keys(hideConfig).filter(k => !!hideConfig[k]);

    if (!utils.includesAny(hidden, ['airQualityPM25', `${this.shortServiceId}:airQualityPM25`])) {
      const nameOverride = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:airQualityPM25`);
      this.airQualityPM25 = new AirQualitySensor(platform, accessory, `${this.accessoryId}:airQualityPM25`,
        nameOverride || 'PM2.5 Air Quality');
    } else {
      this.airQualityPM25 = new AirQualitySensor(platform, accessory, `${this.accessoryId}:airQualityPM25`, 'airQualityPM25');
      this.airQualityPM25.removeService();
      this.airQualityPM25 = undefined;
    }

    if (!utils.includesAny(hidden, ['airQualityPM25Avg', `${this.shortServiceId}:airQualityPM25Avg`])) {
      const nameOverride = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:airQualityPM25Avg`);
      this.airQualityPM25Avg = new AirQualitySensor(platform, accessory, `${this.accessoryId}:airQualityPM25Avg`,
        nameOverride || 'PM2.5 Air Quality 24h Avg');
    } else {
      this.airQualityPM25Avg = new AirQualitySensor(platform, accessory, `${this.accessoryId}:airQualityPM25Avg`, 'airQualityPM25Avg');
      this.airQualityPM25Avg.removeService();
      this.airQualityPM25Avg = undefined;
    }
  }

  //----------------------------------------------------------------------------

  public update(dataReport) {
    if (!utils.includesAll(Object.keys(dataReport), this.requiredData)) {
      throw new Error(`Update on ${this.accessoryId} requires data ${this.requiredData}`);
    } else {
      this.platform.log.debug(`Updating accessory ${this.accessoryId}`);
    }

    const batt = parseFloat(dataReport[`pm25batt${this.channel}`]);
    const batteryLevel = batt / 5.0;
    const lowBattery = batt <= 1.1;

    this.updateBatteryLevel(this.battery, utils.boundRange(batteryLevel * 100));
    this.updateStatusLowBattery(this.battery, lowBattery);
    this.updateChargingState(this.battery, batt === 6);

    this.airQualityPM25?.updatePM25(
      parseFloat(dataReport[`pm25_ch${this.channel}`]),
      dataReport.dateutc,
    );

    this.airQualityPM25Avg?.updatePM25(
      parseFloat(dataReport[`pm25_avg_24h_ch${this.channel}`]),
      dataReport.dateutc,
    );
  }
}
