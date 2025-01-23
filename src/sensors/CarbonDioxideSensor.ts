import { PlatformAccessory } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { Sensor } from './Sensor';
import * as utils from './../Utils';

//------------------------------------------------------------------------------

export class CarbonDioxideSensor extends Sensor {

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
        platform.Service.CarbonDioxideSensor,
        name,
        platform.serviceUuid(id)));

    this.setName(name);
    this.setStatusActive(false);
  }

  //---------------------------------------------------------------------------

  public update(co2: number, time: string) {
    if (!Number.isFinite(co2)) {
      this.platform.log.warn(`Cannot update ${this.name}, CO₂ ${co2} is NaN`);
      this.updateStatusActive(false);
      return;
    }

    if (co2 < 0) {
      this.platform.log.warn(`CO2 below the minimum of 0ppm for ${this.id}`);
      co2 = 0;
    } else if (co2 > 100000) {
      this.platform.log.warn(`CO2 above the maximum of 100000ppm for ${this.id}`);
      co2 = 100000;
    }

    const co2Str = `${co2.toFixed(0)}ppm`;
    const staticNames = utils.truthy(this.platform.config?.additional?.staticNames);

    this.updateName(staticNames ? this.name : `${this.name} ${co2Str}`);
    this.updateLevel(+co2.toFixed(0));
    this.updateDetected(co2 >= 1000); // 1000 ppm is generally accepted the safe limit
    this.updateStatusActive(true);
    this.updateTime(time);
  }

  //---------------------------------------------------------------------------

  private updateDetected(detected: boolean) {
    this.service.updateCharacteristic(
      this.platform.Characteristic.CarbonDioxideDetected,
      detected
        ? this.platform.Characteristic.CarbonDioxideDetected.CO2_LEVELS_ABNORMAL
        : this.platform.Characteristic.CarbonDioxideDetected.CO2_LEVELS_NORMAL,
    );
  }

  //---------------------------------------------------------------------------

  private updateLevel(co2: number) {
    this.service.updateCharacteristic(
      this.platform.Characteristic.CarbonDioxideLevel,
      co2,
    );
  }

  //---------------------------------------------------------------------------
}
