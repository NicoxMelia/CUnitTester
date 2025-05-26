fetch('../js/ejercicios.json')
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        return response.json();
      })
      .then(data => {
        if (!data.exercises) throw new Error("❗ Missing 'exercises' key in JSON");

        const container = document.getElementById('ejercicioList');

        data.exercises.forEach((exercise, index) => {
          const card = document.createElement('div');
          card.className = 'bg-gray-800 rounded-lg p-6 shadow-xl space-y-4';

          const title = document.createElement('h2');
          title.className = 'text-xl font-semibold text-blue-400 flex items-center';
          title.innerHTML = `📄 Exercise ${index + 1}: ${exercise.title}`;

          const desc = document.createElement('p');
          desc.className = 'text-gray-300';
          desc.innerText = exercise.description;

          // Tablita de ejemplos
          const tableWrapper = document.createElement('div');
          tableWrapper.className = 'overflow-x-auto';

          const table = document.createElement('table');
          table.className = 'w-full mt-2 text-sm text-left text-gray-400 border border-gray-600';

          const thead = document.createElement('thead');
          thead.className = 'bg-gray-700 text-xs uppercase text-gray-300';

          thead.innerHTML = `
            <tr>
              <th class="px-4 py-2">📥 Input</th>
              <th class="px-4 py-2">📤 Expected Output</th>
            </tr>
          `;

          const tbody = document.createElement('tbody');
          (exercise.test_cases || []).slice(0, 2).forEach(test => {
            const row = document.createElement('tr');
            row.className = 'border-t border-gray-600';

            row.innerHTML = `
              <td class="px-4 py-2 whitespace-pre-wrap">${test.input}</td>
              <td class="px-4 py-2 whitespace-pre-wrap">${test.expected_output}</td>
            `;
            tbody.appendChild(row);
          });

          table.appendChild(thead);
          table.appendChild(tbody);
          tableWrapper.appendChild(table);

          const btn = document.createElement('a');
          btn.href = `code-runner.html?exercise=E${index + 1}`;
          btn.className = 'inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors';
          btn.innerHTML = '▶️ Solve now';

          card.appendChild(title);
          card.appendChild(desc);
          card.appendChild(tableWrapper);
          card.appendChild(btn);

          container.appendChild(card);
        });
      })
      .catch(error => {
        console.error(error);
        document.getElementById('ejercicioList').innerHTML = `
          <p class="text-red-500">❌ Error loading exercises: ${error.message}</p>
        `;
      });