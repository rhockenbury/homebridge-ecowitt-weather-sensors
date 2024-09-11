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
    this.setStatusActive(false);
  }

  //---------------------------------------------------------------------------

  public update(tempf: number, time: string) {
    if (!Number.isFinite(tempf)) {
      this.platform.log.warn(`Cannot update ${this.name}, temperature ${tempf} is NaN`);
      this.updateStatusActive(false);
      return;
    }

    let tempStr: string;

    // homekit will round °C to the nearest 0.5 degrees, and then convert to °F
    // we mirror this behavior so that temperature in the service name is the same as
    // reported by homekit
    switch (this.platform.config?.units?.temp) {
      case 'ce':
        tempStr = `${(Math.round(utils.toCelcius(tempf) * 2) / 2).toFixed(2)}°C`;
        break;

      default:
      case 'fa':
        tempStr = `${(utils.toFahrenheit(Math.round(utils.toCelcius(tempf) * 2) / 2)).toFixed(2)}°F`;
        break;
    }

    const staticNames = utils.truthy(this.platform.config?.additional?.staticNames);

    this.updateTemperature(Math.round(utils.toCelcius(tempf) * 2) / 2);
    this.updateName(staticNames ? this.name : `${this.name} ${tempStr}`);
    this.updateStatusActive(true);
    this.updateTime(time);
  }

  //---------------------------------------------------------------------------

  private updateTemperature(tempc: number) {
    this.service.updateCharacteristic(
      this.platform.Characteristic.CurrentTemperature,
      tempc,
    );
  }

  //---------------------------------------------------------------------------
}
