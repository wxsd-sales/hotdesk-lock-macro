# Hotdesk Lock Macro
This is an example Webex Device macro which locks your device using a PIN code while in an active hotdesk session.

![image](https://github.com/wxsd-sales/hotdesk-lock-macro/assets/21026209/7381599a-33ef-4086-b490-f8d1fb7e3889)


## Overview

This macro is based off this existing example: https://roomos.cisco.com/macros/Pin%20Code%20Lock

When the device wakes out of standby or halfwake, the macro will prompt for a PIN before allowing the device to be used. The extra functionality this macro adds is the following:

- Device Locking is only available while in an active Hotdesk session
- A PIN can be set by the Hotdesk user the first time they use the Lock Button after signing into the device.
- When an invalid PIN has been entered too many times, the device can sign out of that active hotdesking session.
- If no PIN has been set and the device enters standby, it will not prompt for a PIN unlock after waking.


## Setup

### Prerequisites & Dependencies: 

- RoomOS/CE 11 Webex Device provisioned in Hotdesking mode.
- Web admin access to the device to upload the macro.


### Installation Steps:
1. Download the ``hotdesking-lock.js`` file and upload it to your Webex Room devices Macro editor via the web interface.
2. Configure the Macro by changing the initial values, there are comments explaining each one.
3. Enable the Macro on the editor.
    

## Validation

Validated Hardware:

* Desk Pro

This macro should work on other Webex Devices but has not been validated at this time.


## Demo

<!-- Keep the following statement -->
*For more demos & PoCs like this, check out our [Webex Labs site](https://collabtoolbox.cisco.com/webex-labs).


## License
All contents are licensed under the MIT license. Please see [license](LICENSE) for details.


## Disclaimer
Everything included is for demo and Proof of Concept purposes only. Use of the site is solely at your own risk. This site may contain links to third party content, which we do not warrant, endorse, or assume liability for. These demos are for Cisco Webex usecases, but are not Official Cisco Webex Branded demos.


## Questions
Please contact the WXSD team at [wxsd@external.cisco.com](mailto:wxsd@external.cisco.com?subject=hotdesk-lock-macro) for questions. Or, if you're a Cisco internal employee, reach out to us on the Webex App via our bot (globalexpert@webex.bot). In the "Engagement Type" field, choose the "API/SDK Proof of Concept Integration Development" option to make sure you reach our team. 
