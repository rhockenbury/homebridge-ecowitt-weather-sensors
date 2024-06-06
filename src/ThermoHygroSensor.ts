import { Service, PlatformAccessory } from "homebridge";
import { EcowittPlatform } from "./EcowittPlatform";
import { EcowittAccessory } from "./EcowittAccessory";
import { fToC } from "./WindUtil";

export class ThermoHygroSensor extends EcowittAccessory {
  protected temperatureSensor: Service;
  protected humiditySensor: Service;

  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
    protected readonly name: string
  ) {
    super(platform, accessory);

    const tempName = name + "_temp";
    this.temperatureSensor =
      this.accessory.getService(tempName) ||
      this.accessory.addService(
        this.platform.Service.TemperatureSensor,
        tempName,
        this.platform.serviceUuid(tempName)
      );
    this.setConfiguredName(
      this.temperatureSensor,
      "Ecowitt Temperature Sensor"
    );

    const humName = name + "_hum";
    this.humiditySensor =
      this.accessory.getService(humName) ||
      this.accessory.addService(
        this.platform.Service.HumiditySensor,
        humName,
        this.platform.serviceUuid(humName)
      );
    this.setConfiguredName(this.humiditySensor, "Ecowitt Humidity Sensor");
  }

  updateTemperature(tempf) {
    this.updateCurrentTemperature(this.temperatureSensor, tempf);
    this.updateName(
      this.temperatureSensor,
      `Temperature: ${Math.round(fToC(tempf))}°`
    );
  }

  updateHumidity(humidity) {
    this.updateCurrentRelativeHumidity(this.humiditySensor, humidity);
    this.updateName(this.humiditySensor, `Humidity: ${Math.round(humidity)}%`);
  }
}
