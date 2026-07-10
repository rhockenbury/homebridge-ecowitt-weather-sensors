import { PlatformAccessory } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { EcowittAccessory } from './../EcowittAccessory';
import { HumiditySensor } from './../sensors/HumiditySensor';
import { TemperatureSensor } from './../sensors/TemperatureSensor';
import { ConductivitySensor } from './../sensors/ConductivitySensor';
import { BatterySensor } from './../sensors/BatterySensor';
import * as utils from './../Utils';

//------------------------------------------------------------------------------

export class WH52 extends EcowittAccessory {
  static readonly properties: string[] = ['soilMoisture', 'soilTemperature', 'soilConductivity'];

  protected battery: BatterySensor | undefined;
  protected soilMoisture: HumiditySensor | undefined;
  protected soilTemperature: TemperatureSensor | undefined;
  protected soilConductivity: ConductivitySensor | undefined;

  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
    protected channel: number,
  ) {
    super(platform, accessory, 'WH52', 'WH52 3-in-1 SoilSensor', channel);

    this.requiredData = [`soil_ec_batt${this.channel}`, `soil_ec_hum${this.channel}`, `soil_ec_temp${this.channel}`,
      `soil_ec${this.channel}`];
    this.unusedData = [`soil_ec_hum_ad${this.channel}`, `soil_ec_ad${this.channel}`];

    const hideConfig = this.platform.config?.hidden || {};
    const hideConfigCustom = this.platform.config?.customHidden || [];
    const hidden = Object.keys(hideConfig).filter(k => !!hideConfig[k]).concat(hideConfigCustom);

    if (!utils.includesAny(hidden, ['battery', `${this.shortServiceId}:battery`])) {
      const nameOverride = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:battery`);
      this.battery = new BatterySensor(platform, accessory, `${this.accessoryId}:battery`, nameOverride || 'Battery');
    } else {
      this.battery = new BatterySensor(platform, accessory, `${this.accessoryId}:battery`, 'Battery');
      this.battery.removeService();
      this.battery = undefined;
    }

    if (!utils.includesAny(hidden, ['soilmoisture', `${this.shortServiceId}:soilmoisture`])) {
      const nameOverride = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:soilmoisture`);
      this.soilMoisture = new HumiditySensor(platform, accessory, `${this.accessoryId}:soilmoisture`, nameOverride || 'Soil Moisture');
    } else {
      this.soilMoisture = new HumiditySensor(platform, accessory, `${this.accessoryId}:soilmoisture`, 'Soil Moisture');
      this.soilMoisture.removeService();
      this.soilMoisture = undefined;
    }

    if (!utils.includesAny(hidden, ['soiltemperature', `${this.shortServiceId}:soiltemperature`])) {
      const nameOverride = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:soiltemperature`);
      this.soilTemperature = new TemperatureSensor(
        platform,
        accessory,
        `${this.accessoryId}:soiltemperature`,
        nameOverride || 'Soil Temperature',
      );
    } else {
      this.soilTemperature = new TemperatureSensor(platform, accessory, `${this.accessoryId}:soiltemperature`, 'Soil Temperature');
      this.soilTemperature.removeService();
      this.soilTemperature = undefined;
    }

    if (!utils.includesAny(hidden, ['soilconductivity', `${this.shortServiceId}:soilconductivity`])) {
      const nameOverride = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:soilconductivity`);
      this.soilConductivity = new ConductivitySensor(platform, accessory, `${this.accessoryId}:soilconductivity`,
        nameOverride || 'Soil Conductivity');
    } else {
      this.soilConductivity = new ConductivitySensor(platform, accessory, `${this.accessoryId}:soilconductivity`, 'Soil Conductivity');
      this.soilConductivity.removeService();
      this.soilConductivity = undefined;
    }
  }

  //----------------------------------------------------------------------------

  public update(dataReport) {
    if (!utils.includesAll(Object.keys(dataReport), this.requiredData)) {
      throw new Error(`Update on ${this.accessoryId} requires data ${this.requiredData}`);
    } else {
      this.platform.log.debug(`Updating accessory ${this.accessoryId}`);
    }

    const batt = parseFloat(dataReport[`soil_ec_batt${this.channel}`]);
    const batteryLevel = batt / 1.6;
    const lowBattery = batt <= 1.2;

    this.battery?.updateLevel(
      utils.boundRange(batteryLevel * 100),
      dataReport.dateutc,
    );

    this.battery?.updateStatusLow(
      lowBattery,
      dataReport.dateutc,
    );

    this.soilMoisture?.update(
      parseFloat(dataReport[`soil_ec_hum${this.channel}`]),
      dataReport.dateutc,
    );

    this.soilTemperature?.update(
      parseFloat(dataReport[`soil_ec_temp${this.channel}`]),
      dataReport.dateutc,
    );

    this.soilConductivity?.update(
      parseFloat(dataReport[`soil_ec${this.channel}`]),
      utils.lookup(this.platform.config?.thresholds, 'soilConductivity'),
      dataReport.dateutc,
    );
  }
}
