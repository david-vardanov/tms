// Define path to testimonials file
const testimonialsFile = '../testimonials.txt';


// Get the testimonials from the file
fetch(testimonialsFile)
  .then(response => response.text())
  .then(data => {
    // Split the testimonials into an array
    const testimonials = data.split('\n');

    // Get the carousel indicators and inner element
    const indicators = document.querySelector('.carousel-indicators');
    const inner = document.querySelector('.carousel-inner');

    // Loop through the testimonials and create carousel items and indicators
    testimonials.forEach((testimonial, index) => {
      // Create carousel item
      const item = document.createElement('div');
      item.classList.add('carousel-item');
      

      // Create testimonial element and add to carousel item
      const testimonialEl = document.createElement('p');
      testimonialEl.classList.add('text-center')
      testimonialEl.textContent = testimonial;
      item.appendChild(testimonialEl);

      // Add active class to first item
      if (index === 0) {
        item.classList.add('active');
      }

      // Add carousel item to inner element
      inner.appendChild(item);

      // Create indicator and add to indicator element
      const indicator = document.createElement('li');
      indicator.setAttribute('data-target', '#testimonials');
      indicator.setAttribute('data-slide-to', index.toString());

      // Add active class to first indicator
      if (index === 0) {
        indicator.classList.add('active');
      }

      // Add indicator to indicator element
      indicators.appendChild(indicator);
    });
  })
  .catch(error => console.error('Error loading testimonials:', error));

// Enable the carousel
$('#testimonials').carousel();



function showFlashMessage(flashType, message) {
  const flashElement = $(`
    <div class="alert alert-${flashType} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `);
  $('#flash-messages-container').append(flashElement);

  // Add fade-out animation after a short delay
  setTimeout(() => {
    flashElement.alert('close');
  }, 15000);
}


$('#generate-invite-form').submit((event) => {
  event.preventDefault();
  const formArray = $('#generate-invite-form').serializeArray();
  const formData = formArray.reduce((acc, { name, value }) => {
    acc[name] = value;
    return acc;
  }, {});

  $.ajax({
    url: '/invites/generate-invite-link',
    method: 'POST',
    data: formData,
    dataType: 'json',
    success: (response) => {
      
      const inviteUrl = response.inviteUrl;
      $('#invite-url-preview').html(`
        <p>Invitation link:</p>
        <a href="${inviteUrl}">${inviteUrl}</a> 
      `);
      showFlashMessage(response.flashType, response.message);
    },
    error: (error) => {
      console.error(error);
      if (error.responseJSON) {
        showFlashMessage(error.responseJSON.flashType, error.responseJSON.message);
      } else {
        showFlashMessage('error', 'An unexpected error occurred.');
      }
    }
  });
});

$('.view-button').click(function() {
  var id = $(this).data('id'); // Get the ID of the carrier from the data attribute
  $.get('/carriers/' + id, function(data) { // Make a GET request to the server to get the carrier data
    console.log(id);
    $('#carrier-popup .modal-body').html(data); // Update the popup's body with the carrier/show.ejs template
    $('#carrier-popup').modal('show'); // Show the popup
  });
});



$(document).ready(function() {
  $(".btn-revoke").on("click", function(event) {
    event.preventDefault();
    const inviteId = $(this).data("id");

    if (confirm("Are you sure you want to revoke this invite?")) {
      // If the user clicks "OK", send the request to the server
      $.ajax({
        type: "POST",
        url: `/invites/${inviteId}/revoke`,
        success: function() {
          // Reload the page after the invite is revoked
          location.reload();
        },
        error: function() {
          alert("Error revoking invite. Please try again later.");
        }
      });
    }
  });
});

async function deleteCarrier() {
  const carrierId = document.getElementById('carrierId').value;
  const response = await fetch(`/carriers/${carrierId}`, {
      method: 'DELETE',
      headers: {
          'Content-Type': 'application/json',
      },
  });

  const result = await response.json();

  if (result.success) {
      alert(result.message);
      // Redirect to another page, for example, the list of carriers
      window.location.href = '/carriers/list';
  } else {
      alert(`Error: ${result.message}`);
  }
}


// $(document).ready(() => {
//   $('#carrier-setup-form').submit((event) => {
//     event.preventDefault();
//     const formData = $('#carrier-setup-form').serialize();
//     $.ajax({
//       url: '/carriers/submit-carrier-setup',
//       method: 'POST',
//       data: formData,
//       dataType: 'json',
//       success: (response) => {
//         if (response.success) {
//           alert('Carrier setup completed successfully.')

//         } else {
//           alert('An error occurred: ' + response.error);
//         }
//       },
//       error: (error) => {
//         console.error(error);
//       }
//     });
//   });
// });