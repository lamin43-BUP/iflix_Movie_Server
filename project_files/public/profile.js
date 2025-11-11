document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('profile-form');
  const imgInput = document.getElementById('imageInput');
  const profilePic = document.getElementById('profile-picture');
  const currentTable = document.querySelector('#current-subscription tbody');
  const pastTable = document.querySelector('#past-subscriptions tbody');

  // Image preview
  document.querySelector('.profile-pic-container').addEventListener('click', () => {
    imgInput.click();
  });

  imgInput.addEventListener('change', () => {
    const file = imgInput.files[0];
    if (file) {
      profilePic.src = URL.createObjectURL(file);
    }
  });

  // Load profile data
  fetch('/api/profile')
    .then(res => res.json())
    .then(data => {
      document.getElementById('name').value = data.name || '';
      document.getElementById('email').value = data.email || '';
      document.getElementById('phone').value = data.phone || '';
      document.getElementById('age').value = data.age || '';
      document.getElementById('gender').value = data.gender || '';
      document.getElementById('movie_preference').value = data.movie_preference || '';
      document.getElementById('bio').value = data.bio || '';

      // Profile picture
      if (data.profile_pic) {
        profilePic.src = `${data.profile_pic}?t=${new Date().getTime()}`;
      }

      // Current subscription
if (data.current_subscription) {
  const { plan, start_date, end_date } = data.current_subscription;
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${plan}</td>
    <td>${new Date(start_date).toLocaleDateString()}</td>
    <td>${new Date(end_date).toLocaleDateString()}</td>
  `;
  currentTable.appendChild(tr);
} else {
  currentTable.innerHTML = '<tr><td colspan="3">No active subscription</td></tr>';
}



      // Past subscriptions
      if (Array.isArray(data.past_subs) && data.past_subs.length > 0) {
        data.past_subs.forEach(sub => {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${sub.plan}</td>
    <td>${new Date(sub.start_date).toLocaleDateString()}</td>
    <td>${new Date(sub.end_date).toLocaleDateString()}</td>
  `;
  pastTable.appendChild(tr);
});

      } else {
        pastTable.innerHTML = '<tr><td colspan="3">No past subscriptions</td></tr>';
      }
    })
    .catch(err => {
      console.error('Error fetching profile:', err);
      alert('❌ Could not load profile.');
    });

  // Save profile changes
  form.addEventListener('submit', e => {
    e.preventDefault();
    const formData = new FormData(form);

    fetch('/api/profile/update', {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('✅ Profile updated!');
          window.location.reload();
        } else {
          alert('❌ Update failed. Please try again.');
        }
      })
      .catch(err => {
        console.error('❌ Error submitting form:', err);
        alert('❌ Update failed. Please try again.');
      });
  });
});
