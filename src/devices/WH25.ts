import { Service, PlatformAccessory } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { EcowittAccessory } from './../EcowittAccessory';
import { TemperatureSensor } from './../sensors/TemperatureSensor';
import { HumiditySensor } from './../sensors/HumiditySensor';
import * as utils from './../Utils';

//------------------------------------------------------------------------------

export class WH25 extends EcowittAccessory {
  static readonly properties: string[] = ['indoorTemperature', 'indoorHumidity'];

  protected battery: Service;
  protected temperature: TemperatureSensor | undefined;
  protected humidity: HumiditySensor | undefined;

  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
  ) {
    super(platform, accessory, 'WH25', 'WH25 Indoor Thermo Hygro Baro Sensor');

    this.requiredData = ['wh25batt', 'tempinf', 'humidityin'];
    this.unusedData = ['baromrelin', 'baromabsin'];


    // need to remove existing battery service
    this.battery = this.addBattery('', false);

    //const batteryService = this.accessory.getService(this.platform.Service.Battery);
    // if name == old name -> then remove
    // or just remove it every time???


    const hideConfig = this.platform.config?.hidden || {};
    const hidden = Object.keys(hideConfig).filter(k => !!hideConfig[k]);

    // if (!utils.includesAny(hidden, ['battery', `${this.shortServiceId}:battery`])) {
    //   const batteryName = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:battery`);
    //   this.battery = new BatterySensor(platform, accessory, `${this.accessoryId}:battery`, batteryName || 'Battery');
    //   this.battery.hideService(false);
    // } else {
    //   this.battery = new BatterySensor(platform, accessory, `${this.accessoryId}:battery`, 'Battery');
    //   this.battery.hideService(true);
    // }

    if (!utils.includesAny(hidden, ['indoorTemperature', `${this.shortServiceId}:indoorTemperature`])) {
      const temperatureName = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:indoorTemperature`);
      this.temperature = new TemperatureSensor(platform, accessory,
        `${this.accessoryId}:indoorTemperature`, temperatureName || 'Temperature');
    } else {
      this.temperature = new TemperatureSensor(platform, accessory, `${this.accessoryId}:indoorTemperature`, 'Temperature');
      this.temperature.removeService();
      this.temperature = undefined;
    }

    if (!utils.includesAny(hidden, ['indoorHumidity', `${this.shortServiceId}:indoorHumidity`])) {
      const humidityName = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:indoorHumidity`);
      this.humidity = new HumiditySensor(platform, accessory,
        `${this.accessoryId}:indoorHumidity`, humidityName || 'Humidity');
    } else {
      this.humidity = new HumiditySensor(platform, accessory, `${this.accessoryId}:indoorHumidity`, 'Humidity');
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

    // this.battery?.updateStatusLow(
    //   dataReport.wh25batt === '1',
    //   dataReport.dateutc,
    // )

    this.temperature?.update(
      parseFloat(dataReport.tempinf),
      dataReport.dateutc,
    );

    this.humidity?.update(
      parseFloat(dataReport.humidityin),
      dataReport.dateutc,
    );
  }
}
