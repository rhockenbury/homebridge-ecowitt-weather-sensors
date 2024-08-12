import { PlatformAccessory, Characteristic, Formats, Perms, Units } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { MotionSensor } from './MotionSensor';
import * as Util from './../Utils';

//------------------------------------------------------------------------------

export class RainSensor extends MotionSensor {
  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
    protected readonly name: string,
  ) {
    super(platform, accessory, name);

    // custom sensor for value string
    let sensorValueExists = this.service.testCharacteristic(Util.CHAR_VALUE_NAME);
    if (!sensorValueExists) {
      this.service.addCharacteristic(
        new this.platform.api.hap.Characteristic(Util.CHAR_VALUE_NAME, Util.CHAR_VALUE_UUID, {
          format: Formats.STRING,
          perms: [ Perms.PAIRED_READ, Perms.NOTIFY ]
      }));
    }

    // custom sensor for last updated timestamp
    let sensorTimeExists = this.service.testCharacteristic(Util.CHAR_TIME_NAME);
    if (!sensorTimeExists) {
      this.service.addCharacteristic(
        new this.platform.api.hap.Characteristic(Util.CHAR_TIME_NAME, Util.CHAR_TIME_UUID, {
          format: Formats.STRING,
          perms: [ Perms.PAIRED_READ, Perms.NOTIFY ]
      }));
    }

    // custom sensor for intensity string
    if (name.includes('Rate')) {
      let sensorIntensityExists = this.service.testCharacteristic(Util.CHAR_INTENSITY_NAME);
      if (!sensorIntensityExists) {
        this.service.addCharacteristic(
          new this.platform.api.hap.Characteristic(Util.CHAR_INTENSITY_NAME, Util.CHAR_INTENSITY_UUID, {
            format: Formats.STRING,
            perms: [ Perms.PAIRED_READ, Perms.NOTIFY ]
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
      this.updateValue('NaN');
      this.updateIntensity(0);
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
    this.updateName(Util.STATIC_NAMES ? this.name :  `${this.name} ${rateStr}`);
    this.updateValue(rateStr);
    this.updateIntensity(ratemm);
    this.updateTime(time);

    if (!isFinite(threshold)) {
      if (typeof threshold === undefined) {
        this.platform.log.debug(`Cannot update ${this.name} threshold detection, threshold is not set`);
      } else {
        this.platform.log.warn(`Cannot update ${this.name} threshold detection, threshold ${threshold} is NaN`);
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
      this.updateValue('NaN');
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
    this.updateName(Util.STATIC_NAMES ? this.name :  `${this.name} ${totalStr}`);
    this.updateValue(totalStr);
    this.updateTime(time);

    if (!isFinite(threshold)) {
      if (typeof threshold === undefined) {
        this.platform.log.debug(`Cannot update ${this.name} threshold detection, threshold is not set`);
      } else {
        this.platform.log.warn(`Cannot update ${this.name} threshold detection, threshold ${threshold} is NaN`);
      }
      this.updateMotionDetected(false);
      return;
    }

    this.updateMotionDetected(totalmm >= thresholdmm);
  }

  //----------------------------------------------------------------------------

  private updateValue(value: string) {
    this.platform.log.debug(`Setting ${this.name} value to ${value}`);
    this.service.updateCharacteristic(
      Util.CHAR_VALUE_NAME,
      value,
    );
  }

  //----------------------------------------------------------------------------

  private updateTime(time: string) {
    let timeStr = new Date(time).toLocaleString('en-US',
       {timeZone: 'UTC', hour12: false, dateStyle: 'short', timeStyle: 'short'}
    );
    timeStr = `${timeStr} UTC`;

    this.platform.log.debug(`Setting ${this.name} time to ${timeStr}`);
    this.service.updateCharacteristic(
      Util.CHAR_TIME_NAME,
      timeStr,
    );
  }

  //----------------------------------------------------------------------------

  private updateIntensity(ratemm: number) {
    let intensity = this.toIntensity(ratemm);
    this.platform.log.debug(`Setting ${this.name} intensity to ${intensity}`);
    this.service.updateCharacteristic(
      Util.CHAR_INTENSITY_NAME,
      intensity,
    );
  }

  //----------------------------------------------------------------------------

  private toIntensity(ratemm: number): string {
    // classifcations from MANOBS (Manual of Surface Weather Observations)
    if (ratemm <= 0) {
      return 'None';
    } else if (ratemm <= 2.5) {
      return 'Light';
    } else if (ratemm <= 7.5) {
      return 'Moderate';
    } else if (ratemm <= 50.0) {
      return 'Heavy';
    } else {
      return 'Violent';
    }
  }

  //----------------------------------------------------------------------------
}
