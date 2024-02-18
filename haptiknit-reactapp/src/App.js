import React, {useState, useEffect} from 'react';
import './App.css';
import logo from './charmlab_logo.jpg';
import Dropdown from 'react-bootstrap/Dropdown';

// Set UUIDs
const controlServiceUUID = "00002a6a-0000-1000-8000-00805f9b34fb";
const characteristicsUUID = {
  command: "00002a6b-0000-1000-8000-00805f9b34fb",
  min_pressure: "00002a6c-0000-1000-8000-00805f9b34fb",
  max_pressure: "00002a6d-0000-1000-8000-00805f9b34fb",
  pressure: "00002a6e-0000-1000-8000-00805f9b34fb",
  battery: "00002a6f-0000-1000-8000-00805f9b34fb"
}

// Set global variables
let myPort;
let ledStatus = "LED: OFF";
let chrPressureValue;
let oldPressureLevel = 0;
let minPress = 0;
let maxPress = 0;
let avgPress = 0;

function App() {

  // General Use States for connected devices and pressure testing.
  const [connectedDevice, setConnectedDevice] = useState(null); // Store connected device
  const [deviceName, setDeviceName] = useState('No Device Connected');
  const [pressures, setPressures] = useState(Array(8).fill(''));

  // Initial full list of actuators, no need to mark them as placed initially
  const initialActuators = Array.from({ length: 8 }, (_, i) => ({ id: i, label: `Actuator ${i + 1}` }));
  const [actuatorNumbers, setActuatorNumbers] = useState(1); 
  const [placedActuators, setPlacedActuators] = useState([]);
  const [grid, setGrid] = useState(Array.from({ length: 8 }, () => Array(4).fill(null)));

  {/* Several functions that handle the mapping of buttons.*/}

  // Adjust actuators available for dragging based on dropdown selection
  const handleActuatorNumberChange = (number) => {
    setActuatorNumbers(number);
    // Reset placedActuators state if needed, depending on your handling of placed actuators
    setPlacedActuators([]);
  };

  const handleDragStart = (event, actuator) => {
    console.log("this is the console");
    console.log(event ); // Check the event object

    event.dataTransfer.setData('text/plain', JSON.stringify(actuator));
    event.dataTransfer.effectAllowed = 'move'; // Specifies the allowed effect for the drag operation
  };

  const handleDrop = (event, rowIndex, colIndex) => {
    console.log(event); // Check the event object
    event.preventDefault(); // Prevent default to allow drop
    const actuator = JSON.parse(event.dataTransfer.getData('text'));

    if (!placedActuators.find(a => a.id === actuator.id)) {
      setPlacedActuators(prev => [...prev, actuator]); // Mark the actuator as placed

      // Update the grid with the dropped actuator
      const newGrid = [...grid];
      newGrid[rowIndex][colIndex] = actuator;
      setGrid(newGrid);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Handles change in input fields for KPA

  const handleChange = (index, value) => {
    const numericValue = Number(value);
    if (numericValue > 255) {
      // Show an alert if the value exceeds 255
      alert('Value cannot exceed 255 KPA');
    } else {
      // Update the value normally if within the limit
      const updatedPressures = [...pressures];
      updatedPressures[index] = value; // Assuming you want to keep the input as a string
      setPressures(updatedPressures);
    }
  };

  // Handles connection to PortFlow device.

  const connectToBluetoothDevice = async () => {
    console.log("Attempting to connect to a Bluetooth device...");
    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [], // Specify services
      });

      // Assuming immediate connection
      const server = await device.gatt.connect();
      console.log('Connected:', server.connected);
      
      if (device.gatt.connected) {
        setDeviceName(device.name);
        console.log(`Connected to ${device.name}`);
      } else {
        device.gatt.connect().then(() => {
          setDeviceName(device.name);
          console.log(`Connected to ${device.name}`);
        });
      }
    
      setConnectedDevice(device);
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

const disconnectBluetoothDevice = () => {
    if (connectedDevice && connectedDevice.gatt.connected) {
      console.log("Attempting to disconnect to a Bluetooth device...");

      setDeviceName(`Disconnecting from ${connectedDevice.name}...`);
      connectedDevice.gatt.disconnect();
      setConnectedDevice(null);
      console.log(`Disconnected to ${connectedDevice.name}`);
      setDeviceName('Disconnected');
    } else {
      console.log('No device is connected.');
    }
  };

  const handleClick = () => {
    alert('Button clicked!');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Submitted Pressures:', pressures.slice(0, actuatorNumbers));
    // Here, you can add what you want to do on form submission, like sending data to a server
  };

  // PART 2: Styling to help making the GUI more intuitive to understand.

  const actuatorsButton = {
    margin: 25,
    padding: '15px', // Adjust as needed to ensure the button is circular
    border: 'none',
    display: 'inline-block',
    borderRadius: '50%',
    backgroundColor: 'crimson',
    color: 'white',
    cursor: 'pointer',
    userSelect: 'none',
    fontSize: '16px', // Adjust based on your preference
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: '1', // Ensures the text is centered if it wraps
  }
  const actuator = {
    padding: '15px', // Adjust as needed to ensure the button is circular
    border: 'none',
    display: 'inline-block',
    borderRadius: '50%',
    backgroundColor: 'crimson',
    color: 'white',
    cursor: 'pointer',
    userSelect: 'none',
    fontSize: '16px', // Adjust based on your preference
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: '1',
  }
  const gridGrey = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 100px)',
    gridGap: '40px',
    margin: '35px',
    justifyContent: 'center',
    padding: '20px',
    border: '5px solid #ccc',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    backgroundColor: '#f0f0f0',
  };
  const textStyle = {
    height: '40px',
    color: 'black',
    margin: '25px',
  };
  const inputStyle = {
    marginLeft: '10px',
    marginBottom: '5px',
  }
  const imagelogo = {
    height: '50px',
    margin: '15px',
  };
  const dropdown = {
    marginBottom: '60px',
    marginLeft: '25px',
    fontSize: '40px',
  };

  const dropdowntext = {
    padding: '15px', // Adjust as needed to ensure the button is circular
    border: 'none',
    marginTop: '15px',
    marginBottom: '25px',
    display: 'inline-block',
    backgroundColor: 'grey',
    color: 'white',
    cursor: 'pointer',
    fontSize: '16px', // Adjust based on your preference
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: '1', // Ensures the text is centered if it wraps
  }
  const buttonStyle = {
    margin: 25,
    padding: '15px', // Adjust as needed to ensure the button is circular
    border: 'none',
    display: 'inline-block',
    borderRadius: '50%',
    backgroundColor: 'crimson',
    color: 'white',
    cursor: 'pointer',
    userSelect: 'none',
    fontSize: '16px', // Adjust based on your preference
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: '1', // Ensures the text is centered if it wraps
  }
  const buttonStyleTwo = {
    margin: 25,
    padding: '15px', // Adjust as needed to ensure the button is circular
    display: 'inline-block',
    color: 'white',
    cursor: 'pointer',
    userSelect: 'none',
    fontSize: '16px', // Adjust based on your preference
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: '1', // Ensures the text is centered if it wraps
  }
  const buttonLabels = Array.from({ length: actuatorNumbers }, (_, index) => (index + 1));

  return (
    <div>
      <div>
        <h1 style={textStyle}>A Knit Haptic Pneumatic Sleeve</h1>
      </div>
      <p style={textStyle}>Connected Device: {deviceName}</p>

      {/* Connect Bluetooth */}

      <button
        style={{ ...buttonStyleTwo, backgroundColor: connectedDevice ? 'gray' : 'blue' }} // Example style change based on connection status
        onClick={connectToBluetoothDevice}
        disabled={!!connectedDevice}
      >
        {connectedDevice ? 'Connected' : 'Connect Bluetooth'}
      </button>

      {/* Disconnect Bluetooth */}
      <button
        style={{ ...buttonStyleTwo, backgroundColor: connectedDevice ? 'blue' : 'gray' }}
        onClick={disconnectBluetoothDevice}
        disabled={!connectedDevice}
        > Disconnect Bluetooth </button>

      <h3 style={textStyle}> You have {actuatorNumbers} actuators selected. </h3>

      <Dropdown style={dropdown}>
        <Dropdown.Toggle variant="success" id="dropdown-basic">
          Select Number of Actuators
        </Dropdown.Toggle>
        <Dropdown.Menu style={dropdown}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(number => (
            <Dropdown.Item key={number} style={dropdowntext} onClick={() => handleActuatorNumberChange(number)}>
              {number}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>

      {/* Populate Actuator Buttons */}
      <div style={{ margin: 25, padding: 50 }}>
        {initialActuators.slice(0, actuatorNumbers).filter(actuator => 
          !placedActuators.find(a => a.id === actuator.id)).map(actuator => (
            <button
              key={actuator.id}
              draggable
              onDragStart={(event) => handleDragStart(event, actuator)}
              style={actuatorsButton}
            >
              {actuator.label}
            </button>
          ))}
      </div>


      {/* Show Grey Grid*/}
      <div style={gridGrey}>
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              onDrop={(event) => handleDrop(event, rowIndex, colIndex)}
              onDragOver={(event) => handleDragOver(event)}
              style={cell}
            >
              {cell ? <div style={actuator}>{cell.label}</div> : "Drop here"}
            </div>
          ))
        )}
      </div> 
      
      {/* Set Pressure */}
      <div >
        <form onSubmit={handleSubmit}>
          {Array.from({ length: actuatorNumbers }).map((_, index) => (
            <div key={index}>
              <label style={textStyle}>
                Actuator {index + 1} - set pressure:
                <input
                  style={inputStyle}
                  type="number"
                  value={pressures[index]}
                  onChange={(e) => handleChange(index, e.target.value)}
                  placeholder="Pressure value"
                />
              </label>
            </div>
          ))}
          <button type="submit">Submit</button>    
        </form>
      </div>

      <img style={imagelogo} src={logo} alt="Logo" />;
    </div>
  );
}

export default App;
