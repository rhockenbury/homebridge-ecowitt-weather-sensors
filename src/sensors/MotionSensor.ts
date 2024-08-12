import { PlatformAccessory /*CharacteristicValue,*/ /*Service*/ } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { Sensor } from './Sensor';

//------------------------------------------------------------------------------

export class MotionSensor extends Sensor {

  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
    protected readonly name: string,
  ) {

    super(platform,
      accessory,
      accessory.getService(name)
      || accessory.addService(
        platform.Service.MotionSensor,
        name,
        platform.serviceUuid(name)));
  }

  //---------------------------------------------------------------------------

  setMotionDetected(motionDetected: boolean) {
    this.service.setCharacteristic(
      this.platform.Characteristic.MotionDetected,
      motionDetected);
  }

  updateMotionDetected(motionDetected: boolean) {
    this.service.updateCharacteristic(
      this.platform.Characteristic.MotionDetected,
      motionDetected);
  }

  //---------------------------------------------------------------------------
}
