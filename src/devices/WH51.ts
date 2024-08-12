import { Service, PlatformAccessory } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { EcowittAccessory } from './../EcowittAccessory';

export class WH51 extends EcowittAccessory {
  protected battery: Service;
  protected soilMoistureSensor: Service;
  protected name: string;

  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
    protected readonly channel: number,
  ) {
    super(platform, accessory, 'WH51', 'Wireless Soil Moisture Sensor');

    this.name =
      this.platform.config?.soil?.[`name${this.channel}`] ||
      `CH${this.channel} Soil Moisture`;

    this.setSerialNumber(`CH${this.channel}`);

    this.battery = this.addBattery(this.name);

    this.soilMoistureSensor =
      this.accessory.getService(this.platform.Service.HumiditySensor) ||
      this.accessory.addService(this.platform.Service.HumiditySensor);

    this.setName(this.soilMoistureSensor, this.name);
    this.setStatusActive(this.soilMoistureSensor, false);
  }

  update(dataReport) {
    const soilbatt = dataReport[`soilbatt${this.channel}`];
    const soilmoisture = dataReport[`soilmoisture${this.channel}`];

    this.platform.log.debug(`${this.model} Channel ${this.channel} Update`);
    this.platform.log.debug('  soilbatt:', soilbatt);
    this.platform.log.debug('  soilmoisture:', soilmoisture);

    this.setStatusActive(this.soilMoistureSensor, true);

    const voltage = parseFloat(soilbatt);
    const lowBattery = voltage <= 1.1;

    this.updateBatteryLevel(this.battery, Math.min(100, (voltage / 1.6) * 100));
    this.updateStatusLowBattery(this.battery, lowBattery);

    this.updateCurrentRelativeHumidity(
      this.soilMoistureSensor,
      parseFloat(soilmoisture),
    );
    this.updateStatusLowBattery(this.soilMoistureSensor, lowBattery);
  }
}
