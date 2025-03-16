import { PlatformAccessory, Formats, Perms } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { MotionSensor } from './MotionSensor';
import * as utils from './../Utils';

//------------------------------------------------------------------------------

export class WindSensor extends MotionSensor {
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

  public updateDirection(windDir: number, threshold: number, comparator: string, time: string) {
    if (!Number.isFinite(windDir)) {
      this.platform.log.warn(`Cannot update ${this.name}, direction ${windDir} is NaN`);
      this.updateStatusActive(false);
      return;
    }

    const windDirStr = `${windDir.toFixed(0)}° (${utils.toWindSector(windDir)})`;
    const staticNames = utils.truthy(this.platform.config?.additional?.staticNames);
    const shouldTrigger = this.checkTrigger(windDir, threshold, comparator);

    this.updateStatusActive(true);
    this.updateName(staticNames ? this.name : `${this.name} ${windDirStr}`);
    this.updateValue(windDirStr);
    this.updateTime(time);
    this.updateMotionDetected(shouldTrigger);
  }

  //----------------------------------------------------------------------------

  public updateSpeed(windSpeedmph: number, threshold: number, comparator: string, time: string) {
    if (!Number.isFinite(windSpeedmph)) {
      this.platform.log.warn(`Cannot update ${this.name}, speed ${windSpeedmph} is NaN`);
      this.updateStatusActive(false);
      return;
    }

    let speedStr: string;
    let thresholdmph: number;

    switch (this.platform.config?.units?.wind) {
      case 'kts':
        thresholdmph = threshold * 1.15078;
        speedStr = `${utils.toKts(windSpeedmph).toFixed(1)} kts`;
        break;

      case 'kph':
        thresholdmph = threshold * 0.621371;
        speedStr = `${utils.toKph(windSpeedmph).toFixed(1)} kph`;
        break;

      case 'mps':
        thresholdmph = threshold * 2.23694;
        speedStr = `${utils.toMps(windSpeedmph).toFixed(1)} mps`;
        break;

      default:
      case 'mph':
        thresholdmph = threshold;
        speedStr = `${windSpeedmph.toFixed(1)} mph`;
        break;
    }

    const staticNames = utils.truthy(this.platform.config?.additional?.staticNames);
    const shouldTrigger = this.checkTrigger(windSpeedmph, thresholdmph, comparator);

    this.updateStatusActive(true);
    this.updateName(staticNames ? this.name : `${this.name} ${speedStr}`);
    this.updateValue(speedStr);
    this.updateIntensity(windSpeedmph);
    this.updateTime(time);
    this.updateMotionDetected(shouldTrigger);
  }

  //----------------------------------------------------------------------------

  private updateIntensity(windSpeedmph: number) {
    // add custom characteristic for intensity string
    if (!this.service.testCharacteristic(utils.CHAR_INTENSITY_NAME)) {
      this.service.addCharacteristic(
        new this.platform.api.hap.Characteristic(utils.CHAR_INTENSITY_NAME, utils.CHAR_INTENSITY_UUID, {
          format: Formats.STRING,
          perms: [ Perms.PAIRED_READ, Perms.NOTIFY ],
        }));
    }

    const beaufort = (utils.toBeafort(windSpeedmph)).description;
    this.platform.log.debug(`Setting ${this.name} intensity to ${beaufort}`)

    this.service.updateCharacteristic(
      utils.CHAR_INTENSITY_NAME,
      beaufort,
    );
  }

  //----------------------------------------------------------------------------
}
