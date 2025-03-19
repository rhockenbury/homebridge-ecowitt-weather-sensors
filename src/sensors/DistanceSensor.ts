import { PlatformAccessory } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { MotionSensor } from './MotionSensor';
import * as utils from './../Utils';

//------------------------------------------------------------------------------

export class DistanceSensor extends MotionSensor {

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

  public updateDepth(depthmm: number, threshold: number, comparator: string, time: string) {
    if (!Number.isFinite(depthmm)) {
      this.platform.log.warn(`Cannot update ${this.name}, depth ${depthmm} is NaN`);
      this.updateStatusActive(false);
      return;
    }

    let depthStr: string;
    let thresholdmm: number;

    switch (this.platform.config?.units?.laserDistance) {
      case 'mm':
        thresholdmm = threshold;
        depthStr = `${depthmm.toFixed(1)} mm`;
        break;

      case 'mt':
        thresholdmm = threshold * 1000.0;
        depthStr = `${(depthmm / 1000.0).toFixed(1)} m`;
        break;

      case 'ft':
        thresholdmm = (threshold * 12.0) * 25.4;
        depthStr = `${(depthmm / 25.4 / 12.0).toFixed(1)} ft`;
        break;

      default:
      case 'in':
        thresholdmm = threshold * 25.4;
        depthStr = `${(depthmm / 25.4).toFixed(1)} in`;
        break;
    }

    const staticNames = utils.truthy(this.platform.config?.additional?.staticNames);
    const shouldTrigger = this.checkTrigger(depthmm, thresholdmm, comparator);

    this.updateStatusActive(true);
    this.updateName(staticNames ? this.name : `${this.name} ${depthStr}`);
    this.updateValue(depthStr);
    this.updateTime(time);
    this.updateMotionDetected(shouldTrigger);
  }

  //---------------------------------------------------------------------------
}
