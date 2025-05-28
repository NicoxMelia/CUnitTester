function loadExcercice(ejercicioId){
    var ejercicio = "hhh";

    if (ejercicioId) {
        const consignaContainer = document.getElementById("consignaContainer");
        const tablaCasos = document.getElementById("tablaCasos");

        if (consignaContainer && tablaCasos) {
            consignaContainer.innerHTML = `<div class="text-gray-400">⏳ Cargando consigna...</div>`;
            tablaCasos.innerHTML = "";

            fetch("./js/ejercicios4.json")
                .then(res => res.json())
                .then(data => {
                    ejercicio = data.exercises.find(e => e.id === ejercicioId);

                    if (!ejercicio) {
                        consignaContainer.innerHTML = `<div class="text-red-500 font-semibold">❌ Ejercicio no encontrado</div>`;
                        return;
                    }

                    // Mostrar consigna
                    consignaContainer.innerHTML = `
                        <h2 class="text-2xl font-bold text-cyan-400 mb-2 flex items-center gap-2">
                            📘 ${ejercicio.title}
                        </h2>
                        <p class="text-gray-300 mb-4">${ejercicio.description}</p>`;

                    // Mostrar tabla de casos
                    let tablaHTML = `
                        <table class="w-full text-sm text-left text-gray-300 border border-gray-600">
                            <thead class="bg-gray-700 text-xs uppercase text-gray-400">
                                <tr>
                                    <th class="px-3 py-2 border border-gray-600">Input</th>
                                    <th class="px-3 py-2 border border-gray-600">Expected Output</th>
                                </tr>
                            </thead>
                            <tbody>`;

                    ejercicio.test_cases.forEach(test => {
                        tablaHTML += `
                            <tr class="bg-gray-800">
                                <td class="px-3 py-2 border border-gray-700 font-mono">${test.input}</td>
                                <td class="px-3 py-2 border border-gray-700 font-mono">${test.expected_output}</td>
                            </tr>`;
                    });

                    tablaHTML += `</tbody></table>`;
                    tablaCasos.innerHTML = tablaHTML;
                })
                .catch(err => {
                    consignaContainer.innerHTML = `<div class="text-red-500 font-semibold">⚠️ Error al cargar el ejercicio</div>`;
                    console.error(err);
                });
        }
    }
    return ejercicio;
}


export { loadExcercice };