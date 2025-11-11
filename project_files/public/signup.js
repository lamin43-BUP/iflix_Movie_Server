document.getElementById('signupForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const movie_preference = document.getElementById('movie_preference').value;
  const subscription_plan = document.getElementById('subscription_plan').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm_password').value;
  const age = document.getElementById('age').value.trim();
  const gender = document.getElementById('gender').value;

  if (password !== confirmPassword) {
    alert("Passwords do not match.");
    return;
  }

  const formData = new URLSearchParams();
  formData.append('name', name);
  formData.append('email', email);
  formData.append('phone', phone);
  formData.append('movie_preference', movie_preference);  // ✅ fixed
  formData.append('subscription_plan', subscription_plan); // ✅ fixed
  formData.append('password', password);
  formData.append('age', age);
  formData.append('gender', gender);

  try {
    const response = await fetch('/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });

    const message = await response.text();

    if (response.ok) {
      alert('Signup successful!');
      window.location.href = 'login.html';
    } else {
      alert('Signup failed: ' + message);
    }
  } catch (error) {
    alert('An error occurred: ' + error.message);
  }
});
