window.onload = function() {

    const dropdown = document.getElementById('type'); // ✅ MOVE HERE

    fetch('/jokems/types')
      .then(res => {
          if (!res.ok) throw new Error("Joke service down");
          return res.json();
      })
      .then(types => {
          dropdown.innerHTML = '';
          types.forEach(type => {
              const option = document.createElement('option');
              option.value = type;
              option.textContent = type;
              dropdown.appendChild(option);
          });
      })
      .catch(err => {
          console.log("Failed to fetch from joke service, using cache...");

          fetch('/submitms/types')
            .then(res => res.json())
            .then(types => {
                dropdown.innerHTML = '';
                types.forEach(type => {
                    const option = document.createElement('option');
                    option.value = type;
                    option.textContent = type;
                    dropdown.appendChild(option);
                });
            });
      });
};


function getJoke() {
    const type = document.getElementById('type').value;

    fetch(`jokems/joke/${type}`)
        .then(response => response.json())
        .then(data => {
            const setup = document.getElementById('setup');
            const punchline = document.getElementById('punchline');

            setup.textContent = data[0].setup;
            punchline.textContent = '';

            setTimeout(() => {
                punchline.textContent = data[0].punchline;
            }, 3000);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

