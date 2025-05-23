// Disable gate opening input if "ABC" is selected
function toggleGateInput() {
  var select = document.getElementById('options');
  var input = document.getElementById('gateOpening');
  var selectedValue = select.value;
  if (selectedValue.includes('ABC')) {
    input.disabled = true;
  } else {
    input.disabled = false;
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

// Fetch GPS location on page load
window.onload = function () {
  fetchGPSLocation();
};
