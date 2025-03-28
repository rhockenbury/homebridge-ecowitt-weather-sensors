import { PlatformAccessory, Service } from 'homebridge';
import { EcowittPlatform } from './EcowittPlatform';
import * as utils from './Utils';

//------------------------------------------------------------------------------

export class EcowittAccessory {
  public requiredData: string[] = []; // fields that must be provided
  public optionalData: string[] = []; // fields that are used if available
  public unusedData: string[] = [];   // fields that are not used / displayed

  protected readonly accessoryId: string;
  protected readonly shortServiceId: string;

  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
    protected readonly modelName: string,
    protected readonly accessoryName: string,
    protected readonly channel: number | undefined = undefined,
  ) {
    this.accessoryId = this.platform.serviceId(this.modelName, this.channel);
    this.shortServiceId = this.platform.shortServiceId(this.modelName, this.channel);

    const accessoryInfo = this.accessory.getService(this.platform.Service.AccessoryInformation)!;

    accessoryInfo
      .setCharacteristic(
        this.platform.Characteristic.Manufacturer,
        platform.baseStationInfo.protocol,
      )
      .setCharacteristic(
        this.platform.Characteristic.Model,
        this.accessoryName.split(' ')[0],
      )
      .setCharacteristic(
        this.platform.Characteristic.Name,
        this.accessoryName,
      )
      .setCharacteristic(
        this.platform.Characteristic.ProductData,
        `${platform.baseStationInfo.frequency} Hz`,
      )
      .setCharacteristic(
        this.platform.Characteristic.SerialNumber,
        this.accessoryId,
      )
      .setCharacteristic(
        this.platform.Characteristic.HardwareRevision,
        platform.baseStationInfo.hardwareRevision,
      )
      .setCharacteristic(
        this.platform.Characteristic.SoftwareRevision,
        platform.baseStationInfo.softwareRevision,
      )
      .setCharacteristic(
        this.platform.Characteristic.FirmwareRevision,
        platform.baseStationInfo.firmwareRevision,
      );
  }

  //----------------------------------------------------------------------------

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public update(dataReport) {
    this.platform.log.error(`Update function not implemented for ${this.modelName}. `
      + `Please file a bug report at ${utils.BUG_REPORT_LINK}`);
  }

  //---------------------------------------------------------------------------

  addBattery(name: string, chargeable = false) {
    const battery =
      this.accessory.getService(this.platform.Service.Battery) ||
      this.accessory.addService(this.platform.Service.Battery, name);

    battery.setCharacteristic(this.platform.Characteristic.Name, `${name}`);

    battery.setCharacteristic(
      this.platform.Characteristic.ChargingState,
      chargeable
        ? this.platform.Characteristic.ChargingState.NOT_CHARGING
        : this.platform.Characteristic.ChargingState.NOT_CHARGEABLE,
    );

    battery.setCharacteristic(
      this.platform.Characteristic.StatusLowBattery,
      this.platform.Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL,
    );

    return battery;
  }

  //---------------------------------------------------------------------------

  updateBatteryLevel(service: Service, batteryLevel: number) {
    service.updateCharacteristic(
      this.platform.Characteristic.BatteryLevel,
      batteryLevel,
    );
  }

  //---------------------------------------------------------------------------

  updateStatusLowBattery(service: Service, lowBattery: boolean) {
    service.updateCharacteristic(
      this.platform.Characteristic.StatusLowBattery,
      lowBattery
        ? this.platform.Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW
        : this.platform.Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL,
    );
  }

  //---------------------------------------------------------------------------

  updateChargingState(service: Service, charging = false) {
    service.updateCharacteristic(
      this.platform.Characteristic.ChargingState,
      charging
        ? this.platform.Characteristic.ChargingState.CHARGING
        : this.platform.Characteristic.ChargingState.NOT_CHARGING,
    );
  }

  //---------------------------------------------------------------------------
}
