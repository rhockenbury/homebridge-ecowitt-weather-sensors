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


    // is there a way to check subtype to remove other old battery services ???

    console.log(accessory.services);

    this.setName(name);
    this.setStatusActive(false);
    this.updateStatusLow(false);
  }

  //---------------------------------------------------------------------------

  public update(batteryLevel: number, time: string) {
    if (!Number.isFinite(batteryLevel)) {
      this.platform.log.warn(`Cannot update ${this.name}, battery level ${batteryLevel} is NaN`);
      this.updateStatusActive(false);
      return;
    }

    const batteryStr = `${batteryLevel.toFixed(0)} %`;
    const staticNames = utils.truthy(this.platform.config?.additional?.staticNames);

    this.updateName(staticNames ? this.name : `${this.name} ${batteryStr}`);
    this.updateLevel(batteryLevel);
    this.updateStatusActive(true);
    this.updateTime(time);
  }

  //---------------------------------------------------------------------------

  public updateStatusLow(lowBattery: boolean) {
      this.service.updateCharacteristic(
        this.platform.Characteristic.StatusLowBattery,
        lowBattery
          ? this.platform.Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW
          : this.platform.Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL,
      );

  }

  //---------------------------------------------------------------------------

  public updateChargingState(charging: boolean = false) {
      this.service.updateCharacteristic(
        this.platform.Characteristic.ChargingState,
        charging
          ? this.platform.Characteristic.ChargingState.CHARGING
          : this.platform.Characteristic.ChargingState.NOT_CHARGING,
      );
  }

  //---------------------------------------------------------------------------

  private updateLevel(batteryLevel: number) {
    this.platform.log.debug(`Setting ${this.name} battery level to ${batteryLevel}`);
    this.service.updateCharacteristic(
      this.platform.Characteristic.BatteryLevel,
      batteryLevel,
    );
  }

  //---------------------------------------------------------------------------
}
