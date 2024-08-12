import { PlatformAccessory /*ServiceEventTypes*/ } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { ThermoHygroBaroSensor } from './../ThermoHygroBaroSensor';

//------------------------------------------------------------------------------

export class GW2000 extends ThermoHygroBaroSensor {
  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
  ) {
    super(platform, accessory, 'GW2000', 'Ecowitt GW2000');

    this.accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(
        this.platform.Characteristic.ConfiguredName,
        this.platform.baseStationInfo.deviceName,
      )
      .setCharacteristic(
        this.platform.Characteristic.HardwareRevision,
        platform.baseStationInfo.model,
      );
  }

  update(dataReport) {
    this.platform.log.debug(`${this.model} Update`);
    this.platform.log.debug('  tempinf:', dataReport.tempinf);
    this.platform.log.debug('  humidityin:', dataReport.humidityin);
    this.platform.log.debug('  baromrelin:', dataReport.baromrelin);
    this.platform.log.debug('  baromabsin:', dataReport.baromabsin);

    this.updateStatusActive(this.temperatureSensor, true);
    this.updateStatusActive(this.humiditySensor, true);

    this.updateCurrentTemperature(this.temperatureSensor, dataReport.tempinf);
    this.updateCurrentRelativeHumidity(
      this.humiditySensor,
      dataReport.humidityin,
    );

    this.updateRelativePressure(dataReport.baromrelin);
    this.updateAbsolutePressure(dataReport.baromabsin);
  }
}
