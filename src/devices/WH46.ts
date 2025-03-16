import { PlatformAccessory } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { EcowittAccessory } from './../EcowittAccessory';
import { TemperatureSensor } from './../sensors/TemperatureSensor';
import { HumiditySensor } from './../sensors/HumiditySensor';
import { AirQualitySensor } from './../sensors/AirQualitySensor';
import { CarbonDioxideSensor } from './../sensors/CarbonDioxideSensor';
import { BatterySensor } from './../sensors/BatterySensor';
import * as utils from './../Utils';

//------------------------------------------------------------------------------

export class WH46 extends EcowittAccessory {
  static readonly properties: string[] = ['temperature', 'humidity', 'airQualityPM25',
    'airQualityPM25Avg', 'airQualityPM10', 'airQualityPM10Avg', 'carbonDioxide',
    'carbonDioxideAvg'];

  // 'airQualityPM1', 'airQualityPM1Avg', 'airQualityPM4', 'airQualityPM4Avg'

  protected battery: BatterySensor | undefined;
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
    super(platform, accessory, 'WH46', 'WH46 7-in-1 Air Quality Sensor');

    this.requiredData = ['co2_batt', 'tf_co2', 'humi_co2', 'pm25_co2', 'pm25_24h_co2',
      'pm10_co2', 'pm10_24h_co2', 'co2', 'co2_24h'];
    this.unusedData = ['pm1_co2', 'pm1_24h_co2', 'pm4_co2', 'pm4_24h_co2'];

    this.setPrimary('battery', 'Battery', BatterySensor)

    this.setPrimary('temperature', 'Temperature', TemperatureSensor);

    this.setPrimary('humidity', 'Humidity', HumiditySensor);

    this.setPrimary('airQualityPM25', 'PM2.5 Air Quality', AirQualitySensor);

    this.setPrimary('airQualityPM25Avg', 'PM2.5 Air Quality 24h Avg', AirQualitySensor);

    this.setPrimary('airQualityPM10', 'PM10 Air Quality', AirQualitySensor);

    this.setPrimary('airQualityPM10Avg', 'PM10 Air Quality 24h Avg', AirQualitySensor);

    this.setPrimary('carbonDioxide', 'CO₂ Level', CarbonDioxideSensor);

    this.setPrimary('carbonDioxideAvg', 'CO₂ Level 24h Avg', CarbonDioxideSensor);
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

    this.dispatchUpdate(dataReport, 'update', 'temperature', 'tf_co2');
    this.dispatchUpdate(dataReport, 'update', 'humidity', 'humi_co2');
    this.dispatchUpdate(dataReport, 'updatePM25', 'airQualityPM25', 'pm25_co2');
    this.dispatchUpdate(dataReport, 'updatePM25', 'airQualityPM25Avg', 'pm25_24h_co2');
    this.dispatchUpdate(dataReport, 'updatePM10', 'airQualityPM10', 'pm10_co2');
    this.dispatchUpdate(dataReport, 'updatePM10', 'airQualityPM10Avg', 'pm10_24h_co2');
    this.dispatchUpdate(dataReport, 'update', 'carbonDioxide', 'co2');
    this.dispatchUpdate(dataReport, 'update', 'carbonDioxideAvg', 'co2_24h');
  }
}
