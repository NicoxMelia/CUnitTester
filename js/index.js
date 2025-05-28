import {removeIncludes, putVariables, putFunctions, manageCin, manageCout, manageEndl, manageControlFlow, manageExceptions, putMain, manageArrays} from "./interpreters.js"; 
import { putExtraFunctions } from "./extraFunctions.js";

// Variables globales
let currentInput = "";
let output = "";

// Traductor C++ a JS mejorado
function translateCppToJs(cppCode) {
    let jsCode = cppCode;

    jsCode = removeIncludes(jsCode);
    jsCode = putVariables(jsCode);
    jsCode = putFunctions(jsCode);
    jsCode = manageCin(jsCode);
    jsCode = manageCout(jsCode);
    jsCode = manageEndl(jsCode);
    jsCode = manageControlFlow(jsCode);
    jsCode = manageExceptions(jsCode);
    jsCode = putMain(jsCode);
    jsCode = manageArrays(jsCode);

    // Función para simular paso por referencia de C++
    function passByReference(value) {
        return {
            get value() { return value; },
            set value(newValue) { value = newValue; }
        };
    }

    return putExtraFunctions(jsCode);
}


        // Función para ejecutar el código traducido
        async function executeTranslatedCode(jsCode, input) {
            output = {
                salida: ""
            };
            currentInput = input;

            
            try {
                // Crear función dinámica con el código
                const dynamicFunction = new Function('output', 'currentInput', jsCode);
                await dynamicFunction(output, currentInput);
                output = output.salida;
                console.log('Resultado de la ejecución:', output);
                return { success: true, output: output.trim() };
            } catch (error) {
                return { success: false, error: error.message };
            }
        }


        //*********************************************************** */
        // Manejo de la interfaz
document.addEventListener('DOMContentLoaded', () => {

    

    const urlParams = new URLSearchParams(window.location.search);
    const ejercicioId = urlParams.get("ejercicio");

    /* CARGA EL EJERCICIO EN PANTALLA
    * Esta funcion setea el ejercicio en la variable ejercicio
    */
    var ejercicio = null;

    if (ejercicioId) {
        const consignaContainer = document.getElementById("consignaContainer");
        const tablaCasos = document.getElementById("tablaCasos");

        if (consignaContainer && tablaCasos) {
            consignaContainer.innerHTML = `<div class="text-gray-400">⏳ Cargando consigna...</div>`;
            tablaCasos.innerHTML = "";

            fetch("./js/excercices.json")
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
    
    // Ejecutar tests
    document.getElementById('runBtn').addEventListener('click', async () => {
        const cppCode = document.getElementById("cppCode").value; // Obtener código C++ del editor
        const jsCode = translateCppToJs(cppCode);
        
        // Mostrar JS generado
        document.getElementById('jsOutput').textContent = jsCode;
        Prism.highlightAll();
        
        // Obtener tests
        const testCases = ejercicio.test_cases.map(tc => ({
                    input: tc.input,
                    expected: tc.expected_output
        }));
        
        // Mostrar resultados
        const resultsContainer = document.getElementById('testResults');
        resultsContainer.innerHTML = '<div class="p-4 space-y-3"></div>';
        const resultsList = resultsContainer.querySelector('div');
        
        if (testCases.length === 0) {
            resultsList.innerHTML = `
                <div class="bg-yellow-900/30 border border-yellow-800 text-yellow-400 p-3 rounded-md text-sm">
                    No hay tests definidos. Añade al menos un test para ejecutar.
                </div>
            `;
            return;
        }
        
        // Ejecutar cada test
        for (const [index, test] of testCases.entries()) {
            const resultDiv = document.createElement('div');
            resultDiv.className = `p-3 rounded-md border ${test.input ? '' : 'bg-gray-750 border-gray-700'}`;
            
            if (!test.input || !test.expected) {
                resultDiv.innerHTML = `
                    <div class="flex items-center text-yellow-400 text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                        Test #${index + 1} incompleto - falta input o resultado esperado
                    </div>
                `;
                resultsList.appendChild(resultDiv);
                continue;
            }
            
            const { success, output, error } = await executeTranslatedCode(jsCode, test.input);
            
            if (success) {
                const formatOutput = (text) => {
                    if (!text) return '<div class="text-gray-400">Ninguna salida</div>';
                    return text.split('\n').map(line => 
                        `<div class="whitespace-pre">${line || ' '}</div>`
                    ).join('');
                };
                const passed = output === test.expected;
                resultDiv.className = `p-3 rounded-md border ${passed ? 'bg-green-900/20 border-green-800' : 'bg-red-900/20 border-red-800'}`;
                resultDiv.innerHTML = `
                    <div class="flex items-center justify-between mb-2">
                        <h3 class="font-medium">Test #${index + 1} ${passed ? '✅ Pasó' : '❌ Falló'}</h3>
                        <span class="text-xs px-2 py-1 rounded ${passed ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}">${passed ? 'Éxito' : 'Fallo'}</span>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div>
                            <div class="text-xs text-gray-400 mb-1">Input</div>
                            <div class="bg-gray-700 p-2 rounded font-mono">${test.input}</div>
                        </div>
                        <div>
                            <div class="text-xs text-gray-400 mb-1">Esperado</div>
                            <div class="bg-gray-700 p-2 rounded font-mono">${test.expected}</div>
                        </div>
                        <div>
                            <div class="text-xs text-gray-400 mb-1">Obtenido</div>
                            <div class="bg-gray-700 p-2 rounded font-mono">${formatOutput(output)}</div>
                        </div>
                    </div>
                `;
            } else {
                resultDiv.className = 'p-3 rounded-md border bg-red-900/20 border-red-800';
                resultDiv.innerHTML = `
                    <div class="flex items-center justify-between mb-2">
                        <h3 class="font-medium">Test #${index + 1} ❌ Error</h3>
                        <span class="text-xs px-2 py-1 rounded bg-red-900/30 text-red-400">Error</span>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div>
                            <div class="text-xs text-gray-400 mb-1">Input</div>
                            <div class="bg-gray-700 p-2 rounded font-mono">${test.input}</div>
                        </div>
                        <div class="md:col-span-2">
                            <div class="text-xs text-gray-400 mb-1">Error</div>
                            <div class="bg-gray-700 p-2 rounded font-mono text-red-400">${error}</div>
                        </div>
                    </div>
                `;
            }
            
            resultsList.appendChild(resultDiv);
        }
    });
});


