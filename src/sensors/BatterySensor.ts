import { PlatformAccessory } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { Sensor } from './Sensor';
import * as utils from './../Utils';

//------------------------------------------------------------------------------

export class BatterySensor extends Sensor {

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
        platform.Service.Battery,
        name,
        platform.serviceUuid(id)));

    // remove legacy battery service that was created for each accessory prior to v2.7.0
    const legacyBatteryService = accessory.services
      .filter(s => (s instanceof platform.Service.Battery && s.subtype === undefined));
    if (legacyBatteryService.length > 0) {
      accessory.removeService(legacyBatteryService[0]);
    }

    this.setName(name);
  }

  //---------------------------------------------------------------------------

  public updateLevel(level: number, time: string) {
    if (!Number.isFinite(level)) {
      this.platform.log.warn(`Cannot update ${this.name}, battery level ${level} is NaN`);
      return;
    }

    const levelStr = `${level.toFixed(0)} %`;
    const staticNames = utils.truthy(this.platform.config?.additional?.staticNames);

    this.updateName(staticNames ? this.name : `${this.name} ${levelStr}`);
    this.service.updateCharacteristic(
      this.platform.Characteristic.BatteryLevel,
      level,
    );
    this.updateTime(time);
  }

  //---------------------------------------------------------------------------

  public updateStatusLow(low: boolean, time: string) {
    this.platform.log.debug(`Setting ${this.name} status low battery to ${low}`);
    this.service.updateCharacteristic(
      this.platform.Characteristic.StatusLowBattery,
      low
        ? this.platform.Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW
        : this.platform.Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL,
    );
    this.updateTime(time);
  }

  //---------------------------------------------------------------------------

  public updateChargingState(charging: boolean, time: string) {
    this.platform.log.debug(`Setting ${this.name} charging state to ${charging}`);
    this.service.updateCharacteristic(
      this.platform.Characteristic.ChargingState,
      charging
        ? this.platform.Characteristic.ChargingState.CHARGING
        : this.platform.Characteristic.ChargingState.NOT_CHARGING,
    );
    this.updateTime(time);
  }

  //---------------------------------------------------------------------------
}
