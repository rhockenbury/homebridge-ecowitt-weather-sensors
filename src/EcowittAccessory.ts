import { PlatformAccessory, Service } from 'homebridge';
import { EcowittPlatform } from './EcowittPlatform';
import * as utils from './Utils';

//------------------------------------------------------------------------------

interface Threshold {
  id: string;
  name: string;
  dataProperty: string;
  comparator: string;
  value: number;
}

export class EcowittAccessory {
  // TODO
  static readonly properties: string[];

  public requiredData: string[] = []; // fields that must be provided
  public optionalData: string[] = []; // fields that are used if available
  public unusedData: string[] = [];   // fields that are not used / displayed

  protected readonly accessoryId: string;
  protected readonly shortServiceId: string;

  protected readonly hidden: string[] = [];
  protected readonly thresholds: Threshold[] = [];

  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
    protected readonly modelName: string,
    protected readonly accessoryName: string,
    protected readonly channel: number | undefined = undefined,
  ) {
    this.accessoryId = this.platform.serviceId(this.modelName, this.channel);
    this.shortServiceId = this.platform.shortServiceId(this.modelName, this.channel);

    const hideConfig = this.platform.config?.hidden || {};
    const hideConfigCustom = this.platform.config?.customHidden || [];
    this.hidden = Object.keys(hideConfig).filter(k => !!hideConfig[k]).concat(hideConfigCustom);

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

  //----------------------------------------------------------------------------

  //
  // hidden device will not show device regardless of props and thresholds
  // non-hidden device will not show device if no props and no thresholds
  //
  public static hide(hidden, thresholds) {
    const sensorHidden = utils.includesAny(hidden, [`${this.name}`]);

    if (sensorHidden === true) {
      return true;
    }

    const hasProps = !utils.includesAll(hidden, this.properties);
    const thresholdProps = thresholds.map(t => t.dataProperty);
    const hasThresholds = utils.includesAny(thresholdProps, this.properties);

    if (hasProps === false && hasThresholds === false) {
      return true;
    }

    return false;
  }

  //---------------------------------------------------------------------------

  private addPrimary(property, name, sensorType) {
    let nameOverride = utils.lookup(this.platform.config?.nameOverrides, `${this.shortServiceId}:${property}`);
    const id = this.platform.serviceUuid(`${this.accessoryId}:${property}`);
    this.platform.log.debug(`Creating primary sensor '${name}' with id '${id}' for property '${property}'`);
    const sensor = new sensorType(this.platform, this.accessory, id, nameOverride || name);

    return [id, sensor];
  }

  private removePrimary(id, sensorType) {
    this.platform.log.debug(`Removing primary sensor with id '${id}'`);
    let sensor = new sensorType(this.platform, this.accessory, id, 'Pending Removal');
    sensor.removeService();
    sensor = undefined;

    return [id, sensor];
  }

  //---------------------------------------------------------------------------

  private addThreshold(property, name, sensorType) {
    const cleanName = name.replace(/ /g, '').toLowerCase();
    const id = `threshold:${property}:` + this.platform.serviceUuid(`${this.accessoryId}:${cleanName}`);
    this.platform.log.debug(`Creating threshold sensor '${name}' with id '${id}' for property '${property}'`);
    const sensor = new sensorType(this.platform, this.accessory, id, name.trim());

    return [id, sensor];
  }

  private removeThreshold(id, sensorType) {
    this.platform.log.debug(`Removing threshold sensor with id '${id}'`);
    const sensor = new sensorType(this.platform, this.accessory, id, 'Pending Removal');
    sensor.removeService();
    delete this[id];

    return [id, sensor];
  }

  //---------------------------------------------------------------------------

  protected setPrimary(property, name, sensorType) {
    let id, sensor;

    if (!utils.includesAny(this.hidden, [property, `${this.shortServiceId}:${property}`])) {
      [id, sensor] = this.addPrimary(property, name, sensorType);
    } else {
      id = this.platform.serviceUuid(`${this.accessoryId}:${property}`);
      [id, sensor] = this.removePrimary(id, sensorType);
    }

    this[property] = sensor;
    return sensor;
  }

  protected setThresholds(property, name, sensorType) {
    // create any missing thresholds
    const thresholds = this.platform.config?.customThresholds?.filter((t) => t.dataProperty === property) || [];
    thresholds.forEach(threshold => {
      const [id, sensor] = this.addThreshold(property, threshold.name, sensorType);
      threshold.id = id;
      this[id] = sensor;
    });

    this.thresholds.push(...thresholds);

    // remove any unneeded thresholds
    const existingThresholds = this.accessory.services.filter(s => s.subtype?.startsWith(`threshold:${property}`));
    existingThresholds.forEach(threshold => {
      const shouldRemove = thresholds.find(t => t.id === threshold.subtype) === undefined
      if (shouldRemove) {
        this.removeThreshold(threshold.subtype, sensorType);
      }
    });
  }

  //---------------------------------------------------------------------------

  protected dispatchUpdate(dataReport, handler, property, data) {
    Object.keys(this).filter(id => id.includes(property)).forEach(id => {
      const threshold = this.thresholds.filter(t => t.id === id)[0];
      this[id]?.[handler](
        parseFloat(dataReport[data]),
        threshold?.value,
        threshold?.comparator,
        dataReport.dateutc,
      );
    });
  }

  protected dispatchOptionalUpdate(dataReport, handler, property, data) {
    Object.keys(this).filter(id => id.includes(property)).forEach(id => {
      const threshold = this.thresholds.filter(t => t.id === id)[0];
      if (dataReport[data] === undefined) {
        if (id.startsWith('threshold') && threshold !== undefined) {
          this.platform.log.warn(`Threshold '${threshold.name}' for optional property '${property}' ` +
          ' will not be displayed because that property is not available on the data report');
        } else {
          this.platform.log.debug(`Note that optional property '${property}' will not be displayed ` +
            'because that property is not available on the data report');
        }

        // clean up service since there's no data for it
        this[id]?.removeService();
        this[id] = undefined;
      } else {
        this[id]?.[handler](
          parseFloat(dataReport[data]),
          threshold?.value,
          threshold?.comparator,
          dataReport.dateutc,
        );
      }
    });
  }

  //---------------------------------------------------------------------------
}
