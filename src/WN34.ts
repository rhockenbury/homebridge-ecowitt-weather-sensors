import { PlatformAccessory, Service } from 'homebridge';
import { EcowittPlatform } from './EcowittPlatform';
import { EcowittAccessory } from './EcowittAccessory';


export class WN34 extends EcowittAccessory {
  protected temperatureSensor: Service;
  protected battery: Service;

  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
    protected channel: number,
  ) {
    super(platform, accessory);
    this.temperatureSensor = this.accessory.getService(this.platform.Service.TemperatureSensor)
    || this.accessory.addService(this.platform.Service.TemperatureSensor);

    this.setModel(
      'WN34',
      'Wireless Multi-channel Thermometer Sensor');
    this.setSerialNumber(`CH${this.channel}`);

    const name = this.platform.config?.tf_ch?.[`name${this.channel}`];

    this.setName(this.temperatureSensor, name || `CH${this.channel} Temperature`);
    this.battery = this.addBattery('🌡️');
  }

  update(dataReport) {
    const batt = dataReport[`tf_batt${this.channel}`];
    const tempf = dataReport[`tf_ch${this.channel}`];

    this.platform.log.info(`WH31 Channel ${this.channel} Update`);
    this.platform.log.info('  tf_batt:', batt);
    this.platform.log.info('  tf_ch:', tempf);

    const batteryLevel = parseFloat(batt) / 5;
    const lowBattery = batteryLevel <= 0.2;

    this.addBattery(batt);
    this.updateBatteryLevel(this.battery, batteryLevel);
    this.updateStatusLowBattery(this.temperatureSensor, lowBattery);

    this.updateTemperature(tempf);
    this.updateStatusActive(this.temperatureSensor, true);
  }

  updateTemperature(tempf) {
    this.updateCurrentTemperature(this.temperatureSensor, tempf);
  }

}

