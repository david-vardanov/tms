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




// Add this to your JavaScript file
$('#generate-invite-form').on('submit', function (e) {
  e.preventDefault();

  const mcNumber = $('#mc-number-input').val();

  $.post('/generate-invite-link', { mcNumber }, function (response) {
    if (response.error) {
      // Handle error, e.g., display an error message
      console.error(response.error);
    } else {
      // Display the invite URL in the div
      $('#invite-link-container').html(`<a href="${response.inviteUrl}" target="_blank">${response.inviteUrl}</a>`);
    }
  });
});