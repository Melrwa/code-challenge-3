
document.addEventListener("DOMContentLoaded", () => {
    // Fetch and display the list of films
    fetchFilms();
  
    // Fetch the details of the first film and set up event listeners
    fetchFilmDetails(1);
  });
  
  // Function to fetch and display the list of films
  function fetchFilms() {
    fetch('http://localhost:3000/films')
      .then(response => response.json())
      .then(data => {
        const filmsList = document.getElementById('films');
        filmsList.innerHTML = ''; // Clear the existing content
        
        data.forEach(film => {
          const li = document.createElement('li');
          li.className = 'film item';
  
          // Create a span for the film title
          const span = document.createElement('span');
          span.className = 'film-title';
          span.textContent = film.title; // Set the movie title
  
          // Add click event to highlight the selected movie title
          span.addEventListener('click', () => {
            setActiveFilm(li); // Function to highlight the clicked movie
            fetchFilmDetails(film.id); // Fetch film details when clicked
          });
  
          // Create the delete button
          const deleteButton = document.createElement('button');
          deleteButton.textContent = 'Delete';
          deleteButton.className = 'delete-button';
          deleteButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent the click event from bubbling up
            deleteFilm(film.id, li);
          });
         
  
          li.appendChild(span); // Append the movie title
          li.appendChild(deleteButton); // Append the delete button
          filmsList.appendChild(li); // Append the movie item to the list
  
          // Check if the film is sold out and update the UI accordingly
          if (film.tickets_sold >= film.capacity) {
            li.classList.add('sold-out');
            deleteButton.textContent = 'Sold Out'; // Change button text
          } else {
            li.classList.remove('sold-out');
          }
        });
      })
      .catch(error => console.error('Error fetching films:', error));
  }
  
  // Function to fetch and display the details of a specific film
  function fetchFilmDetails(filmId) {
    fetch(`http://localhost:3000/films/${filmId}`)
      .then(response => response.json())
      .then(film => {
        updateFilmDetails(film);
  
        // Buy Ticket Button Event Listener
        const buyButton = document.getElementById('buy-ticket');
        buyButton.onclick = () => {
          buyTicket(film);
        };
      })
      .catch(error => console.error('Error fetching film details:', error));
  }
  
  // Function to highlight the clicked movie title
  function setActiveFilm(selectedFilm) {
    // Remove 'active' class from all films
    const films = document.querySelectorAll('.film');
    films.forEach(film => film.classList.remove('active'));
  
    // Add 'active' class to the selected film
    selectedFilm.classList.add('active');
  }
  
  // Function to update movie details in the DOM
  function updateFilmDetails(film) {
    // Update the poster
    const posterElement = document.getElementById('poster');
    posterElement.src = film.poster;
    posterElement.alt = film.title;
  
    // Update the movie title
    const titleElement = document.getElementById('title');
    titleElement.textContent = film.title;
  
    // Update the runtime
    const runtimeElement = document.getElementById('runtime');
    runtimeElement.textContent = `${film.runtime} minutes`;
  
    // Update the showtime
    const showtimeElement = document.getElementById('showtime');
    showtimeElement.textContent = film.showtime;
  
    // Update the description
    const descriptionElement = document.getElementById('film-info');
    descriptionElement.textContent = film.description;
  
    // Calculate and update the number of available tickets
    const availableTickets = film.capacity - film.tickets_sold;
    const ticketsElement = document.getElementById('ticket-num');
    ticketsElement.textContent = `${availableTickets} remaining tickets`;
  
    // Update the buy button state based on available tickets
    const buyButton = document.getElementById('buy-ticket');
    if (availableTickets > 0) {
      buyButton.disabled = false; // Enable the buy button
      buyButton.textContent = "Buy Ticket"; // Set text back to normal
    } else {
      buyButton.disabled = true; // Disable the buy button
      buyButton.textContent = "Sold Out"; // Change button text
    }
  }
  
  // Function to handle the Buy Ticket functionality
  function buyTicket(film) {
    const availableTickets = film.capacity - film.tickets_sold;
  
    if (availableTickets > 0) {
      // Increment the number of tickets sold
      const updatedTicketsSold = film.tickets_sold + 1;
  
      // Send a PATCH request to update tickets_sold on the server
      fetch(`http://localhost:3000/films/${film.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tickets_sold: updatedTicketsSold })
      })
      .then(response => response.json())
      .then(updatedFilm => {
        // Update the film details with the new tickets sold count
        film.tickets_sold = updatedFilm.tickets_sold;
        updateFilmDetails(film);
  
        // Post the ticket purchase to the /tickets endpoint
        postTicketPurchase(film.id, 1);
      })
      .catch(error => console.error('Error updating tickets sold:', error));
    } else {
      alert('Sorry, this showing is sold out!');
    }
  }
  
  // Function to post the ticket purchase to the /tickets endpoint
  function postTicketPurchase(filmId, numberOfTickets) {
    fetch('http://localhost:3000/tickets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        film_id: filmId,
        number_of_tickets: numberOfTickets
      })
    })
    .then(response => response.json())
    .then(data => {
      console.log('Ticket purchase recorded:', data);
    })
    .catch(error => console.error('Error posting ticket purchase:', error));
  }
  
  // Function to delete a film from the server
  function deleteFilm(filmId, filmElement) {
    fetch(`http://localhost:3000/films/${filmId}`, {
      method: 'DELETE',
    })
    .then(response => {
      if (response.ok) {
        filmElement.remove(); // Remove the film element from the DOM
        alert(`Film with ID ${filmId} deleted successfully`);
      } else {
        console.error('Error deleting film:', response.statusText);
      }
    })
    .catch(error => console.error('Error deleting film:', error));
  }
  

  