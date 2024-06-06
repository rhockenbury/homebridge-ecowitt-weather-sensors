import { Service, PlatformAccessory } from "homebridge";
import { EcowittPlatform } from "./EcowittPlatform";
import { EcowittAccessory } from "./EcowittAccessory";

export class ThermoHygroSensor extends EcowittAccessory {
  protected temperatureSensor: Service;
  protected humiditySensor: Service;

  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
    protected readonly model: string,
    protected readonly modelName: string
  ) {
    super(platform, accessory, model, modelName);

    const tempName = "Temperature Sensor";
    this.temperatureSensor =
      this.accessory.getService(tempName) ||
      this.accessory.addService(
        this.platform.Service.TemperatureSensor,
        tempName,
        this.platform.serviceUuid(tempName)
      );

    this.temperatureSensor.addCharacteristic(this.platform.Characteristic.Name);

    this.setName(this.temperatureSensor, `${this.model} ${tempName}`);

    const humName = "Humidity Sensor";
    this.humiditySensor =
      this.accessory.getService(humName) ||
      this.accessory.addService(
        this.platform.Service.HumiditySensor,
        humName,
        this.platform.serviceUuid(humName)
      );

    this.humiditySensor.addCharacteristic(this.platform.Characteristic.Name);

    this.setName(this.humiditySensor, `${this.model} ${humName}`);
  }

  updateTemperature(tempf: number) {
    this.updateCurrentTemperature(this.temperatureSensor, tempf);
  }

  updateHumidity(humidity: number) {
    this.updateCurrentRelativeHumidity(this.humiditySensor, humidity);
  }
}
