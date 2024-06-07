import { PlatformAccessory } from 'homebridge';
import { EcowittPlatform } from './EcowittPlatform';
import { ThermoHygroSensor } from './ThermoHygroSensor';

//------------------------------------------------------------------------------

export class ThermoHygroBaroSensor extends ThermoHygroSensor {
  // TODO: Not supported by HomeKit yet.
  // protected absolutePressureSensor: OccupancySensor;
  // protected relativePressureSensor: OccupancySensor;

  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
    protected readonly model: string,
    protected readonly modelName: string,
  ) {
    super(platform, accessory, model, modelName);

    // TODO: Not supported by HomeKit yet.
    // this.absolutePressureSensor = new OccupancySensor(
    //   platform,
    //   accessory,
    //   "Absolute Pressure"
    // );
    // this.relativePressureSensor = new OccupancySensor(
    //   platform,
    //   accessory,
    //   "Relative Pressure"
    // );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateRelativePressure(baromabs) {
    // TODO: Not supported by HomeKit yet.
    // this.absolutePressureSensor.updateName(
    //   `Abs. Pressure: ${Math.round(Utils.tohPa(baromabs)).toString()} hPa`
    // );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateAbsolutePressure(baromrel) {
    // TODO: Not supported by HomeKit yet.
    // this.relativePressureSensor.updateName(
    //   `Rel. Pressure: ${Math.round(Utils.tohPa(baromrel)).toString()} hPa`
    // );
  }
}
