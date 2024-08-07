import {
  PlatformAccessory /*CharacteristicValue,*/ /*Service*/,
} from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { MotionSensor } from './MotionSensor';

import * as WindUtil from './../WindUtil.js';

//------------------------------------------------------------------------------

import { Characteristic, Formats, Perms, Units } from 'homebridge';

const CHAR_VALUE_NAME = 'Value';
const CHAR_VALUE_UUID = 'dc87b6c3-84ab-41a6-ae13-69fea759ee39';

const CHAR_INTENSITY_NAME = 'Intensity';
const CHAR_INTENSITY_UUID = 'fdd76937-37bb-49f2-b1a0-0705fe548782';

export class WindSensor extends MotionSensor {
  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
    protected readonly name: string,
  ) {
    super(platform, accessory, name);

    // custom sensor for value string
    let sensorValueExists = this.service.testCharacteristic(CHAR_VALUE_NAME);
    if (!sensorValueExists) {
      this.service.addCharacteristic(
        new this.platform.api.hap.Characteristic(CHAR_VALUE_NAME, CHAR_VALUE_UUID, {
          format: Formats.STRING,
          perms: [ Perms.PAIRED_READ, Perms.NOTIFY ]
      }));
    }

    // custom sensor for intensity string
    if (name.includes('Speed') || name.includes('Gust')) {
      let sensorIntensityExists = this.service.testCharacteristic(CHAR_INTENSITY_NAME);
      if (!sensorIntensityExists) {
        this.service.addCharacteristic(
          new this.platform.api.hap.Characteristic(CHAR_INTENSITY_NAME, CHAR_INTENSITY_UUID, {
            format: Formats.STRING,
            perms: [ Perms.PAIRED_READ, Perms.NOTIFY ]
        }));
      }
    }

    this.setName(name);
  }

  //----------------------------------------------------------------------------

  public updateDirection(windDir: number) {
    if (!isFinite(windDir)) {
      this.platform.log.warn(`Cannot update ${this.name}, direction ${windDir} is NAN`);
      this.updateStatusActive(false);
      this.updateValue('NAN');
      return;
    }

    let windDirStr = `${windDir} deg (${WindUtil.toSector(windDir)})`;

    this.updateStatusActive(true);
    this.updateName(this.name);
    this.updateValue(windDirStr);
  }

  //----------------------------------------------------------------------------

  public updateSpeed(windSpeedmph: number, threshold: number) {
    if (!isFinite(windSpeedmph)) {
      this.platform.log.warn(`Cannot update ${this.name}, speed ${windSpeedmph} is NAN`);
      this.updateStatusActive(false);
      this.updateValue('NAN');
      this.updateIntensity(0);
      return;
    }

    let speedStr: string;
    let thresholdmph: number;

    switch (this.platform.config?.ws?.wind?.units) {
      case 'kts':
        thresholdmph = threshold * 1.15078
        speedStr = `${Math.round(windSpeedmph * 86.897624) / 100} kts`;
        break;

      case 'kmh':
        thresholdmph = threshold * 0.621371
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
    this.updateName(this.name);
    this.updateValue(speedStr);
    this.updateIntensity(windSpeedmph);

    if (!isFinite(threshold)) {
      this.platform.log.warn(`Cannot update ${this.name}, threshold ${threshold} is NAN`);
      this.updateMotionDetected(false);
      return;
    }

    this.updateMotionDetected(windSpeedmph >= thresholdmph);
  }

  //----------------------------------------------------------------------------

  private updateValue(value: string) {
    this.platform.log.debug(`Setting ${this.name} value to ${value}`);
    this.service.updateCharacteristic(
      CHAR_VALUE_NAME,
      value,
    );
  }

  //----------------------------------------------------------------------------

  private updateIntensity(windSpeedmph: number) {
    let beaufort = (WindUtil.toBeafort(windSpeedmph)).description;
    this.platform.log.debug(`Setting ${this.name} intensity to ${beaufort}`);
    this.service.updateCharacteristic(
      CHAR_INTENSITY_NAME,
      beaufort,
    );
  }

  //----------------------------------------------------------------------------

}
