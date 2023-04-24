





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



$(document).ready(function() {
  function removeFile(fileType, token) {
    if (confirm('Are you sure you want to remove this file?')) {
      const removeFileUrl = token ? `/carriers/remove-file?type=${fileType}&token=${token}` : `/carriers/remove-file?type=${fileType}`;

      $.ajax({
        url: removeFileUrl,
        type: 'GET',
        success: function() {
          location.reload();
        },
        error: function(err) {
          console.error('Error removing file:', err);
          alert('An error occurred while removing the file. Please try again.');
        }
      });
    }
  }

  // Attach click event handlers to remove buttons
  $('button[data-remove-file]').on('click', function() {
    const token = $('input[name="token"]').val();
    removeFile($(this).data('remove-file'), token);
  });
});


$('.view-invite').click(function() {
  var id = $(this).data('id'); // Get the ID of the carrier from the data attribute
  $.get('/invites/' + id, function(data) { // Make a GET request to the server to get the carrier data

    $('#invite-popup .modal-body').html(data); // Update the popup's body with the carrier/show.ejs template
    $('#invite-popup').modal('show'); // Show the popup
  });
});


$(document).ready(function () {
  $(".download-document").on("click", function () {
    $("#globalLoader").show();

    const carrierId = $(this).data("carrier-id");
    const docId = $(this).data("doc-id");
    const url = `/carriers/${carrierId}/documents/${docId}/view`;

    $.get(url, function (response) {
      const presignedUrl = response.preSignedUrl;
      const downloadLink = document.createElement('a');
      downloadLink.href = presignedUrl;
      downloadLink.download = "document"; // You can set this to the desired filename
      document.body.appendChild(downloadLink);
      $("#globalLoader").hide();
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }).fail(function () {
      alert("Error retrieving the document");
    });
  });

});

$(".view-button").click(function () {
  $("#globalLoader").show();

  var id = $(this).data("id");
  $.get("/carriers/" + id, function (data) {
    $("#carrier-popup .modal-body").html(data);
    $("#carrier-popup").modal("show");
  });
  $("#globalLoader").hide();


});

$(document).ready(function() {
  function handleModerateCheckbox() {
    const $moderateCheckbox = $('#moderateCheckbox');
    const $moderateButton = $('#moderateButton');

    if ($moderateCheckbox.length > 0) {
      $moderateButton.prop('disabled', !$moderateCheckbox.prop('checked'));
      $moderateCheckbox.off('change', handleModerateCheckboxChange);
      $moderateCheckbox.on('change', handleModerateCheckboxChange);
    }
  }

  function handleModerateCheckboxChange() {
    const $moderateCheckbox = $(this);
    const $moderateButton = $('#moderateButton');
    $moderateButton.prop('disabled', !$moderateCheckbox.prop('checked'));
  }

  const $carrierModal = $('#carrier-popup');

  if ($carrierModal.length > 0) {
    $carrierModal.on('shown.bs.modal', handleModerateCheckbox);
    handleModerateCheckbox();
  }
});


$(document).ready(function() {
  $(".btn-delete").on("click", function(event) {
    event.preventDefault();
    const inviteId = $(this).data("id");

    if (confirm("Are you sure you want to delete this invite?")) {
      // If the user clicks "OK", send the request to the server
      $.ajax({
        type: "DELETE",
        url: `/invites/${inviteId}`,
        success: function() {
          // Reload the page after the invite is deleted
          location.reload();
        },
        error: function() {
          alert("Error deleting invite. Please try again later.");
        }
      });
    }
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
          // Reload the page after the invite is deleted
          location.reload();
        },
        error: function() {
          alert("Error revoking invite. Please try again later.");
        }
      }).fail(function(xhr, status, error) {
        console.log(error);
      });
    }
  });
});







$(document).ready(function() {
  $(".btn-delete-carrier").on("click", function(event) {
    event.preventDefault();
    const carrierId = $(this).data("id");

    if (confirm("Are you sure you want to delete this carrier?")) {
      // If the user clicks "OK", send the request to the server
      $.ajax({
        type: "DELETE",
        url: `/carriers/${carrierId}`,
        success: function() {
          // Reload the page after the invite is deleted
          location.reload();
        },
        error: function() {
          alert("Error deleting invite. Please try again later.");
        }
      });
    }
  });
});

$(document).ready(function() {
  $(".btn-delete-user").on("click", function(event) {
    event.preventDefault();
    const userId = $(this).data("id");

    if (confirm("Are you sure you want to delete this user?")) {
      // If the user clicks "OK", send the request to the server
      $.ajax({
        type: "DELETE",
        url: `/users/${userId}`,
        success: function() {
          // Reload the page after the user is deleted
          location.reload();
        },
        error: function() {
          alert("Error deleting user. Please try again later.");
        }
      });
    }
  });
});


$(document).ready(function() {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const token = urlSearchParams.get('token');

  if (window.location.pathname === '/carriers/carrier-setup' && token) {
    const inviteId = $('#inviteId').val();

    $.ajax({
      type: 'GET',
      url: `/invites/log/${inviteId}`,
      success: function() {
        console.log('Data logged successfully.');
      },
      error: function() {
        console.error('Error logging data. Please try again later.');
      }
    });
  }
});

$(document).ready(function() {
  function updateUploadVisibility() {
    const selectedPaymentMethod = $('input[type=radio][name=paymentMethod]:checked').val();
    if (selectedPaymentMethod == 'factoring') {
      $('#voidCheckUpload').hide();
      $('#noaUpload').show();
    } else {
      $('#noaUpload').hide();
      $('#voidCheckUpload').show();
    }
  }

  // Call the function on page load to set the initial visibility
  updateUploadVisibility();

  // Update the visibility when a radio button is changed
  $('input[type=radio][name=paymentMethod]').change(function() {
    updateUploadVisibility();
  });
});


// Define path to testimonials file

$(document).ready(function() {
const testimonialsFile = '../testimonials.txt';
if($('.testimonials').length) {
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
  }
});

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