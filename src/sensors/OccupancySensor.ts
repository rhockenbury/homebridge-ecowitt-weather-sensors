import { PlatformAccessory /*CharacteristicValue,*/ /*Service*/ } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { Sensor } from './Sensor';

//------------------------------------------------------------------------------

export class OccupancySensor extends Sensor {

  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
    protected readonly name: string,
  ) {

    super(platform,
      accessory,
      accessory.getService(name)
      || accessory.addService(
        platform.Service.OccupancySensor,
        name,
        platform.serviceUuid(name)));
  }

  //---------------------------------------------------------------------------

  setOccupancyDetected(occupancyDetected: boolean) {
    this.service.setCharacteristic(
      this.platform.Characteristic.OccupancyDetected,
      occupancyDetected
        ? this.platform.Characteristic.OccupancyDetected.OCCUPANCY_DETECTED
        : this.platform.Characteristic.OccupancyDetected.OCCUPANCY_NOT_DETECTED);
  }

  updateOccupancyDetected(occupancyDetected: boolean) {
    this.service.updateCharacteristic(
      this.platform.Characteristic.OccupancyDetected,
      occupancyDetected
        ? this.platform.Characteristic.OccupancyDetected.OCCUPANCY_DETECTED
        : this.platform.Characteristic.OccupancyDetected.OCCUPANCY_NOT_DETECTED);
  }

  //---------------------------------------------------------------------------
}
