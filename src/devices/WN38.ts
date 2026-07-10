import { PlatformAccessory } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { EcowittAccessory } from './../EcowittAccessory';
import { TemperatureSensor } from './../sensors/TemperatureSensor';
import { BatterySensor } from './../sensors/BatterySensor';
import * as utils from './../Utils';

//------------------------------------------------------------------------------

export class WN38 extends EcowittAccessory {
  static readonly properties: string[] = ['blackGlobeTemperature', 'wetBulbGlobeTemperature'];

  protected battery: BatterySensor | undefined;
  protected blackGlobeTemperature: TemperatureSensor | undefined;
  protected wetBulbGlobeTemperature: TemperatureSensor | undefined;

  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
  ) {
    super(platform, accessory, 'WN38', 'WN38 Black Globe Temp Sensor');

    this.requiredData = ['bgtbatt', 'bgt'];
    this.optionalData = ['wbgt'];

    const hideConfig = this.platform.config?.hidden || {};
    const hideConfigCustom = this.platform.config?.customHidden || [];
    const hidden = Object.keys(hideConfig).filter(k => !!hideConfig[k]).concat(hideConfigCustom);

    let nameOverride: string | undefined;

    if (!utils.includesAny(hidden, ['battery', `${this.shortServiceId}:battery`])) {
      nameOverride = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:battery`);
      this.battery = new BatterySensor(platform, accessory, `${this.accessoryId}:battery`, nameOverride || 'Battery');
    } else {
      this.battery = new BatterySensor(platform, accessory, `${this.accessoryId}:battery`, 'Battery');
      this.battery.removeService();
      this.battery = undefined;
    }

    if (!utils.includesAny(hidden, ['blackGlobeTemperature', `${this.shortServiceId}:blackGlobeTemperature`])) {
      nameOverride = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:blackGlobeTemperature`);
      this.blackGlobeTemperature = new TemperatureSensor(platform, accessory, `${this.accessoryId}:blackGlobeTemperature`,
        nameOverride || 'Black Globe Temperature');
    } else {
      this.blackGlobeTemperature = new TemperatureSensor(platform, accessory,
        `${this.accessoryId}:blackGlobeTemperature`, 'Black Globe Temperature');
      this.blackGlobeTemperature.removeService();
      this.blackGlobeTemperature = undefined;
    }

    if (!utils.includesAny(hidden, ['wetBulbGlobeTemperature', `${this.shortServiceId}:wetBulbGlobeTemperature`])) {
      nameOverride = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:wetBulbGlobeTemperature`);
      this.wetBulbGlobeTemperature = new TemperatureSensor(platform, accessory, `${this.accessoryId}:wetBulbGlobeTemperature`,
        nameOverride || 'Wet Bulb Globe Temperature');
    } else {
      this.wetBulbGlobeTemperature = new TemperatureSensor(platform, accessory,
        `${this.accessoryId}:wetBulbGlobeTemperature`, 'Wet Bulb Globe Temperature');
      this.wetBulbGlobeTemperature.removeService();
      this.wetBulbGlobeTemperature = undefined;
    }
  }

  //----------------------------------------------------------------------------

  public update(dataReport) {
    if (!utils.includesAll(Object.keys(dataReport), this.requiredData)) {
      throw new Error(`Update on ${this.accessoryId} requires data ${this.requiredData}`);
    } else {
      this.platform.log.debug(`Updating accessory ${this.accessoryId}`);
    }

    const batt = parseFloat(dataReport['bgtbatt']);
    const batteryLevel = batt / 1.6;
    const lowBattery = batt <= 1.2;

    this.battery?.updateLevel(
      utils.boundRange(batteryLevel * 100),
      dataReport.dateutc,
    );

    this.battery?.updateStatusLow(
      lowBattery,
      dataReport.dateutc,
    );

    this.blackGlobeTemperature?.update(
      parseFloat(dataReport.bgt),
      dataReport.dateutc,
    );

    // optional
    if (dataReport.wbgt === undefined) {
      this.wetBulbGlobeTemperature?.removeService();
      this.wetBulbGlobeTemperature = undefined;
    } else {
      this.wetBulbGlobeTemperature?.update(
        parseFloat(dataReport.wbgt),
        dataReport.dateutc,
      );
    }
  }
}
