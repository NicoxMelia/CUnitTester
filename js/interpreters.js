function removeIncludes(jsCode){
    // 1. Limpieza básica
    jsCode = jsCode
        .replace(/^#include\s*<[^>]+>/gm, '') // elimina includes (iostream, iomanip, etc.)
        .replace(/using\s+namespace\s+std\s*;/g, '')
        .replace(/\/\/.*$/gm, '');

    return jsCode;
}

function putVariables(jsCode) {

    // 2. Declaración de variables
    jsCode = jsCode
    .replace(/\b(int|double|float|char|string|bool)\s+([a-zA-Z_]\w*)(\s*=\s*[^;]+)?\s*;/g, 'let $2$3;')

    return jsCode;
}

function putFunctions(jscode) {

    jscode = jscode.replace(/\b(int|double|float|char|string|bool|void)\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)\s*{/g, 
    (match, returnType, funcName, params) => {
        const jsParams = params.split(',')
            .map(p => p
                // Eliminar el tipo de dato (int, double, etc.)
                .replace(/\b(int|double|float|char|string|bool)\s+/, '')
                // Eliminar corchetes [] al final del nombre
                .replace(/\s*\[\s*\]\s*$/, '')
                .trim()
            )
            .filter(Boolean)
            .join(', ');

        
        const jsReturnType = returnType === 'void' ? '' : 'return';
        console.log(`Función detectada: ${funcName}(${jsParams}) con tipo de retorno ${jsReturnType}`);
        return `function ${funcName}(${jsParams}) {`;
    });
    return jscode;
}
    
function manageCin(jsCode) {

// 3. Entrada con cin: soporta múltiples variables
    jsCode = jsCode.replace(/cin\s*>>\s*([a-zA-Z_]\w*(\s*>>\s*[a-zA-Z_]\w*)*)\s*;/g, (match, vars) => {
        const varList = vars.split(">>").map(v => v.trim()).filter(Boolean);
        return `{\n  const inputs = await readInputs(${varList.length});\n  ${varList.map((v, i) => `${v} = inputs[${i}];`).join('\n  ')}\n}`;
    });

    return jsCode;

}

function manageCout(jsCode) {

// 4. Salida con cout y <<
    jsCode = jsCode.replace(/cout\s*<<\s*([^;]+);/g, (match, expr) => {
        const parts = expr.split("<<").map(p => p.trim());
        return 'output.salida += ' + parts.map(p => {
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

    return jsCode;
}
    
function manageEndl(jsCode) {
    // 5. endl
    jsCode = jsCode.replace(/endl/g, '"\\n"');

    return jsCode;
}

    
function manageControlFlow(jsCode) {

    // 6. Control de flujo
    jsCode = jsCode
        .replace(/\bif\s*\(([^)]+)\)/g, 'if ($1)')
        .replace(/\belse\s+if\s*\(([^)]+)\)/g, 'else if ($1)')
        .replace(/\belse\b/g, 'else')
        .replace(/\bfor\s*\(([^)]+)\)/g, 'for ($1)')
        .replace(/\bwhile\s*\(([^)]+)\)/g, 'while ($1)')
        .replace(/\bdo\s*{/g, 'do {')
        .replace(/\bwhile\s*\(([^)]+)\)\s*;/g, 'while ($1);');

        return jsCode;

}
    

function manageExceptions(jsCode) {

// 7. Try / Catch / Throw
    jsCode = jsCode
        .replace(/\btry\s*{/g, 'try {')
        .replace(/\bcatch\s*\(\s*(\w+)\s*\)/g, 'catch ($1)')
        .replace(/\bthrow\s+([^;]+);/g, 'throw $1;');

        return jsCode;

}
    

function putMain(jsCode) {
// 8. Función main
    jsCode = jsCode
    .replace(/int\s+main\s*\(\s*(int\s+argc\s*,\s*char\s*\*\s*argv\s*\[\s*\]\s*)?\)\s*{/g, 'async function main() {')
    .replace(/\breturn\s+0\s*;/g, '');

    return jsCode;
}
    

function manageArrays(jsCode) {
// 9. Manejo de arrays y matrices
    jsCode = jsCode
    // Arrays unidimensionales
    .replace(/\b(int|double|float|char|string|bool)\s+([a-zA-Z_]\w*)\s*\[\s*\]\s*(=\s*{([^}]+)})?\s*;/g, 'let $2 = [$4];')
    // Arrays con tamaño fijo
    .replace(/\b(int|double|float|char|string|bool)\s+([a-zA-Z_]\w*)\s*\[\s*(\d+)\s*\]\s*;/g, 'let $2 = new Array($3);')
    .replace(
    /([a-zA-Z_]\w*)\s*=\s*{\s*([^}]+)\s*}\s*;/g, '$1 = [$2];')
    // Matrices bidimensionales
    .replace(/\b(int|double|float|char|string|bool)\s+([a-zA-Z_]\w*)\s*\[\s*(\d+)\s*\]\s*\[\s*(\d+)\s*\]\s*;/g, 
        'let $2 = Array($3).fill().map(() => Array($4));');

        return jsCode;
}


export {removeIncludes, putVariables, putFunctions, manageCin, manageCout, manageEndl, manageControlFlow, manageExceptions, putMain, manageArrays};
    

    
