// Load types dynamically
window.onload = function() {
    fetch('jokems/types')
        .then(res => res.json())
        .then(data => {
            const dropdown = document.getElementById('type');
            dropdown.innerHTML = '';

            data.forEach(type => {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = type;
                dropdown.appendChild(option);
            });
        })
        .catch(err => console.error(err));
};

//low-mid 3rd
/*function submitJoke() {
    const setup = document.getElementById('setup').value;
    const punchline = document.getElementById('punchline').value;
    const type = document.getElementById('type').value;
    const message = document.getElementById('message');

    if (!setup || !punchline || !type) {
        message.textContent = "All fields are required!";
        return;
    }

    fetch('http://localhost:4000/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ setup, punchline, type })
    })
    .then(res => res.json())
    .then(data => {
        message.textContent = data.message;
    })
    .catch(err => {
        console.error(err);
        message.textContent = "Error submitting joke";
    });
}*/

//high 3rd
function submitJoke() {
    const setup = document.getElementById('setup').value;
    const punchline = document.getElementById('punchline').value;
    const selectedType = document.getElementById('type').value;
    const newType = document.getElementById('newType').value.trim();
    const message = document.getElementById('message');

    if (!setup || !punchline) {
        message.textContent = "Setup and punchline are required!";
        return;
    }

    const finalType = newType !== "" ? newType : selectedType;

    fetch('/submitms/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ setup, punchline, type: finalType })
    })
    .then(res => res.json())
    .then(data => {
        message.textContent = data.message;
        document.getElementById('newType').value = "";
    })
    .catch(err => {
        console.error(err);
        message.textContent = "Error submitting joke";
    });
}

