import { PlatformAccessory, Formats, Perms } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { Sensor } from './Sensor';
import * as utils from './../Utils';

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

    // custom characteristic for value string
    if (!this.service.testCharacteristic(utils.CHAR_VALUE_NAME)) {
      this.service.addCharacteristic(
        new this.platform.api.hap.Characteristic(utils.CHAR_VALUE_NAME, utils.CHAR_VALUE_UUID, {
          format: Formats.STRING,
          perms: [ Perms.PAIRED_READ, Perms.NOTIFY ],
        }));
    }

    // custom characteristic for last updated timestamp
    if (!this.service.testCharacteristic(utils.CHAR_TIME_NAME)) {
      this.service.addCharacteristic(
        new this.platform.api.hap.Characteristic(utils.CHAR_TIME_NAME, utils.CHAR_TIME_UUID, {
          format: Formats.STRING,
          perms: [ Perms.PAIRED_READ, Perms.NOTIFY ],
        }));
    }
  }

  //---------------------------------------------------------------------------

  private setOccupancyDetected(occupancyDetected: boolean) {
    this.service.setCharacteristic(
      this.platform.Characteristic.OccupancyDetected,
      occupancyDetected
        ? this.platform.Characteristic.OccupancyDetected.OCCUPANCY_DETECTED
        : this.platform.Characteristic.OccupancyDetected.OCCUPANCY_NOT_DETECTED);
  }

  private updateOccupancyDetected(occupancyDetected: boolean) {
    this.service.updateCharacteristic(
      this.platform.Characteristic.OccupancyDetected,
      occupancyDetected
        ? this.platform.Characteristic.OccupancyDetected.OCCUPANCY_DETECTED
        : this.platform.Characteristic.OccupancyDetected.OCCUPANCY_NOT_DETECTED);
  }

  //---------------------------------------------------------------------------

  private updateValue(value: string) {
    this.service.updateCharacteristic(
      utils.CHAR_VALUE_NAME,
      value,
    );
  }

  //----------------------------------------------------------------------------

  private updateTime(time: string) {
    this.service.updateCharacteristic(
      utils.CHAR_TIME_NAME,
      `${time} UTC`,
    );
  }

  //----------------------------------------------------------------------------
}
