import { PlatformAccessory, Formats, Perms, Service } from 'homebridge';
import { EcowittPlatform } from './EcowittPlatform';

import * as Utils from './Utils.js';

//------------------------------------------------------------------------------

export class EcowittAccessory {
  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
    protected readonly model: string,
    protected readonly modelName: string,
  ) {
    this.setModel(model, modelName);

    const accessoryInfo = this.accessory.getService(this.platform.Service.AccessoryInformation)!;

    accessoryInfo
      .setCharacteristic(
        this.platform.Characteristic.Manufacturer,
        'Ecowitt'
      )
      .setCharacteristic(
        this.platform.Characteristic.ProductData,
        `${platform.baseStationInfo.frequency}Hz`,
      )
      .setCharacteristic(
        this.platform.Characteristic.SerialNumber,
        platform.baseStationInfo.serialNumber,
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
      )

      // custom char does not appear in controller
      // if (!accessoryInfo.testCharacteristic(Utils.CHAR_TIME_NAME)) {
      //   accessoryInfo.addCharacteristic(
      //     new this.platform.api.hap.Characteristic(Utils.CHAR_TIME_NAME, Utils.CHAR_TIME_UUID, {
      //       format: Formats.STRING,
      //       perms: [ Perms.PAIRED_READ, Perms.NOTIFY ],
      //     }));
      // }
      //
      //
      // accessoryInfo.updateCharacteristic(
      //   Utils.CHAR_TIME_NAME,
      //   "ABCDLFKJDLSJF",
      // );
      //

      //.addOptionalCharacteristic(this.platform.Characteristic.ConfiguredName); // dont think this is needed
  }

  //----------------------------------------------------------------------------

  getModel() {
    return this.accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .getCharacteristic(this.platform.Characteristic.Model);
  }

  setModel(model: string, name: string) {
    this.accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Model, model)
      .setCharacteristic(this.platform.Characteristic.Name, name);
  }

  //----------------------------------------------------------------------------

  // NOTE where is this called?
  setSerialNumber(serialNumber: string) {
    this.accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(
        this.platform.Characteristic.SerialNumber,
        serialNumber,
      );
  }

  //----------------------------------------------------------------------------

  update(dataReport) {
    this.platform.log.error(`Update function not implemented for this accessory. Please file a bug report at ${${utils.BUG_REPORT_LINK}`);
  }

  //---------------------------------------------------------------------------

  setName(service: Service, name: string) {
    service.setCharacteristic(this.platform.Characteristic.Name, name);
  }

  updateName(service: Service, name: string) {
    service.updateCharacteristic(this.platform.Characteristic.Name, name);
  }

  //----------------------------------------------------------------------------

  private serviceUuid(name: string) {
    const serviceId = this.platform.config.mac + '_' + name;
    return this.platform.api.hap.uuid.generate(serviceId);
  }

  //---------------------------------------------------------------------------

  setStatusActive(service: Service, active: boolean) {
    service.setCharacteristic(
      this.platform.Characteristic.StatusActive,
      active,
    );
  }

  updateStatusActive(service: Service, active: boolean) {
    service.updateCharacteristic(
      this.platform.Characteristic.StatusActive,
      active,
    );
  }

  //---------------------------------------------------------------------------

  addOccupancySensor(name: string) {
    const occupancySensor =
      this.accessory.getService(name) ||
      this.accessory.addService(
        this.platform.Service.OccupancySensor,
        name,
        this.serviceUuid(name),
      );

    return occupancySensor;
  }

  updateOccupancyDetected(service: Service, occupancyDetected: boolean) {
    service.updateCharacteristic(
      this.platform.Characteristic.OccupancyDetected,
      occupancyDetected
        ? this.platform.Characteristic.OccupancyDetected.OCCUPANCY_DETECTED
        : this.platform.Characteristic.OccupancyDetected.OCCUPANCY_NOT_DETECTED,
    );
  }

  //---------------------------------------------------------------------------

  addMotionSensor(name: string) {
    const motionSensor =
      this.accessory.getService(name) ||
      this.accessory.addService(
        this.platform.Service.MotionSensor,
        name,
        this.serviceUuid(name),
      );

    return motionSensor;
  }

  updateMotionDetected(service: Service, motionDetected: boolean) {
    service.updateCharacteristic(
      this.platform.Characteristic.MotionDetected,
      motionDetected,
    );
  }

  //---------------------------------------------------------------------------

  addBattery(name: string, chargeable = false) {
    const battery =
      this.accessory.getService(this.platform.Service.Battery) ||
      this.accessory.addService(this.platform.Service.Battery);

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

  updateCurrentTemperature(service: Service, tempf) {
    const tempInC = Utils.toCelcius(tempf);

    service.updateCharacteristic(
      this.platform.Characteristic.CurrentTemperature,
      tempInC,
    );

    service.updateCharacteristic(
      this.platform.Characteristic.ConfiguredName,
      `Temperature: ${tempInC}°`,
    );

    service.updateCharacteristic(
      this.platform.Characteristic.Name,
      `Temperature: ${tempInC}°`,
    );
  }

  //---------------------------------------------------------------------------

  updateCurrentRelativeHumidity(service: Service, humidity) {
    service.updateCharacteristic(
      this.platform.Characteristic.CurrentRelativeHumidity,
      parseFloat(humidity),
    );

    service.updateCharacteristic(
      this.platform.Characteristic.ConfiguredName,
      `Humidity: ${humidity}%`,
    );

    service.updateCharacteristic(
      this.platform.Characteristic.Name,
      `Humidity: ${humidity}%`,
    );
  }

  //---------------------------------------------------------------------------
}
