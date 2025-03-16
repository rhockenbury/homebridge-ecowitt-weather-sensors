import { PlatformAccessory, Formats, Perms } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { MotionSensor } from './MotionSensor';
import * as utils from './../Utils';

//------------------------------------------------------------------------------

export class UltravioletSensor extends MotionSensor {

  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
    protected readonly id: string,
    protected readonly name: string,
  ) {
    super(platform, accessory, id, name);

    // custom characteristic for intensity string
    if (!this.service.testCharacteristic(utils.CHAR_INTENSITY_NAME)) {
      this.service.addCharacteristic(
        new this.platform.api.hap.Characteristic(utils.CHAR_INTENSITY_NAME, utils.CHAR_INTENSITY_UUID, {
          format: Formats.STRING,
          perms: [ Perms.PAIRED_READ, Perms.NOTIFY ],
        }));
    }

    this.setName(name);
    this.setStatusActive(false);
  }

  //---------------------------------------------------------------------------

  public update(index: number, threshold: number, comparator: string, time: string) {
    if (!Number.isFinite(index)) {
      this.platform.log.warn(`Cannot update ${this.name}, UV Index ${index} is NaN`);
      this.updateStatusActive(false);
      return;
    }

    const uvIndexStr = `${index.toFixed(0)}`;
    const staticNames = utils.truthy(this.platform.config?.additional?.staticNames);
    const shouldTrigger = this.checkTrigger(index, threshold, comparator);

    this.updateName(staticNames ? this.name : `${this.name} ${uvIndexStr}`);
    this.updateValue(uvIndexStr);
    this.updateIntensity(index);
    this.updateStatusActive(true);
    this.updateTime(time);
    this.updateMotionDetected(shouldTrigger);
  }

  //---------------------------------------------------------------------------

  private updateIntensity(index: number) {
    const intensity = (utils.toUVRiskLevel(index)).risk;
    this.platform.log.debug(`Setting ${this.name} intensity to ${intensity}`);
    this.service.updateCharacteristic(
      utils.CHAR_INTENSITY_NAME,
      intensity,
    );
  }

  //---------------------------------------------------------------------------
}
