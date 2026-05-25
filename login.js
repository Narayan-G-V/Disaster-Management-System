function registerUser() {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;

  if (user === "" || pass === "") {
    document.getElementById("msg").innerText = "Fill all fields";
    return;
  }

  localStorage.setItem("sc_user", user);
  localStorage.setItem("sc_pass", pass);

  document.getElementById("msg").innerText =
    "Registered successfully. Now login.";
}

function loginUser() {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;

  const storedUser = localStorage.getItem("sc_user");
  const storedPass = localStorage.getItem("sc_pass");

  if (user === storedUser && pass === storedPass) {
    localStorage.setItem("sc_loggedIn", "true");
    window.location.href = "index.html";
  } else {
    document.getElementById("msg").innerText = "Invalid credentials";
  }
}
