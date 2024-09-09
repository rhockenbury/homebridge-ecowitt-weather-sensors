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
      accessory.services.filter(s => s.subtype === platform.serviceUuid(id))[0]
      || accessory.addService(
        platform.Service.MotionSensor,
        name,
        platform.serviceUuid(id)));

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

  protected updateValue(value: string) {
    this.service.updateCharacteristic(
      utils.CHAR_VALUE_NAME,
      value,
    );
  }

  //----------------------------------------------------------------------------
}
