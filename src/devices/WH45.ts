import { PlatformAccessory, Service } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { EcowittAccessory } from './../EcowittAccessory';
import { TemperatureSensor } from './../sensors/TemperatureSensor';
import { HumiditySensor } from './../sensors/HumiditySensor';
import { AirQualitySensor } from './../sensors/AirQualitySensor';
import { CarbonDioxideSensor } from './../sensors/CarbonDioxideSensor';
import * as utils from './../Utils';

//------------------------------------------------------------------------------

export class WH45 extends EcowittAccessory {
  static readonly properties: string[] = ['temperature', 'humidity', 'airQualityPM25',
    'airQualityPM25Avg', 'airQualityPM10', 'airQualityPM10Avg', 'carbonDioxide',
    'carbonDioxideAvg'];

  protected battery: Service;
  protected temperature: TemperatureSensor | undefined;
  protected humidity: HumiditySensor | undefined;
  protected airQualityPM25: AirQualitySensor | undefined;
  protected airQualityPM25Avg: AirQualitySensor | undefined;
  protected airQualityPM10: AirQualitySensor | undefined;
  protected airQualityPM10Avg: AirQualitySensor | undefined;
  protected carbonDioxide: CarbonDioxideSensor | undefined;
  protected carbonDioxideAvg: CarbonDioxideSensor | undefined;

  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
  ) {
    super(platform, accessory, 'WH45', 'WH45 5-in-1 Air Quality Sensor');

    this.requiredData = ['co2_batt', 'tf_co2', 'humi_co2', 'pm25_co2', 'pm25_24h_co2',
      'pm10_co2', 'pm10_24h_co2', 'co2', 'co2_24h'];

    this.battery = this.addBattery('', true);

    const hideConfig = this.platform.config?.hidden || {};
    const hidden = Object.keys(hideConfig).filter(k => !!hideConfig[k]);

    let nameOverride: string | undefined;

    if (!utils.includesAny(hidden, ['temperature', `${this.shortServiceId}:temperature`])) {
      nameOverride = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:temperature`);
      this.temperature = new TemperatureSensor(platform, accessory, `${this.accessoryId}:temperature`, nameOverride || 'Temperature');
    } else {
      this.temperature = new TemperatureSensor(platform, accessory, `${this.accessoryId}:temperature`, 'Temperature');
      this.temperature.removeService();
      this.temperature = undefined;
    }

    if (!utils.includesAny(hidden, ['humidity', `${this.shortServiceId}:humidity`])) {
      nameOverride = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:humidity`);
      this.humidity = new HumiditySensor(platform, accessory, `${this.accessoryId}:humidity`, nameOverride || 'Humidity');
    } else {
      this.humidity = new HumiditySensor(platform, accessory, `${this.accessoryId}:humidity`, 'Humidity');
      this.humidity.removeService();
      this.humidity = undefined;
    }

    if (!utils.includesAny(hidden, ['airQualityPM25', `${this.shortServiceId}:airQualityPM25`])) {
      nameOverride = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:airQualityPM25`);
      this.airQualityPM25 = new AirQualitySensor(platform, accessory, `${this.accessoryId}:airQualityPM25`,
        nameOverride || 'PM2.5 Air Quality');
    } else {
      this.airQualityPM25 = new AirQualitySensor(platform, accessory, `${this.accessoryId}:airQualityPM25`, 'airQualityPM25');
      this.airQualityPM25.removeService();
      this.airQualityPM25 = undefined;
    }

    if (!utils.includesAny(hidden, ['airQualityPM25Avg', `${this.shortServiceId}:airQualityPM25Avg`])) {
      nameOverride = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:airQualityPM25Avg`);
      this.airQualityPM25Avg = new AirQualitySensor(platform, accessory, `${this.accessoryId}:airQualityPM25Avg`,
        nameOverride || 'PM2.5 Air Quality 24h Avg');
    } else {
      this.airQualityPM25Avg = new AirQualitySensor(platform, accessory, `${this.accessoryId}:airQualityPM25Avg`, 'airQualityPM25Avg');
      this.airQualityPM25Avg.removeService();
      this.airQualityPM25Avg = undefined;
    }

    if (!utils.includesAny(hidden, ['airQualityPM10', `${this.shortServiceId}:airQualityPM10`])) {
      nameOverride = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:airQualityPM10`);
      this.airQualityPM10 = new AirQualitySensor(platform, accessory, `${this.accessoryId}:airQualityPM10`,
        nameOverride || 'PM10 Air Quality');
    } else {
      this.airQualityPM10 = new AirQualitySensor(platform, accessory, `${this.accessoryId}:airQualityPM10`, 'airQualityPM10');
      this.airQualityPM10.removeService();
      this.airQualityPM10 = undefined;
    }

    if (!utils.includesAny(hidden, ['airQualityPM10Avg', `${this.shortServiceId}:airQualityPM10Avg`])) {
      nameOverride = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:airQualityPM10Avg`);
      this.airQualityPM10Avg = new AirQualitySensor(platform, accessory, `${this.accessoryId}:airQualityPM10Avg`,
        nameOverride || 'PM10 Air Quality 24h Avg');
    } else {
      this.airQualityPM10Avg = new AirQualitySensor(platform, accessory, `${this.accessoryId}:airQualityPM10Avg`, 'airQualityPM10Avg');
      this.airQualityPM10Avg.removeService();
      this.airQualityPM10Avg = undefined;
    }

    if (!utils.includesAny(hidden, ['carbonDioxide', `${this.shortServiceId}:carbonDioxide`])) {
      nameOverride = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:carbonDioxide`);
      this.carbonDioxide = new CarbonDioxideSensor(platform, accessory, `${this.accessoryId}:carbonDioxide`,
        nameOverride || 'CO₂ Level');
    } else {
      this.carbonDioxide = new CarbonDioxideSensor(platform, accessory, `${this.accessoryId}:carbonDioxide`, 'carbonDioxide');
      this.carbonDioxide.removeService();
      this.carbonDioxide = undefined;
    }

    if (!utils.includesAny(hidden, ['carbonDioxideAvg', `${this.shortServiceId}:carbonDioxideAvg`])) {
      nameOverride = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:carbonDioxideAvg`);
      this.carbonDioxideAvg = new CarbonDioxideSensor(platform, accessory, `${this.accessoryId}:carbonDioxideAvg`,
        nameOverride || 'CO₂ Level 24h Avg');
    } else {
      this.carbonDioxideAvg = new CarbonDioxideSensor(platform, accessory, `${this.accessoryId}:carbonDioxideAvg`, 'carbonDioxideAvg');
      this.carbonDioxideAvg.removeService();
      this.carbonDioxideAvg = undefined;
    }
  }

  //----------------------------------------------------------------------------

  public update(dataReport) {
    if (!utils.includesAll(Object.keys(dataReport), this.requiredData)) {
      throw new Error(`Update on ${this.accessoryId} requires data ${this.requiredData}`);
    } else {
      this.platform.log.debug(`Updating accessory ${this.accessoryId}`);
    }

    const batt = parseFloat(dataReport['co2_batt']);
    const batteryLevel = batt / 5.0;
    const lowBattery = batt <= 1.1;

    this.updateBatteryLevel(this.battery, utils.boundRange(batteryLevel * 100));
    this.updateStatusLowBattery(this.battery, lowBattery);
    this.updateChargingState(this.battery, batt === 6);

    this.temperature?.update(
      parseFloat(dataReport['tf_co2']),
      dataReport.dateutc,
    );

    this.humidity?.update(
      parseFloat(dataReport['humi_co2']),
      dataReport.dateutc,
    );

    this.airQualityPM25?.updatePM25(
      parseFloat(dataReport['pm25_co2']),
      dataReport.dateutc,
    );

    this.airQualityPM25Avg?.updatePM25(
      parseFloat(dataReport['pm25_24h_co2']),
      dataReport.dateutc,
    );

    this.airQualityPM10?.updatePM10(
      parseFloat(dataReport['pm10_co2']),
      dataReport.dateutc,
    );

    this.airQualityPM10Avg?.updatePM10(
      parseFloat(dataReport['pm10_24h_co2']),
      dataReport.dateutc,
    );

    this.carbonDioxide?.update(
      parseFloat(dataReport['co2']),
      dataReport.dateutc,
    );

    this.carbonDioxideAvg?.update(
      parseFloat(dataReport['co2_24h']),
      dataReport.dateutc,
    );
  }
}
