

#LOWER PRIORITY
## apply linting to test files
## recheck if I can adjust bounds of solar radiation
## add option to split unit to seperate charcteristic

"seperateUnits" feature -> MOVE TO ANOTHER RELEASE



## migration - lightning -> lightningDistance, generalize v2+ migration


## add wiki for config migrations, plus link to in log messages
https://github.com/rhockenbury/homebridge-ecowitt-weather-sensors/wiki/Handling-Plugin-Config-Migrations


## add wiki for for motion detected sensors
https://github.com/rhockenbury/homebridge-ecowitt-weather-sensors/wiki/Setting-Threshold-Triggers



## clean up other implementations of isEcowwit (optional) sensors
------ need to update unit tests for other devices - DONE


## finish implementing totalrainin metrics on rest of devices / and update tests
----- need to also add to plugin UI - DONE, TEST


## add meters and feet to possible units for lds
---- added to config UI - DONE
---- update unit tests to test ft and meters - DONE




## PLUGIN - DID NOT ADD thresholds for LDS01 -> decide ??
## should also introduce new threshold settings with these changes


## UPDATE README
- add LDS01
-- add note about motion sensors somewhere??
-- new custom thresholds config section -> add to setings in README


## add link to Wiki in plugin ui

## remove notes and catalog pages in wiki


rain total hide didn't work????
wind speed hide didn't work??


rain total across all sensors??? -> check all rain devices - shoudl be ok

## search for TODOs - to make sure

## add threshold for winddir - should be done, need to test

## test full migration

## add rainTotal to readme for sensors - DONE, double check

## test hide device - OK

## should only hide device if all data properties hidden + no thresholds set for those data properties - DONE
