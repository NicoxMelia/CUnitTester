function putExtraFunctions(jsCode) {
    // 9. Agregar funciones de soporte
    return `// Funciones de soporte
    // let output = "";
    // let currentInput = "";

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

export {putExtraFunctions};