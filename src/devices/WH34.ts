import { PlatformAccessory, Service } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { EcowittAccessory } from './../EcowittAccessory';
import { TemperatureSensor } from './../sensors/TemperatureSensor';
import * as utils from './../Utils';

//------------------------------------------------------------------------------

export class WH34 extends EcowittAccessory {
  protected battery: Service;
  protected temperature: TemperatureSensor | undefined;

  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
    protected channel: number,
  ) {
    super(platform, accessory, 'WH34', 'Thermo Sensor (WH34)', channel);

    this.requiredData = [`tf_batt${this.channel}`, `tf_ch${this.channel}`];

    this.battery = this.addBattery('', false);

    const hideConfig = this.platform.config?.hidden || {};
    const hidden = Object.keys(hideConfig).filter(k => !!hideConfig[k]);

    if (!utils.includesAny(hidden, ['temperature', `${this.accessoryId}:temperature`])) {
      const temperatureName = utils.lookup(this.platform.config?.nameOverrides, `${this.accessoryId}:temperature`);
      this.temperature = new TemperatureSensor(platform, accessory, `${this.accessoryId}:temperature`, temperatureName || 'Temperature');
    } else {
      this.temperature = new TemperatureSensor(platform, accessory, `${this.accessoryId}:temperature`, 'Temperature');
      this.temperature.removeService();
      this.temperature = undefined;
    }
  }

  public update(dataReport, parseOptionals: boolean = false) {
    if (!utils.includesAll(Object.keys(dataReport), this.requiredData)) {
      throw new Error(`Update on ${this.accessoryId} requires data ${this.requiredData}`);
    } else {
      this.platform.log.debug(`Updating accessory ${this.accessoryId}`);
    }

    const batt = parseFloat(dataReport[`tf_batt${this.channel}`]);
    const batteryLevel = batt / 1.6;
    const lowBattery = batt <= 1.1;

    this.updateBatteryLevel(this.battery, utils.boundRange(batteryLevel * 100));
    this.updateStatusLowBattery(this.battery, lowBattery);

    this.temperature?.update(
      parseFloat(dataReport[`tf_ch${this.channel}`]),
      dataReport.dateutc,
    );
  }
}
