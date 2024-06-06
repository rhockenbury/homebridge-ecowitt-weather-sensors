import { Service, PlatformAccessory /*ServiceEventTypes*/ } from "homebridge";
import { EcowittPlatform } from "./EcowittPlatform";
import { ThermoHygroBaroSensor } from "./ThermoHygroBaroSensor";

//------------------------------------------------------------------------------

export class GW2000 extends ThermoHygroBaroSensor {
  protected indoorTemperature: Service;
  protected indoorHumidity: Service;
  // TODO: Add Barometric data.

  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory
  ) {
    super(platform, accessory);

    this.setModel(
      "GW2000",
      "Gateway with Indoor Temperature, Humidity and Barometric Sensor"
    );

    this.accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(
        this.platform.Characteristic.ConfiguredName,
        this.platform.baseStationInfo.deviceName
      )
      .setCharacteristic(
        this.platform.Characteristic.HardwareRevision,
        platform.baseStationInfo.model
      );

    const nameInTemp = "Indoor Temperature";
    this.indoorTemperature =
      this.accessory.getService(nameInTemp) ||
      this.accessory.addService(
        this.platform.Service.TemperatureSensor,
        nameInTemp,
        this.platform.serviceUuid(nameInTemp)
      );

    const nameInHum = "Indoor Humidity";
    this.indoorHumidity =
      this.accessory.getService(nameInHum) ||
      this.accessory.addService(
        this.platform.Service.HumiditySensor,
        nameInHum,
        this.platform.serviceUuid(nameInHum)
      );
    this.indoorHumidity.displayName = nameInHum;

    this.setName(this.indoorTemperature, "Indoor Temperature");
    this.setName(this.indoorHumidity, "Indoor Humidity");
  }

  update(dataReport) {
    this.platform.log.info("GW2000 Update");
    this.platform.log.info("  tempinf:", dataReport.tempinf);
    this.platform.log.info("  humidityin:", dataReport.humidityin);
    this.platform.log.info("  baromrelin:", dataReport.baromrelin);
    this.platform.log.info("  baromabsin:", dataReport.baromabsin);

    this.updateStatusActive(this.indoorTemperature, true);
    this.updateStatusActive(this.indoorHumidity, true);

    this.updateCurrentTemperature(this.indoorTemperature, dataReport.tempinf);
    this.updateCurrentRelativeHumidity(
      this.indoorHumidity,
      dataReport.humidityin
    );

    this.updateRelativePressure(dataReport.baromrelin);
    this.updateAbsolutePressure(dataReport.baromabsin);
  }
}
