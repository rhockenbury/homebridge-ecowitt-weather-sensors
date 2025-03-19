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
    const shouldTrigger = this.checkTrigger(+events.toFixed(0), threshold, comparator);

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

    let distance: string;
    let distanceStr: string;

    switch (this.platform.config?.units?.lightningDistance) {
      case 'km':
        distance = distancekm.toFixed(1);
        distanceStr = `${distance} km`;
        break;

      default:
      case 'mi':
        distance = utils.toMile(distancekm).toFixed(1);
        distanceStr = `${distance} mi`;
        break;
    }

    const staticNames = utils.truthy(this.platform.config?.additional?.staticNames);
    const shouldTrigger = this.checkTrigger(+distance, threshold, comparator);

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

    // value is set to relative time string - https://date-fns.org/v4.1.0/docs/intlFormatDistance
    const timeStr = intlFormatDistance(new Date().getTime() - timems, new Date().getTime());
    const lightningTime = timeStr.split(' ')[0];

    const staticNames = utils.truthy(this.platform.config?.additional?.staticNames);
    const shouldTrigger = this.checkTrigger(+lightningTime, threshold, comparator);

    this.updateStatusActive(true);
    this.updateName(staticNames ? this.name : `${this.name} ${timeStr}`);
    this.updateValue(timeStr);
    this.updateTime(time);
    this.updateMotionDetected(shouldTrigger);
  }

  //---------------------------------------------------------------------------
}
