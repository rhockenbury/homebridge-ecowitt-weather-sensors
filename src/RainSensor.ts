import {
  PlatformAccessory /*CharacteristicValue,*/ /*Service*/,
} from "homebridge";
import { EcowittPlatform } from "./EcowittPlatform";
import { Sensor } from "./Sensor";

//------------------------------------------------------------------------------

export class RainSensor extends Sensor {
  constructor(
    protected readonly platform: EcowittPlatform,
    protected readonly accessory: PlatformAccessory,
    protected readonly name: string
  ) {
    super(
      platform,
      accessory,
      accessory.getService(name) ||
        accessory.addService(
          platform.Service.Door,
          name,
          platform.serviceUuid(name)
        )
    );
  }

  //----------------------------------------------------------------------------

  public updateRate(ratein: number, thresholdmm) {
    if (!isFinite(ratein)) {
      //this.updateActive(false);
      this.updateName("N/A");
      return;
    }

    let rate: string;
    let ratemm: number;

    switch (this.platform.config?.ws?.rain?.units) {
      case "in":
        rate = `${ratein} in/h`;
        ratemm = ratein * 25.4;
        break;

      default:
      case "mm":
        ratemm = Math.round(ratein * 254) / 10;
        rate = `${ratemm} mm/h`;
        break;
    }

    //this.updateActive(true);
    this.updateName(`${this.name}: ${rate} ${this.toIntensity(ratein)}`);
    this.updateDetected(isFinite(thresholdmm) && ratemm > thresholdmm);
  }

  //----------------------------------------------------------------------------

  public updateTotal(totalin: number, thresholdmm) {
    if (!isFinite(totalin)) {
      //this.updateActive(false);
      this.updateName("N/A");
      return;
    }

    let total: string;
    let totalmm: number;

    switch (this.platform.config?.ws?.rain?.units) {
      case "in":
        total = `${totalin} in`;
        totalmm = totalin * 25.4;
        break;

      default:
      case "mm":
        totalmm = Math.round(totalin * 254) / 10;
        total = `${totalmm} mm`;
        break;
    }

    //this.updateActive(true);
    this.updateName(`${this.name}: ${total}`);
    this.updateDetected(isFinite(thresholdmm) && totalmm > thresholdmm);
  }

  //----------------------------------------------------------------------------

  private updateActive(active: boolean) {
    this.service.updateCharacteristic(
      this.platform.Characteristic.Active,
      active
    );
  }

  //----------------------------------------------------------------------------

  private updateDetected(detected: boolean) {
    this.service.updateCharacteristic(
      this.platform.Characteristic.LeakDetected,
      detected
        ? this.platform.Characteristic.LeakDetected.LEAK_DETECTED
        : this.platform.Characteristic.LeakDetected.LEAK_NOT_DETECTED
    );
  }

  //----------------------------------------------------------------------------

  private toIntensity(ratein: number): string {
    if (ratein <= 0) {
      return "";
    } else if (ratein <= 0.098) {
      return "Light";
    } else if (ratein <= 0.3) {
      return "Moderate";
    } else if (ratein < 2) {
      return "Heavy";
    } else {
      return "Violent";
    }
  }

  //----------------------------------------------------------------------------
}
