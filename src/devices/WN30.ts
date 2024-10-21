import { Service, PlatformAccessory } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { EcowittAccessory } from './../EcowittAccessory';
import { TemperatureSensor } from './../sensors/TemperatureSensor';
import * as utils from './../Utils';

//------------------------------------------------------------------------------

export class WN30 extends EcowittAccessory {
  static readonly properties: string[] = ['temperature'];

  protected battery: Service;
  protected temperature: TemperatureSensor | undefined;

  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
    protected channel: number,
  ) {
    super(platform, accessory, 'WN30', 'WN30 Thermo Sensor', channel);

    this.requiredData = [`batt${this.channel}`, `temp${this.channel}f`];

    this.battery = this.addBattery('', false);

    const hideConfig = this.platform.config?.hidden || {};
    const hidden = Object.keys(hideConfig).filter(k => !!hideConfig[k]);

    if (!utils.includesAny(hidden, ['temperature', `${this.shortServiceId}:temperature`])) {
      const temperatureName = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:temperature`) ||
          utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}`);
      this.temperature = new TemperatureSensor(platform, accessory, `${this.accessoryId}:temperature`, temperatureName || 'Temperature');
    } else {
      this.temperature = new TemperatureSensor(platform, accessory, `${this.accessoryId}:temperature`, 'Temperature');
      this.temperature.removeService();
      this.temperature = undefined;
    }
  }

  //----------------------------------------------------------------------------

  public static requiredData(channel) {
    return [`batt${channel}`, `temp${channel}f`];
  }

  //----------------------------------------------------------------------------

  public update(dataReport) {
    if (!utils.includesAll(Object.keys(dataReport), this.requiredData)) {
      throw new Error(`Update on ${this.accessoryId} requires data ${this.requiredData}`);
    } else {
      this.platform.log.debug(`Updating accessory ${this.accessoryId}`);
    }

    const lowBattery = dataReport[`batt${this.channel}`] === '1';
    this.updateStatusLowBattery(this.battery, lowBattery);

    this.temperature?.update(
      parseFloat(dataReport[`temp${this.channel}f`]),
      dataReport.dateutc,
    );
  }
}
