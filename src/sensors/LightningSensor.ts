import { PlatformAccessory } from 'homebridge';
import { intlFormatDistance } from 'date-fns';
import { EcowittPlatform } from './../EcowittPlatform';
import { MotionSensor } from './MotionSensor';
import * as utils from './../Utils';

//------------------------------------------------------------------------------

export class LightningSensor extends MotionSensor {

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

  public updateLightningEvent(events: number, threshold: number, comparator: string, time: string) {
    if (!Number.isFinite(events)) {
      this.platform.log.warn(`Cannot update ${this.name}, strike events ${events} is NaN`);
      this.updateStatusActive(false);
      return;
    }

    const eventsStr = `${events.toFixed(0)} strikes`;
    const staticNames = utils.truthy(this.platform.config?.additional?.staticNames);
    const shouldTrigger = this.checkTrigger(events, threshold, comparator);

    this.updateStatusActive(true);
    this.updateName(staticNames ? this.name : `${this.name} ${eventsStr}`);
    this.updateValue(eventsStr);
    this.updateTime(time);
    this.updateMotionDetected(shouldTrigger);
  }

  //---------------------------------------------------------------------------

  public updateLightningDistance(distancekm: number, threshold: number, comparator: string, time: string) {
    if (!Number.isFinite(distancekm)) {
      this.platform.log.warn(`Cannot update ${this.name}, strike distance ${distancekm} is NaN`);
      this.updateStatusActive(false);
      return;
    }

    let distanceStr: string;
    let thresholdkm: number;

    switch (this.platform.config?.units?.lightningDistance) {
      case 'km':
        thresholdkm = threshold;
        distanceStr = `${distancekm.toFixed(1)} km`;
        break;

      default:
      case 'mi':
        thresholdkm = threshold * 1.6093;
        distanceStr = `${utils.toMile(distancekm).toFixed(1)} mi`;
        break;
    }

    const staticNames = utils.truthy(this.platform.config?.additional?.staticNames);
    const shouldTrigger = this.checkTrigger(distancekm, thresholdkm, comparator);

    this.updateStatusActive(true);
    this.updateName(staticNames ? this.name : `${this.name} ${distanceStr}`);
    this.updateValue(distanceStr);
    this.updateTime(time);
    this.updateMotionDetected(shouldTrigger);
  }

  //---------------------------------------------------------------------------

  public updateLightningTime(timems: number, threshold: number, comparator: string, time: string) {
    if (!Number.isFinite(timems)) {
      this.platform.log.warn(`Cannot update ${this.name}, strike time ${timems} is NaN`);
      this.updateStatusActive(false);
      return;
    }

    const thresholdms = threshold * 1000;

    // value is set to relative time string - https://date-fns.org/v4.1.0/docs/intlFormatDistance
    const timeStr = intlFormatDistance(new Date().getTime() - timems, new Date().getTime());
    const staticNames = utils.truthy(this.platform.config?.additional?.staticNames);
    const shouldTrigger = this.checkTrigger(timems, thresholdms, comparator);

    this.updateStatusActive(true);
    this.updateName(staticNames ? this.name : `${this.name} ${timeStr}`);
    this.updateValue(timeStr);
    this.updateTime(time);
    this.updateMotionDetected(shouldTrigger);
  }

  //---------------------------------------------------------------------------
}
