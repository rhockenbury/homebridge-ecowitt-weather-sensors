import { PlatformAccessory } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { Sensor } from './Sensor';
import * as utils from './../Utils';

//------------------------------------------------------------------------------

export class HumiditySensor extends Sensor {

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
        platform.Service.HumiditySensor,
        name,
        platform.serviceUuid(id)));

    this.setName(name);
    this.setStatusActive(false);
  }

  //---------------------------------------------------------------------------

  public update(humidity: number, time: string) {
    if (!Number.isFinite(humidity)) {
      this.platform.log.warn(`Cannot update ${this.name}, humidity ${humidity} is NaN`);
      this.updateStatusActive(false);
      return;
    }

    if (humidity < 0) {
      this.platform.log.warn(`Humidity below the minimum of 0% for ${this.id}`);
      humidity = 0;
    } else if (humidity > 100) {
      this.platform.log.warn(`Humidity above the maximum of 100% for ${this.id}`);
      humidity = 100;
    }

    const humidityStr = `${humidity.toFixed(0)} %`;
    const staticNames = utils.truthy(this.platform.config?.additional?.staticNames);

    this.updateName(staticNames ? this.name : `${this.name} ${humidityStr}`);
    this.updateHumidity(+humidity.toFixed(0));
    this.updateStatusActive(true);
    this.updateTime(time);
  }

  //---------------------------------------------------------------------------

  private updateHumidity(humidity: number) {
    this.service.updateCharacteristic(
      this.platform.Characteristic.CurrentRelativeHumidity,
      humidity,
    );
  }

  //---------------------------------------------------------------------------
}
