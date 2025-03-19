import { PlatformAccessory, Formats, Perms } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { Sensor } from './Sensor';
import * as utils from './../Utils';

//------------------------------------------------------------------------------

export class MotionSensor extends Sensor {

  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
    protected readonly id: string,
    protected readonly name: string,
  ) {

    super(platform,
      accessory,
      accessory.services.filter(s => s.subtype === id)[0]
      || accessory.addService(
        platform.Service.MotionSensor,
        name,
        id));

    // custom characteristic for value string
    if (!this.service.testCharacteristic(utils.CHAR_VALUE_NAME)) {
      this.service.addCharacteristic(
        new this.platform.api.hap.Characteristic(utils.CHAR_VALUE_NAME, utils.CHAR_VALUE_UUID, {
          format: Formats.STRING,
          perms: [ Perms.PAIRED_READ, Perms.NOTIFY ],
        }));
    }
  }

  //---------------------------------------------------------------------------

  protected setMotionDetected(motionDetected: boolean) {
    this.service.setCharacteristic(
      this.platform.Characteristic.MotionDetected,
      motionDetected);
  }

  protected updateMotionDetected(motionDetected: boolean) {
    this.service.updateCharacteristic(
      this.platform.Characteristic.MotionDetected,
      motionDetected);
  }

  //---------------------------------------------------------------------------

  private defaultTrigger(value, priorValue) {
    let result = false;

    switch (this.platform.config?.additional?.triggerMode) {
      case 'toZero':
        if (value === 0 && priorValue > 0) {
          result = true;
        }
        break;

      case 'fromZero':
        if (priorValue === 0 && value > 0) {
          result = true;
        }
        break;

      case 'tofromZero':
        if ((value === 0 && priorValue > 0) || (priorValue === 0 && value > 0)) {
          result = true;
        }
        break;

      default:
      case 'all':
        if (value !== priorValue) {
          result = true;
        }
        break;

    }

    return result;
  }

  //---------------------------------------------------------------------------

  private customTrigger(value, threshold, comparator) {
    if (!Number.isFinite(threshold)) {
      this.platform.log.warn(`Cannot update ${this.name} threshold detection, ` +
        `threshold ${threshold} is NaN`);
      return false;
    }

    let result = false;

    if (comparator === 'gt') {
      if (value >= threshold) {
        result = true;
      }
    } else if (comparator === 'lt') {
      if (value < threshold) {
        result = true;
      }
    } else {
      this.platform.log.warn(`Cannot update ${this.name} threshold detection, ` +
        `comparator ${comparator} not recognized`);
      result = false;
    }

    return result;
  }

  //---------------------------------------------------------------------------

  protected checkTrigger(value: number, threshold: number, comparator: string) {
    if (threshold === undefined || comparator === undefined) {
      // default threshold triggering
      this.platform.log.debug(`Threshold or comparator is not defined for ${this.name}, ` +
        'using default trigger behavior');

      const charValue = String(this.service.getCharacteristic(utils.CHAR_VALUE_NAME)?.value);

      if (typeof charValue !== 'string' || charValue === 'null' || charValue?.length === 0) {
        return false;
      }

      const priorValue = parseFloat(charValue.split(' ')[0]);
      return this.defaultTrigger(value, priorValue);

    } else {
      // user-defined threshold
      return this.customTrigger(value, threshold, comparator);
    }

    return false;
  }

  //---------------------------------------------------------------------------

  protected updateValue(value: string) {
    this.service.updateCharacteristic(
      utils.CHAR_VALUE_NAME,
      value,
    );
  }

  //----------------------------------------------------------------------------
}
