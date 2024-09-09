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
