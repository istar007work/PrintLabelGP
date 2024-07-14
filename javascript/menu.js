
// Import the generateESN function
const generateESN = require('./generate_esn');


// memu function 

function showContent(contentId) {
  var content = document.getElementById('dynamicContent');
  switch (contentId) {

      /////////////////////////
      ////////////////////////
      


      /////////////////////////
      ////////////////////////
      case 'print_label':
        // Remove the fetch logic for models
        // Assuming content is defined somewhere in your code
        content.innerHTML = `
            <h2>Welcome to Print Label Page</h2>
            <form id="printLabelForm">
                <label for="model">Model:</label>
                <input type="text" id="model" name="model" maxlength="3" size="3">
                <br><br>
                <label for="carrier"> Carrier:</label>
                <select id="carrier" name="carrier">
                    <option value="AT&T">AT&T</option>
                    <option value="Verizon">Verizon</option>
                    <option value="Aries">Aries</option>
                    <option value="Kore">Kore</option>
                    <option value="T-Mobile">T-Mobile</option>
                </select>
                <br><br>
                <label for="from">From:</label><input type="text" id="from" name="from" pattern="[0-9]*" maxlength="4" size="5">
                <label for="to">To:</label><input type="text" id="to" name="to" pattern="[0-9]*" maxlength="4" size="5">

                <br><br>
                <button type="button" onclick="submitForm()">Submit</button>
            </form>
            <div id="result"></div>
        `;
        break;


      
    



      






      case 'latest_esn':
        content.innerHTML = `
            <h2>Click the button below to view the latest serial numbers</h2>
            <button id="refreshButton">Refresh</button>
        `;
        // Add event listener for the Refresh button after content is rendered
        const refreshButton = document.getElementById('refreshButton');
        if (refreshButton) {
            refreshButton.addEventListener('click', fetchLatestESNs);
        }
        break;
    
      case 'services':
          content.innerHTML = '<h2>This is the Services Page</h2>';
          break;

          case 'addModel':
            content.innerHTML = `
                <h2>Add a new device model</h2>
                <form id="addModelForm">
                    <label for="newModelName">Model Name:</label>
                    <input type="text" id="newModelName" name="newModelName">
                    <button type="button" onclick="handleModel('save')">Save Model</button>
                </form>
            `;
            break;
        break;





      default:
          content.innerHTML = '<h2>Page Not Found</h2>';
          break;
  }
}



function submitForm() {
  var model = document.getElementById('model').value.trim();
  var from = parseInt(document.getElementById('from').value);
  var to = parseInt(document.getElementById('to').value);
  var carrier = document.getElementById('carrier').value.trim();

  // Validate model
  if (!model) {
      alert('Please select a valid model.');
      return;
  }

    // Validate from and to
  // Validate from and to
  if (isNaN(from) || isNaN(to) || from < 0 || to <= 0 || from > to) {
    alert('Please enter valid numeric values for From and To: From should be 0 or greater, and To should be greater than From.');
    return;
  }


  // Validate carrier
  var validCarriers = ['AT&T', 'Verizon', 'Aries', 'Kore', 'T-Mobile'];
  if (!validCarriers.includes(carrier)) {
      alert('Please select a valid carrier.');
      return;
  }

  // Make the request to generate ESNs
  fetch('/generate-esns', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ model, from, to, carrier })
  })
  .then(response => response.json())
  .then(data => {
    console.log('Response Data:', data);
    if (data.error) {
        if (data.error.includes('Duplicate entry')) {
            alert('Error: Duplicate entry encountered while moving data to archive.');
        } else {
            alert('Error: ' + data.error);
        }
        return;
    }
      console.log('Serial numbers successfully generated and saved in Database:', data.esns); // Ensure 'esns' is defined in the response
      var resultDiv = document.getElementById('result');
      resultDiv.innerHTML = `
          <h3>Serial numbers successfully generated and saved in Database:</h3>
          <ul>
              ${data.esns.map((esn, index) => `<li>${esn} - ${data.carrier}</li>`).join('')}
          </ul>
      `;
  })
  .catch(error => console.error('Error:', error));
}


// Function to fetch and display latest ESNs from server
function fetchLatestESNs() {
  fetch('/latest_esn')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      const content = document.getElementById('dynamicContent');
      if (content) {
        content.innerHTML = '<h2>Latest ESNs</h2>';
        const table = document.createElement('table');
        table.innerHTML = `
          <thead>
            <tr>
              <th>Serial Number</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(item => `
              <tr>
                <td>${item.serial_number}</td>
              </tr>
            `).join('')}
          </tbody>
        `;
        content.appendChild(table);
      }
    })
    .catch(error => {
      console.error('Error fetching latest ESNs:', error);
    });
}


