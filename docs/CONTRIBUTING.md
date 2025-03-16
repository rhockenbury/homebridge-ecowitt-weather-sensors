## Contributing

Contributions are welcomed! Please report bugs, suggest improvements, and open pull requests. For major improvements, please open an issue first to discuss what you would like to change.

#### Implementation Flow

Here's the rough order of things that I recommend when adding support for a new device:

* \[ ] Implement the sensor (if needed)
* \[ ] Implement unit tests for the sensor
* \[ ] Implement the device
* \[ ] Implement unit tests for the device
* \[ ] Add any conversion logic for Ambient devices to `src/Util.ts`
* \[ ] Modify `src/EcowittPlatform.ts` to add the device
* \[ ] Implement synthetic tests for the device (must have sample data)
* \[ ] Update `config.schema.json` to add config properties (hidden and thresholds)
* \[ ] Update the `README.md` to add the device
* \[ ] Open a PR targeting the `dev` branch
* \[ ] Check for any needed updates on [project wiki](https://github.com/rhockenbury/homebridge-ecowitt-weather-sensors/wiki)

#### Validation

Before opening a PR, please ensure that all tests and linting succeeds, and that the code builds:

* \[ ] `npm run test`
* \[ ] `npm run lint`
* \[ ] `npm run build`

#### Dev Resources

* [TypeScript Documentation](https://www.typescriptlang.org/docs/)
* [Homebridge Developer Docs](https://developers.homebridge.io)
* [Homekit Developer Docs](https://developer.apple.com/documentation/homekit/)
* [Local Homebridge Environment Setup](https://github.com/homebridge/homebridge?tab=readme-ov-file#plugin-development)
* [Fine Offset Clone Guide](https://meshka.eu/Ecowitt/dokuwiki/doku.php?id=start)

https://github.com/apple/HomeKitADK/blob/master/HAP/HAPCharacteristicTypes.h
https://developer.apple.com/documentation/homekit/

> :information\_source: Please let me know if there's anything else I can provide to help get your started!
