import { PlatformAccessory, Service, Formats, Perms } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import * as utils from './../Utils';

//------------------------------------------------------------------------------

export class Sensor {
  // protected failedUpdateCounter: number = 0;
  // protected failedUpdateThreshold: number = 10;

  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
    protected readonly service: Service,
  ) {
    if (!this.service.testCharacteristic(this.platform.Characteristic.ConfiguredName)) {
      this.service.addCharacteristic(this.platform.Characteristic.ConfiguredName);
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

  protected setName(name: string) {
    this.service.setCharacteristic(
      this.platform.Characteristic.ConfiguredName,
      name,
    );
    this.service.setCharacteristic(this.platform.Characteristic.Name, name);
  }

  public updateName(name: string) {
    this.service.updateCharacteristic(
      this.platform.Characteristic.ConfiguredName,
      name,
    );
    this.service.updateCharacteristic(this.platform.Characteristic.Name, name);
  }

  //---------------------------------------------------------------------------

  protected setStatusActive(active: boolean) {
    this.service.setCharacteristic(
      this.platform.Characteristic.StatusActive,
      active,
    );
  }

  protected updateStatusActive(active: boolean) {
    this.service.updateCharacteristic(
      this.platform.Characteristic.StatusActive,
      active,
    );
  }

  //---------------------------------------------------------------------------

  public removeService() {
    this.accessory.removeService(this.service);
  }

  //---------------------------------------------------------------------------

  protected updateTime(time: string) {
    this.service.updateCharacteristic(
      utils.CHAR_TIME_NAME,
      `${time} UTC`,
    );
  }

  //----------------------------------------------------------------------------

  // protected handleFailedUpdate() {
  //   if (this.failedUpdateCounter >= this.failedUpdateThreshold) {
  //     this.failedUpdateCounter = 0;
  //     throw new Error(`Update on ${this.name} has repeatedly failed. Verify data report from Ecowitt Gateway or Console, and submit a bug report at ${utils.BUG_REPORT_LINK} for assistance`)
  //   }
  // }

  //----------------------------------------------------------------------------
}
