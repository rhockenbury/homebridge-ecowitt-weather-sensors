import { PlatformAccessory } from 'homebridge';
import { EcowittPlatform } from './EcowittPlatform';
import { ThermoHygroBaroSensor } from './ThermoHygroBaroSensor';


export class GW1100 extends ThermoHygroBaroSensor {

  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
  ) {
    super(platform, accessory);

    this.setModel(
      'GW1100',
      /*'WiFi Weather Station */ 'Gateway with Indoor Temperature, Humidity and Barometric Sensor');

    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.ConfiguredName, this.platform.baseStationInfo.deviceName)
      .setCharacteristic(this.platform.Characteristic.HardwareRevision, platform.baseStationInfo.model);
    //  .setCharacteristic(this.platform.Characteristic.SerialNumber, platform.baseStationInfo.serialNumber);
    // .setCharacteristic(this.platform.Characteristic.SoftwareRevision, platform.baseStationInfo.softwareRevision)
    // .setCharacteristic(this.platform.Characteristic.FirmwareRevision, platform.baseStationInfo.firmwareRevision);

    this.setName(this.temperatureSensor, 'Indoor Temperature');
    this.setName(this.humiditySensor, 'Indoor Humidity');
  }

  update(dataReport) {
    this.platform.log.info('GW1100 Update');
    this.platform.log.info('  tempinf:', dataReport.tempinf);
    this.platform.log.info('  humidityin:', dataReport.humidityin);
    this.platform.log.info('  baromrelin', dataReport.baromrelin);
    this.platform.log.info('  baromabsin', dataReport.baromabsin);

    this.updateTemperature(dataReport.tempinf);
    this.updateHumidity(dataReport.humidityin);
    this.updateAbsolutePressure(dataReport.baromabsin);
    this.updateRelativePressure(dataReport.baromrelin);
  }
}

