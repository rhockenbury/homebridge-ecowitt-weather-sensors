import { PlatformAccessory, Service } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';

//------------------------------------------------------------------------------

export class Sensor {
  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
    protected readonly service: Service,
  ) {
    if (!this.service.testCharacteristic(this.platform.Characteristic.ConfiguredName)) {
      this.service.addCharacteristic(this.platform.Characteristic.ConfiguredName);
    }
  }

  //---------------------------------------------------------------------------

  protected serviceUuid(name: string) {
    const serviceId = this.platform.config.mac + '_' + name;
    return this.platform.api.hap.uuid.generate(serviceId);
  }

  //---------------------------------------------------------------------------

  private setName(name: string) {
    this.service.setCharacteristic(
      this.platform.Characteristic.ConfiguredName,
      name,
    );
    this.service.setCharacteristic(this.platform.Characteristic.Name, name);
  }

  private updateName(name: string) {
    this.service.updateCharacteristic(
      this.platform.Characteristic.ConfiguredName,
      name,
    );
    this.service.updateCharacteristic(this.platform.Characteristic.Name, name);
  }

  //---------------------------------------------------------------------------

  private setStatusActive(active: boolean) {
    this.service.setCharacteristic(
      this.platform.Characteristic.StatusActive,
      active,
    );
  }

  private updateStatusActive(active: boolean) {
    this.service.updateCharacteristic(
      this.platform.Characteristic.StatusActive,
      active,
    );
  }

  //---------------------------------------------------------------------------
}
