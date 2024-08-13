import { PlatformAccessory } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { Sensor } from './Sensor';

//------------------------------------------------------------------------------

export class ContactSensor extends Sensor {

  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
    protected readonly name: string,
  ) {

    super(platform,
      accessory,
      accessory.getService(name)
      || accessory.addService(
        platform.Service.ContactSensor,
        name,
        platform.serviceUuid(name)));
  }

  //---------------------------------------------------------------------------

  private updateState(detected: boolean) {
    this.service.updateCharacteristic(
      this.platform.Characteristic.ContactSensorState,
      detected
        ? this.platform.Characteristic.ContactSensorState.CONTACT_DETECTED
        : this.platform.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED);
  }

  //---------------------------------------------------------------------------
}
