import { PlatformAccessory, Formats, Perms } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { MotionSensor } from './MotionSensor';
import * as utils from './../Utils';

//------------------------------------------------------------------------------

export class RainSensor extends MotionSensor {
  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
    protected readonly name: string,
  ) {
    super(platform, accessory, name);

    // custom characteristic for intensity string
    if (name.includes('Rate') || name.includes('rate')) {
      if (!this.service.testCharacteristic(utils.CHAR_INTENSITY_NAME)) {
        this.service.addCharacteristic(
          new this.platform.api.hap.Characteristic(utils.CHAR_INTENSITY_NAME, utils.CHAR_INTENSITY_UUID, {
            format: Formats.STRING,
            perms: [ Perms.PAIRED_READ, Perms.NOTIFY ],
          }));
      }
    }

    this.setName(name);
  }

  //----------------------------------------------------------------------------

  public updateRate(ratein: number, threshold: number, time: string) {
    if (!isFinite(ratein)) {
      this.platform.log.warn(`Cannot update ${this.name}, rate ${ratein} is NaN`);
      this.updateStatusActive(false);
      this.updateName(this.name);
      this.updateValue('NaN');
      this.updateIntensity(0);
      this.updateMotionDetected(false);
      return;
    }

    let ratemm: number;
    let rateStr: string;
    let thresholdmm: number;

    switch (this.platform.config?.ws?.rain?.units) {
      case 'in':
        ratemm = ratein * 25.4;
        thresholdmm = threshold * 25.4;
        rateStr = `${ratein.toFixed(1)} in/hour`;
        break;

      default:
      case 'mm':
        ratemm = ratein * 25.4;
        thresholdmm = threshold;
        rateStr = `${ratemm.toFixed(1)} mm/hour`;
        break;
    }

    this.updateStatusActive(true);
    this.updateName(utils.STATIC_NAMES ? this.name : `${this.name} ${rateStr}`);
    this.updateValue(rateStr);
    this.updateIntensity(ratemm);
    this.updateTime(time);

    if (!isFinite(threshold)) {
      if (typeof threshold === 'undefined') {
        this.platform.log.debug(`Cannot update ${this.name} threshold detection, threshold is not set`);
      } else {
        this.platform.log.warn(`Cannot update ${this.name} threshold detection, threshold ${threshold} is NaN. Verify plugin configuration.`);
      }
      this.updateMotionDetected(false);
      return;
    }

    this.updateMotionDetected(ratemm >= thresholdmm);
  }

  //----------------------------------------------------------------------------

  public updateTotal(totalin: number, threshold, time: string) {
    if (!isFinite(totalin)) {
      this.platform.log.warn(`Cannot update ${this.name}, total ${totalin} is NaN`);
      this.updateStatusActive(false);
      this.updateName(this.name);
      this.updateValue('NaN');
      this.updateMotionDetected(false);
      return;
    }

    let totalmm: number;
    let totalStr: string;
    let thresholdmm: number;

    switch (this.platform.config?.ws?.rain?.units) {
      case 'in':
        totalmm = totalin * 25.4;
        thresholdmm = threshold * 25.4;
        totalStr = `${totalin.toFixed(1)} in`;
        break;

      default:
      case 'mm':
        totalmm = totalin * 25.4;
        thresholdmm = threshold;
        totalStr = `${totalmm.toFixed(1)} mm`;
        break;
    }

    this.updateStatusActive(true);
    this.updateName(utils.STATIC_NAMES ? this.name : `${this.name} ${totalStr}`);
    this.updateValue(totalStr);
    this.updateTime(time);

    if (!isFinite(threshold)) {
      if (typeof threshold === 'undefined') {
        this.platform.log.debug(`Cannot update ${this.name} threshold detection, threshold is not set`);
      } else {
        this.platform.log.warn(`Cannot update ${this.name} threshold detection, threshold ${threshold} is NaN. Verify plugin configuration.`);
      }
      this.updateMotionDetected(false);
      return;
    }

    this.updateMotionDetected(totalmm >= thresholdmm);
  }

  //----------------------------------------------------------------------------

  private updateIntensity(ratemm: number) {
    const intensity = utils.toRainIntensity(ratemm);
    this.platform.log.debug(`Setting ${this.name} intensity to ${intensity}`);
    this.service.updateCharacteristic(
      utils.CHAR_INTENSITY_NAME,
      intensity,
    );
  }

  //----------------------------------------------------------------------------
}
