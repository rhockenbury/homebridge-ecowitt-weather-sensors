import { PlatformAccessory } from "homebridge";
import { EcowittPlatform } from "./EcowittPlatform";
import { ThermoHygroSensor } from "./ThermoHygroSensor";

export class WH31 extends ThermoHygroSensor {
  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
    protected channel: number
  ) {
    super(
      platform,
      accessory,
      "WH31",
      "Wireless Multi-channel Thermometer and Hygrometer Sensor"
    );

    this.setSerialNumber(`CH${this.channel}`);

    const name = this.platform.config?.th?.[`name${this.channel}`];

    this.setName(
      this.temperatureSensor,
      name || `CH${this.channel} Temperature`
    );
    this.setName(this.humiditySensor, name || `CH${this.channel} Humidity`);
  }

  update(dataReport) {
    const batt = dataReport[`batt${this.channel}`];
    const tempf = dataReport[`temp${this.channel}f`];
    const humidity = dataReport[`humidity${this.channel}`];

    this.platform.log.info(`${this.model} Channel ${this.channel} Update`);
    this.platform.log.info("  batt:", batt);
    this.platform.log.info("  tempf:", tempf);
    this.platform.log.info("  humidity:", humidity);

    const lowBattery = batt === "1";

    this.updateTemperature(tempf);
    this.updateStatusLowBattery(this.temperatureSensor, lowBattery);
    this.updateStatusActive(this.temperatureSensor, true);

    this.updateHumidity(humidity);
    this.updateStatusLowBattery(this.humiditySensor, lowBattery);
    this.updateStatusActive(this.humiditySensor, true);
  }
}
