// login
const loginContainer = document.getElementById('login-container');
const loginError = document.getElementById('login-error');
const loginButton = document.getElementById('login-button');
const dashboardContainer = document.getElementById('dashboard-container');

// Check if the user is already logged in
const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
if (isLoggedIn) {
  showDashboard();
}

loginButton.addEventListener('click', () => {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  authenticateUser(username, password);
});

document.getElementById('password').addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    authenticateUser(username, password);
  }
});

async function authenticateUser(username, password) {
  try {
    // Fetch user data from the JSON file
    const response = await fetch('users.json');
    const user = await response.json();

    if (user.username === username && user.password === password) {
      // If the username and password match, show the user's dashboard
      loginError.style.display = 'none';
      showDashboard();

      // Save the login state to localStorage
      localStorage.setItem('isLoggedIn', 'true');
    } else {
      // If authentication fails, display an error message
      loginError.style.display = 'block';
      dashboardContainer.style.display = 'none';

      // Remove the login state from localStorage
      localStorage.removeItem('isLoggedIn');
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    // Handle error
    loginError.style.display = 'block';
    dashboardContainer.style.display = 'none';

    // Remove the login state from localStorage in case of an error
    localStorage.removeItem('isLoggedIn');
  }
}

function showDashboard() {
  loginContainer.style.display = 'none';
  loginError.style.display = 'none';
  dashboardContainer.style.display = 'block';

  const userDashboard = document.getElementById('user1-dashboard');
  if (userDashboard) {
    userDashboard.style.display = 'block';
  }
}

// Date and Time Widget
function getCurrentDateTime() {
  // Get the current date and time
  const now = new Date();
  const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
  const dateOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
  const timeString = now.toLocaleTimeString('en-US', timeOptions);
  const dateString = now.toLocaleDateString('en-US', dateOptions);
  return { time: timeString, date: dateString };
}

function updateTimeAndDate() {
  // Update the time and date in the widget
  const { time, date } = getCurrentDateTime();
  const timeContainer = document.getElementById('time-container');
  const dateContainer = document.getElementById('date-container');
  timeContainer.textContent = time;
  dateContainer.textContent = date;
}

updateTimeAndDate();
setInterval(updateTimeAndDate, 1000); // Update time and date every second

// Weather Widget
const apiKey = 'b458fbb2f4c02a9d9704275b73796f41';

function showLoading() {
  // Show the loading spinner while fetching weather data
  document.querySelector('.loader').style.display = 'block';
  document.querySelector('.weather-content').style.display = 'none';
}

function hideLoading() {
  // Hide the loading spinner and show weather content
  document.querySelector('.loader').style.display = 'none';
  document.querySelector('.weather-content').style.display = 'flex';
}

function getUserLocation() {
  // Get user's geolocation using browser's navigator API
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    } else {
      reject('Geolocation is not supported by this browser.');
    }
  });
}

async function getCityName(lat, lon) {
  // Get city name from latitude and longitude using OpenWeatherMap API
  try {
    const apiUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    return data[0].name;
  } catch (error) {
    console.error('Error fetching city name:', error);
    return null;
  }
}

async function updateWeatherWidget(city) {
  // Update weather widget with weather data for the given city
  try {
    showLoading();

    let cityName = city;

    if (!city) {
      // If city not provided, get user's location and fetch city name
      const position = await getUserLocation();
      const { latitude, longitude } = position.coords;
      cityName = await getCityName(latitude, longitude);
    }

    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${apiKey}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    const temperature = Math.round(data.main.temp);
    const weatherDescription = data.weather[0].description;
    const iconCode = data.weather[0].icon;

    // Update weather information in the widget
    document.getElementById('city').textContent = cityName;
    document.getElementById('temperature').textContent = `${temperature}°C`;
    document.getElementById('weather-description').textContent = weatherDescription;
    document.getElementById('weather-icon').src = `https://openweathermap.org/img/w/${iconCode}.png`;

    hideLoading();
  } catch (error) {
    console.error('Error fetching weather data:', error);
    hideLoading();
  }
}

updateWeatherWidget();
setInterval(updateWeatherWidget, 600000); // Update weather every 10 minutes

