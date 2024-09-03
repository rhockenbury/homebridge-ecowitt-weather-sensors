import { PlatformAccessory } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { Sensor } from './Sensor';
import * as utils from './../Utils';

//------------------------------------------------------------------------------

export class TemperatureSensor extends Sensor {

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
        platform.Service.TemperatureSensor,
        name,
        platform.serviceUuid(id)));

    this.setName(name);
  }

  //---------------------------------------------------------------------------

  public update(tempf: number, time: string) {
    if (!Number.isFinite(tempf)) {
      this.platform.log.warn(`Cannot update ${this.name}, temperature ${tempf} is NaN`);
      this.updateStatusActive(false);
      return;
    }

    let tempStr: string;

    switch (this.platform.config?.units?.temp) {
      case 'ce':
        tempStr = `${utils.toCelcius(tempf).toFixed(1)}°C`;
        break;

      default:
      case 'fa':
        tempStr = `${tempf.toFixed(1)}°F`;
        break;
    }

    const staticNames = utils.truthy(this.platform.config?.additional?.staticNames);

    this.updateTemperature(utils.toCelcius(tempf));
    this.updateName(staticNames ? this.name : `${this.name} ${tempStr}`);
    this.updateStatusActive(true);
    this.updateTime(time);
  }

  //---------------------------------------------------------------------------

  private updateTemperature(tempc: number) {
    this.service.updateCharacteristic(
      this.platform.Characteristic.CurrentTemperature,
      tempc
    );
  }

  //---------------------------------------------------------------------------
}
