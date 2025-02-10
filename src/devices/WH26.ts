import { PlatformAccessory } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { EcowittAccessory } from './../EcowittAccessory';
import { TemperatureSensor } from './../sensors/TemperatureSensor';
import { HumiditySensor } from './../sensors/HumiditySensor';
import { BatterySensor } from './../sensors/BatterySensor';
import * as utils from './../Utils';

//------------------------------------------------------------------------------

export class WH26 extends EcowittAccessory {
  static readonly properties: string[] = ['temperature', 'humidity'];

  protected battery: BatterySensor | undefined;
  protected temperature: TemperatureSensor | undefined;
  protected humidity: HumiditySensor | undefined;

  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
  ) {
    super(platform, accessory, 'WH26', 'WH26 Outdoor Thermo Hygro Sensor');

    this.requiredData = ['wh26batt', 'tempf', 'humidity'];

    const hideConfig = this.platform.config?.hidden || {};
    const hidden = Object.keys(hideConfig).filter(k => !!hideConfig[k]);

    if (!utils.includesAny(hidden, ['battery', `${this.shortServiceId}:battery`])) {
      const batteryName = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:battery`);
      this.battery = new BatterySensor(platform, accessory, `${this.accessoryId}:battery`, batteryName || 'Battery');
    } else {
      this.battery = new BatterySensor(platform, accessory, `${this.accessoryId}:battery`, 'Battery');
      this.battery.removeService();
      this.battery = undefined;
    }

    if (!utils.includesAny(hidden, ['temperature', `${this.shortServiceId}:temperature`])) {
      const temperatureName = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:temperature`);
      this.temperature = new TemperatureSensor(platform, accessory, `${this.accessoryId}:temperature`, temperatureName || 'Temperature');
    } else {
      this.temperature = new TemperatureSensor(platform, accessory, `${this.accessoryId}:temperature`, 'Temperature');
      this.temperature.removeService();
      this.temperature = undefined;
    }

    if (!utils.includesAny(hidden, ['humidity', `${this.shortServiceId}:humidity`])) {
      const humidityName = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:humidity`);
      this.humidity = new HumiditySensor(platform, accessory, `${this.accessoryId}:humidity`, humidityName || 'Humidity');
    } else {
      this.humidity = new HumiditySensor(platform, accessory, `${this.accessoryId}:humidity`, 'Humidity');
      this.humidity.removeService();
      this.humidity = undefined;
    }
  }

  //----------------------------------------------------------------------------

  public update(dataReport) {
    if (!utils.includesAll(Object.keys(dataReport), this.requiredData)) {
      throw new Error(`Update on ${this.accessoryId} requires data ${this.requiredData}`);
    } else {
      this.platform.log.debug(`Updating accessory ${this.accessoryId}`);
    }

    this.battery?.updateStatusLow(
      dataReport.wh26batt === '1',
      dataReport.dateutc,
    );

    this.temperature?.update(
      parseFloat(dataReport['tempf']),
      dataReport.dateutc,
    );

    this.humidity?.update(
      parseFloat(dataReport['humidity']),
      dataReport.dateutc,
    );
  }
}
