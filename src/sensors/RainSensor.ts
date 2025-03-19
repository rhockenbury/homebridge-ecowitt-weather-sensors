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

    let rate: string;
    let rateStr: string;

    switch (this.platform.config?.units?.rain) {
      case 'mm':
        rate = utils.toMm(ratein).toFixed(1);
        rateStr = `${rate} mm/hour`;
        break;

      default:
      case 'in':
        rate = ratein.toFixed(1);
        rateStr = `${rate} in/hour`;
        break;
    }

    const staticNames = utils.truthy(this.platform.config?.additional?.staticNames);
    const shouldTrigger = this.checkTrigger(+rate, threshold, comparator);

    this.updateStatusActive(true);
    this.updateName(staticNames ? this.name : `${this.name} ${rateStr}`);
    this.updateValue(rateStr);
    this.updateIntensity(ratein);
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

    let total: string;
    let totalStr: string;

    switch (this.platform.config?.units?.rain) {
      case 'mm':
        total = utils.toMm(totalin).toFixed(1);
        totalStr = `${total} mm`;
        break;

      default:
      case 'in':
        total = totalin.toFixed(1);
        totalStr = `${total} in`;
        break;
    }

    const staticNames = utils.truthy(this.platform.config?.additional?.staticNames);
    const shouldTrigger = this.checkTrigger(+total, threshold, comparator);

    this.updateStatusActive(true);
    this.updateName(staticNames ? this.name : `${this.name} ${totalStr}`);
    this.updateValue(totalStr);
    this.updateTime(time);
    this.updateMotionDetected(shouldTrigger);
  }

  //----------------------------------------------------------------------------

  private updateIntensity(ratein: number) {
    // add custom characteristic for intensity string
    if (!this.service.testCharacteristic(utils.CHAR_INTENSITY_NAME)) {
      this.service.addCharacteristic(
        new this.platform.api.hap.Characteristic(utils.CHAR_INTENSITY_NAME, utils.CHAR_INTENSITY_UUID, {
          format: Formats.STRING,
          perms: [ Perms.PAIRED_READ, Perms.NOTIFY ],
        }));
    }

    const intensity = utils.toRainIntensity(ratein);
    this.platform.log.debug(`Setting ${this.name} intensity to ${intensity}`);

    this.service.updateCharacteristic(
      utils.CHAR_INTENSITY_NAME,
      intensity,
    );
  }

  //----------------------------------------------------------------------------
}
