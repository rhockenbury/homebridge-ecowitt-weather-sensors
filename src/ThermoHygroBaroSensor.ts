import { /*Service,*/ PlatformAccessory } from "homebridge";
import { EcowittPlatform } from "./EcowittPlatform";
import { ThermoHygroSensor } from "./ThermoHygroSensor";
import { OccupancySensor } from "./OccupancySensor";

import * as Utils from "./Utils.js";

//------------------------------------------------------------------------------

export class ThermoHygroBaroSensor extends ThermoHygroSensor {
  protected absolutePressureSensor: OccupancySensor;
  protected relativePressureSensor: OccupancySensor;

  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
    protected readonly name: string
  ) {
    super(platform, accessory, name);

    this.absolutePressureSensor = new OccupancySensor(
      platform,
      accessory,
      "Absolute Pressure"
    );
    this.relativePressureSensor = new OccupancySensor(
      platform,
      accessory,
      "Relative Pressure"
    );
  }

  updateRelativePressure(baromabs) {
    this.absolutePressureSensor.updateName(
      `Abs. Pressure: ${Math.round(Utils.tohPa(baromabs)).toString()} hPa`
    );
  }

  updateAbsolutePressure(baromrel) {
    this.relativePressureSensor.updateName(
      `Rel. Pressure: ${Math.round(Utils.tohPa(baromrel)).toString()} hPa`
    );
  }
}
