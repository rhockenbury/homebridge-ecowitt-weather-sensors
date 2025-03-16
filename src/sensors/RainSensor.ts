import { PlatformAccessory, Formats, Perms } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { MotionSensor } from './MotionSensor';
import * as utils from './../Utils';

//------------------------------------------------------------------------------

export class RainSensor extends MotionSensor {
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

  //----------------------------------------------------------------------------

  public updateRate(ratein: number, threshold: number, comparator: string, time: string) {
    if (!Number.isFinite(ratein)) {
      this.platform.log.warn(`Cannot update ${this.name}, rate ${ratein} is NaN`);
      this.updateStatusActive(false);
      return;
    }

    let ratemm: number;
    let rateStr: string;
    let thresholdmm: number;

    switch (this.platform.config?.units?.rain) {
      case 'mm':
        ratemm = ratein * 25.4;
        thresholdmm = threshold;
        rateStr = `${ratemm.toFixed(1)} mm/hour`;
        break;

      default:
      case 'in':
        ratemm = ratein * 25.4;
        thresholdmm = threshold * 25.4;
        rateStr = `${ratein.toFixed(1)} in/hour`;
        break;
    }

    const staticNames = utils.truthy(this.platform.config?.additional?.staticNames);
    const shouldTrigger = this.checkTrigger(ratemm, thresholdmm, comparator);

    this.updateStatusActive(true);
    this.updateName(staticNames ? this.name : `${this.name} ${rateStr}`);
    this.updateValue(rateStr);
    this.updateIntensity(ratemm);
    this.updateTime(time);
    this.updateMotionDetected(shouldTrigger);
  }

  //----------------------------------------------------------------------------

  public updateTotal(totalin: number, threshold: number, comparator: string, time: string) {
    if (!Number.isFinite(totalin)) {
      this.platform.log.warn(`Cannot update ${this.name}, total ${totalin} is NaN`);
      this.updateStatusActive(false);
      return;
    }

    let totalmm: number;
    let totalStr: string;
    let thresholdmm: number;

    switch (this.platform.config?.units?.rain) {
      case 'mm':
        totalmm = totalin * 25.4;
        thresholdmm = threshold;
        totalStr = `${totalmm.toFixed(1)} mm`;
        break;

      default:
      case 'in':
        totalmm = totalin * 25.4;
        thresholdmm = threshold * 25.4;
        totalStr = `${totalin.toFixed(1)} in`;
        break;
    }

    const staticNames = utils.truthy(this.platform.config?.additional?.staticNames);
    const shouldTrigger = this.checkTrigger(totalmm, thresholdmm, comparator);

    this.updateStatusActive(true);
    this.updateName(staticNames ? this.name : `${this.name} ${totalStr}`);
    this.updateValue(totalStr);
    this.updateTime(time);
    this.updateMotionDetected(shouldTrigger);
  }

  //----------------------------------------------------------------------------

  private updateIntensity(ratemm: number) {
    // add custom characteristic for intensity string
    if (!this.service.testCharacteristic(utils.CHAR_INTENSITY_NAME)) {
      this.service.addCharacteristic(
        new this.platform.api.hap.Characteristic(utils.CHAR_INTENSITY_NAME, utils.CHAR_INTENSITY_UUID, {
          format: Formats.STRING,
          perms: [ Perms.PAIRED_READ, Perms.NOTIFY ],
        }));
    }

    const intensity = utils.toRainIntensity(ratemm);
    this.platform.log.debug(`Setting ${this.name} intensity to ${intensity}`);

    this.service.updateCharacteristic(
      utils.CHAR_INTENSITY_NAME,
      intensity,
    );
  }

  //----------------------------------------------------------------------------
}
