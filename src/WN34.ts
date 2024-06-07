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
    super(
      platform,
      accessory,
      'WN34',
      'Wireless Multi-channel Thermometer Sensor',
    );

    this.temperatureSensor =
      this.accessory.getService(this.platform.Service.TemperatureSensor) ||
      this.accessory.addService(this.platform.Service.TemperatureSensor);

    this.setSerialNumber(`CH${this.channel}`);

    const name = this.platform.config?.tf?.[`name${this.channel}`];

    this.setName(
      this.temperatureSensor,
      name || `CH${this.channel} Temperature`,
    );
    this.battery = this.addBattery(name || `CH${this.channel} Temperature`);
  }

  update(dataReport) {
    const batt = dataReport[`tf_batt${this.channel}`];
    const tempf = dataReport[`tf_ch${this.channel}`];

    this.platform.log.info(`${this.model} Channel ${this.channel} Update`);
    this.platform.log.info('  tf_batt:', batt);
    this.platform.log.info('  tf_ch:', tempf);

    const voltage = parseFloat(batt);
    const lowBattery = voltage <= 1.1;

    this.updateBatteryLevel(this.battery, (voltage / 1.6) * 100);
    this.updateStatusLowBattery(this.battery, lowBattery);

    this.updateTemperature(tempf);
    this.updateStatusActive(this.temperatureSensor, true);
  }

  updateTemperature(tempf) {
    this.updateCurrentTemperature(this.temperatureSensor, tempf);
  }
}
