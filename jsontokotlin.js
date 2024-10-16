function convertToKotlin() {
    const jsonInput = document.getElementById("jsonInput").value;

    // Clear previous output and reset nested classes storage
    document.getElementById("kotlinOutput").innerText = "";
    nestedClasses = ""; // Reset the nested classes string
    generatedClasses = {}; // Track generated classes to avoid duplicates

    let kotlinClasses = "";

    try {
        const jsonObject = JSON.parse(jsonInput);
        kotlinClasses = generateKotlinClasses(jsonObject, "Root");
    } catch (e) {
        kotlinClasses = "Invalid JSON format";
    }

    // Output the generated Kotlin classes
    document.getElementById("kotlinOutput").innerText = kotlinClasses;
}

let nestedClasses = ""; // This will store all the nested classes
let generatedClasses = {}; // Track generated classes to avoid duplicates

function generateKotlinClasses(jsonObject, className = "Root") {
    // Check for duplicates and create a unique class name if necessary
    const uniqueClassName = getUniqueClassName(className);
    let kotlinCode = `data class ${uniqueClassName}(\n`;

    for (const key in jsonObject) {
        const value = jsonObject[key];
        let type = getType(value, key);

        kotlinCode += `    val ${key}: ${type},\n`;
    }

    kotlinCode = kotlinCode.slice(0, -2); // Remove last comma
    kotlinCode += "\n)\n";

    return kotlinCode + nestedClasses; // Append nested classes at the end
}

function getType(value, key) {
    if (Array.isArray(value)) {
        // Handle arrays and nested objects in arrays
        if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
            const nestedClassName = capitalizeFirstLetter(key.slice(0, -1));
            nestedClasses += generateKotlinClasses(value[0], nestedClassName);
            return `List<${nestedClassName}>`;
        } else {
            return `List<${mapTypeToKotlin(typeof value[0])}>`;
        }
    } else if (typeof value === "object" && value !== null) {
        // Handle nested objects
        const nestedClassName = capitalizeFirstLetter(key);
        nestedClasses += generateKotlinClasses(value, nestedClassName);
        return nestedClassName;
    } else {
        return mapTypeToKotlin(typeof value);
    }
}

function getUniqueClassName(baseName) {
    if (!generatedClasses[baseName]) {
        generatedClasses[baseName] = 1; // Initialize count if not present
        return baseName; // Return the base name if it's the first occurrence
    } else {
        // Increment the count and create a new unique name
        const count = generatedClasses[baseName]++;
        return `${baseName}${count}`; // Return name with suffix
    }
}

function mapTypeToKotlin(jsType) {
    switch (jsType) {
        case "number":
            return "Double";
        case "boolean":
            return "Boolean";
        case "string":
            return "String";
        default:
            return "Any";
    }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