document.getElementById('search-button').addEventListener('click', () => {
  // Update weather widget with user-provided city on button click
  const cityInput = document.getElementById('city-input');
  const city = cityInput.value.trim();
  updateWeatherWidget(city);
  cityInput.value = '';
});

document.getElementById('city-input').addEventListener('keypress', (event) => {
  // Update weather widget with user-provided city on Enter key press
  if (event.key === 'Enter') {
    const cityInput = document.getElementById('city-input');
    const city = cityInput.value.trim();
    updateWeatherWidget(city);
    cityInput.value = '';
  }
});

// Todo-list
document.addEventListener('DOMContentLoaded', () => {
  // Load and manage the todo list from local storage
  const taskInput = document.getElementById('task-input');
  const addButton = document.getElementById('add-button');
  const taskList = document.getElementById('task-list');

  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

  function renderTasks() {
     // Render the tasks in the todo list
    taskList.innerHTML = tasks
      .map((task, index) => `
        <li class="items">
          <div>
            <input type="checkbox" ${task.completed ? 'checked' : ''} data-index="${index}">
            <span class="${task.completed ? 'completed' : ''}">${task.text}</span>
          </div>
          <button class="delete-button" data-index="${index}">Delete</button>
        </li>
      `)
      .join('');
  }
  
  function toggleTask(event) {
  // Toggle the completion status of a task and save to local storage
  const index = event.target.dataset.index;
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    renderTasks();
  }
  
  // Attach event listener to the entire taskList and use event delegation
  taskList.addEventListener('change', toggleTask);

  function saveTasks() {
    // Save tasks to local storage
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  addButton.addEventListener('click', () => {
    // Add a new task to the list and save to local storage
    const text = taskInput.value.trim();
    if (text) {
      tasks.push({ text, completed: false });
      saveTasks();
      renderTasks();
      taskInput.value = '';
    }
  });

  taskList.addEventListener('change', (event) => {
    // Handle checkbox change to update task completion status
    if (event.target.tagName === 'INPUT') {
      const index = event.target.nextElementSibling.nextElementSibling.dataset.index;
      tasks[index].completed = event.target.checked;
      saveTasks();
      renderTasks();
    }
  });

  taskList.addEventListener('click', (event) => {
    // Handle click on delete button to remove task from the list
    if (event.target.classList.contains('delete-button')) {
      const index = event.target.dataset.index;
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    }
  });

  taskInput.addEventListener('keypress', (event) => {
    // Add a new task on Enter key press and save to local storage
    if (event.key === 'Enter') {
      const text = taskInput.value.trim();
      if (text) {
        tasks.push({ text, completed: false });
        saveTasks();
        renderTasks();
        taskInput.value = '';
      }
    }
  });

  renderTasks();

  // Dark Mode
  const darkModeToggle = document.getElementById("dark-mode-toggle");
  const boxes = document.querySelectorAll(".box");
  const inputs = document.querySelectorAll("input");
  
  const isDarkMode = JSON.parse(localStorage.getItem("darkMode"));
  
  function toggleDarkMode() {
    // Toggle dark mode and update elements accordingly
    const isDarkModeEnabled = document.body.classList.toggle("dark-mode");
    boxes.forEach((box) => box.classList.toggle("dark-mode", isDarkModeEnabled));
    inputs.forEach((input) => input.classList.toggle("dark-mode", isDarkModeEnabled));
    localStorage.setItem("darkMode", isDarkModeEnabled);
    updateIcon(isDarkModeEnabled);
  }
  
  function updateIcon(isDarkModeEnabled) {
    // Update dark mode icon based on current state
    const sunIcon = document.getElementById("sun-icon");
    const moonIcon = document.getElementById("moon-icon");
  
    sunIcon.style.display = isDarkModeEnabled ? "inline-block" : "none";
    moonIcon.style.display = isDarkModeEnabled ? "none" : "inline-block";
  }
  
  darkModeToggle.addEventListener("click", toggleDarkMode);
  
  if (isDarkMode) {
    // Check and apply dark mode on page load
    toggleDarkMode();
  }
});
