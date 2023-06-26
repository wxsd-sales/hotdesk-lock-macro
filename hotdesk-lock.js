/********************************************************
 * 
 * Macro Author:      	William Mills
 *                    	Technical Solutions Specialist 
 *                    	wimills@cisco.com
 *                    	Cisco Systems
 * 
 * Version: 1-0-1
 * Released: 06/17/23
 * 
 * This is an example Webex Device macro which locks your 
 * device using a PIN code while in an active hotdesk session
 * 
 * Full Readme, source code and license agreement available on Github:
 * https://github.com/wxsd-sales/hotdesk-lock-macro
 * 
 ********************************************************/
import xapi from 'xapi';

const config = {
  maxattempts: 3, // Max PIN attempts before auto sign out
  button: {
    name: 'Lock Device', // Name of Lock Button
    color: '#eb4034', // Color of button if using non custom icon
    icon: 'https://wxsd-sales.github.io/kiosk-demos/icons/lockpad.png' // Default Icon or a URL to a PNG for custom
  },
  panelId: 'lockButton' // Base Panel Id used for auto UI Creation and Processing
}

/*********************************************************
 * Create Panel and Subscribe to Status Changes and Events
**********************************************************/

createPanel();
xapi.Event.UserInterface.Extensions.Panel.Clicked.on(processClicks)
xapi.Event.UserInterface.Message.TextInput.Response.on(processTextInputResponse)
xapi.Event.UserInterface.Message.TextInput.Clear.on(processTextInputClear)
xapi.Status.Webex.DevicePersonalization.Hotdesking.SessionStatus.on(processHotdeskSession);
xapi.Status.Standby.State.on(processStandbyChange)

/*********************************************************
 * Main functions of the macro
**********************************************************/

let pin = '';
let attempts = 0;

function processClicks(event) {
  if (event.PanelId != config.panelId) return;
  if (pin === '') {
    askForPIN(true)
  } else {
    xapi.Command.Standby.Halfwake();
  }
}

function processTextInputResponse(event) {
  switch (event.FeedbackId) {
    case 'pin-code-response':
      if (event.Text == pin) {
        console.log('PIN valid')
        attempts = 0;
        return;
      }
      console.log('Invalid PIN')
      if (attempts == config.maxattempts) {
        console.log('Max PIN attempts reached, logging out of hotdesk session')
        xapi.Command.Webex.Registration.Logout();
      } else {
        attempts = attempts + 1;
        askForPIN();
      }
      break;
    case 'pin-code-setup':
      if (event.Text.length >= 4) {
        pin = event.Text;
        xapi.Command.Standby.Halfwake();
      } else {
        xapi.Command.UserInterface.Message.Alert.Display(
          { Duration: 8, Text: 'The PIN must be a minimum of 4-digits', Title: 'Invalid PIN' });
      }
      break;
  }
}

function processTextInputClear(event) {
  if (event.FeedbackId != 'pin-code-response') return;
  xapi.Command.Standby.Halfwake();
}

function processHotdeskSession(state) {
  switch (state) {
    case 'Available':
      console.log('Device Available - hiding lock button');
      xapi.Command.UserInterface.Extensions.Panel.Update({ PanelId: config.panelId, Visibility: 'Hidden' });
      break;
    case 'Reserved':
      console.log('Device Reserved - displaying lock button');
      xapi.Command.UserInterface.Extensions.Panel.Update({ PanelId: config.panelId, Visibility: 'Auto' });
      break;
  }
  pin = '';
}

async function processStandbyChange(state) {
  if (state != 'Off') return;
  if (pin === '') return;
  const sessionStatus = await getHotdeskingStatus();
  if (sessionStatus != 'Reserved') return;
  askForPIN();
}

function getHotdeskingStatus(){
  return xapi.Status.Webex.DevicePersonalization.Hotdesking.SessionStatus.get()
  .catch(error => {return 'Available'})
}

function askForPIN(setup = false) {
  const requestText = (attempts > 0) ?
  `Please Enter PIN<br>Attempt (${attempts}/${config.maxattempts})` : 
  'Please Enter PIN';

  xapi.Command.UserInterface.Message.TextInput.Display({
    FeedbackId: setup ? 'pin-code-setup' : 'pin-code-response',
    InputType: 'PIN',
    Placeholder: setup ? 'Please set a new PIN' : 'Please Enter PIN',
    SubmitText: 'Submit',
    Text: setup ? 'Please set a PIN before the device can be locked<br>minimum 4-digits' : requestText,
    Title: setup ? 'Create PIN' : 'Device Locked'
  });
}

function getIcon(url) {
  return xapi.Command.UserInterface.Extensions.Icon.Download({ Url: url })
    .then(result => result.IconId)
    .catch(error => {
      console.log('Unable to download icon: ' + error.message)
      return false
    })
}

async function createPanel() {
  let icon = '';
  if (config.button.icon.startsWith('http')) {
    const iconId = await getIcon(config.button.icon)
    icon = `<Icon>Custom</Icon>
              <CustomIcon>
                <Id>${iconId}</Id>
              </CustomIcon>`
  } else {
    icon = `<Icon>${config.button.icon}</Icon>`
  }

  const panel = `<Extensions>
                  <Panel>
                    <Location>HomeScreen</Location>
                    <Type>Home</Type>
                    ${icon}
                    <Color>${config.button.color}</Color>
                    <Name>${config.button.name}</Name>
                    <ActivityType>Custom</ActivityType>
                  </Panel>
                </Extensions>`;

  xapi.Command.UserInterface.Extensions.Panel.Save({ PanelId: config.panelId }, panel)
    .then(result => {
      getHotdeskingStatus().then(state => processHotdeskSession(state)) 
    })
}
