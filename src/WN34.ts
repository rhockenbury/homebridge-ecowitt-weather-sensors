import { PlatformAccessory, Service } from 'homebridge';
import { EcowittPlatform } from './EcowittPlatform';
import { EcowittAccessory } from './EcowittAccessory';


export class WN34 extends EcowittAccessory {
  protected temperatureSensor: Service;

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

    const name = this.platform.config?.tf?.[`name${this.channel}`];

    this.setName(this.temperatureSensor, name || `CH${this.channel} Temperature`);
  }

  update(dataReport) {
    const batt = dataReport[`batt${this.channel}`];
    const tempf = dataReport[`ch${this.channel}`];

    this.platform.log.info(`WH31 Channel ${this.channel} Update`);
    this.platform.log.info('  batt:', batt);
    this.platform.log.info('  tempf:', tempf);

    const lowBattery = batt === '1';

    this.updateTemperature(tempf);
    this.updateStatusLowBattery(this.temperatureSensor, lowBattery);
    this.updateStatusActive(this.temperatureSensor, true);

  }

  updateTemperature(tempf) {
    this.updateCurrentTemperature(this.temperatureSensor, tempf);
  }

}

