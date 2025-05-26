 // Variables globales
        let currentInput = "";
        let output = "";

        // Traductor C++ a JS mejorado
        function translateCppToJs(cppCode) {
    let jsCode = cppCode;

    // 1. Limpieza básica
    jsCode = jsCode
        .replace(/^#include\s*<[^>]+>/gm, '') // elimina includes (iostream, iomanip, etc.)
        .replace(/using\s+namespace\s+std\s*;/g, '')
        .replace(/\/\/.*$/gm, '');

    // 2. Declaración de variables
    jsCode = jsCode.replace(/\b(int|double|float|char|string|bool)\s+([a-zA-Z_]\w*)(\s*=\s*[^;]+)?\s*;/g, 'let $2$3;');

    // 3. Entrada con cin: soporta múltiples variables
    jsCode = jsCode.replace(/cin\s*>>\s*([a-zA-Z_]\w*(\s*>>\s*[a-zA-Z_]\w*)*)\s*;/g, (match, vars) => {
        const varList = vars.split(">>").map(v => v.trim()).filter(Boolean);
        return `{\n  const inputs = await readInputs(${varList.length});\n  ${varList.map((v, i) => `${v} = inputs[${i}];`).join('\n  ')}\n}`;
    });

    // 4. Salida con cout y <<
    jsCode = jsCode.replace(/cout\s*<<\s*([^;]+);/g, (match, expr) => {
        const parts = expr.split("<<").map(p => p.trim());
        return 'output += ' + parts.map(p => {
            if (p.includes('setw(')) {
                const match = p.match(/setw\((\d+)\)\s*\+\s*(.+)/);
                if (match) return `String(${match[2]}).padStart(${match[1]})`;
            }
            if (p.includes('setprecision(')) {
                const match = p.match(/setprecision\((\d+)\)\s*\+\s*(.+)/);
                if (match) return `Number(${match[2]}).toFixed(${match[1]})`;
            }
            return `String(${p})`;
        }).join(' + ') + ';';
    });

    // 5. endl
    jsCode = jsCode.replace(/endl/g, '"\\n"');

    // 6. Control de flujo
    jsCode = jsCode
        .replace(/\bif\s*\(([^)]+)\)/g, 'if ($1)')
        .replace(/\belse\s+if\s*\(([^)]+)\)/g, 'else if ($1)')
        .replace(/\belse\b/g, 'else')
        .replace(/\bfor\s*\(([^)]+)\)/g, 'for ($1)')
        .replace(/\bwhile\s*\(([^)]+)\)/g, 'while ($1)')
        .replace(/\bdo\s*{/g, 'do {')
        .replace(/\bwhile\s*\(([^)]+)\)\s*;/g, 'while ($1);');

    // 7. Try / Catch / Throw
    jsCode = jsCode
        .replace(/\btry\s*{/g, 'try {')
        .replace(/\bcatch\s*\(\s*(\w+)\s*\)/g, 'catch ($1)')
        .replace(/\bthrow\s+([^;]+);/g, 'throw $1;');

    // 8. Función main
    jsCode = jsCode.replace(/int\s+main\s*\(\s*\)\s*{/, 'async function main() {');
    jsCode = jsCode.replace(/\breturn\s+0\s*;/g, '');

    // 9. Agregar funciones de soporte
    return `// Funciones de soporte
let output = "";
let currentInput = "";

async function readInput() {
    const result = currentInput.trim();
    currentInput = "";
    return result;
}

async function readInputs(n) {
    const parts = currentInput.trim().split(/\\s+/);
    currentInput = "";
    return parts.slice(0, n).map(v => isNaN(v) ? v : Number(v));
}

${jsCode}

// Iniciar ejecución
main();`;
}


        // Función para ejecutar el código traducido
        async function executeTranslatedCode(jsCode, input) {
            output = "";
            currentInput = input;
            
            try {
                // Crear función dinámica con el código
                const dynamicFunction = new Function('output', 'currentInput', jsCode);
                await dynamicFunction(output, currentInput);
                return { success: true, output: output.trim() };
            } catch (error) {
                return { success: false, error: error.message };
            }
        }

        // Manejo de la interfaz
        document.addEventListener('DOMContentLoaded', () => {
            // Añadir nuevo test
            document.getElementById('addTestBtn').addEventListener('click', () => {
                const testCase = document.createElement('div');
                testCase.className = 'test-case bg-gray-750 p-3 rounded-md';
                testCase.innerHTML = `
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                        <div>
                            <label class="block text-xs text-gray-400 mb-1">Input</label>
                            <input type="text" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Valor de entrada">
                        </div>
                        <div>
                            <label class="block text-xs text-gray-400 mb-1">Output Esperado</label>
                            <input type="text" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Resultado esperado">
                        </div>
                    </div>
                    <button class="remove-test bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs transition-colors">
                        Eliminar Test
                    </button>
                `;
                document.getElementById('testCases').appendChild(testCase);
                
                // Añadir evento al nuevo botón de eliminar
                testCase.querySelector('.remove-test').addEventListener('click', () => {
                    testCase.remove();
                });
            });
            
            // Delegación de eventos para botones de eliminar existentes
            document.getElementById('testCases').addEventListener('click', (e) => {
                if (e.target.classList.contains('remove-test')) {
                    e.target.closest('.test-case').remove();
                }
            });
            
            // Ejecutar tests
            document.getElementById('runBtn').addEventListener('click', async () => {
                const cppCode = document.getElementById('cppCode').value;
                const jsCode = translateCppToJs(cppCode);
                
                // Mostrar JS generado
                document.getElementById('jsOutput').textContent = jsCode;
                Prism.highlightAll();
                
                // Obtener tests
                const testCases = Array.from(document.querySelectorAll('.test-case')).map(el => {
                    const inputs = el.querySelectorAll('input');
                    return {
                        input: inputs[0].value,
                        expected: inputs[1].value
                    };
                });
                
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
                                    <div class="bg-gray-700 p-2 rounded font-mono">${output || 'Ninguna salida'}</div>
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