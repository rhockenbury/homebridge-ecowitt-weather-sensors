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

    // custom characteristic for intensity string
    if (name.includes('Speed') || name.includes('speed') || name.includes('Gust') || name.includes('gust')) {
      if (!this.service.testCharacteristic(utils.CHAR_INTENSITY_NAME)) {
        this.service.addCharacteristic(
          new this.platform.api.hap.Characteristic(utils.CHAR_INTENSITY_NAME, utils.CHAR_INTENSITY_UUID, {
            format: Formats.STRING,
            perms: [ Perms.PAIRED_READ, Perms.NOTIFY ],
          }));
      }
    }

    this.setName(name);
    this.setStatusActive(false);
  }

  //----------------------------------------------------------------------------

  public updateDirection(windDir: number, time: string) {
    if (!Number.isFinite(windDir)) {
      this.platform.log.warn(`Cannot update ${this.name}, direction ${windDir} is NaN`);
      this.updateStatusActive(false);
      return;
    }

    const windDirStr = `${windDir.toFixed(0)}° (${utils.toWindSector(windDir)})`;
    const staticNames = utils.truthy(this.platform.config?.additional?.staticNames);

    this.updateStatusActive(true);
    this.updateName(staticNames ? this.name : `${this.name} ${windDirStr}`);
    this.updateValue(windDirStr);
    this.updateTime(time);
  }

  //----------------------------------------------------------------------------

  public updateSpeed(windSpeedmph: number, threshold: number, time: string) {
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

      case 'kmh':
        thresholdmph = threshold * 0.621371;
        speedStr = `${utils.toKmh(windSpeedmph).toFixed(1)} kmh`;
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

    this.updateStatusActive(true);
    this.updateName(staticNames ? this.name : `${this.name} ${speedStr}`);
    this.updateValue(speedStr);
    this.updateIntensity(windSpeedmph);
    this.updateTime(time);

    if (!Number.isFinite(threshold)) {
      if (typeof threshold === 'undefined') {
        this.platform.log.debug(`Cannot update ${this.name} threshold detection, threshold is not set`);
      } else {
        this.platform.log.warn(`Cannot update ${this.name} threshold detection, threshold ${threshold} is NaN. `
          + 'Verify plugin configuration');
      }
      this.updateMotionDetected(false);
      return;
    }

    this.updateMotionDetected(windSpeedmph >= thresholdmph);
  }

  //----------------------------------------------------------------------------

  private updateIntensity(windSpeedmph: number) {
    const beaufort = (utils.toBeafort(windSpeedmph)).description;
    this.platform.log.debug(`Setting ${this.name} intensity to ${beaufort}`);
    this.service.updateCharacteristic(
      utils.CHAR_INTENSITY_NAME,
      beaufort,
    );
  }

  //----------------------------------------------------------------------------
}
