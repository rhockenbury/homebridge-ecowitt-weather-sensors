<span align="center" style="text-align:center">
<div align="center" style="text-align:center">

<img src="./docs/assets/homebridge-ecowitt-logo2.png" alt="Homebridge Ecowitt Logo Banner" width="600"/>

# Homebridge Ecowitt Weather Sensors

<!-- badges -->

[![verified-by-homebridge](https://badgen.net/badge/homebridge/verified/purple)](https://github.com/homebridge/homebridge/wiki/Verified-Plugins) [![Test Status](https://github.com/rhockenbury/homebridge-ecowitt-weather-sensors/actions/workflows/build-master.yml/badge.svg)](https://github.com/rhockenbury/homebridge-ecowitt-weather-sensors/actions/workflows/build-master.yml) [![NPM Version](https://img.shields.io/npm/v/homebridge-ecowitt-weather-sensors)](https://www.npmjs.com/package/homebridge-ecowitt-weather-sensors) [![NPM Downloads](https://img.shields.io/npm/d18m/homebridge-ecowitt-weather-sensors)](https://www.npmjs.com/package/homebridge-ecowitt-weather-sensors) [![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/license/apache-2-0)

:fast\_forward: :fast\_forward: :fast\_forward: **[Getting Started](https://github.com/rhockenbury/homebridge-ecowitt-weather-sensors/tree/master?tab=readme-ov-file#getting-started) | [Supported Devices](https://github.com/rhockenbury/homebridge-ecowitt-weather-sensors/tree/master?tab=readme-ov-file#supported-devices) | [Configuration](https://github.com/rhockenbury/homebridge-ecowitt-weather-sensors?tab=readme-ov-file#configuration) | [FAQs](https://github.com/rhockenbury/homebridge-ecowitt-weather-sensors?tab=readme-ov-file#frequently-asked-questions) | [Contributing](https://github.com/rhockenbury/homebridge-ecowitt-weather-sensors/blob/master/docs/CONTRIBUTING.md)** :rewind: :rewind: :rewind:

</div>
</span>

## Complete HomeKit support for [Ecowitt](https://www.ecowitt.com/shop/homePage) Weather Sensors with [Homebridge](https://homebridge.io).

This plugin operates as a service that listens for data reports from an Ecowitt WiFi Gateway or Weather Display Console.  The Ecowitt gateway or console must be configured to publish weather service reports to the Homebridge Ecowitt Weather Sensors plugin.

For bugs, feature requests, and questions - [please file a new issue](https://github.com/rhockenbury/homebridge-ecowitt-weather-sensors/issues/new/choose).

> :arrow\_up: :arrow\_up: :arrow\_up: **v2 is now available! These docs are for v2, and v1 docs can be found [here](https://github.com/rhockenbury/homebridge-ecowitt-weather-sensors/tree/v1-release). See the [v2 config migration guide](https://github.com/rhockenbury/homebridge-ecowitt-weather-sensors/wiki/V2-Migration-Guide) to get started.  Please [report any issues](https://github.com/rhockenbury/homebridge-ecowitt-weather-sensors/issues/new/choose).**

## Features

* Stable support for most Ecowitt weather sensor products
* Operates locally without the need for any cloud services
* Detection thresholds for most weather sensor devices to drive automations
* Customize units, sensor override names, and whether to show or hide a device

> :warning: **This plugin uses a few custom characteristics on HomeKit services which are not visible on the HomeKit app. For full functionality, third-party apps such as [Eve](https://www.evehome.com/en-us/eve-app), [Controller for HomeKit](https://controllerforhomekit.com/) or [Home+](https://apps.apple.com/us/app/home-6/id995994352) are recommended, but not required.**

## Requirements

* Ecowitt WiFI Gateway or Weather Display console such as GW1200, GW2000, HP2550, or HP3500. Check [supported devices](https://github.com/rhockenbury/homebridge-ecowitt-weather-sensors?tab=readme-ov-file#supported-devices) for the full list of supported gateways and consoles.
* **WSView Plus** app is recommended, available through the [Apple App Store](https://apps.apple.com/us/app/wsview-plus/id1581353359) or the [Google Play Store](https://play.google.com/store/apps/details?id=com.ost.wsautool).

## Installation

Search for "Ecowitt" on the [Homebridge Config UI X](https://github.com/homebridge/homebridge-config-ui-x) Plugins screen, find `homebridge-ecowitt-weather-sensors` and select to install.

## Getting Started

It is recommended to configure the plugin via the **Settings** UI.

The plugin's **Base Station** settings must be configured before configuring the Ecowitt gateway or display console.

### MAC Address

This can be found on the *About* screen on the Weather Display Console, or via the **WSView Plus** app on the "My Devices" tab.

The MAC address is used to validate that the data report received is coming from the correct gateway or display console.

### Data Report Service

The **Port** and **Path** settings configure on which port and path the data report service will listen for data reports coming from the gateway or display console.

Default settings are `8080` for the port and `/data/report` for the path. Other values may be used as desired. Depending on your system or network configuration ensure the **Port** selected is not already in use and that its accessible from the Ecowitt base station.

<span align="center" style="text-align:center">
<div align="center" style="text-align:center">

<img src="./docs/assets/homebridge-plugin-config.png" alt="Homebridge UI Config" width="500"/>

*Plugin UI with Required Configuration Options*

</div>
</span>

### Gateway / Display Console Configuration

After configuring the **Base Station** settings, restart Homebridge and confirm via the status logs that there are no errors and that the data report service has been started and is listening.

Before updating the gateway or display console to report its data to the plugin, ensure all the available devices have been configured and are correctly reporting their data to the base station through the Ecowitt **WSView Plus** app.

The plugin requires the custom weather service to be configured to report data with **Path** and **Port** parameters that match the same in the **Base Station** settings.

The service **Protocol Type** must be configured as **Ecowitt**. The **Upload Interval** can be configured as desired. Anywhere from 20 seconds to 60 seconds is recommended as the data report messages are relatively small and do not put much load on the network or Homebridge host. Keep in mind that Ecowitt devices typically transmit data to the base station every 60-80 seconds (depending on the device) so single digit values for the **Upload Interval** may result in the same repeated data being transmitted from the base station to the plugin.

The gateway or display console can be configured using the Ecowitt **WSView Plus** app. In the app, select gateway or display console under "My Devices" then navigate to "More" on the upper right to select "Weather Services."

<span align="center" style="text-align:center">
<div align="center" style="text-align:center">

<img src="./docs/assets/app-config-nav.png" alt="WSView Plus App 'More' Options" width="200"/>   <img src="./docs/assets/app-config.png" alt="WSView Plus App Weather Services" width="200"/>

*Ecowitt WSView Plus app showing Custom Weather Service*

</div>
</span>

The gateway and display console can also be configured directly via its web UI on the "Weather Services" tab.

<span align="center" style="text-align:center">
<div align="center" style="text-align:center">

<img src="./docs/assets/webui-config.png" alt="Gateway Web UI" width="500"/>

*Ecowitt Gateway Web UI showing Custom Weather Service*

</div>
</span>

It is also recommended to configure the Homebridge host system with a static IP address (or DHCP reservation) to avoid issues with Homebridge IP address changing after system reboots.

After the gateway or display console configuration has been updated, there should be Homebridge status logs indicating accessories are discovered based on the first data report received.

## Supported Devices

The full list of all [Ecowitt sensors](https://shop.ecowitt.com/collections/wifi-sensor) and [Ecowitt consoles](https://shop.ecowitt.com/collections/console) can be found on the [Ecowitt online store](https://shop.ecowitt.com/).

This plugin currently supports the Ecowitt devices shown in the table below. If your Ecowitt device is currently not supported, [please open a feature request](https://github.com/rhockenbury/homebridge-ecowitt/issues/new?assignees=\&labels=enhancement\&projects=\&template=feature-request.md\&title=).

| Device | Description | Service | Product Image |
| -------- | ------- | ------- | ------ |
| GW1000 / GW1100 | WiFi Weather Station Gateway | <ul><li>Indoor Temperature</li><li>Indoor Humidity</li></ul> | <img src="./docs/assets/GW1000-GW1100.jpeg" alt="GW1000" width="200"/> |
| GW1200 | WiFi Weather Station Gateway | <ul><li>Indoor Temperature</li><li>Indoor Humidity</li></ul> | <img src="./docs/assets/GW1200.jpeg" alt="GW1200" width="200"/> |
| GW2000 | WiFi Weather Station Gateway | <ul><li>Indoor Temperature</li><li>Indoor Humidity</li></ul> | <img src="./docs/assets/GW2000.jpeg" alt="GW2000" width="200"/> |
| HP2550 (and variants) | 7" TFT Color Display Console |  | <img src="./docs/assets/HP2550.jpeg" alt="HP2550" width="200"/> |
| HP2560 (and variants) | 7" TFT Color Display Console with Indoor Sensor Antenna | <ul><li>Indoor Temperature</li><li>Indoor Humidity</li></ul> | <img src="./docs/assets/HP2560.jpeg" alt="HP2560" width="200"/> |
| HP3500 (and variants) | 4.3" TFT Color Display Console | | <img src="./docs/assets/HP3500.jpeg" alt="HP3500" width="200"/> |
| WH25 | Indoor Temperature, Humidity and Barometric Sensor | <ul><li>Indoor Temperature</li><li>Indoor Humidity</li></ul> | <img src="./docs/assets/WH25.jpeg" alt="WH25" width="200"/> |
| WH26| Outdoor Temperature and Humidity Sensor | <ul><li>Temperature</li><li>Humidity</li></ul> | <img src="./docs/assets/WH26.jpeg" alt="WH26" width="200"/> |
| WN30 | Thermometer with Probe | <ul><li>Temperature</li></ul> | <img src="./docs/assets/WN30.jpeg" alt="WN30" width="200"/> |
| WN31 / WH31 (including S and EP variants) | Multi-Channel Temperature and Humidity Sensor | <ul><li>Temperature</li><li>humidity</li></ul> | <img src="./docs/assets/WN31.jpeg" alt="WN31" width="200"/> |
| WN32 / WH32 (including EP variant) | Outdoor Temperature and Humidity Sensor <br><br> *Note this will register as a WH26* | <ul><li>Temperature</li><li>Humidity</li></ul> | <img src="./docs/assets/WN32.jpeg" alt="WN32" width="200"/> |
| WN32P | Indoor Temperature, Humidity and Barometric Sensor <br><br> *Note this will register as a WH25*| <ul><li>Indoor Temperature</li><li>Indoor Humidity</li></ul> | <img src="./docs/assets/WN32P.jpeg" alt="WN32P" width="200"/> |
| WN34 (S, D, and L variants) | Multi-Channel Temperature Sensor | <ul><li>Temperature</li></ul>  | <img src="./docs/assets/WN34.jpeg" alt="WN34" width="200"/> |
| WN35 | Leaf Wetness Sensor | <ul><li>Leaf Wetness</li></ul>  | <img src="./docs/assets/WN35.jpeg" alt="WN35" width="200"/> |
| WN36 | Floating Pool Thermometer <br><br> *Note this will register as a WN30* | <ul><li>Temperature</li></ul> | <img src="./docs/assets/WN36.jpeg" alt="WN36" width="200"/> |
| WH40 | Self-Emptying Rain Collector Rainfall Sensor | <ul><li>Rain Rate</li><li>Rain Event Total</li><li>Rain Hourly Total</li><li>Rain Daily Total</li><li>Rain Weekly Total</li><li>Rain Monthly Total</li><li>Rain Yearly Total</li></ul> | <img src="./docs/assets/WH40.jpeg" alt="WH40" width="200"/> |
| WH41 | PM2.5 Air Quality Sensor with Solar Panel | <ul><li>PM2.5 Air Quality</li><li>PM2.5 Air Quality (24hrs)</li></ul> | <img src="./docs/assets/WH41.jpeg" alt="WH41" width="200"/> |
| WH43 | PM2.5 Air Quality Sensor <br><br> *Note this will register as a WH41* | <ul><li>PM2.5 Air Quality</li><li>PM2.5 Air Quality (24hrs)</li></ul> | <img src="./docs/assets/WH43.jpeg" alt="WH43" width="200"/> |
| WH45 | 5-in-1 PM2.5 / PM10 / CO₂ Air Quality Sensor | <ul><li>Temperature</li><li>Humidity</li><li>PM2.5 Air Quality</li><li>PM2.5 Air Quality (24hrs)</li><li>PM10 Air Quality</li><li>PM10 Air Quality (24hrs)</li><li>CO₂ Level</li><li>CO₂ Level (24 hrs)</li></ul> | <img src="./docs/assets/WH45.jpeg" alt="WH45" width="200"/> |
| WH46 | 7-in-1 PM1.0 / PM2.5 / PM4.0 / PM10 / CO₂ Air Quality Sensor | <ul><li>Temperature</li><li>Humidity</li><li>PM2.5 Air Quality</li><li>PM2.5 Air Quality (24hrs)</li><li>PM10 Air Quality</li><li>PM10 Air Quality (24hrs)</li><li>CO₂ Level</li><li>CO₂ Level (24 hrs)</li></ul> | <img src="./docs/assets/WH46.jpeg" alt="WH46" width="200"/> |
| WH51 (and L variant)| Soil Moisture Sensor | <ul><li>Soil Moisture</li></ul> | <img src="./docs/assets/WH51.jpeg" alt="WH51" width="200"/> |
| WH55 | Water Leak Detection Sensor | <ul><li>Water Leak</li></ul> | <img src="./docs/assets/WH55.jpeg" alt="WH55" width="200"/> |
| WH57 | Lightning Detection Sensor | <ul><li>Lightning Events</li><li>Lightning Distance</li><li>Lightning Time</li></ul> | <img src="./docs/assets/WH57.jpeg" alt="WH57" width="200"/> |
| WH65 / WS69 | Solar Powered 7-in-1 Outdoor Station | <ul><li>Temperature</li><li>Humidity</li><li>Solar Radiation</li><li>UV Index</li><li>Wind Direction</li><li>Wind Speed</li><li>Wind Gust Speed</li><li>Wind Max Daily Speed</li><li>Rain Rate</li><li>Rain Event Total</li><li>Rain Hourly Total</li><li>Rain Daily Total</li><li>Rain Weekly Total</li><li>Rain Monthly Total</li><li>Rain Yearly Total</li></ul> | <img src="./docs/assets/WH65.jpeg" alt="WH65" width="200"/> |
| WS68 | Solar Powered 4-in-1 Outdoor Station | <ul><li>Solar Radiation</li><li>UV Index</li><li>Wind Direction</li><li>Wind Speed</li><li>Wind Gust Speed</li><li>Wind Max Daily Speed</li></ul> | <img src="./docs/assets/WS68.jpeg" alt="WS68" width="200"/> |
| WS80 | Solar Powered 6-in-1 Outdoor Station | <ul><li>Temperature</li><li>Humidity</li><li>Solar Radiation</li><li>UV Index</li><li>Wind Direction</li><li>Wind Speed</li><li>Wind Gust Speed</li><li>Wind Max Daily Speed</li></ul> | <img src="./docs/assets/WS80.jpeg" alt="WS80" width="200"/> |
| WS85 | 3-in-1 Solar Weather Station | <ul><li>Wind Direction</li><li>Wind Speed</li><li>Wind Gust Speed</li><li>Wind Max Daily Speed</li><li>Rain Rate</li><li>Rain Event Total</li><li>Rain Hourly Total</li><li>Rain Daily Total</li><li>Rain Weekly Total</li><li>Rain Monthly Total</li><li>Rain Yearly Total</li></ul> | <img src="./docs/assets/WS85.jpeg" alt="WS85" width="200"/> |
| WS90 | Solar Powered 7-in-1 Outdoor Anti-vibration Haptic Sensor Array | <ul><li>Temperature</li><li>Humidity</li><li>Solar Radiation</li><li>UV Index</li><li>Wind Direction</li><li>Wind Speed</li><li>Wind Gust Speed</li><li>Wind Max Daily Speed</li><li>Rain Rate</li><li>Rain Event Total</li><li>Rain Hourly Total</li><li>Rain Daily Total</li><li>Rain Weekly Total</li><li>Rain Monthly Total</li><li>Rain Yearly Total</li></ul> | <img src="./docs/assets/WS90.jpeg" alt="WS90" width="200"/> |

> :warning: **This plugin does not currently implement barometric (pressure) services and PM1.0/PM4.0 air quality services. While these are not supported natively by HomeKit as this time, they are planned to be implemented with custom characteristics, see [this issue](https://github.com/rhockenbury/homebridge-ecowitt-weather-sensors/issues/5).**

## Configuration

### Basic Configuration

This plugin will work with the basic configuration described in [Getting Started](https://github.com/rhockenbury/homebridge-ecowitt-weather-sensors/tree/master?tab=readme-ov-file#getting-started). As an example -

```
{
    "platform": "Ecowitt",
    "baseStation": {
        "mac": "30:C9:22:3E:DD:2B",
        "port": 8080,
        "path": "/data/report"
    }
}
```

### All Configuration

It's recommended to configure the plugin through the Plugin Config UI on the Homebridge UI. [Checkout the configs folder](https://github.com/rhockenbury/homebridge-ecowitt-weather-sensors/tree/master/tests/configs) for examples if you are configuring through JSON directly.

| Option | Default | Explanation |
| -------- | ------- | ------- |
| baseStation.mac | `00:00:00:00:00:00` | The MAC address of the Ecowitt base station. If not set or if invalid, the default is used *and* MAC validation (`additional.macValidation`) will be disabled |
| baseStation.port | `8080` | The port on which to listen for data reports from the Ecowitt Gateway or Console |
| baseStation.path | `/data/report` | The URL path on which to listen for data reports from the Ecowitt Gateway or Console |
| units.wind | `mph` | The units to display wind speed. Possible values are: <br/><br/>`mph`: Miles per Hour<br/>`kmh`: Kilometers per Hour<br/>`mps`: Meters per Second<br/>`kts`: Knots |
| units.rain | `in` | The units to display rain accumulation. Possible values are: <br/><br/>`in`: Inches<br/>`mm`: Millimeters</p> |
| units.distance | `mi` | The units to display distance such as lightning strike distance.  Possible values are: <br/><br/>`mi`: Miles<br/>`km`: Kilometers |
| units.temperature | `fh` | The units to display temperature. Possible values are: <br/><br/>`fh`: Fahrenheit<br/>`ce`: Celcius |
| thresholds | `{}` | A mapping of a weather data property to the trigger threshold for that property.  By default no thresholds are set. Trigger thresholds should be specified in the units selected under the `units` configuration block. Possible keys are: <br/><br/>`windSpeed`<br/>`windGustSpeed`<br/>`windMaxDailySpeed`<br/>`rainRate`<br/>`rainEventTotal`<br/>`rainHourlyTotal`<br/>`rainDailyTotal`<br/>`rainWeeklyTotal`<br/>`rainMonthlyTotal`<br/>`rainYearlyTotal`<br/>`uvIndex`<br/>`lightningEvents`<br/>`lightningDistance *`<br/>`lightningTime *` <br/><br/> \*The value of the weather data property must be <strong>greater than</strong> the threshold to trigger the accessory (motion detected), except for `lightningDistance` and `lightningTime` which are triggered when the weather data property is <strong>less than</strong> the threshold. |
| hidden | `{}` | A mapping of a weather data property or device to whether it should be displayed. By default no weather data or devices are hidden. Possible keys to hide weather data are: <br/><br/>`windDirection`<br>`windSpeed`<br/>`windGustSpeed`<br/>`windMaxDailySpeed`<br/>`rainRate`<br/>`rainEventTotal`<br/>`rainHourlyTotal`<br/>`rainDailyTotal`<br/>`rainWeeklyTotal`<br/>`rainMonthlyTotal`<br/>`rainYearlyTotal`<br/>`solarRadiation`<br/>`uvIndex`<br/>`temperature`<br/>`humidity`<br/>`indoorTemperature`<br/>`indoorhumidity`<br/>`soilMoisture`<br/>`leafWetness`<br/>`waterLeak`<br/>`airQualityPM25`<br/>`airQualityPM25Avg`<br/>`airQualityPM10`<br/>`airQualityPM10Avg`<br/>`carbonDioxide`<br/>`carbonDioxideAvg`<br/>`lightningEvents`<br/>`lightningDistance`<br/>`lightningTime` <br/><br/> Possible keys to hide devices are: <br/><br>`GW1000`<br>`GW2000`<br>`HP2560`<br>`WH25` (Also use for `WN32P`)<br>`WH26` (Also use for `WN32`)<br>`WN30` (Also use for `WN36`)<br>`WN31`<br>`WN34`<br>`WN35`<br>`WH40`<br>`WH41` (Also use for `WH43`)<br>`WH45`<br>`WH46`<br>`WH51`<br>`WH55`<br>`WH57`<br>`WH65`<br>`WS68`<br>`WS80`<br>`WS85`<br/>`WS90`<br><br> Please note that if all weather data properties for a device are hidden, the device itself will be hidden automatically. |
| nameOverrides | `[]` | A list of key value pairs that specifies the override name for an accessory service.  Each override takes on the form: <br><br> `{"key": "<the-service-identifier>", "value", "<the-override-name>"}` <br><br> The service identifier is specified in the form `YYYY(CHZ)` or if an accessory has multiple services the weather data property should be included in the identifier `YYYY(CHZ):<weather-data-property>`. <br><br>`YYYY` is the device id (e.g. WH41) <br> `(CHZ)` is the optional channel id if the device uses a channel. <br><br> The weather data property can be set to any of the weather data keys indicated in `hidden` |
| additional.staticNames | `false` | Set to `true` to not show the weather metric value in the service names of the accessory so that the service names do not change. |
| additional.validateMac | `true` | Check that the MAC address in each data report matches the MAC address specified for the plugin, and do not process the data report if it does not match. |
| additional.luxFactor | `126.7` | Factor to multiple the Solar Radiation data (in W/m<sup>2</sup>) to convert to Lux. |
| additional.acceptAnyPath | `false` | Process data reports that are submitted to the plugin on paths other than the path specified in `baseStation.path`. |
| additional.validateTimestamp | `true` | Check the recency of the data report with the `dateutc` weather data property, and do not process the data report if its determined to be old. |
| additional.removeStaleDevices | `true` | Remove the accessory from Homebridge if it does not appear in the current data report during device discovery. |

## Frequently Asked Questions

### How do I migrate to this plugin from other Homebridge Ecowitt plugins?

> This plugin includes most prior version of Homebridge Ecowitt plugin forks including v1.0 and v1.1 from [spatialdude](https://github.com/spatialdude), v1.2 and v1.3 from [ochong](https://github.com/ochong) and v1.4 from [pavelserbajlo](https://github.com/pavelserbajlo). If you are currently using any of these mentioned versions, you can switch to the same version of <em>this</em> plugin and get the same functionality.

> I would also recommend updating to the latest version of this plugin to take advantage of the new features. Check out the [v2 migration guide](https://github.com/rhockenbury/homebridge-ecowitt-weather-sensors/wiki/V2-Migration-Guide) for more info on updating.

### Does this plugin support devices produced by other manufacturers?

> There are a number of weather station distributors that re-package and re-brand the hardware sensors from [Fine Offset](https://www.foshk.com/Wifi_Weather_Station/). Along with Ecowitt, other notable distributors include Aercus, Ambient Weather, and Frogger.  These brands typically also use similar firmware / software within their ecosystem, and many provide the ability to publish weather data reports to a custom endpoint.

> If the weather station equipment you are using supports a custom weather service endpoint, please [file a feature request](https://github.com/rhockenbury/homebridge-ecowitt/issues/new?assignees=\&labels=enhancement\&projects=\&template=feature-request.md\&title=) to let me know what devices you would like support for. Please make sure to [include the data report](https://github.com/rhockenbury/homebridge-ecowitt-weather-sensors/wiki/Submitting-Data-Report) in the feature request.

### I've added an Ecowitt device to my gateway or console, and can see it on the **WSView Plus** app , but the accessory is not showing up in Homebridge or Homekit?

> The plugin only performs device discovery on the first data report after the plugin starts. If you add a device, please restart Homebridge to trigger the discovery and the plugin should pick up the new device, and create the accessory. In the Homebridge logs, you can look for logs that begin with `Adding new accessory` to confirm it was added.

### I use an Ecowitt sensor that's not currently supported.  What can I do to get it supported?

> Please [open a feature request](https://github.com/rhockenbury/homebridge-ecowitt/issues/new?assignees=\&labels=enhancement\&projects=\&template=feature-request.md\&title=) on the Github project to let me know what devices you are interested in getting support for. Please make sure to [include the data report](https://github.com/rhockenbury/homebridge-ecowitt-weather-sensors/wiki/Submitting-Data-Report) in the feature request.

## Contributing

Contributions are welcomed! Please report bugs, suggest improvements, and open pull requests. For major pull requests, please open an issue first to discuss what you would like to change. See the [Contributing Guide](./docs/CONTRIBUTING.md) for more info.

## Supporting

This plugin requires my time and energy to develop and maintain, as well as the occasional Ecowitt device purchase. If you feel you have gotten value from this plugin, please consider [making a donation](https://www.paypal.com/donate/?business=4G6G3V4CYG2CY).

<span align="center" style="text-align:center">
<div align="center" style="text-align:center">

:fast\_forward: :fast\_forward: :fast\_forward: **[Getting Started](https://github.com/rhockenbury/homebridge-ecowitt-weather-sensors/tree/master?tab=readme-ov-file#getting-started) | [Supported Devices](https://github.com/rhockenbury/homebridge-ecowitt-weather-sensors/tree/master?tab=readme-ov-file#supported-devices) | [Configuration](https://github.com/rhockenbury/homebridge-ecowitt-weather-sensors?tab=readme-ov-file#configuration) | [FAQs](https://github.com/rhockenbury/homebridge-ecowitt-weather-sensors?tab=readme-ov-file#frequently-asked-questions) | [Contributing](https://github.com/rhockenbury/homebridge-ecowitt-weather-sensors/blob/master/docs/CONTRIBUTING.md)** :rewind: :rewind: :rewind:

</div>
</span>
