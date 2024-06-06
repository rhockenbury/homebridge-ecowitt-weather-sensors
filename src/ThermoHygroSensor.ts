import { Service, PlatformAccessory } from "homebridge";
import { EcowittPlatform } from "./EcowittPlatform";
import { EcowittAccessory } from "./EcowittAccessory";

export class ThermoHygroSensor extends EcowittAccessory {
  protected temperatureSensor: Service;
  protected humiditySensor: Service;

  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory
  ) {
    super(platform, accessory);

    this.temperatureSensor =
      this.accessory.getService(this.platform.Service.TemperatureSensor) ||
      this.accessory.addService(this.platform.Service.TemperatureSensor);
    this.setConfiguredName(
      this.temperatureSensor,
      "Ecowitt Temperature Sensor"
    );

    this.humiditySensor =
      this.accessory.getService(this.platform.Service.HumiditySensor) ||
      this.accessory.addService(this.platform.Service.HumiditySensor);
    this.setConfiguredName(this.humiditySensor, "Ecowitt Humidity Sensor");
  }

  updateTemperature(tempf) {
    this.updateCurrentTemperature(this.temperatureSensor, tempf);
  }

  updateHumidity(humidity) {
    this.updateCurrentRelativeHumidity(this.humiditySensor, humidity);
  }
}
