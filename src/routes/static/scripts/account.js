async function resetPassword() {
  if (document.getElementById('password').value === document.getElementById('password2').value){
    fetch('/resetPassword', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.access_token}`
          },
          body: JSON.stringify({ password: document.getElementById('password').value })     
    })
    alert("Password has been changed.")
  } else alert("Passwords don't match.")
}

async function getAccount() {
  const res = await fetch('/account', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.access_token}`
        }
  })
  const json = await res.json();
  document.getElementById('accountDetails').style = 'display: visible;';
  document.getElementById('accountUsername').innerHTML = `Username: ${json.username}`;
  document.getElementById('accountPassword').value = `${json.password}`;
  document.getElementById('accountAccess').innerHTML = `Access Level: ${json.access}`;
}

function mouseOverPass() {
  document.getElementById('accountPassword').type = "text";
}

function mouseOutPass() {
  document.getElementById('accountPassword').type = "password";
}