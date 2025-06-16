import { calculateQ } from './calculate_Q.js';
// Function to add days to a date
function addDays(date, days) {
    let result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}  
// Function to calculate the number of days between two dates
function daysBetween(date1, date2) {
    const diffTime = Math.abs(new Date(date2) - new Date(date1)); // Get the absolute difference in milliseconds
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
}

// Disable gate opening input if "ABC" is selected
function toggleGateInput() {
  var select = document.getElementById('options');
  var input = document.getElementById('gateOpening');
  var selectedValue = select.value;
  if (selectedValue.includes('BCW')) {
    input.readOnly = true;
    input.value = '-1'; // Set to -1 when readOnly
  } else {
    input.readOnly = false;
  }
}
// Fetch GPS location using Geolocation API
function fetchGPSLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        var gpsInput = document.getElementById('gpsLocation');
        gpsInput.value =
          position.coords.latitude + ', ' + position.coords.longitude;
      },
      function (error) {
        var gpsInput = document.getElementById('gpsLocation');
        gpsInput.value = 'Unable to retrieve GPS location';
      }
    );
  } else {
    var gpsInput = document.getElementById('gpsLocation');
    gpsInput.value = 'Geolocation not supported';
  }
}

// Function to update today's entries section
function updateEntries(result){
  // Update today's entries section
      const todayEntriesDiv = document.getElementById('todaysEntriesDiv');
      todayEntriesDiv.innerHTML = ''; // Clear previous entries
      if(result.entries.length === 0){
        todayEntriesDiv.textContent = 'No entries for today.';
      }else{
        const table = document.createElement('table');
        table.id = 'entriesTable';
        const headerRow = document.createElement('tr');
        Object.keys(result.entries[0]).forEach(key => {
          const th = document.createElement('th');
          th.textContent = key;
          headerRow.appendChild(th);
        });
        table.appendChild(headerRow);
        result.entries.forEach(entry => {
          const row = document.createElement('tr');
          Object.values(entry).forEach(value => {
            const td = document.createElement('td');
            td.textContent = value;
            row.appendChild(td);
          });
          table.appendChild(row);

        }); 
        todayEntriesDiv.appendChild(table);
      }
}

// Get flowRows from the server-side rendered data
// Handle submission of the form
document.getElementById('recordForm').addEventListener('submit', function (event) {
  event.preventDefault(); // Prevent form submission

  // Get form data
  var options = document.getElementById('options').value; // Get selected option value
  var waterLevel = document.getElementById('waterLevel').value; // Note: Extra space in ID is intentional
  var gateOpening = document.getElementById('gateOpening').value; // Note: Extra space in ID is intentional
  var gpsLocation = document.getElementById('gpsLocation').value;
  var selectedOptionFlowID = Number(options.split('_')[0]); // Extract flow_id from the selected option

  //locate q_planned value based on the selected option
  let selectedRow = flowRows.find(row => row.id === selectedOptionFlowID);

  const qpIndex = getQPIndex(new Date('2024-11-1')); // Get the index for q_planned based on days difference
  const qp = selectedRow.q_planned[qpIndex];

  // Calculate Q_actual based on water level and gate opening
  // Note: The dimensions are extracted from the selectedRow object
  const dimMap={
    bc: selectedRow.bcw_bc,
    p1: selectedRow.bcw_p1,
    l: selectedRow.bcw_l,
    b: selectedRow.sg_b,
    hc: selectedRow.sg_hc,
    numgates: selectedRow.sg_numgates,
    type: selectedRow.device_type
  };
  const qa = parseFloat(calculateQ(waterLevel,gateOpening,dimMap).toFixed(2));
  
  //calculate K value
  let k = (qp === 0? 0: qa/qp);
  k= parseFloat(k.toFixed(3)); 

  // Validate inputs
  if (!options || !waterLevel || !gateOpening) {
    alert('Please fill in all fields.');
    return;
  }
  if (isNaN(waterLevel) || isNaN(gateOpening)) {
    alert('Water level and gate opening must be numbers.');
    return;
  }
  // Prepare data to send
  var data = {
    options: options,
    waterLevel: waterLevel,
    gateOpening: gateOpening,
    gpsLocation: gpsLocation,
    q_planned: qp,
    q_actual: qa,
    k: k
  };


  // Send data to server and handle response
  fetch('/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(response => response.json())
    .then(result => {
      // Handle server response
      const formMessage = document.getElementById('formMessage');
      if (result.success) {formMessage.textContent = `Data submission successful`;}
      else {formMessage.textContent = `Error: ${result.error}`;}

      document.getElementById('recordForm').reset(); // Reset form
      fetchGPSLocation(); // Fetch GPS location again

      // Update today's entries title
      const todaysEntriesTitle = document.getElementById('todaysEntriesTitle');
      todaysEntriesTitle.textContent = `Today's Entries for ${result.entries[0].Structures_In_Out_Device}`;
      updateEntries(result); // Update today's entries section with new data
      
    })
    .catch(error => {
      console.error('Error:', error);
      alert('An error occurred while submitting the data.');
    });
});
function getQPIndex(startDate) {
  const today = new Date();
  const daysDiff = daysBetween(startDate, today);
  return Math.floor(daysDiff/5);
}

//display dimensions of the selected device on change of the select option
document.getElementById('options').addEventListener('change', function() {
  const selectedOption = this.value;
  const flowID = Number(selectedOption.split('_')[0]); 
  let inner = '';
  let selectedRow = flowRows.find(row => row.id === flowID);
  const qpIndex = getQPIndex(new Date('2024-11-1')); // Get the index for q_planned based on days difference
    console.log(qpIndex);

  if (selectedRow.device_type === 'BCW') {
    inner = `Bc: ${selectedRow.bcw_bc} <br>P1: ${selectedRow.bcw_p1}<br> L: ${selectedRow.bcw_l} <br> Q planned: ${selectedRow.q_planned[qpIndex]}`;
  }else if (selectedRow.device_type === 'SG') {
    inner = `b: ${selectedRow.sg_b} <br> Hc: ${selectedRow.sg_hc}<br> number of gates: ${selectedRow.sg_numgates}<br>Q planned: ${selectedRow.q_planned[qpIndex]}`;
  }else if(selectedRow.device_type === 'TRAPEZOIDAL_WEIR'){
    inner = `Top width: ${selectedRow.c_topwidth} <br> Bottom width: ${selectedRow.c_bottomwidth}<br> L: ${selectedRow.c_l}<br>Q planned: ${selectedRow.q_planned[qpIndex]}`;

  }
  else{
    inner = 'No additional information available for this device type.';
  }
  document.getElementById('dimdiv' ).innerHTML = inner; // Update the inner HTML of the div with id 'dimdiv'
  document.getElementById('formMessage').textContent = ''; // Clear any previous messages
    }
  );
    

document.getElementById('options').addEventListener('change', function() {
  toggleGateInput();

});


// Fetch GPS location on page load
window.onload = function () {
  toggleGateInput(); // Set initial state of gate input based on selected option
  fetchGPSLocation(); // Fetch GPS location on page load
}
