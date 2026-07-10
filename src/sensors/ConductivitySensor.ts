import { PlatformAccessory } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { MotionSensor } from './MotionSensor';
import * as utils from './../Utils';

//------------------------------------------------------------------------------

export class ConductivitySensor extends MotionSensor {

  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
    protected readonly id: string,
    protected readonly name: string,
  ) {
    super(platform, accessory, id, name);

    this.setName(name);
    this.setStatusActive(false);
  }

  //---------------------------------------------------------------------------

  public update(conductivityMicrospcm: number, threshold: number, time: string) {
    if (!Number.isFinite(conductivityMicrospcm)) {
      this.platform.log.warn(`Cannot update ${this.name}, conductivity ${conductivityMicrospcm} is NaN`);
      this.updateStatusActive(false);
      return;
    }

    let conductivityStr: string;
    let thresholdMicrospcm: number;

    switch (this.platform.config?.units?.soilConductivity) {
      case 'millispcm':
        thresholdMicrospcm = threshold * 1000.0;
        conductivityStr = `${(conductivityMicrospcm / 1000.0).toFixed(3)} mS/cm`;
        break;

      default:
      case 'microspcm':
        thresholdMicrospcm = threshold;
        conductivityStr = `${conductivityMicrospcm.toFixed(0)} μS/cm`;
        break;
    }

    const staticNames = utils.truthy(this.platform.config?.additional?.staticNames);

    this.updateName(staticNames ? this.name : `${this.name} ${conductivityStr}`);
    this.updateValue(conductivityStr);
    this.updateStatusActive(true);
    this.updateTime(time);

    if (!Number.isFinite(threshold)) {
      if (typeof threshold === 'undefined') {
        this.platform.log.debug(`Cannot update ${this.name} threshold detection, threshold is not set`);
      } else {
        this.platform.log.warn(`Cannot update ${this.name} threshold detection, threshold ${threshold} is NaN. `
          + 'Verify plugin configuration');
      }
      this.updateMotionDetected(false);
      return;
    }

    this.updateMotionDetected(conductivityMicrospcm >= thresholdMicrospcm);
  }

  //---------------------------------------------------------------------------
}