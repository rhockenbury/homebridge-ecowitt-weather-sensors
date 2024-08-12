import { PlatformAccessory, Formats, Perms } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { MotionSensor } from './MotionSensor';
import * as WindUtil from './../WindUtil.js';
import * as Util from './../Utils';

//------------------------------------------------------------------------------

export class WindSensor extends MotionSensor {
  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
    protected readonly name: string,
  ) {
    super(platform, accessory, name);

    // custom sensor for value string
    if (!this.service.testCharacteristic(Util.CHAR_VALUE_NAME)) {
      this.service.addCharacteristic(
        new this.platform.api.hap.Characteristic(Util.CHAR_VALUE_NAME, Util.CHAR_VALUE_UUID, {
          format: Formats.STRING,
          perms: [ Perms.PAIRED_READ, Perms.NOTIFY ],
        }));
    }

    // custom sensor for intensity string
    if (name.includes('Speed') || name.includes('Gust')) {
      if (!this.service.testCharacteristic(Util.CHAR_INTENSITY_NAME)) {
        this.service.addCharacteristic(
          new this.platform.api.hap.Characteristic(Util.CHAR_INTENSITY_NAME, Util.CHAR_INTENSITY_UUID, {
            format: Formats.STRING,
            perms: [ Perms.PAIRED_READ, Perms.NOTIFY ],
          }));
      }
    }

    this.setName(name);
  }

  //----------------------------------------------------------------------------

  public updateDirection(windDir: number) {
    if (!isFinite(windDir)) {
      this.platform.log.warn(`Cannot update ${this.name}, direction ${windDir} is NaN`);
      this.updateStatusActive(false);
      this.updateValue('NaN');
      return;
    }

    const windDirStr = `${windDir} deg (${WindUtil.toSector(windDir)})`;

    this.updateStatusActive(true);
    this.updateName(Util.STATIC_NAMES ? this.name : `${this.name} ${windDirStr}`);
    this.updateValue(windDirStr);
  }

  //----------------------------------------------------------------------------

  public updateSpeed(windSpeedmph: number, threshold: number) {
    if (!isFinite(windSpeedmph)) {
      this.platform.log.warn(`Cannot update ${this.name}, speed ${windSpeedmph} is NaN`);
      this.updateStatusActive(false);
      this.updateValue('NaN');
      this.updateIntensity(0);
      return;
    }

    let speedStr: string;
    let thresholdmph: number;

    switch (this.platform.config?.ws?.wind?.units) {
      case 'kts':
        thresholdmph = threshold * 1.15078;
        speedStr = `${Math.round(windSpeedmph * 86.897624) / 100} kts`;
        break;

      case 'kmh':
        thresholdmph = threshold * 0.621371;
        speedStr = `${Math.round(windSpeedmph * 16.09344) / 10} km/h`;
        break;

      case 'mps':
        thresholdmph = threshold * 2.23694;
        speedStr = `${Math.round(windSpeedmph * 44.704) / 100} m/s`;
        break;

      default:
      case 'mph':
        thresholdmph = threshold;
        speedStr = `${(windSpeedmph).toFixed(1)} mph`;
        break;
    }

    this.updateStatusActive(true);
    this.updateName(Util.STATIC_NAMES ? this.name : `${this.name} ${speedStr}`);
    this.updateValue(speedStr);
    this.updateIntensity(windSpeedmph);

    if (!isFinite(threshold)) {
      if (typeof threshold === 'undefined') {
        this.platform.log.debug(`Cannot update ${this.name} threshold detection, threshold is not set`);
      } else {
        this.platform.log.warn(`Cannot update ${this.name} threshold detection, threshold ${threshold} is NaN`);
      }
      this.updateMotionDetected(false);
      return;
    }

    this.updateMotionDetected(windSpeedmph >= thresholdmph);
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

  private updateIntensity(windSpeedmph: number) {
    const beaufort = (WindUtil.toBeafort(windSpeedmph)).description;
    this.platform.log.debug(`Setting ${this.name} intensity to ${beaufort}`);
    this.service.updateCharacteristic(
      Util.CHAR_INTENSITY_NAME,
      beaufort,
    );
  }

  //----------------------------------------------------------------------------
}
