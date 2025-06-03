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


function updateEntries(result){
  // Update today's entries section
      const todayEntriesDiv = document.getElementById('todaysEntriesDiv');
      todayEntriesDiv.innerHTML = ''; // Clear previous entries
      if(result.entries.length === 0) {
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


document.getElementById('recordForm').addEventListener('submit', function (event) {
  event.preventDefault(); // Prevent form submission

  // Get form data
  var options = document.getElementById('options').value; // Get selected option value
  var waterLevel = document.getElementById('waterLevel').value; // Note: Extra space in ID is intentional
  var gateOpening = document.getElementById('gateOpening').value; // Note: Extra space in ID is intentional
  var gpsLocation = document.getElementById('gpsLocation').value;
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
    gpsLocation: gpsLocation
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
      // Handle server response here
      const formMessage = document.getElementById('formMessage');
      formMessage.textContent = `Data submission: ${result.message}`;

      document.getElementById('recordForm').reset(); // Reset form
      fetchGPSLocation(); // Fetch GPS location again

      // Update today's entries title
      const todaysEntriesTitle = document.getElementById('todaysEntriesTitle');
      todaysEntriesTitle.textContent = `Today's Entries for ${result.entries[0].Structures_In_Out_Device}`;
      // Clear previous entries
      updateEntries(result); // Update today's entries section with new data
      
    })
    .catch(error => {
      console.error('Error:', error);
      alert('An error occurred while submitting the data.');
      console.log(error);
    });
});

document.getElementById('options').addEventListener('change', function() {
  toggleGateInput();
});

// Fetch GPS location on page load
window.onload = function () {
  toggleGateInput(); // Set initial state of gate input based on selected option
  fetchGPSLocation(); // Fetch GPS location on page load
}