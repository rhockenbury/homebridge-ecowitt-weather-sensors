import { PlatformAccessory } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { Sensor } from './Sensor';
import * as utils from './../Utils';

//------------------------------------------------------------------------------

export class LightSensor extends Sensor {

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
        platform.Service.LightSensor,
        name,
        platform.serviceUuid(id)));

    this.setName(name);
    this.setStatusActive(false);
  }

  //---------------------------------------------------------------------------

  public update(solarRadiation: number, time: string) {
    if (!Number.isFinite(solarRadiation)) {
      this.platform.log.warn(`Cannot update ${this.name}, solar radiation ${solarRadiation} is NaN`);
      this.updateStatusActive(false);
      return;
    }

    const luxFactor = this.platform.config?.additional?.luxFactor || 126.7;
    let lux = luxFactor * solarRadiation;
    let luxStr = '';

    if (lux <= 0.0) {  // ambient light characterstic min is 0.0001
      lux = 0.0001;
      luxStr = '0lx';
    } else if (lux <= 0.0005) {
      luxStr = '0lx';
    } else {
      luxStr = `${lux.toFixed(3)}lx`;
    }

    const staticNames = utils.truthy(this.platform.config?.additional?.staticNames);

    this.updateName(staticNames ? this.name : `${this.name} ${luxStr}`);
    this.updateLux(lux);
    this.updateStatusActive(true);
    this.updateTime(time);
  }

  //---------------------------------------------------------------------------

  private updateLux(lux: number) {
    this.service.updateCharacteristic(
      this.platform.Characteristic.CurrentAmbientLightLevel,
      lux,
    );
  }

  //---------------------------------------------------------------------------
}
