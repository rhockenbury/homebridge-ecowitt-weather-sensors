import { PlatformAccessory } from 'homebridge';
import { EcowittPlatform } from './../EcowittPlatform';
import { Sensor } from './Sensor';
import * as utils from './../Utils';

//------------------------------------------------------------------------------

export class AirQualitySensor extends Sensor {

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
        platform.Service.AirQualitySensor,
        name,
        platform.serviceUuid(id)));

    this.setName(name);
    this.setStatusActive(false);
  }
  //---------------------------------------------------------------------------

  public updatePM10(pm10: number, time: string) {
    if (!Number.isFinite(pm10)) {
      this.platform.log.warn(`Cannot update ${this.name}, pm10 ${pm10} is NaN`);
      this.updateStatusActive(false);
      return;
    }

    const pm10Str = `${pm10.toFixed(0)} mcg/m³`;
    const staticNames = utils.truthy(this.platform.config?.additional?.staticNames);

    this.updateName(staticNames ? this.name : `${this.name} ${pm10Str}`);
    this.updatePM10Density(pm10);
    this.updatePM10Quality(pm10);
    this.updateStatusActive(true);
    this.updateTime(time);
  }

  //---------------------------------------------------------------------------

  public updatePM25(pm25: number, time: string) {
    if (!Number.isFinite(pm25)) {
      this.platform.log.warn(`Cannot update ${this.name}, pm2.5 ${pm25} is NaN`);
      this.updateStatusActive(false);
      return;
    }

    const pm25Str = `${pm25.toFixed(0)} mcg/m³`;
    const staticNames = utils.truthy(this.platform.config?.additional?.staticNames);

    this.updateName(staticNames ? this.name : `${this.name} ${pm25Str}`);
    this.updatePM25Density(pm25);
    this.updatePM25Quality(pm25);
    this.updateStatusActive(true);
    this.updateTime(time);
  }


  //---------------------------------------------------------------------------

  private updatePM10Density(pm10: number) {
    this.service.updateCharacteristic(
      this.platform.Characteristic.PM10Density,
      pm10,
    );
  }

  //---------------------------------------------------------------------------

  private updatePM25Density(pm25: number) {
    this.service.updateCharacteristic(
      this.platform.Characteristic.PM2_5Density,
      pm25,
    );
  }

  //---------------------------------------------------------------------------

  private updatePM10Quality(pm10: number) {
    const airQuality = utils.toAirQuality(pm10, 'pm10');
    this.platform.log.debug(`Setting ${this.name} pm10 quality to ${airQuality.description}`);
    this.service.updateCharacteristic(
      this.platform.Characteristic.AirQuality,
      airQuality.scale,
    );
  }

  //---------------------------------------------------------------------------

  private updatePM25Quality(pm25: number) {
    const airQuality = utils.toAirQuality(pm25, 'pm25');
    this.platform.log.debug(`Setting ${this.name} pm2.5 quality to ${airQuality.description}`);
    this.service.updateCharacteristic(
      this.platform.Characteristic.AirQuality,
      airQuality.scale,
    );
  }
}
