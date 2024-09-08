import { PlatformAccessory, Service } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { EcowittAccessory } from './../EcowittAccessory';
import { HumiditySensor } from './../sensors/HumiditySensor';
import * as utils from './../Utils';

//------------------------------------------------------------------------------

export class WH51 extends EcowittAccessory {
  static readonly properties: string[] = ['soilMoisture'];
  protected battery: Service;
  protected soilMoisture: HumiditySensor | undefined;

  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
    protected channel: number,
  ) {
    super(platform, accessory, 'WH51', 'Soil Moisture Sensor (WH51)', channel);

    this.requiredData = [`soilbatt${this.channel}`, `soilmoisture${this.channel}`];
    this.optionalData = [`soilad${this.channel}`];

    this.battery = this.addBattery('', false);

    const hideConfig = this.platform.config?.hidden || {};
    const hidden = Object.keys(hideConfig).filter(k => !!hideConfig[k]);

    if (!utils.includesAny(hidden, ['soilmoisture', `${this.shortServiceId}:soilmoisture`])) {
      const nameOverride = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:soilmoisture`)  ||
          utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}`);
      this.soilMoisture = new HumiditySensor(platform, accessory, `${this.accessoryId}:soilmoisture`, nameOverride || 'Soil Moisture');
    } else {
      this.soilMoisture = new HumiditySensor(platform, accessory, `${this.accessoryId}:soilmoisture`, 'Soil Moisture');
      this.soilMoisture.removeService();
      this.soilMoisture = undefined;
    }
  }

  //----------------------------------------------------------------------------

  public update(dataReport) {
    if (!utils.includesAll(Object.keys(dataReport), this.requiredData)) {
      throw new Error(`Update on ${this.accessoryId} requires data ${this.requiredData}`);
    } else {
      this.platform.log.debug(`Updating accessory ${this.accessoryId}`);
    }

    const batt = parseFloat(dataReport[`soilbatt${this.channel}`]);
    const batteryLevel = batt / 1.6;
    const lowBattery = batt <= 1.1;

    this.updateBatteryLevel(this.battery, utils.boundRange(batteryLevel * 100));
    this.updateStatusLowBattery(this.battery, lowBattery);

    this.soilMoisture?.update(
      parseFloat(dataReport[`soilmoisture${this.channel}`]),
      dataReport.dateutc,
    );
  }
}
