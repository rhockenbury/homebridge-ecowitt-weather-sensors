import { PlatformAccessory } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { EcowittAccessory } from './../EcowittAccessory';
import { AirQualitySensor } from './../sensors/AirQualitySensor';
import { BatterySensor } from './../sensors/BatterySensor';
import * as utils from './../Utils';

//------------------------------------------------------------------------------

export class WH41 extends EcowittAccessory {
  static readonly properties: string[] = ['airQualityPM25', 'airQualityPM25Avg'];

  protected battery: BatterySensor | undefined;
  protected airQualityPM25: AirQualitySensor | undefined;
  protected airQualityPM25Avg: AirQualitySensor | undefined;

  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
    protected channel: number,
  ) {
    super(platform, accessory, 'WH41', 'WH41 PM2.5 Air Quality Sensor', channel);

    this.requiredData = [`pm25batt${this.channel}`, `pm25_ch${this.channel}`, `pm25_avg_24h_ch${this.channel}`];

    this.setPrimary('battery', 'Battery', BatterySensor);

    this.setPrimary('airQualityPM25', 'PM2.5 Air Quality', AirQualitySensor);

    this.setPrimary('airQualityPM25Avg', 'PM2.5 Air Quality 24h Avg', AirQualitySensor);
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

    this.battery?.updateLevel(
      utils.boundRange(batteryLevel * 100),
      dataReport.dateutc,
    );

    this.battery?.updateStatusLow(
      lowBattery,
      dataReport.dateutc,
    );

    this.battery?.updateChargingState(
      batt === 6,
      dataReport.dateutc,
    );

    this.dispatchUpdate(dataReport, 'updatePM25', 'airQualityPM25', `pm25_ch${this.channel}`);
    this.dispatchUpdate(dataReport, 'updatePM25', 'airQualityPM25Avg', `pm25_avg_24h_ch${this.channel}`);
  }
}
