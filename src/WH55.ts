import { Service, PlatformAccessory } from "homebridge";
import { EcowittPlatform } from "./EcowittPlatform";
import { EcowittAccessory } from "./EcowittAccessory";

export class WH55 extends EcowittAccessory {
  protected battery: Service;
  protected leakSensor: Service;
  protected name: string;

  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
    protected readonly channel: number
  ) {
    super(
      platform,
      accessory,
      "WH55",
      "Wireless Multi-channel Water Leak Detection Sensor"
    );

    this.setSerialNumber(`CH${this.channel}`);

    this.name =
      this.platform.config?.leak?.[`name${this.channel}`] ||
      `CH${this.channel}`;

    this.leakSensor =
      this.accessory.getService(this.platform.Service.LeakSensor) ||
      this.accessory.addService(this.platform.Service.LeakSensor);

    this.setName(this.leakSensor, this.name);
    //this.setStatusActive(this.leakSensor, false);

    this.battery = this.addBattery(this.name);
  }

  update(dataReport) {
    const leakbatt = dataReport[`leakbatt${this.channel}`];
    const leak = dataReport[`leak_ch${this.channel}`];

    this.platform.log.info(`${this.model} Channel ${this.channel} Update`);
    this.platform.log.info("  leakbatt:", leakbatt);
    this.platform.log.info("  leak:", leak);

    //this.setStatusActive(this.leakSensor, true);

    // Battery

    const batteryLevel = parseFloat(leakbatt) / 5;
    const lowBattery = batteryLevel <= 0.2;

    this.updateBatteryLevel(this.battery, batteryLevel * 100);
    this.updateStatusLowBattery(this.battery, lowBattery);

    // Leak

    this.leakSensor.updateCharacteristic(
      this.platform.Characteristic.LeakDetected,
      leak === "1"
        ? this.platform.Characteristic.LeakDetected.LEAK_DETECTED
        : this.platform.Characteristic.LeakDetected.LEAK_NOT_DETECTED
    );

    this.updateStatusLowBattery(this.leakSensor, lowBattery);
  }
}
