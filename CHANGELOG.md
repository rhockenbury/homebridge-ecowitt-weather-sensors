### 2.10.1

* Resolve several issues with error handling and data report parsing

### 2.10.0

* Add support for most Ambient Weather stations and sensors
* Add logic to create accessory for base station even if station model is not recognized
* Accept both PASSKEY and MAC for data report source validation

### 2.9.0-beta

* Add custom hidden feature to hide specific service on a specific device
* Minor updates to plugin UI such as adding additional tooltips and updating text

### 2.8.2-beta

* Introduce limited alpha support for Ambient Weather devices (only WS1965)
* Implement support for WN1900 / WN1910 / WN1920 Ecowitt consoles
* Add support for WN67 5-in-1 weather sensor array
* Resolve a bug where the comparison PASSKEY was generated incorrectly
* Updates in Plugin UI and log messages for easier first-time setup
* Add more documentation on setting name overrides for a sensor

### 2.7.0-beta

* Add more documentation on setting name overrides for a sensor
* Add support for WN and WS series Ecowitt consoles (see README)
* Add support for hiding battery service and setting name override for battery service
* Consolidate gateway/console hiding feature to single hide/show setting
* Internal refactor of data report request parsing and base station discovery

### 2.6.0

* Add support for GW3000 Wifi Gateway
* Add configuration option to log data report each time a data report is received
* Fix discovery and registration of WH40 accessory
* Add characteristic value boundary checks, and cap values at Homekit thresholds if exceeded
* Fix issue with converting wind speeds to kilometer per hour (kph)

### 2.5.1

* Update dependencies
* Fix bug with WN30 and WN35 where name override without metric was not respected

### 2.5.0

* Implement support for WN32 and WN32P
* Add Homebridge verified badge

### 2.4.1

* Promote v2 to GA
* Improve data report simulator with parameters set in definitions file
* Improve error handling for missing required parameters on a sensor

### 2.4.0-beta

* Add support for WH65, WS68, WS80, and WS90
* Implement Light and Ultraviolet sensor types
* Fix issue with mapping wind direction to a sector
* Add paypal funding link to `package.json` and donation section to `README.md`
* Add Github action to close issues with no activity

### 2.3.1-beta

* Add `homepage` field in `package.json` for plugin verification
* Add `name` property in `config.schema.json` for plugin verification

### 2.3.0-beta

* Add support for WH26 and WN30
* Renamed WH31 and WH34 to WN31 and WN34 respectively

### 2.2.0-beta

* Add support for WH41, WH43, WH45, WH46, and WH57
* Implement Air Quality, Carbon Dioxide, and Lightning sensors
* Minor adjustments to thresholds for low battery indication
* Add log notice to indicate what weather data properties are not supported for each device
* Fix minor issue with temperature rounding in dynamic service names
* Add log warning to re-register if weather data properties change on data report
* Add short contributing guide

### 2.1.0-beta

* Update device names to not include parentheses so default names can be saved in Homekit
* Update log messages around adding and removing accessories to include accessory UUID
* Correct migration guide link embedded in log messages
* Add links to collecting/submitting the Ecowitt data report for Github issues
* Implement removeStaleDevices setting to auto-remove devices that do not appear in data report
* Adjusted temperature and humidity service names to mirror Homekit formatting
* Implement rudimentary data report simulator to support manual plugin testing
* Fix issue with timestamp validation and timezone offset
* Add warning if data report interval is set to lower than 10 seconds

### 2.0.0-beta

* New plugin UI for plugin configuration with expanded capabilities
* Added support for GW1200, HP255X, HP256X, and HP3500
* Dynamic service names can be disabled through plugin config
* Set "Value" and "Intensity" characteristics for rain and wind sensors
* Fix bug for WH51 battery sensor above 100% warning
* Fix bug for channel undefined for some accessories
* Reduced plugin noise by reducing log levels where appropriate
* Added more helpful log messages for certain failures cases
* Expanded and more complete documentation in the README
* Implemented v2 config mapper to auto-generate v2 plugin config
* Implemented unit tests, and synthetic tests from real data reports

### 1.4.1

* Fixed typos in wind threshold
* Added a "too high wind speed" sensor with its own threshold to support certain automation edge-cases

### 1.4.0

* Added support for WS-85 - 3-in-1 Solar Weather Sensor, Measures Rainfall, Wind Speed & Direction
* Fixed support for GW2000 where data output was merging its readings with readings of other attached sensor (I'm assuming WS-90 or similar 7-in-1) in the previous fork
* Disabled barometric readings of GW2000 until it is supported by HomeKit as it only pollutes the HomeKit views now
* Fixed display of all sensor names in HomeKit view
* Moved rain triggers from the leak sensor to occupancy sensor to prevent loud notifications for all home members

### 1.3.0

* Add WN34 - Multi-Channel Temperature Sensor

### 1.2.5

* Corrected Node 18 support
* Made GW2000 support generic rather than specific to GW2000C

### 1.2.0

* Added GW2000C gateway

### 1.1.0

* Added rain detection thresholds
* Added lux conversion factor setting
* Round inches to mm conversion to 1 decimal place

### 1.0.0

* Initial release
