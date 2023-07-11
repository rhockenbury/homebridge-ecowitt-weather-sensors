
# Ecowitt Sensors Homebridge Plugin

This is a fork of [https://github.com/spatialdude/homebridge-ecowitt](https://github.com/spatialdude/homebridge-ecowitt) with a dependency update and the addition of support for the GW2000C.

A Homebridge plugin providing support for a wide range of **Ecowitt** sensors.

The plugin operates as a service that listens for data reports from an Ecowitt WiFi Gateway or Weather Display Console.

Features include -
* Support for a wide range of sensor types
* Operates locally without the need for any cloud services
* Sensors can be hidden via the plugin settings
* Configurable display units

## Release Notes

* 1.2.0
  * Added GW2000C gateway

* 1.1.0
  * Added rain detection thresholds
  * Added lux conversion factor setting
  * Round inches to mm conversion to 1 decimal place

* 1.0.0
  * Initial release

**Note**: This plugin is still in development. Please consider this when installing it on your system. Feedback is welcome.

## Requirements
* GW1000 Gateway or HP2551 Weather Display Console

## Installation

#### Option 1: Install via Homebridge Config UI X:

Search for "Ecowitt" in [homebridge-config-ui-x](https://github.com/oznu/homebridge-config-ui-x) and install `homebridge-ecowitt`.

#### Option 2: Manually Install:

```
sudo npm install -g homebridge-ecowitt
```

## Configuration

It is recommended to configure the plugin via the **Settings** UI.

The plugin's **Base Station** settings must be configured before configuring the Ecowitt gateway or display console. 

### MAC Address

This can be found int he *About* screen on the Weather Display Console or via the **WS View** app.

The MAC address is used validate that the data report received is coming from the correct gateway or display console.

### Data Report Service

The **Port** and **Path** settings configure on which port and path the data report service will listen for data reports coming from the gateway or display console.

Typical settings for the are `8080` for the port and `/data/report` for the path. Other values may be used as desired. Depending on your system or network configuration ensure the **Port** number being used is not blocked.

### Geteway / Display Console

After configuring the **Base Station** settings, restart Homebridge and confirm via the status log that there are no errors and that the data report service has been started and is listening.

The gateway or display console can be configured using the Ecowitt **WS View** app. The display console can also be configured directly via its UI.

Before updating the gateway or display console to report its data to the plugin, ensure all the available sensors have been configured and are correctly reporting their data.

The plugin requires the custom weather service to be configured to report data with **Path** and **Port** parameters that match the same in the **Base Station** settings.

The service **Protocol Type** must be configured as **Ecowitt**. The **Upload Interval** can be configured as desired. 20 seconds is recommended as the data report messages are relatively small and do not put much load on the network or Homebridge host. 

It is also recommended to configure the Homebridge host system with a static IP address to avoid issues with address changes after system reboots.

After the gateway or display console has been configuration has been updated, sensor data reports will appear in the Homebridge status log. The plugin will automatically configure the accessories based on the first data report received.


## Tested Devices

* GW1000 - WiFi Weather Station Gateway with Indoor Temperature, Humidity and Barometric Sensor
* HP2551 - Weather Station Display Console
* WH24 - Solar Powered 7-in-1 Outdoor Sensor
* WH31 - Multi-Channel Temperature and humidity Sensor
* WH32 - Indoor Temperature, Humidity and Barometric Sensor
* WH41 - PM2.5 Air Quality Sensor Monitor Outdoor
* WH51 - Wireless Soil Moisture Sensor
* WH55 - Wireless Water Leak Detection Sensor with Loud Audio Alarm
* WH57 - Wireless Lightning Detection Sensor
* WH65 - Solar Powered 7-in-1 Outdoor Sensor

## Sensor Notes


### Outdoor Weather Sensors
#### Wind
* Sensors (Can be indvidually hidden via the plugin settings)
    * Direction
    * Speed
    * Gust
    * Maximum Daily Gust 
* Presented as **Motion Sensors**
  * **Motion Detected** status is triggered based on thresholds configured in the plugin settings
* Thresholds are configured using the [Beaufort Scale](https://simple.wikipedia.org/wiki/Beaufort_scale)
* Wind speed display units can be configured in the plugin setting.
  
#### Rain
* Sensors (Can be individually hidden via the plugin settings)
  * Rate
  * Event
  * Hourly
  * Daily
  * Weekly
  * Monthly
  * Yearly
* Presented as **Leak Sensors**
  * For the Rate sensor, the **Leak Detected** status is based on the threshold configured in the plugin settings. 
  * For all other sensors the **Leak Detected** status is triggered if the sensor's value is non-zero
* Rain display units and detection thresholds are configured the plugin settings 
  
#### UV Index
* Can be hidden via plugin settings
* Presented as an **Occupancy Sensor**
  * **Occupancy Detected** status is based on the threshold configured in the plugin settings
  
#### Solar Radiation
* Can be hidden via plugin settings
* Presented as a **Light Sensor**
* Display units and conversion factor to lux are configured in plugin settings
  
### Indoor Thermometer/Hygrometer/Barometer Sensor
* Can be hidden via plugin settings
  
### Multi-Channel Thermometer/Hygrometer Sensors
* Can be hidden via plugin settings
* Up to 8 sensors supported
* Sensors can be individually named via the plugin settings
  
### Lightning Detection Sensor
* Can be hidden via plugin settings
* Number of lighing events is presented as a **Contact Sensor**
  * **Open** state when number of events is > 0
  * **Closed** state when number of events is 0
* Distance and time presented as an **Occupancy Sensor**
  * **Occupancy Detected** status is set when number of events is > 0
* Distance units configured via plugin settings

### Soil Moisture Sensors
* Can be hidden via plugin settings
* Up to 8 sensors supported
* Sensors can be individually named via the plugin settings
* Presented as **Humidity Sensors**
 
### Leak Detection Sensors
* Can be hidden via plugin settings
* Up to 4 sensors supported
* Sensors can be individually named via the plugin settings
  
### PM2.5 Air Quality Sensors
* Can be hidden via plugin settings
* Up to 4 sensors supported
* Sensors can be individually named via the plugin settings
* Current and 24H Average presented as separate sensors
