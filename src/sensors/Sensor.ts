import {
  PlatformAccessory,
  /*CharacteristicValue,*/ Service,
} from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';

//------------------------------------------------------------------------------

export class Sensor {
  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
    protected readonly service: Service,
  ) {
    let configuredNameExists = this.service.testCharacteristic(this.platform.Characteristic.ConfiguredName);
    if (!configuredNameExists) {
      this.service.addCharacteristic(this.platform.Characteristic.ConfiguredName);
    }
  }

  //---------------------------------------------------------------------------

  protected serviceUuid(name: string) {
    const serviceId = this.platform.config.mac + '_' + name;
    return this.platform.api.hap.uuid.generate(serviceId);
  }

  //---------------------------------------------------------------------------

  setName(name: string) {
    this.service.setCharacteristic(this.platform.Characteristic.Name, name);
  }

  updateName(name: string) {
    this.service.updateCharacteristic(
      this.platform.Characteristic.ConfiguredName,
      name,
    );
    this.service.updateCharacteristic(this.platform.Characteristic.Name, name);
  }

  //---------------------------------------------------------------------------

  setStatusActive(active: boolean) {
    this.service.setCharacteristic(
      this.platform.Characteristic.StatusActive,
      active,
    );
  }

  updateStatusActive(active: boolean) {
    this.service.updateCharacteristic(
      this.platform.Characteristic.StatusActive,
      active,
    );
  }

  //---------------------------------------------------------------------------

  updateStatusLowBattery(lowBattery: boolean) {
    this.service.updateCharacteristic(
      this.platform.Characteristic.StatusLowBattery,
      lowBattery
        ? this.platform.Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW
        : this.platform.Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL,
    );
  }

  //---------------------------------------------------------------------------
}
